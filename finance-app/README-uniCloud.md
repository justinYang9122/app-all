# 财务管家 · uniCloud 阿里云部署指南

## 一、创建服务空间

1. 访问 [uniCloud 控制台](https://unicloud.dcloud.net.cn/)
2. 完成**实名认证**（法律要求）
3. 点击「新建服务空间」
4. 服务商选择 **阿里云**
5. 选择 **免费版**（开发者版，资源较少仅用于测试）
6. 输入空间名称（如 `finance-app`）
7. 点击「立即购买」→「确认开通」
8. 创建完成后，进入空间详情页，记录以下信息：
   - **spaceId**：服务空间 ID
   - **clientSecret**：客户端密钥

## 二、配置项目

### 方法 A：配置文件（推荐）

编辑 `src/config/cloud.ts`：

```typescript
export const cloudConfig = {
  provider: 'aliyun' as const,
  spaceId: '你的 spaceId',        // 替换
  clientSecret: '你的 clientSecret',  // 替换
}
```

同时编辑 `src/manifest.json` 中的 `uniCloud` 字段：

```json
"uniCloud": {
    "provider": "aliyun",
    "spaceId": "你的 spaceId",
    "clientSecret": "你的 clientSecret"
}
```

### 方法 B：使用 HBuilderX 关联

如果你同时安装了 HBuilderX：
1. 用 HBuilderX 打开项目
2. 右键 `uniCloud-aliyun` 目录 →「关联云服务空间」
3. 选择创建的服务空间

## 三、部署云函数

### 使用 HBuilderX

1. 右键 `uniCloud-aliyun/cloudfunctions` 目录
2. 选择「上传所有云函数」
3. 等待上传完成

### 使用 CLI

```bash
# 安装 uniCloud CLI（如果未安装）
npm install -g @dcloudio/unicloud-cli

# 上传所有云函数
unicloud deploy --provider aliyun
```

## 四、初始化数据库

### 上传 Schema

1. 右键 `uniCloud-aliyun/database` 目录
2. 选择「上传所有 DB Schema」

### 初始化数据

部署 `initData` 云函数后，在前端调用或通过 Web 控制台执行：

```javascript
// 在 uniCloud Web 控制台的云函数测试中执行
// 传入你的 userId（注册后获得）
uniCloud.callFunction({
  name: 'initData',
  data: { userId: '你的用户ID' }
})
```

## 五、云函数清单

| 云函数 | 功能 |
|---|---|
| `login` | 用户登录（PBKDF2 密码校验） |
| `register` | 用户注册（自动创建 4 个默认账户） |
| `addRecord` | 添加记账记录（同步更新账户余额） |
| `getRecords` | 获取记录列表（支持按月筛选） |
| `getMonthSummary` | 获取月度收支汇总 |
| `getCategoryStats` | 获取分类统计（支持支出/收入维度） |
| `addAccount` | 添加账户 |
| `getAccounts` | 获取账户列表（含总资产计算） |
| `updateAccount` | 更新账户（名称/余额） |
| `initData` | 初始化预置分类和默认账户 |

## 六、数据库表结构

| 表名 | 用途 | 权限 |
|---|---|---|
| `users` | 用户信息 | 仅本人读写 |
| `records` | 记账记录 | 仅本人读写 |
| `accounts` | 账户信息 | 仅本人读写 |
| `categories` | 分类数据 | 所有人可读，仅管理员可写 |

## 七、运行验证

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin
```

### 降级模式

如果未配置 uniCloud 服务空间，项目会自动降级为**本地模式**：
- 登录/注册：使用本地用户（`local_用户名`）
- 记录/账户：使用 Mock 数据
- 数据不持久化到云端，仅本地存储

配置好 uniCloud 后，所有操作将自动切换为云端模式。

## 八、常见问题

### Q: 云函数调用报错「请稍后重试」

检查：
1. `src/config/cloud.ts` 中的 spaceId 和 clientSecret 是否正确
2. 云函数是否已上传部署
3. 服务空间是否正常运行（在控制台查看）

### Q: 注册后看不到默认账户

注册云函数会自动创建 4 个默认账户。如果没有，手动调用 `initData` 云函数。

### Q: 微信小程序中 uniCloud 不可用

微信小程序需要额外配置：
1. 在 `manifest.json` 的 `mp-weixin` 中填写你的小程序 appid
2. 在 uniCloud 控制台的「应用管理」中关联小程序
