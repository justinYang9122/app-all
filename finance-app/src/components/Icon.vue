<template>
  <!-- 使用 image + data URI 渲染 SVG，跨端兼容（H5/小程序/App） -->
  <image
    :src="dataUri"
    :style="{ width: sizeStr, height: sizeStr }"
    mode="aspectFit"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  color?: string
}>(), {
  size: 44,
  color: '#111111'
})

const emit = defineEmits<{
  click: []
}>()

const sizeStr = computed(() =>
  typeof props.size === 'number' ? `${props.size}rpx` : props.size
)

// 图标 SVG 路径数据（viewBox 统一 0 0 24 24，12x12 图标已缩放）
// __C__ 为颜色占位符，渲染时替换为实际颜色
const iconMap: Record<string, string> = {
  // Tab 图标
  home: '<path d="M4 10.5l8-7 8 7" stroke-width="2"/><path d="M6 9.5V20h12V9.5" stroke-width="2"/>',
  chart: '<path d="M5 20V13M12 20V5M19 20v-6" stroke-width="2"/>',
  wallet: '<rect x="3.5" y="6" width="17" height="12" rx="2" stroke-width="2"/><path d="M3.5 9.5h17" stroke-width="2"/>',
  user: '<circle cx="12" cy="8" r="3.6" stroke-width="2"/><path d="M5.5 20c.5-3.5 3-5 6.5-5s6 1.5 6.5 5" stroke-width="2"/>',

  // 品牌图标
  logo: '<path d="M8 5l4 6 4-6M12 11v8M9.5 15h5M9.5 19h5" stroke-width="2"/>',

  // 通用图标
  lock: '<rect x="5" y="10" width="14" height="10" rx="2" stroke-width="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke-width="1.8"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke-width="2.4"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6" stroke-width="2"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6" stroke-width="2"/>',
  search: '<circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M21 21l-4.5-4.5" stroke-width="2"/>',
  export: '<path d="M12 3v12M7 8l5-5 5 5" stroke-width="1.8"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke-width="1.8"/>',
  settings: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke-width="1.8"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H5a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H11a1.7 1.7 0 0 0 1-1.5V5a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V11a1.7 1.7 0 0 0 1.5 1H19a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke-width="1.5"/>',

  // 支出分类图标
  food: '<circle cx="12" cy="14" r="6" stroke-width="1.8"/><path d="M9 14V9M12 14V7M15 14V9" stroke-width="1.8"/>',
  transport: '<path d="M5 15.5l1.3-4.2A2 2 0 0 1 8.2 10h7.6a2 2 0 0 1 1.9 1.3L19 15.5" stroke-width="1.7"/><rect x="4" y="15.5" width="16" height="3.2" rx="1.2" stroke-width="1.7"/><path d="M7.5 19.5v1M16.5 19.5v1" stroke-width="1.7"/>',
  shopping: '<path d="M6 8h12l-1 12H7L6 8z" stroke-width="1.7"/><path d="M9 10V6a3 3 0 0 1 6 0v4" stroke-width="1.7"/>',
  entertainment: '<circle cx="12" cy="12" r="9" stroke-width="1.7"/><path d="M10 8.5l6 3.5-6 3.5z" fill="__C__" stroke="none"/>',
  housing: '<path d="M4 11l8-7 8 7" stroke-width="1.7"/><path d="M6 10v10h12V10" stroke-width="1.7"/><path d="M10 20v-5h4v5" stroke-width="1.7"/>',
  medical: '<circle cx="12" cy="12" r="9" stroke-width="1.7"/><path d="M12 8v8M8 12h8" stroke-width="1.7"/>',
  communication: '<rect x="7.5" y="3" width="9" height="18" rx="2" stroke-width="1.7"/><path d="M10.5 18h3" stroke-width="1.7"/>',
  clothing: '<path d="M12 9a2.2 2.2 0 1 0-2.2-2.2" stroke-width="1.7"/><path d="M5 20l7-8.5 7 8.5" stroke-width="1.7"/>',
  social: '<rect x="4" y="9" width="16" height="11" rx="1.5" stroke-width="1.7"/><path d="M12 9v11M4 13.5h16" stroke-width="1.7"/><path d="M12 9s-3.5-3-5-1.8c-.8.6-.2 1.8 5 1.8z" stroke-width="1.7"/><path d="M12 9s3.5-3 5-1.8c.8.6.2 1.8-5 1.8z" stroke-width="1.7"/>',
  other: '<circle cx="6" cy="12" r="1.7" fill="__C__" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="__C__" stroke="none"/><circle cx="18" cy="12" r="1.7" fill="__C__" stroke="none"/>',

  // 收入分类图标
  salary: '<rect x="3" y="6" width="18" height="12" rx="2" stroke-width="1.7"/><circle cx="12" cy="12" r="3" stroke-width="1.7"/><path d="M6.5 9.5h.01M17.5 14.5h.01" stroke-width="1.7"/>',
  parttime: '<rect x="3" y="7" width="18" height="13" rx="2" stroke-width="1.7"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke-width="1.7"/><path d="M3 12h18" stroke-width="1.7"/>',
  bonus: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z" stroke-width="1.7"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" stroke-width="1.7"/><path d="M10 13h4M12 13v4M9 20h6" stroke-width="1.7"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2" stroke-width="1.7"/><path d="M12 8v13M3 12h18" stroke-width="1.7"/><path d="M12 8s-2-4-4-3 1 3 4 3zM12 8s2-4 4-3-1 3-4 3z" stroke-width="1.7"/>',

  // 账户图标
  cash: '<path d="M3 7h18v10H3" stroke-width="1.7"/><circle cx="12" cy="12" r="2.5" stroke-width="1.7"/>',
  'bank-card': '<rect x="3" y="5.5" width="18" height="13" rx="2" stroke-width="1.7"/><path d="M3 9.5h18" stroke-width="1.7"/>',
  wechat: '<path d="M5 6h14v9H10l-4 4V6" stroke-width="1.7"/>',
  alipay: '<circle cx="12" cy="12" r="9" stroke-width="1.7"/><path d="M9 9h6M12 9v6" stroke-width="1.7"/>'
}

const dataUri = computed(() => {
  const content = iconMap[props.name] || ''
  if (!content) return ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${props.color}" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`

  // 替换颜色占位符
  const colored = svg.replace(/__C__/g, props.color)

  // 使用 URL 编码，兼容小程序
  return `data:image/svg+xml,${encodeURIComponent(colored)}`
})
</script>
