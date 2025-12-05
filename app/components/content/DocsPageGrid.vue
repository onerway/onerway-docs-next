<script setup lang="ts">
/**
 * DocsPageGrid 组件
 * 响应式网格布局容器，用于排列 DocsPageCard 等卡片组件
 *
 * 特点：
 * - 支持响应式列数配置（base/sm/md/lg/xl 断点）
 * - 可自定义间距
 * - 支持语义化标签（div/ul/ol）
 * - 自动处理 ARIA 属性
 *
 * @example MDC 用法
 * ```mdc
 * ::docs-page-grid{cols.base="1" cols.md="2" cols.lg="3"}
 *   ::docs-page-card{title="卡片1"}
 *   ::
 *   ::docs-page-card{title="卡片2"}
 *   ::
 * ::
 * ```
 */
// ============================================================================
// Types
// ============================================================================

type ResponsiveCols = 1 | 2 | 3;

export interface DocsPageGridProps {
  cols?: {
    base?: ResponsiveCols;
    sm?: ResponsiveCols;
    md?: ResponsiveCols;
    lg?: ResponsiveCols;
    xl?: ResponsiveCols;
  };
  gap?: string;
  uiOverride?: Record<string, string>;
  class?: string;
  as?: "div" | "ul" | "ol";
  ariaLabel?: string;
}

const props = withDefaults(
  defineProps<DocsPageGridProps>(),
  {
    cols: () => ({ base: 1, md: 2, lg: 2, xl: 3 }),
    gap: "gap-6",
    as: "div",
  }
);

const gridClass = computed<string>(() => {
  const classes = ["grid", "items-stretch", props.gap];
  const { base, sm, md, lg, xl } = props.cols;
  if (base) classes.push(`grid-cols-${base}`);
  if (sm) classes.push(`sm:grid-cols-${sm}`);
  if (md) classes.push(`md:grid-cols-${md}`);
  if (lg) classes.push(`lg:grid-cols-${lg}`);
  if (xl) classes.push(`xl:grid-cols-${xl}`);
  return classes.join(" ");
});
</script>

<template>
  <component
    :is="props.as"
    :class="[gridClass, props.class]"
    :role="props.as !== 'div' ? 'list' : undefined"
    :aria-label="
      props.as !== 'div' ? props.ariaLabel : undefined
    ">
    <slot />
  </component>
</template>
