<!-- ============================================================
     财务管家 · 分类管理页
     支持支出/收入分类的新增、修改、删除（存在关联记录阻止删除）
     三端兼容：H5 / 小程序 / App
     ============================================================ -->
<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="topbar">
      <view class="topbar__back" @click="goBack">
        <Icon name="chevron-left" :size="40" color="#111111" />
      </view>
      <text class="topbar__title">分类管理</text>
      <view class="topbar__action" @click="onAdd">
        <Icon name="plus" :size="36" color="#E63329" />
      </view>
    </view>

    <view class="content">
      <!-- 支出/收入切换 -->
      <SegmentToggle
        :options="toggleOptions"
        v-model="currentType"
      />

      <!-- 分类列表 -->
      <view class="list">
        <view
          v-for="cat in currentList"
          :key="cat.id"
          class="cat-item"
        >
          <view class="cat-item__main">
            <view class="cat-item__icon">
              <IconBlock :name="cat.icon" />
            </view>
            <text class="cat-item__name">{{ cat.name }}</text>
          </view>
          <view class="cat-item__actions">
            <view class="cat-item__btn cat-item__btn--edit" @click="onEdit(cat)">
              <text>编辑</text>
            </view>
            <view class="cat-item__btn cat-item__btn--delete" @click="onDelete(cat)">
              <text>删除</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="currentList.length === 0" class="empty">
          <text class="empty__text">暂无{{ currentType === 'expense' ? '支出' : '收入' }}分类</text>
        </view>
      </view>
    </view>

    <!-- 新增/编辑弹窗 -->
    <view class="modal" v-if="showModal" @click="onModalMaskClick">
      <view class="modal__card" @click.stop>
        <view class="modal__header">
          <text class="modal__title">{{ editingCategory ? '编辑分类' : '新增分类' }}</text>
          <text class="modal__close" @click="cancelModal">×</text>
        </view>

        <!-- 类型选择（新增时可选） -->
        <view class="modal__row" v-if="!editingCategory">
          <text class="modal__label">分类类型</text>
          <view class="type-picker">
            <view
              class="type-picker__item"
              :class="{ 'type-picker__item--active': formType === 'expense' }"
              @click="formType = 'expense'"
            >
              <text>支出</text>
            </view>
            <view
              class="type-picker__item"
              :class="{ 'type-picker__item--active': formType === 'income' }"
              @click="formType = 'income'"
            >
              <text>收入</text>
            </view>
          </view>
        </view>

        <!-- 图标选择（flex-wrap + 负 margin 配对，兼容小程序） -->
        <view class="modal__row">
          <text class="modal__label">分类图标</text>
          <view class="icon-list">
            <view
              v-for="ic in allIcons"
              :key="ic"
              class="icon-list__item"
              :class="{ 'icon-list__item--active': formIcon === ic }"
              @click="formIcon = ic"
            >
              <view class="icon-list__item-inner">
                <IconBlock :name="ic" :size="48" />
              </view>
            </view>
          </view>
        </view>

        <!-- 名称输入 -->
        <view class="modal__row">
          <text class="modal__label">分类名称</text>
          <input
            class="modal__input"
            v-model="formName"
            placeholder="请输入分类名称"
            placeholder-class="modal__placeholder"
          />
        </view>

        <!-- 操作按钮 -->
        <view class="modal__actions">
          <BaseButton variant="outline" text="取消" @click="cancelModal" />
          <BaseButton variant="primary" :text="editingCategory ? '保存修改' : '新增分类'" @click="saveCategory" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import Icon from '@/components/Icon.vue'
import IconBlock from '@/components/IconBlock.vue'
import SegmentToggle from '@/components/SegmentToggle.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useCategoryStore, categoryIcons } from '@/stores/category'
import { useUserStore } from '@/stores/user'
import type { Category, RecordType } from '@/types'

const categoryStore = useCategoryStore()
const userStore = useUserStore()

// 页面显示时加载云端分类，无云函数则降级为 mock
onShow(async () => {
  const uid = userStore.userInfo?.id
  if (!uid) return
  await categoryStore.loadCategories(uid)
})

// SegmentToggle 需要的格式：{ label, value }
const toggleOptions = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' }
]

// 当前显示的分类类型
const currentType = ref<RecordType>('expense')

// 当前类型的分类列表
const currentList = computed(() => categoryStore.getByType(currentType.value))

// 所有可选图标
const allIcons = categoryIcons

// 弹窗状态
const showModal = ref(false)
const editingCategory = ref<Category | null>(null)
const formType = ref<RecordType>('expense')
const formIcon = ref<string>(allIcons[0])
const formName = ref<string>('')

// 打开新增
function onAdd() {
  editingCategory.value = null
  formType.value = currentType.value
  formIcon.value = allIcons[0]
  formName.value = ''
  showModal.value = true
}

// 打开编辑
function onEdit(cat: Category) {
  editingCategory.value = cat
  formType.value = cat.type
  formIcon.value = cat.icon
  formName.value = cat.name
  showModal.value = true
}

// 取消弹窗
function cancelModal() {
  showModal.value = false
  editingCategory.value = null
  formName.value = ''
}

// 点击遮罩关闭
function onModalMaskClick() {
  cancelModal()
}

// 保存分类（新增/编辑均先同步云端，失败降级本地）
async function saveCategory() {
  const uid = userStore.userInfo?.id
  if (!uid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const name = formName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' })
    return
  }

  let ok = false
  if (editingCategory.value) {
    // 编辑
    ok = await categoryStore.updateCategory(uid, editingCategory.value.id, name, formIcon.value)
    if (!ok) {
      uni.showToast({ title: '名称重复或更新失败', icon: 'none' })
      return
    }
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    // 新增
    ok = await categoryStore.addCategory(uid, name, formType.value, formIcon.value)
    if (!ok) {
      uni.showToast({ title: '同类型下分类名称不能重复', icon: 'none' })
      return
    }
    uni.showToast({ title: '新增成功', icon: 'success' })
    // 新增后切换到对应类型页
    currentType.value = formType.value
  }
  cancelModal()
}

// 删除分类（先同步云端，失败降级本地；有关联记录时阻止删除并精准提示）
async function onDelete(cat: Category) {
  const uid = userStore.userInfo?.id
  if (!uid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.showModal({
    title: `删除「${cat.name}」`,
    content: (
      '确定删除该分类吗？\n' +
      '• 该分类的配置信息（名称/图标）会从系统中移除\n' +
      '• 已引用该分类的历史记录**不会被删除**，但后续记账时无法再选择此分类\n\n' +
      '⚠️ 若该分类下仍有历史记录，为避免统计偏差，系统将阻止删除，需要先处理明细。'
    ),
    confirmText: '确认删除',
    confirmColor: '#E63329',
    cancelText: '取消',
    success: async (res) => {
      if (!res.confirm) return
      const result = await categoryStore.deleteCategory(uid, cat.id)
      if (result.ok) {
        uni.showToast({ title: '已删除', icon: 'success' })
      } else if (result.errorCode === 'has_records') {
        uni.showModal({
          title: '无法删除',
          content: result.errorMessage || '该分类下还有关联记录，暂不支持直接删除。',
          showCancel: false,
          confirmText: '我知道了'
        })
      } else {
        uni.showToast({ title: result.errorMessage || '删除失败', icon: 'none' })
      }
    }
  })
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

  &__back, &__action {
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
}

.content {
  padding: 0 32rpx 64rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $white;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  padding: 24rpx 28rpx;

  &__main {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  &__icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: $radius-icon;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $ink;
  }

  &__actions {
    display: flex;
    gap: 16rpx;
  }

  &__btn {
    padding: 12rpx 28rpx;
    border-radius: 32rpx;
    font-size: 24rpx;
    font-weight: 600;

    &--edit {
      background: $bg;
      color: $ink;
    }

    &--delete {
      background: rgba(#E63329, 0.08);
      color: $red;
    }
  }
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 32rpx;
  box-sizing: border-box;

  &__card {
    width: 100%;
    max-width: 640rpx;
    background: $white;
    border-radius: $radius-card;
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 700;
    color: $ink;
  }

  &__close {
    font-size: 48rpx;
    line-height: 1;
    color: $gray;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  &__label {
    font-size: 26rpx;
    font-weight: 600;
    color: $ink;
  }

  &__input {
    height: 88rpx;
    padding: 0 28rpx;
    background: $bg;
    border-radius: 20rpx;
    font-size: 30rpx;
    color: $ink;
  }

  &__placeholder {
    color: $muted;
  }

  &__actions {
    display: flex;
    gap: 24rpx;
    margin-top: 8rpx;
  }
}

.type-picker {
  display: flex;
  background: $bg;
  border-radius: $radius-pill;
  padding: 8rpx;
  height: 72rpx;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 28rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: $ink;

    &--active {
      background: $red;
      color: $white;
    }
  }
}

// 图标网格：flex-wrap + 负 margin 配对，兼容小程序（不依赖 calc）
.icon-list {
  margin: -8rpx;
  display: flex;
  flex-wrap: wrap;

  &__item {
    width: 16.6666%;   // 一行 6 个 ≈ 1/6
    padding: 8rpx;
    box-sizing: border-box;
  }

  &__item-inner {
    width: 100%;
    padding-top: 100%;  // 保证 1:1 正方形
    position: relative;
    background: $bg;
    border-radius: $radius-icon;
    border: 3rpx solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__item--active &__item-inner {
    border-color: $red;
    background: rgba(#E63329, 0.08);
  }

  // 由于 padding-top: 100% 会把图标挤到下面，这里用绝对定位居中（兼容 padding-top 撑开法）
  &__item-inner :deep(.icon-block),
  &__item-inner :deep(> *),
  &__item-inner > * {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    margin: auto;
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
</style>
