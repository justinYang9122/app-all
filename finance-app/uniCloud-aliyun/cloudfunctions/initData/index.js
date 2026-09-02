'use strict'
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { userId } = event

  if (!userId) {
    return { code: 1, message: '缺少用户ID', data: null }
  }

  try {
    // 检查是否已初始化
    const categoryCheck = await db.collection('categories').count()
    if (categoryCheck.total > 0) {
      // 检查用户是否已有账户
      const accountCheck = await db.collection('accounts').where({ userId }).count()
      if (accountCheck.total > 0) {
        return { code: 0, message: '数据已初始化', data: null }
      }
    }

    // 预置分类数据
    const categories = [
      // 支出分类（10）
      { name: '餐饮', type: 'expense', icon: 'food', sortOrder: 1 },
      { name: '交通', type: 'expense', icon: 'transport', sortOrder: 2 },
      { name: '购物', type: 'expense', icon: 'shopping', sortOrder: 3 },
      { name: '娱乐', type: 'expense', icon: 'entertainment', sortOrder: 4 },
      { name: '住房', type: 'expense', icon: 'housing', sortOrder: 5 },
      { name: '医疗', type: 'expense', icon: 'medical', sortOrder: 6 },
      { name: '通讯', type: 'expense', icon: 'communication', sortOrder: 7 },
      { name: '服饰', type: 'expense', icon: 'clothing', sortOrder: 8 },
      { name: '人情', type: 'expense', icon: 'social', sortOrder: 9 },
      { name: '其他', type: 'expense', icon: 'other', sortOrder: 10 },
      // 收入分类（5）
      { name: '工资', type: 'income', icon: 'salary', sortOrder: 11 },
      { name: '兼职', type: 'income', icon: 'parttime', sortOrder: 12 },
      { name: '奖金', type: 'income', icon: 'bonus', sortOrder: 13 },
      { name: '礼金', type: 'income', icon: 'gift', sortOrder: 14 },
      { name: '其他', type: 'income', icon: 'other', sortOrder: 15 }
    ]

    // 批量插入分类（如果还没有）
    if (categoryCheck.total === 0) {
      for (const cat of categories) {
        await db.collection('categories').add(cat)
      }
    }

    // 为用户预置 4 个默认账户
    const accounts = [
      { userId, name: '现金', icon: 'cash', balance: 0, sortOrder: 1 },
      { userId, name: '银行卡', icon: 'bank-card', balance: 0, sortOrder: 2 },
      { userId, name: '微信支付', icon: 'wechat', balance: 0, sortOrder: 3 },
      { userId, name: '支付宝', icon: 'alipay', balance: 0, sortOrder: 4 }
    ]

    for (const acc of accounts) {
      await db.collection('accounts').add({
        ...acc,
        createdAt: Date.now()
      })
    }

    return { code: 0, message: '初始化成功', data: null }
  } catch (e) {
    return { code: -1, message: '初始化失败: ' + e.message, data: null }
  }
}
