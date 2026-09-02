<template>
  <button class="btn" :class="`btn--${variant}`" :disabled="disabled" @click="onClick">
    {{ text }}
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string
  variant?: 'primary' | 'outline'
  disabled?: boolean
}>(), {
  text: '',
  variant: 'primary',
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

// 使用中间函数，避免模板内直接调用 emit 在小程序端不触发
function onClick() {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>

.btn {
  height: 100rpx;
  border: none;
  border-radius: $radius-btn;
  background: $red;
  color: $white;
  font-size: 32rpx;
  font-weight: 600;
  width: 100%;
  line-height: 100rpx;
  text-align: center;

  &--outline {
    background: $white;
    color: $red;
    border: 3rpx solid $red;
    height: 96rpx;
    line-height: 90rpx;
  }

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.5;
  }
}
</style>
