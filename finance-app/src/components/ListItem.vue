<template>
  <view class="list-item" :class="{ 'list-item--tall': tall }" @click="emit('click')">
    <view class="list-item__left">
      <slot name="icon" />
      <view class="list-item__text">
        <text class="list-item__title">{{ title }}</text>
        <text v-if="sub" class="list-item__sub">{{ sub }}</text>
      </view>
    </view>
    <view class="list-item__right">
      <text v-if="amount !== undefined" class="list-item__amount num" :class="amountClass">
        {{ amountText }}
      </text>
      <slot name="right" />
      <Icon v-if="chevron" name="chevron-right" :size="24" color="#8A8A8E" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import { formatNumber } from '@/utils/format'
import type { RecordType } from '@/types'

const props = withDefaults(defineProps<{
  title: string
  sub?: string
  amount?: number
  amountType?: RecordType | 'none'
  tall?: boolean
  chevron?: boolean
}>(), {
  amountType: 'none',
  tall: false,
  chevron: false
})

const emit = defineEmits<{
  click: []
}>()

const amountText = computed(() => {
  if (props.amount === undefined) return ''
  const formatted = formatNumber(props.amount)
  if (props.amountType === 'expense') return `-¥ ${formatted}`
  if (props.amountType === 'income') return `+¥ ${formatted}`
  return `¥ ${formatted}`
})

const amountClass = computed(() => {
  if (props.amountType === 'expense') return 'list-item__amount--expense'
  return ''
})
</script>

<style lang="scss" scoped>

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 28rpx;
  background: $white;
  border-radius: 28rpx;

  &--tall {
    min-height: 136rpx;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 24rpx;
    min-width: 0;
    flex: 1;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: $ink;
  }

  &__sub {
    font-size: 24rpx;
    color: $gray;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-shrink: 0;
  }

  &__amount {
    font-size: 34rpx;
    font-weight: 600;
    color: $ink;
    font-variant-numeric: tabular-nums;

    &--expense {
      color: $red;
    }
  }
}
</style>
