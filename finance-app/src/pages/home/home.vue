<template>
  <view class="page page--home">
    <!-- 问候行 -->
    <view class="greet">
      <text class="greet__title">{{ greeting }}，{{ userName }}</text>
      <view class="greet__avatar">{{ userAvatar }}</view>
    </view>

    <!-- 月度概览 -->
    <view class="overview">
      <DarkCard
        label="本月结余"
        :amount="balance"
        :income="income"
        :expense="expense"
        :show-income-expense="true"
      >
        <template #extra>
          <picker mode="date" fields="month" :value="pickerMonth" @change="onMonthChange">
            <view class="month-switch">
              <text class="month-switch__text">{{ monthStr }}</text>
              <Icon name="chevron-down" :size="24" color="#9A9A9E" />
            </view>
          </picker>
        </template>
      </DarkCard>
    </view>

    <!-- 区块标题 -->
    <view class="section-head">
      <text class="section-head__title">本月明细</text>
      <view class="section-head__more" @click="goAllRecords">
        <text class="section-head__more-text">全部</text>
        <Icon name="chevron-right" :size="24" color="#8A8A8E" />
      </view>
    </view>

    <!-- 记录列表（按日期分组） -->
    <view class="record-list">
      <view v-for="group in groupedRecords" :key="group.date" class="record-group">
        <text class="record-group__date">{{ group.date }}</text>
        <view class="record-group__items">
          <ListItem
            v-for="record in group.records"
            :key="record.id"
            :title="record.categoryName"
            :sub="record.note"
            :amount="record.amount"
            :amount-type="record.type"
          >
            <template #icon>
              <IconBlock :name="record.categoryIcon" :size="80" />
            </template>
          </ListItem>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="groupedRecords.length === 0" class="empty">
        <text class="empty__text">本月暂无记录</text>
      </view>
    </view>

    <!-- 悬浮新增按钮 -->
    <Fab @click="goRecord" />

    <!-- 底部导航 -->
    <TabBar current="home" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DarkCard from '@/components/DarkCard.vue'
import ListItem from '@/components/ListItem.vue'
import IconBlock from '@/components/IconBlock.vue'
import Icon from '@/components/Icon.vue'
import Fab from '@/components/Fab.vue'
import TabBar from '@/components/TabBar.vue'
import { useUserStore } from '@/stores/user'
import { useRecordStore } from '@/stores/record'

const userStore = useUserStore()
const recordStore = useRecordStore()

// 用户信息
const userName = computed(() => userStore.userInfo?.nickname || '朋友')
const userAvatar = computed(() => userStore.userInfo?.avatar || '友')

// 时段问候语
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

// 月份显示（2026.08）
const monthStr = computed(() => recordStore.currentMonthLabel)
// picker 初始值（YYYY-MM）
const pickerMonth = computed(() => recordStore.currentMonth)

// 月度汇总数据
const balance = computed(() => recordStore.monthSummary.balance)
const income = computed(() => recordStore.monthSummary.income)
const expense = computed(() => recordStore.monthSummary.expense)

// 按日期分组的记录
const groupedRecords = computed(() => recordStore.getGroupedRecords())

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

// 跳转记账页
function goRecord() {
  uni.navigateTo({ url: '/pages/record/record' })
}

// 跳转全部明细页
function goAllRecords() {
  uni.navigateTo({ url: '/pages/records/records' })
}
</script>

<style lang="scss" scoped>

.page--home {
  min-height: 100vh;
  background: $bg;
  padding: 0 32rpx 208rpx;
  box-sizing: border-box;
}

.greet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0 24rpx;

  &__title {
    font-size: 36rpx;
    font-weight: 600;
    color: $ink;
  }

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: $black;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 700;
  }
}

.overview {
  margin-bottom: 8rpx;
}

.month-switch {
  display: flex;
  align-items: center;
  gap: 4rpx;

  &__text {
    font-size: 26rpx;
    color: $muted;
  }
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0 16rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: $ink;
  }

  &__more {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  &__more-text {
    font-size: 24rpx;
    color: $gray;
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.record-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  &__date {
    font-size: 24rpx;
    color: $gray;
    padding-left: 8rpx;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
}

.empty {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;

  &__text {
    font-size: 28rpx;
    color: $gray;
  }
}
</style>
