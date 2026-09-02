<template>
  <view class="page page--login">
    <!-- 品牌区 -->
    <view class="brand">
      <view class="brand__logo">
        <Icon name="logo" :size="60" color="#FFFFFF" />
      </view>
      <text class="brand__title">财务管家</text>
      <text class="brand__subtitle">记录每一笔 · 掌控每一天</text>
    </view>
    <!-- 表单区 -->
    <view class="form">
      <!-- 模式切换标签 -->
      <view class="mode-switch">
        <text
          class="mode-switch__item"
          :class="{ 'mode-switch__item--active': mode === 'login' }"
          @click="switchMode('login')"
        >登录</text>
        <text
          class="mode-switch__item"
          :class="{ 'mode-switch__item--active': mode === 'register' }"
          @click="switchMode('register')"
        >注册</text>
      </view>

      <BaseInput v-model="username" icon="user" placeholder="请输入用户名" />
      <BaseInput v-model="password" icon="lock" placeholder="请输入密码（至少 6 位）" password />
      <BaseInput
        v-if="mode === 'register'"
        v-model="confirmPassword"
        icon="lock"
        placeholder="请确认密码"
        password
      />
      <BaseButton :text="mode === 'login' ? '登录' : '注册'" @click="handleSubmit" />
      <view class="register" v-if="mode === 'login'">
        <text class="register__hint">还没有账号？</text>
        <text class="register__link" @click="switchMode('register')">立即注册</text>
      </view>
      <view class="register" v-else>
        <text class="register__hint">已有账号？</text>
        <text class="register__link" @click="switchMode('login')">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/Icon.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 当前模式：登录 / 注册
const mode = ref<'login' | 'register'>('login')

// 表单数据
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

// 切换模式
function switchMode(target: 'login' | 'register') {
  mode.value = target
  password.value = ''
  confirmPassword.value = ''
}

// 提交（登录或注册）
async function handleSubmit() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }

  if (mode.value === 'register') {
    if (username.value.trim().length < 3) {
      uni.showToast({ title: '用户名长度至少 3 位', icon: 'none' })
      return
    }
    if (password.value.length < 6) {
      uni.showToast({ title: '密码长度不能少于 6 位', icon: 'none' })
      return
    }
    if (password.value !== confirmPassword.value) {
      uni.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    uni.showLoading({ title: '注册中' })
    const res = await userStore.register(username.value, password.value)
    uni.hideLoading()
    if (res.ok) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => uni.reLaunch({ url: '/pages/home/home' }), 500)
    } else {
      uni.showToast({ title: res.message || '注册失败', icon: 'none' })
    }
  } else {
    uni.showLoading({ title: '登录中' })
    const res = await userStore.login(username.value, password.value)
    uni.hideLoading()
    if (res.ok) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => uni.reLaunch({ url: '/pages/home/home' }), 500)
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>

.page--login {
  min-height: 100vh;
  background: $white;
  padding: 192rpx 48rpx 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;

  &__logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 32rpx;
    background: $red;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
  }

  &__title {
    font-size: 60rpx;
    font-weight: 700;
    color: $ink;
  }

  &__subtitle {
    font-size: 28rpx;
    color: $gray;
  }
}

.form {
  margin-top: 64rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.mode-switch {
  display: flex;
  gap: 48rpx;
  justify-content: center;

  &__item {
    font-size: 32rpx;
    font-weight: 600;
    color: $gray;
    padding-bottom: 8rpx;

    &--active {
      color: $ink;
      border-bottom: 4rpx solid $red;
    }
  }
}

.register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 16rpx;

  &__hint {
    font-size: 26rpx;
    color: $gray;
  }

  &__link {
    font-size: 26rpx;
    font-weight: 600;
    color: $red;
  }
}
</style>
