'use strict'
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { userId, month } = event // month: 'YYYY-MM'

  if (!userId) {
    return { code: 1, message: '缺少用户ID', data: null }
  }

  try {
    // 获取该月所有记录
    const res = await db.collection('records').where({
      userId,
      date: new RegExp('^' + month)
    }).get()

    let income = 0
    let expense = 0

    for (const record of res.data) {
      if (record.type === 'income') {
        income += record.amount
      } else {
        expense += record.amount
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: {
        income,
        expense,
        balance: income - expense
      }
    }
  } catch (e) {
    return { code: -1, message: '获取失败: ' + e.message, data: null }
  }
}
