<template>
  <view class="field">
    <Icon v-if="icon" :name="icon" :size="40" color="#8A8A8E" />
    <input
      class="field__input"
      :type="type"
      :placeholder="placeholder"
      :password="password"
      :value="modelValue"
      @input="onInput"
    />
  </view>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

withDefaults(defineProps<{
  modelValue?: string
  icon?: string
  placeholder?: string
  type?: string
  password?: boolean
}>(), {
  modelValue: '',
  icon: '',
  placeholder: '',
  type: 'text',
  password: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 使用中间函数，避免模板内直接调用 emit 在小程序端不触发
function onInput(e: any) {
  emit('update:modelValue', e.detail.value)
}
</script>

<style lang="scss" scoped>

.field {
  display: flex;
  align-items: center;
  gap: 24rpx;
  height: 104rpx;
  padding: 0 32rpx;
  background: $bg;
  border-radius: 28rpx;

  &__input {
    flex: 1;
    font-size: 30rpx;
    color: $ink;
  }
}
</style>
