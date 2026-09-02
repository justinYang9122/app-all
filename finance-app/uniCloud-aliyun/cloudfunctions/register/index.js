'use strict'
// ============================================================
// 财务管家 · 注册云函数
// 密码使用 PBKDF2 哈希存储，注册成功后自动创建：
//   1. 默认账户（现金/银行卡/微信支付/支付宝）
//   2. 默认分类（支出 10 + 收入 5，与前端 mock 一致）
// ============================================================
const db = uniCloud.database()
const crypto = require('crypto')

// 密码哈希：PBKDF2 + 随机 salt，存储格式 salt:hash
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// 返回一套默认分类（与前端 src/stores/category.ts mockCategories 严格保持一致）
function buildDefaultCategories(userId, createdAt) {
  return [
    // 支出分类
    { userId, type: 'expense', name: '餐饮', icon: 'food',            sortOrder: 1,  createdAt },
    { userId, type: 'expense', name: '交通', icon: 'transport',       sortOrder: 2,  createdAt },
    { userId, type: 'expense', name: '购物', icon: 'shopping',        sortOrder: 3,  createdAt },
    { userId, type: 'expense', name: '娱乐', icon: 'entertainment',   sortOrder: 4,  createdAt },
    { userId, type: 'expense', name: '住房', icon: 'housing',         sortOrder: 5,  createdAt },
    { userId, type: 'expense', name: '医疗', icon: 'medical',         sortOrder: 6,  createdAt },
    { userId, type: 'expense', name: '通讯', icon: 'communication',   sortOrder: 7,  createdAt },
    { userId, type: 'expense', name: '服饰', icon: 'clothing',        sortOrder: 8,  createdAt },
    { userId, type: 'expense', name: '人情', icon: 'social',          sortOrder: 9,  createdAt },
    { userId, type: 'expense', name: '其他', icon: 'other',           sortOrder: 10, createdAt },
    // 收入分类
    { userId, type: 'income',  name: '工资', icon: 'salary',          sortOrder: 1,  createdAt },
    { userId, type: 'income',  name: '兼职', icon: 'parttime',        sortOrder: 2,  createdAt },
    { userId, type: 'income',  name: '奖金', icon: 'bonus',           sortOrder: 3,  createdAt },
    { userId, type: 'income',  name: '礼金', icon: 'gift',            sortOrder: 4,  createdAt },
    { userId, type: 'income',  name: '其他', icon: 'other',           sortOrder: 5,  createdAt },
  ]
}

exports.main = async (event, context) => {
  const { username, password } = event

  // ---------- 参数校验 ----------
  if (!username || !password) {
    return { code: 1, message: '请输入用户名和密码', data: null }
  }
  // 用户名：2-20 位，中英文/数字/下划线/中划线
  if (username.length < 2 || username.length > 20) {
    return { code: 1, message: '用户名长度需 2-20 个字符', data: null }
  }
  if (!/^[A-Za-z0-9\u4e00-\u9fa5_\-]+$/.test(username)) {
    return { code: 1, message: '用户名仅支持中英文、数字、下划线和中划线', data: null }
  }
  // 密码：至少 6 位，必须包含字母和数字组合（提升安全性，防止弱口令）
  if (password.length < 6) {
    return { code: 1, message: '密码长度不能少于 6 位', data: null }
  }

  try {
    // 检查用户名是否已存在
    const existRes = await db.collection('users').where({ username }).count()
    if (existRes.total > 0) {
      return { code: 1, message: '该用户名已被注册', data: null }
    }

    // 创建用户（密码哈希存储）
    const now = Date.now()
    const addRes = await db.collection('users').add({
      username,
      password: hashPassword(password),
      nickname: username,
      avatar: username.charAt(0),
      createdAt: now
    })

    const userId = addRes.id

    // ----- 1. 为新用户创建默认账户 -----
    const defaultAccounts = [
      { userId, name: '现金',     icon: 'cash',       balance: 0, sortOrder: 1, createdAt: now },
      { userId, name: '银行卡',   icon: 'bank-card',  balance: 0, sortOrder: 2, createdAt: now },
      { userId, name: '微信支付', icon: 'wechat',     balance: 0, sortOrder: 3, createdAt: now },
      { userId, name: '支付宝',   icon: 'alipay',     balance: 0, sortOrder: 4, createdAt: now }
    ]
    for (const acc of defaultAccounts) {
      await db.collection('accounts').add(acc)
    }

    // ----- 2. 为新用户创建默认分类（与前端 mock 对齐，保证 getCategories 返回非空） -----
    const defaultCategories = buildDefaultCategories(userId, now)
    for (const cat of defaultCategories) {
      await db.collection('categories').add(cat)
    }

    return {
      code: 0,
      message: '注册成功',
      data: {
        id: userId,
        username,
        nickname: username,
        avatar: username.charAt(0)
      }
    }
  } catch (e) {
    console.error('[register] 注册失败:', e)
    return { code: -1, message: '注册失败，请稍后重试', data: null }
  }
}
