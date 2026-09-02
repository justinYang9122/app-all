'use strict'
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  if (!userId) {
    return { code: 1, message: '缺少用户ID', data: null }
  }

  try {
    const res = await db.collection('accounts').where({ userId }).orderBy('sortOrder', 'asc').get()

    let totalAsset = 0
    for (const account of res.data) {
      totalAsset += account.balance || 0
    }

    return {
      code: 0,
      message: '获取成功',
      data: {
        accounts: res.data,
        totalAsset
      }
    }
  } catch (e) {
    return { code: -1, message: '获取失败: ' + e.message, data: null }
  }
}
