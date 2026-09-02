<template>
  <view class="icon-block" :class="{ 'icon-block--dark': dark }">
    <Icon :name="name" :size="iconSize" :color="iconColor" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  dark?: boolean
}>(), {
  size: 80,
  dark: false
})

const iconSize = computed(() => Math.round(props.size * 0.55))
const iconColor = computed(() => (props.dark ? '#FFFFFF' : '#111111'))
</script>

<style lang="scss" scoped>

.icon-block {
  width: v-bind('size + "rpx"');
  height: v-bind('size + "rpx"');
  border-radius: $radius-icon;
  background: $bg;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--dark {
    background: $black;
  }
}
</style>
