// ============================================================
// 财务管家 · 账户状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloud } from '@/utils/request'
import { nowTimestamp } from '@/utils/format'
import { useRecordStore } from '@/stores/record'
import type { Account } from '@/types'

/** 删除操作返回结果（支持区分失败原因，便于调用方展示精准提示） */
export interface DeleteResult {
  ok: boolean
  /** has_records = 存在关联记账记录，为避免数据偏差禁止删除 */
  errorCode?: 'has_records'
  /** 面向用户的错误文案（已本地化） */
  errorMessage?: string
  /** has_records 时附带的关联记录条数，可直接展示给用户 */
  relatedCount?: number
}

// Mock 账户数据（来自原型 accounts.html）— 当 getAccounts 云函数不可用时降级
const mockAccounts: Account[] = [
  { id: 'acc_cash', name: '现金', icon: 'cash', balance: 1250 },
  { id: 'acc_bank', name: '银行卡', icon: 'bank-card', balance: 18500.8 },
  { id: 'acc_wechat', name: '微信支付', icon: 'wechat', balance: 2300 },
  { id: 'acc_alipay', name: '支付宝', icon: 'alipay', balance: 1400 }
]

// 可选账户图标
export const accountIcons = ['cash', 'bank-card', 'wechat', 'alipay']

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([...mockAccounts])
  const totalAsset = computed(() =>
    accounts.value.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  )

  // 加载账户：优先云端拉取，失败用 mock
  async function loadAccounts(userId: string): Promise<void> {
    try {
      const res = await callCloud<{ accounts: Account[]; totalAsset: number }>('getAccounts', { userId })
      if (res.code === 0 && res.data) {
        accounts.value = res.data.accounts
        return
      }
    } catch {
      // 云函数不可用，使用 Mock 数据
    }
    accounts.value = [...mockAccounts]
  }

  // 根据ID获取账户
  function getById(id: string): Account | undefined {
    return accounts.value.find(a => a.id === id)
  }

  // 添加账户
  async function addAccount(userId: string, name: string, icon: string, balance: number = 0): Promise<boolean> {
    try {
      const res = await callCloud<Account>('addAccount', { userId, name, icon, balance })
      if (res.code === 0 && res.data) {
        accounts.value.push(res.data)
        return true
      }
    } catch {
      // 云函数不可用
    }
    // 本地降级
    const newAcc: Account = {
      id: `local_acc_${nowTimestamp()}`,
      name,
      icon,
      balance
    }
    accounts.value.push(newAcc)
    return true
  }

  // 更新账户余额
  async function updateAccount(userId: string, accountId: string, balance: number): Promise<boolean> {
    try {
      const res = await callCloud('updateAccount', { userId, accountId, balance })
      if (res.code === 0) {
        const acc = accounts.value.find(a => a.id === accountId)
        if (acc) acc.balance = balance
        return true
      }
    } catch {
      // 云函数不可用
    }
    // 本地降级
    const acc = accounts.value.find(a => a.id === accountId)
    if (acc) acc.balance = balance
    return true
  }

  // 更新账户名称和图标
  async function updateAccountInfo(userId: string, accountId: string, name: string, icon: string): Promise<boolean> {
    try {
      const res = await callCloud('updateAccount', { userId, accountId, name, icon })
      if (res.code === 0) {
        const acc = accounts.value.find(a => a.id === accountId)
        if (acc) {
          acc.name = name
          acc.icon = icon
        }
        return true
      }
    } catch {
      // 云函数不可用
    }
    // 本地降级
    const acc = accounts.value.find(a => a.id === accountId)
    if (acc) {
      acc.name = name
      acc.icon = icon
    }
    return true
  }

  // 删除账户：先校验关联记录，有引用则拒绝删除（保护数据一致性，防止聚合统计漏算）
  async function deleteAccount(userId: string, accountId: string): Promise<DeleteResult> {
    // --- 前置校验：关联记录阻断 ---
    const recordStore = useRecordStore()
    const relatedCount = recordStore.records.filter(r => r.accountId === accountId).length
    if (relatedCount > 0) {
      return {
        ok: false,
        errorCode: 'has_records',
        errorMessage: (
          `该账户下还有 ${relatedCount} 条历史记录，为避免数据统计出现偏差，暂不支持直接删除。\n` +
          `如需删除，请先在「明细」页删除或迁移对应记录。`
        ),
        relatedCount
      }
    }

    try {
      const res = await callCloud('deleteAccount', { userId, accountId })
      if (res.code === 0) {
        const idx = accounts.value.findIndex(a => a.id === accountId)
        if (idx > -1) accounts.value.splice(idx, 1)
        return { ok: true }
      }
    } catch {
      // 云函数不可用，降级本地
    }
    // 本地降级
    const idx = accounts.value.findIndex(a => a.id === accountId)
    if (idx > -1) accounts.value.splice(idx, 1)
    return { ok: true }
  }

  return {
    accounts,
    totalAsset,
    loadAccounts,
    getById,
    addAccount,
    updateAccount,
    updateAccountInfo,
    deleteAccount
  }
})
