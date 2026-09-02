// ============================================================
// 财务管家 · 格式化工具函数
// ============================================================
import type { RecordType } from '@/types'

/**
 * 格式化数字（千分位，保留两位小数）
 * 自实现千分位，不依赖 Intl API，兼容微信小程序
 */
export function formatNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return '0.00'
  const fixed = Math.abs(value).toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return value < 0 ? `-${grouped}.${decPart}` : `${grouped}.${decPart}`
}

/**
 * 格式化金额（带正负号和货币符号）
 * 支出：-¥ 38.00  收入：+¥ 8,200.00
 */
export function formatAmount(amount: number, type: RecordType): string {
  const formatted = formatNumber(amount)
  if (type === 'expense') return `-¥ ${formatted}`
  return `+¥ ${formatted}`
}

/**
 * 格式化金额（带货币符号，无正负号）
 */
export function formatMoney(amount: number): string {
  return `¥ ${formatNumber(amount)}`
}

/**
 * 格式化日期（YYYY-MM-DD → 中文标签）
 * 今天 / 昨天 / M月D日
 */
export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  // 使用本地时间构造，避免 UTC 时区偏移
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dateOnly = new Date(year, month - 1, day)
  dateOnly.setHours(0, 0, 0, 0)

  if (dateOnly.getTime() === today.getTime()) return '今天'
  if (dateOnly.getTime() === yesterday.getTime()) return '昨天'
  return `${month}月${day}日`
}

/**
 * 格式化日期带日期标签（今天 · 8月19日）
 */
export function formatDateWithLabel(dateStr: string): string {
  const label = formatDate(dateStr)
  const parts = dateStr.split('-')
  if (parts.length !== 3) return label
  const month = Number(parts[1])
  const day = Number(parts[2])
  return `${label} · ${month}月${day}日`
}

/**
 * 格式化月份（2026年8月）
 */
export function formatMonth(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

/**
 * 格式化月份（2026.08）
 */
export function formatMonthShort(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}.${month}`
}

/**
 * 获取月份键（YYYY-MM，零填充）
 * 用于记录筛选和汇总匹配，确保与 date 字段 YYYY-MM-DD 前缀一致
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 获取当前日期字符串（YYYY-MM-DD）
 */
export function getTodayStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取当前时间戳
 */
export function nowTimestamp(): number {
  return Date.now()
}

/**
 * 生成唯一 ID（时间戳 + 随机数，避免毫秒内冲突）
 */
export function genId(prefix: string = 'local'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ============================================================
// 以下：导出工具（CSV + 文件/剪贴板）
// ============================================================

/**
 * 生成 CSV 格式账单数据（表格形式）
 * 包含 UTF-8 BOM 头，确保 Excel / WPS 打开中文不乱码
 */
export function buildRecordsCsv(records: Array<{
  date: string
  type: 'expense' | 'income'
  categoryName: string
  amount: number
  accountName: string
  note?: string
}>): string {
  // 表头
  const header = ['日期', '类型', '分类', '金额', '账户', '备注']
  // 行数据
  const rows = records.map(r => {
    const typeStr = r.type === 'expense' ? '支出' : '收入'
    const note = (r.note || '').replace(/,/g, '，').replace(/\n/g, ' ')
    return [
      r.date,
      typeStr,
      r.categoryName,
      r.amount.toFixed(2),
      r.accountName,
      note
    ]
  })
  // 汇总行
  const income = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const balance = income - expense
  const summaryRow = ['', '汇总', `共${records.length}条`, `收入:${income.toFixed(2)} / 支出:${expense.toFixed(2)}`, `结余:${balance.toFixed(2)}`, '']

  const allRows = [header, ...rows, summaryRow]
  const csvContent = allRows
    .map(row => row.map(cell => {
      // 如果单元格包含逗号、引号、换行，则用引号包裹并转义内部引号（符合 RFC 4180）
      const str = String(cell ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(','))
    .join('\n')

  // 添加 UTF-8 BOM：Excel 默认按 GBK 读取，加 BOM 后可识别为 UTF-8
  return '\ufeff' + csvContent
}

/**
 * 导出账单：弹窗让用户选择「导出为文件」或「复制到剪贴板」
 * 兼容 H5 / 小程序 / App 三端
 */
export async function exportRecords(records: Parameters<typeof buildRecordsCsv>[0], monthLabel?: string): Promise<void> {
  if (records.length === 0) {
    uni.showToast({ title: '暂无记录可导出', icon: 'none' })
    return
  }

  const csv = buildRecordsCsv(records)
  const fileName = `账单_${monthLabel || '全部'}_${new Date().toISOString().slice(0, 10)}.csv`

  // #ifdef H5
  // H5 端：同时支持文件下载 + 剪贴板
  uni.showActionSheet({
    itemList: ['📁 导出为 CSV 文件（表格形式）', '📋 复制到剪贴板'],
    success: (res) => {
      if (res.tapIndex === 0) {
        downloadFileH5(csv, fileName)
      } else if (res.tapIndex === 1) {
        copyToClipboard(csv)
      }
    }
  })
  // #endif

  // #ifndef H5
  // 小程序 / App 端：根据能力调整选项
  const itemList: string[] = ['📋 复制到剪贴板']
  // #ifdef APP-PLUS
  itemList.unshift('📁 导出为 CSV 文件（表格形式）')
  // #endif

  uni.showActionSheet({
    itemList,
    success: async (res) => {
      // APP 端 itemList = [文件, 剪贴板]；小程序端 = [剪贴板]
      const isAppFileChoice = itemList.length === 2 && res.tapIndex === 0
      if (isAppFileChoice) {
        await saveFileApp(csv, fileName)
      } else {
        copyToClipboard(csv)
      }
    }
  })
  // #endif
}

/**
 * H5 端下载文件
 */
function downloadFileH5(content: string, fileName: string): void {
  try {
    // #ifdef H5
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    uni.showToast({ title: '文件已下载', icon: 'success' })
    // #endif
    // #ifndef H5
    copyToClipboard(content)
    // #endif
  } catch (e) {
    console.error('下载失败:', e)
    uni.showToast({ title: '下载失败，请重试', icon: 'none' })
  }
}

/**
 * App 端保存文件到公共文档目录
 */
async function saveFileApp(content: string, fileName: string): Promise<void> {
  try {
    // #ifdef APP-PLUS
    // @ts-ignore - plus 仅在 App 端全局存在
    if (typeof plus !== 'undefined') {
      // @ts-ignore
      plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, (fs: any) => {
        fs.root.getFile(fileName, { create: true }, (fileEntry: any) => {
          fileEntry.createWriter((writer: any) => {
            writer.onwrite = () => {
              uni.showModal({
                title: '导出成功',
                content: `文件已保存到公共文档目录：${fileName}`,
                showCancel: false,
                confirmText: '知道了'
              })
            }
            writer.onerror = () => {
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
            writer.write(content)
          }, () => {
            uni.showToast({ title: '保存失败', icon: 'none' })
          })
        }, () => {
          uni.showToast({ title: '保存失败', icon: 'none' })
        })
      }, () => {
        uni.showToast({ title: '保存失败', icon: 'none' })
      })
      return
    }
    // #endif
    // 非 App 端或 plus 不可用时，降级到剪贴板
    copyToClipboard(content)
  } catch (e) {
    console.error('保存文件失败:', e)
    copyToClipboard(content)
  }
}

/**
 * 复制内容到剪贴板（统一 API，三端通用）
 */
function copyToClipboard(content: string): void {
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({ title: '账单已复制到剪贴板', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请重试', icon: 'none' })
    }
  })
}
