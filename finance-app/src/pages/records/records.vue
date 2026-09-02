<!-- ============================================================
     财务管家 · 明细列表页（全部记录）
     支持分页查看，20条/页
     三端兼容：H5 / 小程序 / App
     ============================================================ -->
<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="topbar">
      <view class="topbar__back" @click="goBack">
        <Icon name="chevron-left" :size="40" color="#111111" />
      </view>
      <text class="topbar__title">全部明细</text>
      <text class="topbar__placeholder"></text>
    </view>

    <!-- 月份筛选 -->
    <view class="month-filter">
      <picker mode="date" fields="month" :value="pickerMonth" @change="onMonthChange">
        <view class="month-filter__inner">
          <text class="month-filter__text">{{ monthLabel }}</text>
          <Icon name="chevron-down" :size="24" color="#8A8A8E" />
        </view>
      </picker>
    </view>

    <view class="content">
      <!-- 记录列表（按日期分组） -->
      <view class="record-list">
        <view v-for="group in pagedGroups" :key="group.date" class="record-group">
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
        <view v-if="pagedGroups.length === 0 && !loading" class="empty">
          <text class="empty__text">暂无记录</text>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading">
          <text class="loading__text">加载中...</text>
        </view>

        <!-- 分页控制 -->
        <view v-if="totalPages > 1" class="pagination">
          <view
            class="pagination__btn"
            :class="{ 'pagination__btn--disabled': page <= 1 }"
            @click="prevPage"
          >
            <text>上一页</text>
          </view>
          <text class="pagination__info">{{ page }} / {{ totalPages }}</text>
          <view
            class="pagination__btn"
            :class="{ 'pagination__btn--disabled': page >= totalPages }"
            @click="nextPage"
          >
            <text>下一页</text>
          </view>
        </view>

        <!-- 底部提示 -->
        <view v-if="pagedGroups.length > 0" class="footer-tip">
          <text class="footer-tip__text">共 {{ totalCount }} 条记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Icon from '@/components/Icon.vue'
import ListItem from '@/components/ListItem.vue'
import IconBlock from '@/components/IconBlock.vue'
import { useRecordStore } from '@/stores/record'
import { useUserStore } from '@/stores/user'
import { formatDateWithLabel } from '@/utils/format'
import type { RecordItem, RecordGroup } from '@/types'

const recordStore = useRecordStore()
const userStore = useUserStore()

const PAGE_SIZE = 20
const page = ref(1)
const loading = ref(false)

// 从 store 获取当前月份
const pickerMonth = computed(() => recordStore.currentMonth)
const monthLabel = computed(() => {
  const [year, month] = recordStore.currentMonth.split('-')
  return `${year}年${Number(month)}月`
})

// 总记录数
const totalCount = computed(() => recordStore.records.length)

// 总页数
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))

// 按日期分组的所有记录（先定义，供 pagedGroups 使用）
const allGroupedRecords = computed((): RecordGroup[] => {
  const groups: RecordGroup[] = []
  const dateMap: Record<string, RecordItem[]> = {}
  for (const record of recordStore.records) {
    if (!dateMap[record.date]) {
      dateMap[record.date] = []
    }
    dateMap[record.date].push(record)
  }
  const sortedDates = Object.keys(dateMap).sort((a, b) => b.localeCompare(a))
  for (const date of sortedDates) {
    groups.push({
      date: formatDateWithLabel(date),
      records: dateMap[date]
    })
  }
  return groups
})

// 将分组数据"扁平化"后分页，再按页重建分组
// 保证分页时按记录条数切分，而不是按天数
const pagedGroups = computed((): RecordGroup[] => {
  // 1. 扁平化所有记录（保持日期从新到旧的顺序）
  const allRecords: RecordItem[] = []
  for (const g of allGroupedRecords.value) {
    for (const r of g.records) {
      allRecords.push(r)
    }
  }
  // 2. 按页切片
  const start = (page.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pageRecords = allRecords.slice(start, end)

  // 3. 重新按日期分组
  const dateMap: Record<string, RecordItem[]> = {}
  for (const r of pageRecords) {
    if (!dateMap[r.date]) {
      dateMap[r.date] = []
    }
    dateMap[r.date].push(r)
  }

  const result: RecordGroup[] = []
  const sortedDates = Object.keys(dateMap).sort((a, b) => b.localeCompare(a))
  for (const date of sortedDates) {
    result.push({
      date: formatDateWithLabel(date),
      records: dateMap[date]
    })
  }
  return result
})

// 月份变化时重置页码
watch(pickerMonth, () => {
  page.value = 1
})

// 加载数据
async function loadData() {
  const uid = userStore.userInfo?.id
  if (!uid) return
  loading.value = true
  try {
    await recordStore.loadRecords(uid, pickerMonth.value)
  } finally {
    loading.value = false
  }
}

// 页面加载
onLoad(() => {
  loadData()
})

// 月份切换
async function onMonthChange(e: { detail: { value: string } }) {
  const newMonth = e.detail.value
  recordStore.switchMonth(newMonth)
  page.value = 1
  await loadData()
}

// 上一页
function prevPage() {
  if (page.value > 1) {
    page.value--
    uni.pageScrollTo({ scrollTop: 0, duration: 200 })
  }
}

// 下一页
function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    uni.pageScrollTo({ scrollTop: 0, duration: 200 })
  }
}

// 返回
function goBack() {
  uni.navigateBack({ delta: 1 })
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
  padding: 0 32rpx;
  background: $bg;

  &__back {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 34rpx;
    font-weight: 700;
    color: $ink;
  }

  &__placeholder {
    width: 72rpx;
  }
}

.month-filter {
  padding: 0 32rpx 24rpx;

  &__inner {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 28rpx;
    background: $white;
    border-radius: 40rpx;
  }

  &__text {
    font-size: 28rpx;
    font-weight: 600;
    color: $ink;
  }
}

.content {
  padding: 0 32rpx 64rpx;
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
  padding: 120rpx 0;

  &__text {
    font-size: 28rpx;
    color: $gray;
  }
}

.loading {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;

  &__text {
    font-size: 26rpx;
    color: $gray;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  padding: 48rpx 0 24rpx;

  &__btn {
    padding: 16rpx 40rpx;
    background: $white;
    border-radius: 40rpx;
    font-size: 26rpx;
    font-weight: 500;
    color: $ink;

    &--disabled {
      opacity: 0.4;
    }
  }

  &__info {
    font-size: 26rpx;
    color: $gray;
    font-variant-numeric: tabular-nums;
  }
}

.footer-tip {
  display: flex;
  justify-content: center;
  padding: 24rpx 0;

  &__text {
    font-size: 24rpx;
    color: $gray;
  }
}
</style>
