<!-- ============================================================
     财务管家 · 统计页
     展示月度结余与分类占比，支持月份切换和数据导出
     ============================================================ -->
<template>
  <view class="page">
    <!-- 顶部导航栏：左侧月份选择 + 右侧导出 -->
    <view class="topbar">
      <picker mode="date" fields="month" :value="pickerMonth" @change="onMonthChange">
        <view class="topbar__left">
          <text class="topbar__month">{{ monthLabel }}</text>
          <Icon name="chevron-down" :size="32" color="#111111" />
        </view>
      </picker>
      <text class="topbar__action" @click="onExport">导出</text>
    </view>

    <view class="content">
      <!-- 本月结余汇总卡片 -->
      <DarkCard
        label="本月结余"
        :amount="summary.balance"
        :income="summary.income"
        :expense="summary.expense"
        :show-income-expense="true"
      />

      <!-- 分类占比卡片 -->
      <view class="card chart-card">
        <text class="chart-card__title">分类占比</text>

        <!-- 堆叠条形图 -->
        <view class="chart">
          <view
            v-for="(seg, i) in segments"
            :key="i"
            class="chart__seg"
            :style="{ flexGrow: seg.percentage || 0, flexShrink: 0, flexBasis: 0, background: seg.color }"
          />
        </view>

        <!-- 图例列表 -->
        <view class="legend">
          <view v-for="(seg, i) in segments" :key="i" class="legend__row">
            <view class="legend__dot" :style="{ background: seg.color }" />
            <text class="legend__name">{{ seg.categoryName }}</text>
            <text class="legend__detail num">{{ formatMoney(seg.amount) }} · {{ seg.percentage }}%</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="segments.length === 0" class="empty">
          <text class="empty__text">本月暂无支出记录</text>
        </view>
      </view>
    </view>

    <!-- 底部 TabBar -->
    <TabBar current="stats" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DarkCard from '@/components/DarkCard.vue'
import Icon from '@/components/Icon.vue'
import TabBar from '@/components/TabBar.vue'
import { useRecordStore } from '@/stores/record'
import { useUserStore } from '@/stores/user'
import { formatMoney, exportRecords } from '@/utils/format'

const recordStore = useRecordStore()
const userStore = useUserStore()

// 当前月份标签：2026年8月
const monthLabel = computed(() => {
  const [year, month] = recordStore.currentMonth.split('-')
  return `${year}年${Number(month)}月`
})
// picker 初始值
const pickerMonth = computed(() => recordStore.currentMonth)

// 月度汇总
const summary = computed(() => recordStore.monthSummary)

// 分类统计（支出维度）
const categoryData = computed(() => recordStore.getCategoryStats('expense'))

// 堆叠条形图段
const palette = ['#E63329', '#111111', '#555555', '#C9C9CE']
const segments = computed(() =>
  categoryData.value.stats.map((stat, index) => ({
    ...stat,
    color: palette[index] || palette[palette.length - 1]
  }))
)

// 月份切换
async function onMonthChange(e: { detail: { value: string } }) {
  const newMonth = e.detail.value
  recordStore.switchMonth(newMonth)
  const uid = userStore.userInfo?.id
  if (!uid) return
  await Promise.all([
    recordStore.loadRecords(uid, newMonth),
    recordStore.loadSummary(uid, newMonth)
  ])
}

// 页面显示时加载数据
onShow(async () => {
  const uid = userStore.userInfo?.id
  if (!uid) return
  await Promise.all([
    recordStore.loadRecords(uid),
    recordStore.loadSummary(uid)
  ])
})

// 导出账单（支持文件 + 剪贴板两种方式）
function onExport() {
  exportRecords(recordStore.records, monthLabel.value)
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

  &__left {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  &__month {
    font-size: 34rpx;
    font-weight: 700;
    color: $ink;
  }

  &__action {
    font-size: 28rpx;
    font-weight: 600;
    color: $red;
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

.chart-card {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: $ink;
  }
}

.chart {
  height: 40rpx;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  background: $bg;

  &__seg {
    height: 100%;
  }
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  &__row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    font-size: 28rpx;
    color: $ink;
    flex: 1;
  }

  &__detail {
    font-size: 26rpx;
    color: $gray;
  }
}

.empty {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;

  &__text {
    font-size: 26rpx;
    color: $gray;
  }
}
</style>
