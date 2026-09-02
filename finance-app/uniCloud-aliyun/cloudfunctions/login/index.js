'use strict'
// ============================================================
// 财务管家 · 登录云函数
// 密码使用 PBKDF2 哈希比较，统一错误消息防止用户枚举
// ============================================================
const db = uniCloud.database()
const crypto = require('crypto')

// 密码校验：PBKDF2 比较哈希
function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false
  const parts = stored.split(':')
  if (parts.length !== 2) return false
  const salt = parts[0]
  const hash = parts[1]
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === verify
}

exports.main = async (event, context) => {
  const { username, password } = event

  if (!username || !password) {
    return { code: 1, message: '请输入用户名和密码', data: null }
  }

  try {
    const res = await db.collection('users').where({ username }).get()

    // 统一错误消息，防止用户枚举
    const user = res.data[0]
    if (!user || !verifyPassword(password, user.password)) {
      return { code: 1, message: '用户名或密码错误', data: null }
    }

    return {
      code: 0,
      message: '登录成功',
      data: {
        id: user._id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || (user.nickname || user.username).charAt(0)
      }
    }
  } catch (e) {
    console.error('[login] 登录失败:', e)
    return { code: -1, message: '登录失败，请稍后重试', data: null }
  }
}
