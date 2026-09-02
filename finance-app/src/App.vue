<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

// 应用启动时检查登录态
onLaunch(() => {
  const userStore = useUserStore()
  userStore.restoreLogin()

  // 首页为 home，未登录则跳转到登录页
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})
</script>

<style lang="scss">
/* 全局公共组件样式（Sass 3.0 兼容写法：@use 替代废弃的 @import） */
@import './styles/components.scss';

/* 基础重置 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  color: #111111;
}

/* 金额等宽数字 */
.num {
  font-variant-numeric: tabular-nums;
}
</style>
