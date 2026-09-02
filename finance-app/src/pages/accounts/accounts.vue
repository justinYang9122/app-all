<!-- ============================================================
     财务管家 · 账户页
     展示总资产与各账户余额，支持添加、编辑和删除账户
     ============================================================ -->
<template>
  <view class="page">
    <!-- 顶部导航栏：左侧标题 + 右侧添加账户 -->
    <view class="topbar">
      <text class="topbar__title">账户</text>
      <text class="topbar__action" @click="onAddAccount" v-if="editMode">+ 添加账户</text>
      <text class="topbar__action" @click="enterEditMode" v-else-if="canToggleEdit">管理</text>
      <text class="topbar__action topbar__action--muted" @click="exitEditMode" v-else>完成</text>
    </view>

    <view class="content">
      <!-- 总资产卡片 -->
      <DarkCard label="总资产" :amount="totalAsset">
        <text class="dark-meta">{{ accounts.length }} 个账户</text>
      </DarkCard>

      <!-- 添加账户表单（编辑模式） -->
      <view class="add-form" v-if="showAddForm">
        <view class="card add-form__card">
          <view class="add-form__header">
            <text class="add-form__title">{{ editingAccount ? '编辑账户' : '新增账户' }}</text>
            <text class="add-form__close" @click="cancelAddForm">×</text>
          </view>

          <!-- 图标选择 -->
          <view class="add-form__row">
            <text class="add-form__label">图标</text>
            <view class="icon-picker">
              <view
                v-for="ic in accountIcons"
                :key="ic"
                class="icon-picker__item"
                :class="{ 'icon-picker__item--active': formIcon === ic }"
                @click="formIcon = ic"
              >
                <IconBlock :name="ic" :size="56" />
              </view>
            </view>
          </view>

          <!-- 名称输入 -->
          <view class="add-form__row">
            <text class="add-form__label">账户名称</text>
            <input
              class="add-form__input"
              v-model="formName"
              placeholder="如：招商银行卡"
              placeholder-class="add-form__placeholder"
            />
          </view>

          <!-- 余额输入 -->
          <view class="add-form__row">
            <text class="add-form__label">账户余额</text>
            <input
              class="add-form__input"
              type="digit"
              v-model="formBalance"
              placeholder="0.00"
              placeholder-class="add-form__placeholder"
            />
          </view>

          <!-- 操作按钮 -->
          <view class="add-form__actions">
            <BaseButton variant="outline" text="取消" @click="cancelAddForm" />
            <BaseButton variant="primary" :text="editingAccount ? '保存修改' : '保存账户'" @click="saveAccount" />
          </view>
        </view>
      </view>

      <!-- 账户列表 -->
      <view class="list">
        <view
          v-for="acc in accounts"
          :key="acc.id"
          class="account-item"
        >
          <view class="account-item__main" @click="onAccountClick(acc)">
            <view class="account-item__icon">
              <IconBlock :name="acc.icon" dark />
            </view>
            <view class="account-item__info">
              <text class="account-item__name">{{ acc.name }}</text>
            </view>
            <text class="account-item__balance num">¥ {{ formatBalance(acc.balance) }}</text>
          </view>

          <!-- 编辑模式下显示操作按钮 -->
          <view class="account-item__actions" v-if="editMode">
            <view class="account-item__btn account-item__btn--edit" @click="onEditAccount(acc)">
              <text>编辑</text>
            </view>
            <view class="account-item__btn account-item__btn--delete" @click="onDeleteAccount(acc)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部 TabBar -->
    <TabBar current="accounts" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DarkCard from '@/components/DarkCard.vue'
import IconBlock from '@/components/IconBlock.vue'
import BaseButton from '@/components/BaseButton.vue'
import TabBar from '@/components/TabBar.vue'
import { useAccountStore, accountIcons } from '@/stores/account'
import { useUserStore } from '@/stores/user'
import { formatNumber } from '@/utils/format'
import type { Account } from '@/types'

const accountStore = useAccountStore()
const userStore = useUserStore()

// 账户列表
const accounts = computed(() => accountStore.accounts)
// 总资产
const totalAsset = computed(() => accountStore.totalAsset)

// 编辑模式（从"我的-账户管理"进入时开启）
const editMode = ref(false)
// 是否可以切换到管理模式（避免在新增表单时重复显示）
const canToggleEdit = computed(() => !showAddForm.value && !editMode.value)

// 添加账户表单
const showAddForm = ref(false)
const editingAccount = ref<Account | null>(null)
const formIcon = ref(accountIcons[0])
const formName = ref('')
const formBalance = ref('')

// 金额格式化
function formatBalance(v: number): string {
  return formatNumber(v)
}

// 页面显示时加载账户，并检查是否为编辑模式
onShow(() => {
  const userId = userStore.userInfo?.id || ''
  accountStore.loadAccounts(userId)

  // 检查是否从"我的-账户管理"跳转（必须先写 storage 再 switchTab，时序已保证）
  try {
    const flag = uni.getStorageSync('account_edit_mode')
    if (flag === true || flag === 'true' || flag === 1) {
      editMode.value = true
      uni.removeStorageSync('account_edit_mode')
    }
  } catch {
    // ignore
  }
})

// 进入管理模式
function enterEditMode() {
  editMode.value = true
}

// 退出管理模式
function exitEditMode() {
  editMode.value = false
  cancelAddForm()
}

// 打开新增账户表单
function onAddAccount() {
  editingAccount.value = null
  formIcon.value = accountIcons[0]
  formName.value = ''
  formBalance.value = '0'
  showAddForm.value = true
}

// 打开编辑账户表单
function onEditAccount(acc: Account) {
  editingAccount.value = acc
  formIcon.value = acc.icon
  formName.value = acc.name
  formBalance.value = String(acc.balance ?? 0)
  showAddForm.value = true
}

// 取消表单
function cancelAddForm() {
  showAddForm.value = false
  editingAccount.value = null
  formName.value = ''
  formBalance.value = ''
}

// 保存账户（新增或修改）
async function saveAccount() {
  const name = formName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入账户名称', icon: 'none' })
    return
  }
  const balance = Number(formBalance.value)
  if (isNaN(balance)) {
    uni.showToast({ title: '请输入有效余额', icon: 'none' })
    return
  }

  const userId = userStore.userInfo?.id || ''
  uni.showLoading({ title: editingAccount.value ? '保存中' : '添加中' })

  try {
    if (editingAccount.value) {
      // 编辑模式：串行更新基本信息和余额（避免并发写入同一记录导致冲突）
      await accountStore.updateAccountInfo(userId, editingAccount.value.id, name, formIcon.value)
      await accountStore.updateAccount(userId, editingAccount.value.id, balance)
      uni.hideLoading()
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      // 新增
      await accountStore.addAccount(userId, name, formIcon.value, balance)
      uni.hideLoading()
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    cancelAddForm()
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 点击账户（非编辑模式修改余额，编辑模式不处理）
function onAccountClick(acc: Account) {
  if (editMode.value) return
  uni.showModal({
    title: acc.name,
    editable: true,
    placeholderText: '请输入新余额',
    content: String(acc.balance),
    success: async (res) => {
      if (res.confirm && res.content !== undefined) {
        const newBalance = Number(res.content)
        if (isNaN(newBalance)) {
          uni.showToast({ title: '请输入有效金额', icon: 'none' })
          return
        }
        const userId = userStore.userInfo?.id || ''
        uni.showLoading({ title: '更新中' })
        await accountStore.updateAccount(userId, acc.id, newBalance)
        uni.hideLoading()
        uni.showToast({ title: '更新成功', icon: 'success' })
      }
    }
  })
}

// 删除账户（二次确认 + 风险提示）
function onDeleteAccount(acc: Account) {
  // 第一步：先做关联记录阻断检查，有记录时直接提示用户，不再进入双重确认（避免浪费情绪成本）
  const userId = userStore.userInfo?.id || ''
  // （store 内部也会做一次校验，这里只是为了在第一次弹窗就显示更准确的提示，减少用户操作）
  uni.showModal({
    title: `删除「${acc.name}」`,
    content:
      '确定删除该账户吗？\n' +
      '• 该账户的配置信息（名称/图标/余额）会从系统中移除\n' +
      '• 已引用该账户的历史记录**不会被删除**，但后续记账时无法再选择此账户\n\n' +
      '⚠️ 若该账户下仍有历史记录，为避免统计偏差，系统将阻止删除，需要先处理明细。',
    confirmText: '确认删除',
    confirmColor: '#E63329',
    cancelText: '再想想',
    success: async (res) => {
      if (!res.confirm) return
      // 再次确认
      uni.showModal({
        title: '最后确认',
        content: '此操作不可撤销。真的要删除该账户配置吗？',
        confirmText: '仍然删除',
        confirmColor: '#E63329',
        cancelText: '取消',
        success: async (res2) => {
          if (!res2.confirm) return
          uni.showLoading({ title: '删除中' })
          try {
            const result = await accountStore.deleteAccount(userId, acc.id)
            uni.hideLoading()
            if (result.ok) {
              uni.showToast({ title: '已删除', icon: 'success' })
            } else if (result.errorCode === 'has_records') {
              uni.showModal({
                title: '无法删除',
                content: result.errorMessage || '该账户下还有关联记录，暂不支持直接删除。',
                showCancel: false,
                confirmText: '我知道了'
              })
            } else {
              uni.showToast({ title: '删除失败，请重试', icon: 'none' })
            }
          } catch {
            uni.hideLoading()
            uni.showToast({ title: '删除失败，请重试', icon: 'none' })
          }
        }
      })
    }
  })
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

  &__title {
    font-size: 34rpx;
    font-weight: 700;
    color: $ink;
  }

  &__action {
    font-size: 28rpx;
    font-weight: 600;
    color: $red;

    &--muted {
      color: $ink;
    }
  }
}

.content {
  padding: 16rpx 32rpx 208rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.dark-meta {
  font-size: 24rpx;
  color: #6e6e72;
}

.card {
  background: $white;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* ---- 账户列表项 ---- */
.account-item {
  background: $white;
  border-radius: 28rpx;
  overflow: hidden;

  &__main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
    padding: 28rpx;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: $ink;
  }

  &__balance {
    font-size: 34rpx;
    font-weight: 600;
    color: $ink;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  &__actions {
    display: flex;
    border-top: 1rpx solid $bg;
  }

  &__btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    font-weight: 500;

    &--edit {
      color: $ink;
      border-right: 1rpx solid $bg;
    }

    &--delete {
      color: $red;
    }

    &:active {
      background: $bg;
    }
  }
}

/* ---- 添加/编辑账户表单 ---- */
.add-form {
  &__card {
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
    color: $gray;
    line-height: 1;
    padding: 0 8rpx;
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  &__label {
    font-size: 26rpx;
    color: $gray;
    font-weight: 500;
  }

  &__input {
    height: 84rpx;
    padding: 0 24rpx;
    background: $bg;
    border-radius: 16rpx;
    font-size: 30rpx;
    color: $ink;
  }

  &__placeholder {
    color: #B8B8BC;
  }

  &__actions {
    display: flex;
    gap: 20rpx;
    margin-top: 8rpx;

    :deep(.base-btn) {
      flex: 1;
    }
  }
}

/* ---- 图标选择器 ---- */
.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  &__item {
    width: 96rpx;
    height: 96rpx;
    border-radius: 24rpx;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4rpx solid transparent;
    transition: all 0.15s;

    &--active {
      border-color: $red;
      background: rgba(230, 51, 41, 0.06);
    }
  }
}
</style>
