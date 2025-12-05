<script setup lang="ts">
/**
 * ProseInlineBlocks 组件
 * 强制其子内容（包括块级组件）在同一行内渲染
 *
 * 特点：
 * - 将块级组件和文本强制在同一行显示
 * - 使用 MDCSlot 移除多余的段落包装
 * - 适用于需要在段落中混合文本和块级组件的场景
 *
 * @example MDC 用法
 * ```mdc
 * ::prose-inline-blocks
 * 查看 ::prose-annotation
 * #default
 * OAuth 2.0
 * #annotation
 * **OAuth 2.0** is an authorization framework
 * :: 获取更多信息
 * ::
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface ProseInlineBlocksProps {
  /** 自定义 class */
  class?: string;
  /** 子元素垂直对齐方式 */
  align?: "baseline" | "top" | "middle" | "bottom";
}

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<ProseInlineBlocksProps>(),
  {
    class: undefined,
    align: "baseline",
  }
);

// ============================================================================
// Constants
// ============================================================================

/** 对齐方式映射 */
const ALIGN_MAP = {
  baseline: "align-baseline",
  top: "align-top",
  middle: "align-middle",
  bottom: "align-bottom",
} as const;

// ============================================================================
// Computed Properties
// ============================================================================

const alignClasses = computed(() => ALIGN_MAP[props.align]);
</script>

<template>
  <span
    :class="[
      'prose-inline-blocks-wrapper',
      alignClasses,
      props.class,
    ]">
    <MDCSlot unwrap="p" />
  </span>
</template>

<style scoped>
/**
 * 主容器样式
 * - 使用 <span> 标签作为容器，避免 <p> 嵌套块级元素的语义问题
 * - display: block 使其表现为块级元素（每个 ProseInlineBlocks 各占一行）
 * - 但内部子元素强制行内显示
 */
.prose-inline-blocks-wrapper {
  display: block;
}

/**
 * 处理可能存在的段落元素
 */
.prose-inline-blocks-wrapper :deep(p) {
  display: inline !important;
  margin: 0 !important;
}
</style>
