<template>
  <view class="dark-card">
    <view class="dark-card__row">
      <text class="dark-card__label">{{ label }}</text>
      <slot name="extra" />
    </view>
    <text class="dark-card__amount num">{{ formattedAmount }}</text>
    <view v-if="showIncomeExpense" class="dark-card__divider" />
    <view v-if="showIncomeExpense" class="dark-card__row">
      <view class="dark-card__col">
        <text class="dark-card__col-label">收入</text>
        <text class="dark-card__col-amount num">¥ {{ formattedIncome }}</text>
      </view>
      <view class="dark-card__col dark-card__col--right">
        <text class="dark-card__col-label">支出</text>
        <text class="dark-card__col-amount dark-card__col-amount--expense num">-¥ {{ formattedExpense }}</text>
      </view>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '@/utils/format'

const props = withDefaults(defineProps<{
  label: string
  amount: number
  income?: number
  expense?: number
  showIncomeExpense?: boolean
}>(), {
  income: 0,
  expense: 0,
  showIncomeExpense: false
})

const formattedAmount = computed(() => formatNumber(props.amount))
const formattedIncome = computed(() => formatNumber(props.income))
const formattedExpense = computed(() => formatNumber(props.expense))
</script>

<style lang="scss" scoped>

.dark-card {
  background: $black;
  border-radius: $radius-lg;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  &__label {
    font-size: 26rpx;
    color: $muted;
  }

  &__amount {
    font-size: 64rpx;
    font-weight: 700;
    color: $white;
    font-variant-numeric: tabular-nums;
  }

  &__divider {
    height: 2rpx;
    background: #2A2A2A;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    &--right {
      align-items: flex-end;
    }
  }

  &__col-label {
    font-size: 24rpx;
    color: $gray;
  }

  &__col-amount {
    font-size: 32rpx;
    font-weight: 600;
    color: $white;
    font-variant-numeric: tabular-nums;

    &--expense {
      color: $red;
    }
  }
}
</style>
