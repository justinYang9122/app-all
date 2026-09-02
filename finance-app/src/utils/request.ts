// ============================================================
// 财务管家 · uniCloud 云函数调用封装
// uniCloud 在 main.ts 中初始化，此处直接调用
// ============================================================
import type { CloudResponse } from '@/types'

/**
 * 调用 uniCloud 云函数
 * @param name 云函数名
 * @param data 请求数据
 * @returns 云函数返回结果
 */
export async function callCloud<T = unknown>(
  name: string,
  data: Record<string, unknown> = {}
): Promise<CloudResponse<T>> {
  try {
    const res = await uniCloud.callFunction({ name, data })
    const result = res.result as CloudResponse<T>

    if (result.code !== 0) {
      console.error(`[云函数 ${name}] 错误:`, result.message)
    }

    return result
  } catch (err) {
    console.error(`[云函数 ${name}] 调用异常:`, err)
    return {
      code: -1,
      message: '网络异常',
      data: null as T,
    }
  }
}

/**
 * 本地存储封装
 */
export const storage = {
  get(key: string): unknown {
    try {
      return uni.getStorageSync(key)
    } catch {
      return null
    }
  },

  set(key: string, value: unknown): void {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('存储失败:', e)
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('删除失败:', e)
    }
  },
}
