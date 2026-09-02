<template>
  <view class="page page--record">
    <!-- 顶部导航 -->
    <view class="topbar">
      <text class="topbar__cancel" @click="handleCancel">取消</text>
      <text class="topbar__title">记一笔</text>
      <text class="topbar__save" @click="handleSave">保存</text>
    </view>

    <!-- 支出/收入切换 -->
    <SegmentToggle
      :options="typeOptions"
      :model-value="type"
      @update:model-value="(v: string) => onTypeChange(v)"
    />

    <!-- 金额输入区 -->
    <view class="amount">
      <text class="amount__symbol">¥</text>
      <input
        class="amount__input num"
        type="digit"
        placeholder="0"
        placeholder-class="amount__placeholder"
        @input="onAmountInput"
      />
    </view>

    <!-- 分类网格 -->
    <view class="category-grid">
      <view
        v-for="cat in currentCategories"
        :key="cat.id"
        class="cat-cell"
        @click="selectCategory(cat.id)"
      >
        <view
          class="cat-cell__icon"
          :class="{ 'cat-cell__icon--active': selectedCategoryId === cat.id }"
        >
          <Icon
            :name="cat.icon"
            :size="44"
            :color="selectedCategoryId === cat.id ? '#FFFFFF' : '#111111'"
          />
        </view>
        <text class="cat-cell__label">{{ cat.name }}</text>
      </view>
    </view>

    <!-- 附加信息 -->
    <view class="extra">
      <ListItem title="账户" :sub="selectedAccountName" chevron @click="pickAccount">
        <template #icon>
          <IconBlock :name="selectedAccountIcon" :size="64" />
        </template>
      </ListItem>
      <ListItem title="备注" :sub="note || '添加备注'" chevron @click="editNote" />
      <picker mode="date" :value="date" @change="onDateChange">
        <ListItem title="日期" :sub="dateLabel" chevron />
      </picker>
    </view>

    <!-- 底部保存按钮 -->
    <view class="footer">
      <BaseButton text="保存到账本" @click="handleSave" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SegmentToggle from '@/components/SegmentToggle.vue'
import ListItem from '@/components/ListItem.vue'
import IconBlock from '@/components/IconBlock.vue'
import Icon from '@/components/Icon.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useCategoryStore } from '@/stores/category'
import { useAccountStore } from '@/stores/account'
import { useRecordStore } from '@/stores/record'
import { useUserStore } from '@/stores/user'
import { getTodayStr, formatDate } from '@/utils/format'
import type { RecordType } from '@/types'

const categoryStore = useCategoryStore()
const accountStore = useAccountStore()
const recordStore = useRecordStore()
const userStore = useUserStore()

// 页面显示时加载云端分类/账户（显示用户自定义的分类/账户，并在删除后兜底选中第一个可用）
onShow(async () => {
  const uid = userStore.userInfo?.id
  if (!uid) return
  await Promise.all([
    categoryStore.loadCategories(uid),
    accountStore.loadAccounts(uid),
  ])
  // 兜底：如果当前选中的分类/账户已经被删除了，自动切回第一个可用项
  if (!categoryStore.getById(selectedCategoryId.value)) {
    const list = categoryStore.getByType(type.value)
    selectedCategoryId.value = list[0]?.id || ''
  }
  if (!accountStore.getById(selectedAccountId.value)) {
    selectedAccountId.value = accountStore.accounts[0]?.id || ''
  }
})

// 分段切换选项
const typeOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

// 表单状态
const type = ref<RecordType>('expense')
const amount = ref(0)
const selectedCategoryId = ref(categoryStore.expenseCategories[0]?.id || '')
const selectedAccountId = ref(accountStore.accounts[0]?.id || '')
const note = ref('')
const date = ref(getTodayStr())

// 当前分类列表（随类型切换）
const currentCategories = computed(() => categoryStore.getByType(type.value))

// 选中账户信息
const selectedAccountName = computed(() => {
  const acc = accountStore.getById(selectedAccountId.value)
  return acc ? acc.name : '请选择账户'
})
const selectedAccountIcon = computed(() => {
  const acc = accountStore.getById(selectedAccountId.value)
  return acc ? acc.icon : 'cash'
})

// 日期显示
const dateLabel = computed(() => formatDate(date.value))

// 金额输入
function onAmountInput(e: any) {
  const val = e.detail.value
  amount.value = val === '' ? 0 : Number(val)
}

// 切换支出/收入
function onTypeChange(val: string) {
  type.value = val as RecordType
  // 切换类型后默认选中第一个分类
  const list = categoryStore.getByType(type.value)
  selectedCategoryId.value = list[0]?.id || ''
}

// 选择分类
function selectCategory(id: string) {
  selectedCategoryId.value = id
}

// 选择账户（ActionSheet）
function pickAccount() {
  const accounts = accountStore.accounts
  uni.showActionSheet({
    itemList: accounts.map(a => a.name),
    success: (res) => {
      const acc = accounts[res.tapIndex]
      if (acc) selectedAccountId.value = acc.id
    }
  })
}

// 编辑备注（弹窗输入）
function editNote() {
  uni.showModal({
    title: '备注',
    editable: true,
    placeholderText: '请输入备注',
    content: note.value,
    success: (res) => {
      if (res.confirm && res.content !== undefined) {
        note.value = res.content
      }
    }
  })
}

// 日期变更
function onDateChange(e: any) {
  date.value = e.detail.value
}

// 取消
function handleCancel() {
  uni.navigateBack()
}

// 保存记录
async function handleSave() {
  if (!amount.value || amount.value <= 0) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }
  if (!selectedCategoryId.value) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }
  const cat = categoryStore.getById(selectedCategoryId.value)
  const acc = accountStore.getById(selectedAccountId.value)
  if (!cat || !acc) {
    uni.showToast({ title: '信息不完整', icon: 'none' })
    return
  }
  const userId = userStore.userInfo?.id || 'guest'
  await recordStore.addRecord({
    type: type.value,
    categoryId: cat.id,
    categoryName: cat.name,
    categoryIcon: cat.icon,
    amount: amount.value,
    note: note.value,
    accountId: acc.id,
    accountName: acc.name,
    date: date.value
  }, userId)
  uni.showToast({ title: '保存成功', icon: 'success' })
  // 保存成功后返回上一页
  setTimeout(() => uni.navigateBack(), 500)
}
</script>

<style lang="scss" scoped>

.page--record {
  min-height: 100vh;
  background: $white;
  padding: 0 32rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104rpx;
  padding: 0 8rpx;

  &__cancel {
    font-size: 30rpx;
    color: $gray;
  }

  &__title {
    font-size: 34rpx;
    font-weight: 700;
    color: $ink;
  }

  &__save {
    font-size: 30rpx;
    font-weight: 600;
    color: $red;
  }
}

.amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
  padding: 56rpx 0 48rpx;

  &__symbol {
    font-size: 64rpx;
    font-weight: 700;
    color: $ink;
  }

  &__input {
    font-size: 96rpx;
    font-weight: 700;
    color: $ink;
    text-align: center;
    width: 480rpx;
  }

  &__placeholder {
    color: $chart-4;
  }
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 8rpx 0 40rpx;
}

.cat-cell {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 0;

  &__icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 28rpx;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;

    &--active {
      background: $red;
    }
  }

  &__label {
    font-size: 22rpx;
    color: $gray;
  }
}

.extra {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.footer {
  margin-top: auto;
}
</style>
