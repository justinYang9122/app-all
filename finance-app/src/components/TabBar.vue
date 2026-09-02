<template>
  <view class="tabbar">
    <view class="tabbar__pill">
      <view
        v-for="tab in tabs"
        :key="tab.path"
        class="tab"
        :class="{ 'tab--active': current === tab.key }"
        @click="switchTab(tab.path)"
      >
        <Icon :name="tab.icon" :size="36" :color="current === tab.key ? '#FFFFFF' : '#8A8A8E'" />
        <text class="tab__label">{{ tab.label }}</text>
      </view>
    </view>
    <view class="tabbar__home" />
  </view>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{
  current: string // home / stats / accounts / profile
}>()

const tabs = [
  { key: 'home', label: '首页', icon: 'home', path: '/pages/home/home' },
  { key: 'stats', label: '统计', icon: 'chart', path: '/pages/stats/stats' },
  { key: 'accounts', label: '账户', icon: 'wallet', path: '/pages/accounts/accounts' },
  { key: 'profile', label: '我的', icon: 'user', path: '/pages/profile/profile' }
]

function switchTab(path: string) {
  uni.redirectTo({ url: path })
}
</script>

<style lang="scss" scoped>

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 166rpx;
  background: $white;
  padding: 24rpx 32rpx 42rpx;
  display: flex;
  z-index: 100;

  &__pill {
    flex: 1;
    display: flex;
    background: $bg;
    border-radius: 72rpx;
    padding: 8rpx;
    gap: 8rpx;
  }

  &__home {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 16rpx;
    width: 268rpx;
    height: 10rpx;
    border-radius: 6rpx;
    background: $ink;
  }
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 52rpx;

  &__label {
    font-size: 20rpx;
    color: $gray;
  }

  &--active {
    background: $red;

    .tab__label {
      color: $white;
      font-weight: 600;
    }
  }
}
</style>
