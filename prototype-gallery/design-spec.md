# 财务管家 · AI 实现规范（自包含版）

> 本文档为**自包含**规格：设计令牌 + 全局组件 + 6 页组件树（含精确数值）+ 数据模型。
> 配合 `ai-export/` 下的 6 个独立 HTML 页面（`login.html` / `home.html` / `record.html` / `stats.html` / `accounts.html` / `profile.html`）一起使用——HTML 是可直接解析的真实标记，本规范是其结构化说明。
> 目标：让 AI / 开发工具一次性读懂布局与样式，并据此生成代码（推荐 uni-app Vue3 + TS，或 React + Tailwind）。

### 0. 文件即设计系统（先读这两个）
- **`tokens.css`** — 设计令牌**唯一来源**：颜色、圆角、阴影、字体、画布尺寸，全部以 CSS 变量定义（`:root{ --red:#E63329; ... }`）。
- **`components.css`** — **统一组件词汇**：`.app` / `.topbar` / `.dark-card` / `.list-item` / `.icon-block` / `.tabbar` / `.fab` / `.btn` / `.field` / `.toggle` 等，跨 6 页复用，类名一致。
- 6 个页面只 `<link>` 上述两份 + 各自**独有**的少量局部样式（品牌区、分类网格、图表等），不再重复定义令牌与公共组件。
- 这样其他 AI 读两份文件即可掌握整套管件，再逐页拼装——与 Google Stitch「令牌 + 组件优先」的产出思路一致。

---

## 1. 项目概览

| 项 | 值 |
|---|---|
| 产品名 | 财务管家 |
| 类型 | 个人 / 家庭轻量记账 App |
| 目标平台 | H5 + 微信小程序 + App（一套 uni-app Vue3 代码） |
| 风格 | 红黑高反差 · 简洁大方 |
| 画布尺寸 | 390 × 844（移动端优先，1px ≈ 2rpx） |
| 适配 | 移动端优先；PC 端居中容器 + 断点重排 |
| 主题 | 浅色为主；深色卡片（概览/总资产）用黑底 |

---

## 2. 设计令牌（Design Tokens）

### 2.1 颜色
| 令牌 | 色值 | 用途 |
|---|---|---|
| `primary` | `#E63329` | 主按钮、支出金额、选中态、Logo、FAB |
| `primary-dark` | `#B81F1B` | 主红按下 / hover 态 |
| `black` | `#0F0F0F` | 概览卡 / 总资产卡底、头像底、账户图标底 |
| `ink` | `#111111` | 主文字、收入金额、图表深色段 |
| `gray` | `#8A8A8E` | 次级文字、图标未选中态、占位 |
| `muted` | `#9A9A9E` | 深色卡片上的标签文字 |
| `border` | `#EBEBED` | 分割线、输入框描边 |
| `bg` | `#F6F6F7` | 页面背景、输入框底、图标块底、Tab 胶囊底 |
| `white` | `#FFFFFF` | 卡片、列表项、按钮文字 |
| `chart-3` | `#555555` | 分类占比第三段 |
| `chart-4` | `#C9C9CE` | 分类占比第四段 / 占位 |
| `red-soft` | `#FDEBE9` | 退出登录按钮 hover 态底 |

### 2.2 字体
- 中文：系统无衬线（PingFang SC / Microsoft YaHei）
- 数字 / 金额：`Inter`，`font-variant-numeric: tabular-nums`（等宽数字）
- 字重：Regular 400 / SemiBold 600 / Bold 700

### 2.3 字号（px）
| 用途 | 字号 |
|---|---|
| 大金额（结余 / 总资产 / 记账输入） | 32–48 |
| 品牌名 | 30 |
| 导航栏标题 | 16–17 |
| 卡片金额 / 列表金额 | 17 |
| 正文 / 问候语 | 15–18 |
| 输入框文字 | 15 |
| 次级标签 | 12–13 |
| 分类 / Tab 标签 | 10–11 |

### 2.4 圆角（px）
| 用途 | 圆角 |
|---|---|
| 大卡片（概览 / 总资产 / 汇总） | 20 |
| 卡片 / 列表项 | 14–16 |
| 图标块 | 12 |
| 按钮 | 14 |
| 胶囊（Tab Bar / 切换） | 24–28 |

### 2.5 间距（px）
| 用途 | 间距 |
|---|---|
| 页面左右内边距 | 16–20 |
| 大区块间距 | 24–32 |
| 组件内间距 | 8–16 |
| 圆点 / 图标间隔 | 8–12 |

### 2.6 阴影
- 卡片：`0 2px 10px rgba(0,0,0,0.04)`
- FAB：`0 6px 14px rgba(230,51,41,0.4)`

### 2.7 全局常量
- 屏幕宽 `390`，TabBar 高 `83`（含安全区），FAB 直径 `56`，主按钮高 `48–52`。

---

## 3. 全局组件

### 3.1 TabBar（底部胶囊导航）
- 位置：固定底部，高 83px；外层胶囊 `bg #F6F6F7`、圆角 28、水平居中、内边距约 6px。
- 4 项：**首页 / 统计 / 账户 / 我的**；每项 = 线性图标（20px）+ 文字（11px）。
- 选中态：红底白字白图标（`#E63329` 胶囊）；未选中：灰字灰图标（`#8A8A8E`）。
- 仅「首页」页显示右下 FAB；其余页面 TabBar 同款但无 FAB。

### 3.2 FAB（悬浮记账按钮）
- 仅首页：红色圆形 `Ø56`，右下 `right:20 bottom:100`（在 TabBar 之上），白「+」图标 28px，阴影 `0 6px 14px rgba(230,51,41,0.4)`。
- 点击 → 跳转记账页。

### 3.3 图标集（线性 SVG，stroke 1.6，currentColor）
- Tab 图标（4）：home / chart / wallet / user
- 分类图标（15）：餐饮 / 交通 / 购物 / 娱乐 / 住房 / 医疗 / 通讯 / 服饰 / 人情 / 其他 / 工资 / 兼职 / 奖金 / 礼金 / 收入-其他
- 通用图标：user、lock、plus、arrow-right、chevron、export、search、setting 等
- 账户图标（4）：现金 / 银行卡 / 微信 / 支付宝（黑色圆形底 `#0F0F0F` + 白图标）

### 3.4 卡片 / 列表项
- `card`：白底、圆角 16、阴影 `0 2px 10px rgba(0,0,0,0.04)`、内边距 16。
- `list-item`：白底圆角 14、左图标块（`bg #F6F6F7` 圆角 12，40×40）+ 名称/备注 + 右侧金额（支出红 `#E63329` / 收入黑 `#111111`）。

### 3.5 主按钮 / 输入框
- `btn-primary`：红底 `#E63329`、白字、全宽、高 50、圆角 14、字重 600。
- `input`：浅灰底 `#F6F6F7`、圆角 12、左图标 + 占位灰字、高 48。

---

## 4. 页面组件树（6 页）

> 约定：`<!-- -->` 为样式提示；金额正负：支出 `-`（红），收入 `+`（黑）。

### 4.1 登录页 `login.html`
```
.screen (390×844, bg #FFFFFF, flex-col, pad 24)
  .brand (center)                         <!-- 垂直居中区 -->
    .logo  (Ø72, radius 20, bg #E63329)   <!-- 白「¥」30px -->
    .title "财务管家"  (30, Bold, #111)
    .subtitle "记录每一笔 · 掌控每一天" (14, #8A8A8E)
  .form (gap 14)
    .input (user icon)  placeholder "用户名 / 手机号"
    .input (lock icon)  placeholder "密码" type password
  .btn-primary "登录"  (full width)
  .link "还没有账号？立即注册" (14, #E63329, center)
```
- 无 TabBar、无 FAB。

### 4.2 首页 `home.html`
```
.screen (bg #F6F6F7, flex-col)
  .topbar (pad 16, between)
    .greeting "早上好，栗子" (17, SemiBold, #111)
    .avatar (Ø40, circle #0F0F0F) "栗" (white 16)
  .overview-card (bg #0F0F0F, radius 20, pad 20, margin 16)
    .row (between)
      .label "本月结余" (13, #9A9A9E)
      .month-switch "8月 ▾" (13, #9A9A9E)
    .amount "¥ 3,280.00" (36, Bold, #FFF, tabular)
    .divider (1px #2A2A2A)
    .row2 (between)
      .sub "收入 ¥ 8,200" (14, #FFF)
      .sub "支出 ¥ 4,920" (14, #E63329)
  .section-head (pad 16 16 8)  "本月明细"  +  .more "全部 ›" (#8A8A8E)
  .list (pad 0 16)
    .date-group "今天"
      .list-item (餐饮 / 午餐 / -¥38.00 红)
      .list-item (交通 / 地铁 / -¥6.00 红)
    .date-group "昨天"
      .list-item (工资 / 薪资 / +¥8,200.00 黑)
  TabBar (首页选中) + FAB "＋" (red, bottom-right)
```

### 4.3 记账页 `record.html`
```
.screen (bg #F6F6F7, flex-col)
  .navbar (between, pad 16)
    .cancel "取消" (#8A8A8E)
    .title "记一笔" (17, SemiBold)
    .save "保存" (#E63329, SemiBold)
  .type-switch (capsule, bg #F6F6F7, radius 24)
    .seg active "支出" (red bg, white)  | .seg "收入" (gray)
  .amount-input "¥ 0.00" (40, Bold, #111, tabular, center)
  .category-grid (5 cols, gap 12)
    .cat (icon-block 48 radius12 + label 11)  ×10 (支出) / ×5 (收入)
    .cat.active (red bg, white icon+label)
  .fields (card, pad 16, gap 14)
    .field "账户  ›"  (value: 微信支付)
    .field "备注  …"  (placeholder)
    .field "日期  ›"  (value: 2026-08-20)
  .btn-primary "保存到账本" (full width, margin 16)
```
- 无 TabBar（顶部返回式导航）；无 FAB。

### 4.4 统计页 `stats.html`
```
.screen (bg #F6F6F7, flex-col)
  .navbar (between, pad 16)
    .month "2026年8月 ▾" (17, SemiBold)
    .export "导出" (#E63329, SemiBold)
  .summary-card (bg #0F0F0F, radius 20, pad 20)
    .label "本月结余" (13, #9A9A9E)
    .amount "¥ 3,280.00" (34, Bold, #FFF)
    .row (between)
      .sub "收入 ¥ 8,200" (#FFF)
      .sub "支出 ¥ 4,920" (#E63329)
  .section-head "分类占比" (pad 16 16 8)
  .stack-bar (h 12, radius 6)
    <!-- 4 段：红 #E63329 45% / 黑 #111 25% / 深灰 #555 18% / 浅灰 #C9C9CE 12% -->
  .legend (card, pad 16, gap 12)
    .legend-item (dot + 分类名 + 金额 + 百分比) ×4
      <!-- 餐饮 45% / 交通 25% / 购物 18% / 其他 12% -->
  TabBar (统计选中)
```

### 4.5 账户页 `accounts.html`
```
.screen (bg #F6F6F7, flex-col)
  .navbar (between, pad 16)
    .title "账户" (17, SemiBold)
    .add "＋ 添加账户" (#E63329, SemiBold)
  .total-card (bg #0F0F0F, radius 20, pad 20)
    .label "总资产" (13, #9A9A9E)
    .amount "¥ 12,560.00" (34, Bold, #FFF)
    .sub "4 个账户" (13, #9A9A9E)
  .section-head "我的账户" (pad 16 16 8)
  .list (pad 0 16)
    .list-item (icon-block black + 现金 / ¥ 500.00)
    .list-item (icon-block black + 银行卡 / ¥ 8,000.00)
    .list-item (icon-block black + 微信支付 / ¥ 3,060.00)
    .list-item (icon-block black + 支付宝 / ¥ 1,000.00)
  TabBar (账户选中)
```

### 4.6 我的页 `profile.html`
```
.screen (bg #F6F6F7, flex-col)
  .navbar (center)  .title "我的" (17, SemiBold)
  .profile-card (card, flex, gap 12, pad 16)
    .avatar (Ø56, circle #0F0F0F) "栗" (white 22)
    .meta  .name "栗子" (17, SemiBold)  .id "ID: 88201" (13, #8A8A8E)
  .menu (card, pad 0)
    .menu-item "分类管理 ›"
    .menu-item "账户管理 ›"
    .menu-item "数据导出 ›"
    .menu-item "深色模式 ›"
    .menu-item "关于财务管家 ›"
  .btn-outline "退出登录" (white bg, red text+1px red border, radius 14)
  TabBar (我的选中)
```

---

## 5. 导航与交互流

```
未登录 → login.html → 登录成功 → home.html
TabBar：home ⇄ stats ⇄ accounts ⇄ profile（选中红底）
home FAB "＋" → record.html → 保存 → 返回 home（列表刷新）
profile "退出登录" → login.html
```

---

## 6. 数据模型

```ts
type RecordType = 'expense' | 'income'

interface Category { id: string; name: string; type: RecordType; icon: string }
interface Account  { id: string; name: string; icon: string; balance: number }
interface RecordItem {
  id: string
  type: RecordType
  categoryId: string
  categoryName: string
  categoryIcon: string
  amount: number          // 正数，正负由 type 决定
  note: string
  accountId: string
  accountName: string
  date: string            // YYYY-MM-DD
}
```

- 支出分类（10）：餐饮、交通、购物、娱乐、住房、医疗、通讯、服饰、人情、其他
- 收入分类（5）：工资、兼职、奖金、礼金、其他
- 账户（4）：现金、银行卡、微信支付、支付宝
- 存储：本地 Storage（按用户隔离）

---

## 7. 语义约定（强约束）

- **支出 = 红色 `#E63329`**，金额前缀 `-`
- **收入 = 墨黑 `#111111`**，金额前缀 `+`
- 选中态 / 主操作 = 红色填充 + 白字
- 深色卡片（概览 / 总资产 / 汇总）统一黑底 `#0F0F0F` + 白 / 红文字
- 金额一律 `tabular-nums` 等宽对齐

---

## 8. 给其他 AI 的使用建议

1. **先读 `tokens.css`** → 整套管件令牌（颜色 / 圆角 / 阴影 / 字体）。
2. **再读 `components.css`** → 统一组件词汇与布局规则。
3. **再读本规范 §4 组件树** → 拿到每页结构、精确数值与文案。
4. **最后读对应 `*.html`** → 拿到真实 DOM 标记与内联 SVG 图标（线性、stroke=currentColor，无 base64）。
5. 还原优先级：令牌变量化（CSS 自定义属性 / SCSS 变量）→ 全局组件（TabBar / FAB / dark-card / list-item）→ 逐页拼装。
6. 移动端用 `390` 为基准宽度；小程序用 `rpx`（×2），H5 用 `vw` 或 `max-width:390px` 居中。
