<template>
  <view class="fab" @click="emit('click')">
    <Icon name="plus" :size="48" color="#FFFFFF" />
  </view>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

const emit = defineEmits<{
  click: []
}>()
</script>

<style lang="scss" scoped>

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 208rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: $red;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-fab;
  z-index: 5;
}
</style>
