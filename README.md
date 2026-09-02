# 财务管家 · app-all

面向个人与家庭的记账管理工具，一套「设计原型 → 跨端实现」的完整项目集合。由 AI 编程框架辅助开发，用于对比体验不同 AI 框架在实际开发中的差异。

> ⚠️ **安全声明**：此为非决定安全版本，请勿直接投入使用，需加强鉴权隐私等

## 项目结构

```
app-all/
├── finance-app/          # ★ 正式实现：uni-app 跨端记账应用 + uniCloud 后端
│   ├── src/
│   │   ├── pages/        # 8 个页面（首页/登录/记账/明细/统计/账户/分类/我的）
│   │   ├── components/   # 10 个通用组件（BaseButton/DarkCard/TabBar/Fab 等）
│   │   ├── stores/       # 4 个 Pinia store（用户/账户/分类/记录）
│   │   ├── styles/       # 设计令牌 tokens.scss + 公共组件样式
│   │   ├── config/       # uniCloud 服务空间配置
│   │   └── utils/        # 云函数调用封装 + 格式化工具
│   └── uniCloud-aliyun/
│       ├── cloudfunctions/  # 10 个云函数（登录/注册/记账/账户/分类/统计）
│       └── database/        # 4 张表 schema（含行级权限定义）
└── prototype-gallery/    # ★ 设计原型包（AI 友好、自包含）
    ├── tokens.css        # 设计令牌唯一来源（颜色/圆角/阴影/字体）
    ├── components.css    # 统一组件词汇（跨 6 页复用）
    ├── design-spec.md    # 实现规范（组件树 + 数据模型 + 语义约定）
    └── *.html            # 6 个原型页面 + 单文件可分享预览（share.html）
```

## 技术栈

| 模块 | 技术 |
|---|---|
| 跨端框架 | uni-app（Vue3 + TypeScript + Vite） |
| 状态管理 | Pinia |
| 样式 | Sass + 设计令牌（design tokens） |
| 后端 | uniCloud 云函数 + 云数据库（阿里云 Serverless） |
| 原型 | HTML/CSS 设计系统（参照 Google Stitch「令牌 + 组件优先」思路） |

## 功能特性

- **快速记账**：收支切换、分类网格、多账户、备注，一套代码适配 H5 / 微信小程序 / App
- **统计**：月度收支汇总、分类占比
- **账户管理**：多账户余额跟踪，记账时自动联动余额增减
- **分类管理**：10 个支出分类 + 5 个收入分类，注册自动初始化
- **安全设计**：PBKDF2 + 随机盐密码哈希、登录防用户枚举、云函数参数强校验、数据库 schema 行级权限
- **AI 辅助开发**：从设计令牌/组件规范解析到代码生成全程 AI 辅助，对比 Trae 与 Claude Code 的开发体验

## 快速开始

### finance-app（uni-app 应用）

```bash
cd finance-app
npm install

# H5 端开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 其他平台（交互式选择）
npm run dev:custom
```

> 云函数与云数据库需关联 uniCloud 阿里云服务空间，详见 [finance-app/README-uniCloud.md](finance-app/README-uniCloud.md)。
> 未关联服务空间时，开发环境（DEV）自动降级为本地 mock 模式，不影响开发调试。

### prototype-gallery（设计原型）

直接用浏览器打开任一 `*.html` 即可预览 6 个页面；`share.html` 为单文件可分享版本。

AI / 开发工具使用顺序：`tokens.css` → `components.css` → `design-spec.md` → 对应页面 HTML。

## 设计规范速览

- 支出 = 红 `#E63329`（金额前缀 `-`）；收入 = 墨黑 `#111111`（前缀 `+`）
- 选中态 / 主操作 = 红色填充 + 白字；深色卡片（概览/总资产/汇总）统一黑底 `#0F0F0F`
- 金额一律 `tabular-nums` 等宽对齐
- 移动端基准宽 390px；小程序用 rpx（×2），H5 用 `max-width:390px` 居中
