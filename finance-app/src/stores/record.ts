// ============================================================
// 财务管家 · 记账记录状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloud } from '@/utils/request'
import { getTodayStr, nowTimestamp, genId, getMonthKey } from '@/utils/format'
import type { RecordItem, MonthSummary, RecordGroup, CategoryStat, RecordType } from '@/types'

// Mock 记录数据（来自原型 home.html）
const mockRecords: RecordItem[] = [
  {
    id: 'r1', type: 'expense', categoryId: 'cat_food', categoryName: '餐饮', categoryIcon: 'food',
    amount: 38, note: '午餐 · 星巴克', accountId: 'acc_wechat', accountName: '微信支付', date: getTodayStr(), createdAt: nowTimestamp()
  },
  {
    id: 'r2', type: 'expense', categoryId: 'cat_transport', categoryName: '交通', categoryIcon: 'transport',
    amount: 12.5, note: '地铁卡充值', accountId: 'acc_wechat', accountName: '微信支付', date: getTodayStr(), createdAt: nowTimestamp()
  },
  {
    id: 'r3', type: 'income', categoryId: 'cat_salary', categoryName: '工资', categoryIcon: 'salary',
    amount: 12500, note: '八月工资', accountId: 'acc_bank', accountName: '银行卡', date: getTodayStr(), createdAt: nowTimestamp()
  },
  {
    id: 'r4', type: 'expense', categoryId: 'cat_shopping', categoryName: '购物', categoryIcon: 'shopping',
    amount: 259, note: '家居用品', accountId: 'acc_alipay', accountName: '支付宝', date: getTodayStr(), createdAt: nowTimestamp()
  }
]

export const useRecordStore = defineStore('record', () => {
  const records = ref<RecordItem[]>([...mockRecords])
  const monthSummary = ref<MonthSummary>({ income: 12500, expense: 309.5, balance: 12190.5 })
  const currentMonth = ref(getMonthKey(new Date()))

  // 当前月份短格式显示（2026.08）
  const currentMonthLabel = computed(() => {
    const [year, month] = currentMonth.value.split('-')
    return `${year}.${month}`
  })

  // 加载记录
  async function loadRecords(userId: string, month?: string): Promise<void> {
    const monthStr = month || currentMonth.value

    try {
      const res = await callCloud<RecordItem[]>('getRecords', { userId, month: monthStr })
      if (res.code === 0 && res.data) {
        records.value = res.data
        return
      }
    } catch {
      // 云函数不可用，使用 Mock 数据
    }
    // Mock 降级：筛选当月记录
    records.value = mockRecords.filter(r => r.date.startsWith(monthStr))
  }

  // 加载月度汇总
  async function loadSummary(userId: string, month?: string): Promise<void> {
    const monthStr = month || currentMonth.value

    try {
      const res = await callCloud<MonthSummary>('getMonthSummary', { userId, month: monthStr })
      if (res.code === 0 && res.data) {
        monthSummary.value = res.data
        return
      }
    } catch {
      // 云函数不可用
    }
    // Mock 降级：从本地记录计算
    const monthRecords = records.value.filter(r => r.date.startsWith(monthStr))
    const income = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
    const expense = monthRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
    monthSummary.value = { income, expense, balance: income - expense }
  }

  // 切换月份
  function switchMonth(month: string) {
    currentMonth.value = month
  }

  // 添加记录
  async function addRecord(record: Omit<RecordItem, 'id' | 'createdAt'>, userId: string): Promise<boolean> {
    const newRecord: RecordItem = {
      ...record,
      id: genId('local'),
      createdAt: nowTimestamp()
    }

    try {
      const res = await callCloud<{ id: string }>('addRecord', {
        userId,
        ...record
      })
      if (res.code === 0) {
        newRecord.id = res.data?.id || newRecord.id
      }
    } catch {
      // 云函数不可用
    }

    // 更新本地状态
    records.value.unshift(newRecord)

    // 更新汇总（仅当记录属于当前月份）
    if (record.date.startsWith(currentMonth.value)) {
      if (record.type === 'income') {
        monthSummary.value.income += record.amount
      } else {
        monthSummary.value.expense += record.amount
      }
      monthSummary.value.balance = monthSummary.value.income - monthSummary.value.expense
    }

    return true
  }

  // 按日期分组
  function getGroupedRecords(): RecordGroup[] {
    const groups: RecordGroup[] = []
    const dateMap: Record<string, RecordItem[]> = {}

    // 预计算 today / yesterday，避免循环内重复计算
    const todayStr = getTodayStr()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    for (const record of records.value) {
      if (!dateMap[record.date]) {
        dateMap[record.date] = []
      }
      dateMap[record.date].push(record)
    }

    const sortedDates = Object.keys(dateMap).sort((a, b) => b.localeCompare(a))
    for (const date of sortedDates) {
      let label: string
      if (date === todayStr) label = `今天 · ${date.slice(5).replace('-', '月')}日`
      else if (date === yesterdayStr) label = `昨天 · ${date.slice(5).replace('-', '月')}日`
      else label = `${date.slice(5).replace('-', '月')}日`

      groups.push({ date: label, records: dateMap[date] })
    }

    return groups
  }

  // 获取分类统计（从本地记录计算）
  function getCategoryStats(type: RecordType): { stats: CategoryStat[]; total: number } {
    const typeRecords = records.value.filter(r => r.type === type)
    const catMap: Record<string, CategoryStat> = {}
    let total = 0

    for (const record of typeRecords) {
      if (!catMap[record.categoryId]) {
        catMap[record.categoryId] = {
          categoryId: record.categoryId,
          categoryName: record.categoryName,
          categoryIcon: record.categoryIcon,
          amount: 0,
          percentage: 0,
          type
        }
      }
      catMap[record.categoryId].amount += record.amount
      total += record.amount
    }

    const stats = Object.values(catMap).map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
    })).sort((a, b) => b.amount - a.amount)

    return { stats, total }
  }

  return {
    records,
    monthSummary,
    currentMonth,
    currentMonthLabel,
    loadRecords,
    loadSummary,
    switchMonth,
    addRecord,
    getGroupedRecords,
    getCategoryStats
  }
})
