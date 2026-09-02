'use strict'
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { userId, month } = event // month: 'YYYY-MM'

  if (!userId || typeof userId !== 'string') {
    return { code: 1, message: '缺少用户ID', data: null }
  }
  // [建议修改 审查新增]：month 参数格式强校验，避免传入 '2026-8' 或
  // 其他脏字符串被直接拼成正则（会漏数据），也避免正则注入
  if (month !== undefined && month !== null && month !== '') {
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return { code: 1, message: 'month 格式应为 YYYY-MM', data: null }
    }
  }

  try {
    const query = { userId }

    if (month) {
      // 按月筛选：date 以 'YYYY-MM' 开头
      const dbCmd = db.command
      query.date = new RegExp('^' + month)
    }

    const res = await db.collection('records').where(query).orderBy('date', 'desc').orderBy('createdAt', 'desc').get()

    return {
      code: 0,
      message: '获取成功',
      data: res.data
    }
  } catch (e) {
    return { code: -1, message: '获取失败: ' + e.message, data: null }
  }
}
