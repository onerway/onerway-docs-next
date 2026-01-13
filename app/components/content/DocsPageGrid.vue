<script setup lang="ts">
/**
 * DocsPageGrid 组件
 * 响应式网格布局容器，用于排列 DocsPageCard 等卡片组件
 *
 * 特点：
 * - 支持预设模式，一个 prop 搞定常见布局
 * - 支持字符串简写语法，MDC 中更易书写
 * - 支持响应式列数配置（base/sm/md/lg/xl 断点）
 * - 可自定义间距
 * - 支持语义化标签（div/ul/ol）
 * - 自动处理 ARIA 属性
 *
 * @example MDC 用法 - 预设模式（推荐）
 * ```mdc
 * ::docs-page-grid{preset="features"}
 *   :::docs-page-card{title="卡片1" to="/path"}
 *   :::
 * ::
 * ```
 *
 * @example MDC 用法 - 简化语法
 * ```mdc
 * ::docs-page-grid{cols="1 2 3"}
 * <!-- 等价于 base:1, md:2, lg:3 -->
 * ::
 * ```
 *
 * @example MDC 用法 - 完整控制（≥3 属性使用 YAML）
 * ```mdc
 * ::docs-page-grid
 * ---
 * cols:
 *   base: 1
 *   md: 2
 *   lg: 3
 *   xl: 4
 * ---
 * ::
 * ```
 */
// ============================================================================
// Types
// ============================================================================

type ResponsiveCols = 1 | 2 | 3 | 4;

interface ColsObject {
  base?: ResponsiveCols;
  sm?: ResponsiveCols;
  md?: ResponsiveCols;
  lg?: ResponsiveCols;
  xl?: ResponsiveCols;
}

// 预设配置 - 覆盖常见文档布局场景
const PRESETS = {
  // 功能展示：小屏单列，中屏双列，大屏三列
  features: { base: 1, md: 2, lg: 3 },
  // 卡片列表：更紧凑的双列布局
  cards: { base: 1, md: 2 },
  // 资源/链接列表：大屏可展示更多
  resources: { base: 1, sm: 2, lg: 3, xl: 4 },
  // 单列布局
  single: { base: 1 },
  // 双列布局
  dual: { base: 1, md: 2 },
} satisfies Record<string, ColsObject>;

export interface DocsPageGridProps {
  /** 预设模式：features | cards | resources | single | dual */
  preset?: keyof typeof PRESETS;
  /**
   * 响应式列数配置
   * - 字符串简写: "1 2 3" → base:1, md:2, lg:3
   * - 对象形式: { base: 1, md: 2, lg: 3 }
   */
  cols?: string | ColsObject;
  /** 间距类名，默认 gap-8 */
  gap?: string;
  /** 额外的 class */
  class?: string;
  /** 语义化标签 */
  as?: "div" | "ul" | "ol";
  /** 无障碍标签 */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<DocsPageGridProps>(), {
  gap: "gap-8",
  as: "div",
});

// ============================================================================
// Computed
// ============================================================================

/**
 * 解析 cols 配置，支持多种输入格式
 */
const resolvedCols = computed<ColsObject>(() => {
  // 1. 优先使用预设
  if (props.preset && PRESETS[props.preset]) {
    return PRESETS[props.preset];
  }

  // 2. 未提供 cols 时使用默认值
  if (!props.cols) {
    return { base: 1, md: 2, lg: 2, xl: 3 };
  }

  // 3. 对象形式直接使用
  if (typeof props.cols === "object") {
    return props.cols;
  }

  // 4. 字符串简写解析: "1 2 3" → { base: 1, md: 2, lg: 3 }
  const parts = props.cols
    .split(/\s+/)
    .map(Number)
    .filter(Boolean) as ResponsiveCols[];
  const [base, md, lg, xl] = parts;
  return {
    base: base || 1,
    ...(md && { md }),
    ...(lg && { lg }),
    ...(xl && { xl }),
  };
});

const gridClass = computed<string>(() => {
  const classes = ["grid", "items-stretch", props.gap];
  const { base, sm, md, lg, xl } = resolvedCols.value;

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
    :aria-label="props.as !== 'div' ? props.ariaLabel : undefined">
    <slot />
  </component>
</template>
