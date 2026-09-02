'use strict'
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { userId, type, categoryId, categoryName, categoryIcon, amount, note, accountId, accountName, date } = event

  if (!userId || !type || !categoryId || !amount || !date) {
    return { code: 1, message: '缺少必要参数', data: null }
  }

  // [建议修改 审查新增]：type 只能是 expense / income，防止脏数据写入
  // （前端被绕过直接调用云函数时可能提交非法值）
  if (type !== 'expense' && type !== 'income') {
    return { code: 1, message: 'type 参数非法，应为 expense 或 income', data: null }
  }

  // [建议修改 审查新增]：amount 必须是正数（金额不允许 0/负数/NaN）
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return { code: 1, message: 'amount 必须为正数', data: null }
  }

  // [建议修改 审查新增]：date 必须是 YYYY-MM-DD 格式
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { code: 1, message: 'date 格式应为 YYYY-MM-DD', data: null }
  }

  try {
    // 插入记录
    const addRes = await db.collection('records').add({
      userId,
      type,
      categoryId,
      categoryName,
      categoryIcon,
      amount,
      note: note || '',
      accountId,
      accountName,
      date,
      createdAt: Date.now()
    })

    // 更新账户余额
    if (accountId) {
      const balanceChange = type === 'expense' ? -amount : amount
      await db.collection('accounts').doc(accountId).update({
        balance: dbCmd.inc(balanceChange)
      })
    }

    return {
      code: 0,
      message: '保存成功',
      data: { id: addRes.id }
    }
  } catch (e) {
    return { code: -1, message: '保存失败: ' + e.message, data: null }
  }
}
