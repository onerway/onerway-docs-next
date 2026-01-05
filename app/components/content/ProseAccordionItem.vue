<script setup lang="ts">
/**
 * ProseAccordionItem 组件
 * 作为 ProseAccordion 的子组件使用
 *
 * 支持两个命名 slot：
 * - #label: 用于放置 markdown 标题作为 trigger
 * - #content: 用于放置展开内容
 *
 * @example MDC 用法 - 基础
 * ```mdc
 * :::accordion-item{icon="i-lucide-circle-help"}
 *
 * #label
 * ## 这是标题，支持 **markdown** 语法
 *
 * #content
 * 这是内容区域，支持完整的 markdown 语法。
 *
 * :::
 * ```
 *
 * @example MDC 用法 - 单个 badge
 * ```mdc
 * :::accordion-item{icon="i-lucide-credit-card" badge="NEW"}
 * ```
 *
 * @example MDC 用法 - 多个 badges（YAML 形式）
 * ```mdc
 * :::accordion-item{icon="i-lucide-credit-card"}
 * ---
 * badges:
 *   - label: NEW
 *     color: primary
 *   - label: Beta
 *     color: neutral
 * ---
 * :::
 * ```
 */

// 从 ProseAccordion 导入 BadgeConfig 类型，避免重复定义
import type { BadgeConfig } from "./ProseAccordion.vue";

export interface ProseAccordionItemProps {
  /**
   * 前置图标名称
   */
  icon?: string;
  /**
   * 自定义 trailing icon
   * 覆盖父组件的默认 chevron-down 图标
   */
  trailingIcon?: string;
  /**
   * 单个 badge（简单场景）
   * @example badge="NEW"
   */
  badge?: string;
  /**
   * 多个 badges（灵活场景）
   * @example :badges='[{"label":"NEW","color":"primary"}]'
   */
  badges?: BadgeConfig[];
  /** 自定义 class */
  class?: string;
}

defineProps<ProseAccordionItemProps>();

defineSlots<{
  /**
   * Label slot - 用于显示在 trigger 中的内容
   * 支持 markdown 语法，如标题、加粗等
   */
  label(): unknown;
  /**
   * Content slot - 展开后显示的内容
   * 支持完整的 markdown 语法
   */
  content(): unknown;
}>();
</script>

<template>
  <!-- 
    此组件作为数据容器，实际渲染由父组件 ProseAccordion 处理
    父组件会提取 #label 和 #content slot 内容
  -->
  <div :class="$props.class">
    <slot name="label" />
    <slot name="content" />
  </div>
</template>
