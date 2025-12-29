<script setup lang="ts">
/**
 * TabsItem 组件（覆盖 Nuxt UI 默认实现）
 * 作为 Tabs 的子组件使用
 *
 * @example MDC 用法
 * ```mdc
 * ::prose-tabs{sync="package-manager"}
 *
 * :::prose-tabs-item{label="pnpm" icon="i-simple-icons-pnpm"}
 * 使用 pnpm 安装：
 * ```bash
 * pnpm add @nuxt/ui
 * ```
 * :::
 *
 * :::prose-tabs-item{label="npm" icon="i-simple-icons-npm"}
 * 使用 npm 安装：
 * ```bash
 * npm install @nuxt/ui
 * ```
 * :::
 *
 * ::
 * ```
 */
export interface ProseTabsItemProps {
  /**
   * Tab 标签文本
   */
  label: string;
  /**
   * Tab 图标名称 (Iconify)
   */
  icon?: string;
  /** 自定义 class */
  class?: string;
}

defineProps<ProseTabsItemProps>();

defineSlots<{
  /**
   * 默认 slot - Tab 内容
   * 支持完整的 markdown 语法
   */
  default(): unknown;
}>();
</script>

<template>
  <!-- 
    Tab 内容容器
    - 作为 ProseTabs 的子组件，通过 props 传递 label、icon 等元数据
    - 实际内容通过 default slot 传入，由父组件通过 <component :is> 渲染
    - 保留 <div> 包装以支持 class prop 和样式定制
  -->
  <div :class="$props.class">
    <slot />
  </div>
</template>
