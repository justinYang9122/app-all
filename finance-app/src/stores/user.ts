// ============================================================
// 财务管家 · 用户状态管理
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { callCloud, storage } from '@/utils/request'
import type { UserInfo } from '@/types'

const STORAGE_KEY = 'finance_user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  // 从本地存储恢复登录态
  function restoreLogin() {
    const saved = storage.get(STORAGE_KEY) as UserInfo | null
    if (saved) {
      userInfo.value = saved
    }
  }

  // 登录
  async function login(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
    const res = await callCloud<UserInfo>('login', { username, password })
    if (res.code === 0 && res.data) {
      userInfo.value = res.data
      storage.set(STORAGE_KEY, res.data)
      return { ok: true }
    }
    // 开发环境降级：云函数不可用时使用本地登录（仅开发模式，生产环境不降级）
    if (import.meta.env.DEV && res.code === -1) {
      const localUser: UserInfo = {
        id: `local_${username}`,
        username,
        nickname: username,
        avatar: username.charAt(0)
      }
      userInfo.value = localUser
      storage.set(STORAGE_KEY, localUser)
      return { ok: true }
    }
    return { ok: false, message: res.message }
  }

  // 注册
  async function register(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
    const res = await callCloud<UserInfo>('register', { username, password })
    if (res.code === 0 && res.data) {
      userInfo.value = res.data
      storage.set(STORAGE_KEY, res.data)
      return { ok: true }
    }
    // 开发环境降级：云函数不可时时使用本地注册
    if (import.meta.env.DEV && res.code === -1) {
      const localUser: UserInfo = {
        id: `local_${username}`,
        username,
        nickname: username,
        avatar: username.charAt(0)
      }
      userInfo.value = localUser
      storage.set(STORAGE_KEY, localUser)
      return { ok: true }
    }
    return { ok: false, message: res.message }
  }

  // 退出登录
  function logout() {
    userInfo.value = null
    storage.remove(STORAGE_KEY)
    uni.reLaunch({ url: '/pages/login/login' })
  }

  return {
    userInfo,
    isLoggedIn,
    restoreLogin,
    login,
    register,
    logout
  }
})
