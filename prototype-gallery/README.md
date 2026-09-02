# 财务管家 · 原型导出包（AI 友好）

本目录是一个**自包含、面向 AI / 开发工具**的移动端原型导出，用于快速还原「财务管家」记账应用的前端代码。

## 目录结构
```
ai-export/
├── index.html          # 导航首页 + 设计令牌速览（入口）
├── tokens.css          # ★ 设计令牌唯一来源（颜色 / 圆角 / 阴影 / 字体）
├── components.css      # ★ 统一组件词汇（.app/.topbar/.dark-card/.list-item/.tabbar/.fab/.btn…）
├── login.html          # 01 登录
├── home.html           # 02 首页（概览 + 明细 + FAB）
├── record.html         # 03 记账（收支切换 + 分类网格）
├── stats.html          # 04 统计（汇总 + 分类占比）
├── accounts.html       # 05 账户（总资产 + 列表）
├── profile.html        # 06 我的（个人卡 + 设置）
└── design-spec.md      # ★ 自包含实现规范（令牌 + 组件树 + 数据模型）
```

## 给 AI 的使用顺序
1. 读 `tokens.css` → 整套管件令牌（颜色 / 圆角 / 阴影 / 字体）。
2. 读 `components.css` → 统一组件词汇与布局规则。
3. 读 `design-spec.md` → 拿到 6 页组件树（含精确数值）、数据模型、语义约定。
4. 读对应的 `*.html` → 拿到真实 DOM 标记与内联 SVG 图标（线性、stroke=currentColor，无 base64）。
5. 按"令牌变量化 → 全局组件 → 逐页拼装"的顺序生成代码。

> 本结构参照 Google Stitch 的「令牌 + 组件优先」产出思路：设计系统抽成可复用文件，页面只引用 + 保留局部差异。

## 关键约束
- 支出 = 红 `#E63329`（金额前缀 `-`）；收入 = 墨黑 `#111111`（前缀 `+`）。
- 选中态 / 主操作 = 红色填充 + 白字。
- 深色卡片（概览 / 总资产 / 汇总）统一黑底 `#0F0F0F`。
- 金额用 `tabular-nums` 等宽对齐。
- 移动端基准宽 390；小程序用 rpx（×2），H5 用 `max-width:390px` 居中。

## 推荐技术栈
uni-app（Vue3 + TypeScript）一套代码覆盖 H5 + 微信小程序 + App；或 React + Tailwind + Vite。
