<!-- ============================================================
     财务管家 · 我的页
     展示个人信息与设置菜单
     ============================================================ -->
<template>
  <view class="page">
    <!-- 顶部导航栏：居中标题 -->
    <view class="topbar topbar--center">
      <text class="topbar__title">我的</text>
    </view>

    <view class="content">
      <!-- 个人卡片 -->
      <view class="card profile-card">
        <view class="avatar"><text class="avatar__text">{{ avatarText }}</text></view>
        <view class="profile-card__info">
          <text class="profile-card__name">{{ nickname }}</text>
          <text class="profile-card__id">ID：{{ userId }}</text>
        </view>
      </view>

      <!-- 设置菜单列表 -->
      <view class="list">
        <ListItem
          v-for="item in menus"
          :key="item.key"
          :title="item.title"
          chevron
          @click="onMenuClick(item.key)"
        >
          <template #icon>
            <IconBlock :name="item.icon" />
          </template>
        </ListItem>
      </view>

      <!-- 退出登录按钮 -->
      <BaseButton variant="outline" text="退出登录" @click="onLogout" />
    </view>

    <!-- 底部 TabBar -->
    <TabBar current="profile" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ListItem from '@/components/ListItem.vue'
import IconBlock from '@/components/IconBlock.vue'
import BaseButton from '@/components/BaseButton.vue'
import TabBar from '@/components/TabBar.vue'
import { useUserStore } from '@/stores/user'
import { useRecordStore } from '@/stores/record'
import { exportRecords } from '@/utils/format'

const userStore = useUserStore()
const recordStore = useRecordStore()

// 头像首字
const avatarText = computed(() => userStore.userInfo?.avatar || 'U')
// 用户昵称
const nickname = computed(() => userStore.userInfo?.nickname || '未登录')
// 用户 ID
const userId = computed(() => userStore.userInfo?.id || '-')

// 设置菜单
const menus = [
  { key: 'category', title: '分类管理', icon: 'other' },
  { key: 'account', title: '账户管理', icon: 'wallet' },
  { key: 'export', title: '数据导出', icon: 'export' },
  { key: 'dark', title: '深色模式', icon: 'settings' },
  { key: 'about', title: '关于财务管家', icon: 'logo' }
]

// 菜单项点击
function onMenuClick(key: string) {
  switch (key) {
    case 'category':
      // 跳转到分类管理页
      uni.navigateTo({ url: '/pages/categories/categories' })
      break
    case 'account':
      // ⚠️ 关键：必须先写 storage（switchTab success 回调可能晚于目标页 onShow）
      try {
        uni.setStorageSync('account_edit_mode', true)
      } catch {}
      // 跳转到账户 tab，进入后将自动进入编辑模式
      uni.switchTab({
        url: '/pages/accounts/accounts',
        fail: () => {
          uni.reLaunch({ url: '/pages/accounts/accounts' })
        }
      })
      break
    case 'export':
      onExport()
      break
    case 'dark':
      uni.showToast({ title: '深色模式即将上线', icon: 'none' })
      break
    case 'about':
      uni.showModal({
        title: '关于财务管家',
        content: '版本 1.0.0\n记录每一笔 · 掌控每一天\n基于 uni-app + Vue 3 + TypeScript',
        showCancel: false,
        confirmText: '知道了'
      })
      break
  }
}

// 数据导出（使用统一工具函数，支持文件 + 剪贴板）
function onExport() {
  exportRecords(recordStore.records)
}

// 退出登录：二次确认后调用 store.logout()
function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号吗？',
    confirmText: '退出',
    confirmColor: '#E63329',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}
</script>

<style lang="scss" scoped>

.page {
  min-height: 100vh;
  background: $bg;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104rpx;
  padding: 0 40rpx;

  &--center {
    justify-content: center;
  }

  &__title {
    font-size: 34rpx;
    font-weight: 700;
    color: $ink;
  }
}

.content {
  padding: 16rpx 32rpx 208rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.card {
  background: $white;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 40rpx;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  &__name {
    font-size: 36rpx;
    font-weight: 600;
    color: $ink;
  }

  &__id {
    font-size: 26rpx;
    color: $gray;
  }
}

// 大头像：120rpx 圆形黑色背景
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $black;
  color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &__text {
    font-size: 48rpx;
    font-weight: 700;
    color: $white;
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
