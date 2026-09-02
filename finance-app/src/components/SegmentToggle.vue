<template>
  <view class="toggle">
    <view
      v-for="opt in options"
      :key="opt.value"
      class="toggle__seg"
      :class="{ 'toggle__seg--active': modelValue === opt.value }"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </view>
  </view>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: string
}

defineProps<{
  options: Option[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style lang="scss" scoped>

.toggle {
  display: flex;
  width: 440rpx;
  height: 80rpx;
  background: $bg;
  border-radius: $radius-pill;
  padding: 8rpx;
  align-self: center;

  &__seg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 32rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: $ink;
    transition: all 0.2s;

    &--active {
      background: $red;
      color: $white;
    }
  }
}
</style>
