// ============================================================
// 财务管家 · 分类状态管理
// 架构约束：所有写入先同步云端，成功→采用云返回数据；失败→降级本地
// （与 account store 的降级策略保持一致，确保三端行为对称）
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloud } from '@/utils/request'
import { genId } from '@/utils/format'
import { useRecordStore } from '@/stores/record'
import type { Category, RecordType } from '@/types'

/** 分类删除返回结果（区分失败原因，精准展示给用户） */
export interface CategoryDeleteResult {
  ok: boolean
  /** has_records = 存在关联记账记录，为避免数据偏差禁止删除 */
  errorCode?: 'has_records'
  errorMessage?: string
  /** has_records 时关联的记录条数 */
  relatedCount?: number
}

// Mock 分类数据（来自 design-spec.md §6）— 当 getCategories 云函数不可用时降级
const mockCategories: Category[] = [
  // 支出分类
  { id: 'cat_food', name: '餐饮', type: 'expense', icon: 'food' },
  { id: 'cat_transport', name: '交通', type: 'expense', icon: 'transport' },
  { id: 'cat_shopping', name: '购物', type: 'expense', icon: 'shopping' },
  { id: 'cat_entertainment', name: '娱乐', type: 'expense', icon: 'entertainment' },
  { id: 'cat_housing', name: '住房', type: 'expense', icon: 'housing' },
  { id: 'cat_medical', name: '医疗', type: 'expense', icon: 'medical' },
  { id: 'cat_communication', name: '通讯', type: 'expense', icon: 'communication' },
  { id: 'cat_clothing', name: '服饰', type: 'expense', icon: 'clothing' },
  { id: 'cat_social', name: '人情', type: 'expense', icon: 'social' },
  { id: 'cat_other_expense', name: '其他', type: 'expense', icon: 'other' },
  // 收入分类
  { id: 'cat_salary', name: '工资', type: 'income', icon: 'salary' },
  { id: 'cat_parttime', name: '兼职', type: 'income', icon: 'parttime' },
  { id: 'cat_bonus', name: '奖金', type: 'income', icon: 'bonus' },
  { id: 'cat_gift', name: '礼金', type: 'income', icon: 'gift' },
  { id: 'cat_other_income', name: '其他', type: 'income', icon: 'other' }
]

// 可选图标（支出/收入通用，取现有 mock 中用到过的所有图标去重）
export const categoryIcons = [
  'food', 'transport', 'shopping', 'entertainment', 'housing',
  'medical', 'communication', 'clothing', 'social', 'other',
  'salary', 'parttime', 'bonus', 'gift'
]

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([...mockCategories])
  const expenseCategories = computed(() =>
    categories.value.filter(c => c.type === 'expense')
  )
  const incomeCategories = computed(() =>
    categories.value.filter(c => c.type === 'income')
  )

  // 加载分类：优先云端拉取，失败用 mock
  async function loadCategories(userId: string): Promise<void> {
    try {
      const res = await callCloud<Category[]>('getCategories', { userId })
      if (res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
        categories.value = res.data
        return
      }
    } catch {
      // 云函数不可用，使用 Mock 数据
    }
    categories.value = [...mockCategories]
  }

  function getByType(type: RecordType): Category[] {
    return categories.value.filter(c => c.type === type)
  }

  function getById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  // 新增分类：先同步云端，成功→使用云返回ID；失败→本地生成ID
  async function addCategory(
    userId: string,
    name: string,
    type: RecordType,
    icon: string
  ): Promise<boolean> {
    const trimmed = name.trim()
    if (!trimmed) return false
    // 同类型下不允许重名（前置校验，避免浪费云端请求）
    if (categories.value.some(c => c.type === type && c.name === trimmed)) return false

    try {
      const res = await callCloud<Category>('addCategory', { userId, name: trimmed, type, icon })
      if (res.code === 0 && res.data) {
        categories.value.push(res.data)
        return true
      }
    } catch {
      // 云函数不可用，降级本地
    }

    categories.value.push({
      id: `local_cat_${genId('cat')}`,
      name: trimmed,
      type,
      icon
    })
    return true
  }

  // 修改分类：先同步云端，失败→本地仍然修改
  async function updateCategory(
    userId: string,
    id: string,
    name: string,
    icon: string
  ): Promise<boolean> {
    const trimmed = name.trim()
    if (!trimmed) return false
    const target = categories.value.find(c => c.id === id)
    if (!target) return false
    // 同类型下重名校验（排除自身）
    if (categories.value.some(
      c => c.type === target.type && c.name === trimmed && c.id !== id
    )) return false

    try {
      const res = await callCloud('updateCategory', { userId, categoryId: id, name: trimmed, icon })
      if (res.code === 0) {
        target.name = trimmed
        target.icon = icon
        return true
      }
    } catch {
      // 云函数不可用，降级本地
    }

    target.name = trimmed
    target.icon = icon
    return true
  }

  // 删除分类：先校验关联记录，有引用则拒绝删除（保护数据一致性，避免分类聚合统计漏算）
  async function deleteCategory(userId: string, id: string): Promise<CategoryDeleteResult> {
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx < 0) return { ok: false, errorMessage: '分类不存在' }

    // --- 前置校验：关联记录阻断 ---
    const recordStore = useRecordStore()
    const relatedCount = recordStore.records.filter(r => r.categoryId === id).length
    if (relatedCount > 0) {
      return {
        ok: false,
        errorCode: 'has_records',
        errorMessage: (
          `该分类下还有 ${relatedCount} 条历史记录，为避免分类统计出现偏差，暂不支持直接删除。\n` +
          `如需删除，请先在「明细」页删除或修改对应记录的分类。`
        ),
        relatedCount
      }
    }

    try {
      const res = await callCloud('deleteCategory', { userId, categoryId: id })
      if (res.code === 0) {
        categories.value.splice(idx, 1)
        return { ok: true }
      }
    } catch {
      // 云函数不可用，降级本地
    }

    categories.value.splice(idx, 1)
    return { ok: true }
  }

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loadCategories,
    getByType,
    getById,
    addCategory,
    updateCategory,
    deleteCategory
  }
})
