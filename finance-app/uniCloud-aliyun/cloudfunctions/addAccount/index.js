'use strict'
// ============================================================
// 财务管家 · 添加账户云函数
// ============================================================
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { userId, name, icon } = event

  if (!userId || !name || !icon) {
    return { code: 1, message: '缺少必要参数', data: null }
  }

  try {
    // 获取当前账户数量作为排序序号
    const countRes = await db.collection('accounts').where({ userId }).count()
    const sortOrder = countRes.total + 1

    const addRes = await db.collection('accounts').add({
      userId,
      name,
      icon,
      balance: 0,
      sortOrder,
      createdAt: Date.now()
    })

    return {
      code: 0,
      message: '添加成功',
      data: {
        id: addRes.id,
        name,
        icon,
        balance: 0,
        sortOrder
      }
    }
  } catch (e) {
    console.error('[addAccount] 添加失败:', e)
    return { code: -1, message: '添加失败，请稍后重试', data: null }
  }
}
