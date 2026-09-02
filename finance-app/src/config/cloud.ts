// ============================================================
// 财务管家 · uniCloud 阿里云服务空间配置
// ⚠️ 【安全红线】clientSecret 绝对不能出现在前端源码中！
// uniCloud 前端 SDK 只需要 spaceId 即可；clientSecret 仅用于
// 管理端/云函数之间的服务端调用，暴露后任何人都可以绕过
// 应用逻辑直接操作数据库。
// 如需管理端能力，请使用 uniCloud「客户端访问控制 + schema 权限」
// 或 uni-config-center 在云端读取密钥。
// ============================================================

export const cloudConfig = {
  provider: 'aliyun' as const,
  spaceId: 'mp-55874989-fdfc-4994-8ac2-0ef3727d414d',
  // clientSecret 已移除：前端调用 uniCloud 不需要此字段。
  // 如控制台提示需要初始化，检查 uniCloud.init 文档；
  // 旧版空间兼容性：保留空字符串占位，不影响实际调用。
  clientSecret: '',
}

export function isCloudConfigured(): boolean {
  // 只要有 spaceId 即可判定配置完成（clientSecret 不是前端必填）
  return !!cloudConfig.spaceId
}
