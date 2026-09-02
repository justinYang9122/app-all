// ============================================================
// 财务管家 · TypeScript 类型定义
// 基于 design-spec.md §6 数据模型
// ============================================================

// 记录类型：支出 / 收入
export type RecordType = 'expense' | 'income';

// 分类
export interface Category {
  id: string;
  name: string;
  type: RecordType;
  icon: string; // 图标组件名
}

// 账户
export interface Account {
  id: string;
  name: string;
  icon: string; // 图标组件名
  balance: number;
}

// 记账记录
export interface RecordItem {
  id: string;
  type: RecordType;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  amount: number; // 正数，正负由 type 决定
  note: string;
  accountId: string;
  accountName: string;
  date: string; // YYYY-MM-DD
  createdAt: number; // 创建时间戳
}

// 用户信息
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string; // 头像首字
}

// 月度汇总
export interface MonthSummary {
  income: number; // 收入总额
  expense: number; // 支出总额
  balance: number; // 结余 = 收入 - 支出
}

// 分类统计项
export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number; // 占比 0-100
  type: RecordType;
}

// 云函数响应
export interface CloudResponse<T = unknown> {
  code: number; // 0 成功，非 0 失败
  message: string;
  data: T;
}

// 按日期分组的记录
export interface RecordGroup {
  date: string; // 日期标签：今天 / 昨天 / YYYY-MM-DD
  records: RecordItem[];
}
