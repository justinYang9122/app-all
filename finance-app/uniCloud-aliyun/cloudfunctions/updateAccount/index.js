'use strict'
// ============================================================
// 财务管家 · 更新账户云函数
// 支持修改账户名称和余额
// ============================================================
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { userId, accountId, name, balance } = event

  if (!userId || !accountId) {
    return { code: 1, message: '缺少必要参数', data: null }
  }

  try {
    // 校验账户归属权
    const accRes = await db.collection('accounts').where({ _id: accountId, userId }).get()
    if (accRes.data.length === 0) {
      return { code: 1, message: '账户不存在或无权操作', data: null }
    }

    // 构建更新数据
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (balance !== undefined) updateData.balance = Number(balance)

    await db.collection('accounts').doc(accountId).update(updateData)

    return {
      code: 0,
      message: '更新成功',
      data: null
    }
  } catch (e) {
    console.error('[updateAccount] 更新失败:', e)
    return { code: -1, message: '更新失败，请稍后重试', data: null }
  }
}
