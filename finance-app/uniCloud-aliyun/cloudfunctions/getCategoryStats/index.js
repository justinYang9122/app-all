'use strict'
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { userId, month, type } = event // type: 'expense' | 'income', 默认 expense

  if (!userId) {
    return { code: 1, message: '缺少用户ID', data: null }
  }

  try {
    const queryType = type || 'expense'

    const res = await db.collection('records').where({
      userId,
      type: queryType,
      date: new RegExp('^' + month)
    }).get()

    // 按分类汇总
    const categoryMap = {}
    let total = 0

    for (const record of res.data) {
      const catId = record.categoryId
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          categoryId: catId,
          categoryName: record.categoryName,
          categoryIcon: record.categoryIcon,
          amount: 0,
          type: queryType
        }
      }
      categoryMap[catId].amount += record.amount
      total += record.amount
    }

    // 转换为数组并计算占比
    const stats = Object.values(categoryMap).map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
    }))

    // 按金额降序排序
    stats.sort((a, b) => b.amount - a.amount)

    return {
      code: 0,
      message: '获取成功',
      data: { stats, total }
    }
  } catch (e) {
    return { code: -1, message: '获取失败: ' + e.message, data: null }
  }
}
