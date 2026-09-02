import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { cloudConfig, isCloudConfigured } from './config/cloud'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)

  // 初始化 uniCloud 阿里云服务空间
  if (isCloudConfigured()) {
    uniCloud.init(cloudConfig)
    console.log('[uniCloud] 阿里云服务空间已初始化:', cloudConfig.spaceId)
  } else {
    console.warn('[uniCloud] 未配置服务空间，将使用本地降级模式。请填写 src/config/cloud.ts')
  }

  return {
    app,
    pinia
  }
}
