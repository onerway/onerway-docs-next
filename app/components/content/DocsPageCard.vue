<script setup lang="ts">
/**
 * DocsPageCard 组件
 * 可点击的文档卡片，用于展示文档入口和导航链接
 *
 * 特点：
 * - 基于 UPageCard 封装，继承 Nuxt UI 设计语言
 * - 支持 Nuxt UI 原生 variant（solid/outline/soft/subtle/ghost/naked）
 * - 支持 spotlight 高亮效果（悬浮动画通过 app.config.ts 全局配置）
 * - 支持内部链接和外部链接
 * - 支持标题旁显示 Badge 标签
 * - 支持自定义分析事件追踪
 * - 支持文本截断（line-clamp）
 *
 * @example MDC 用法
 * ```mdc
 * <!-- 基础用法（≥3 属性使用 YAML 块） -->
 * ::docs-page-card
 * ---
 * title: 快速开始
 * to: /get-started
 * icon: i-lucide-rocket
 * ---
 * ::
 *
 * <!-- 带 Badge 标签 -->
 * ::docs-page-card
 * ---
 * title: 即将推出
 * to: "#"
 * badge: TODO
 * ---
 * ::
 *
 * <!-- Badge 对象配置 -->
 * ::docs-page-card
 * ---
 * title: 新功能
 * to: /new
 * badge:
 *   label: New
 *   color: success
 * ---
 * ::
 *
 * <!-- 简单用法（<3 属性可内联） -->
 * ::docs-page-card{title="标题" to="/path"}
 * 卡片描述内容
 * ::
 * ```
 */
import type { RouteLocationRaw } from "vue-router";
import type { PageCardProps, BadgeProps } from "#ui/types";

// ============================================================================
// Types（从 Nuxt UI 派生，确保类型同步）
// ============================================================================

/** Nuxt UI PageCard 原生 variant */
type NativeVariant = NonNullable<PageCardProps["variant"]>;

/** Spotlight 颜色，从 Nuxt UI PageCardProps 提取 */
type SpotlightColor = NonNullable<PageCardProps["spotlightColor"]>;

/** PageCard 方向，从 Nuxt UI PageCardProps 提取 */
type Orientation = NonNullable<PageCardProps["orientation"]>;

/** Badge 颜色，从 Nuxt UI BadgeProps 提取 */
type BadgeColor = NonNullable<BadgeProps["color"]>;

/** Badge 变体，从 Nuxt UI BadgeProps 提取 */
type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/** line-clamp 允许的值（必须显式声明以支持 Tailwind JIT） */
type LineClampValue = 1 | 2 | 3 | 4 | 5 | 6;

/** Badge 配置对象 */
interface BadgeConfig {
  label: string;
  color?: BadgeColor;
  variant?: BadgeVariant;
}

/** 分析事件载荷 */
interface AnalyticsPayload {
  title?: string;
  to?: string | RouteLocationRaw;
  external: boolean;
}

export interface DocsPageCardProps {
  title?: string;
  description?: string;
  to?: string | RouteLocationRaw;
  spotlight?: boolean;
  spotlightColor?: SpotlightColor;
  icon?: string;
  /**
   * 标题旁显示的 Badge
   * - 字符串：直接作为 label 显示
   * - 对象：支持 label、color、variant 配置
   */
  badge?: string | BadgeConfig;
  /** 覆盖 UPageCard 的 ui slots 样式 */
  uiOverride?: Record<string, string>;
  /**
   * Nuxt UI 原生卡片变体
   * @default "outline"
   */
  variant?: NativeVariant;
  disabled?: boolean;
  external?: boolean;
  lineClampTitle?: LineClampValue;
  lineClampDescription?: LineClampValue;
  reverse?: boolean;
  orientation?: Orientation;
  /** 分析事件：可以是回调函数或元数据对象 */
  analytics?: Record<string, unknown> | ((payload: AnalyticsPayload) => void);
}

const props = withDefaults(defineProps<DocsPageCardProps>(), {
  spotlight: true,
  spotlightColor: "primary",
  variant: "outline",
  disabled: false,
  external: false,
  reverse: false,
  orientation: "vertical",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  analytics: [payload: AnalyticsPayload];
}>();

// ============================================================================
// Constants
// ============================================================================

/**
 * 显式映射 line-clamp 类名，确保 Tailwind JIT 能正确编译
 * 动态模板字符串如 `line-clamp-${n}` 不会被 JIT 检测到
 */
const LINE_CLAMP_MAP: Record<LineClampValue, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

// ============================================================================
// Computed Properties
// ============================================================================

/** 容器样式类 */
const containerClass = computed(() => {
  const classes = [
    "col-span-1",
    // 尊重用户的 reduced motion 偏好
    "motion-reduce:transition-none motion-reduce:transform-none",
  ];

  if (props.disabled) {
    classes.push("opacity-60 pointer-events-none");
  }

  return classes.join(" ");
});

/** 合并 UPageCard ui 配置 */
const mergedUi = computed(() => {
  const overrides = props.uiOverride || {};

  // 仅在有 lineClamp 时添加样式，其他样式由 app.config.ts 全局配置
  const titleClamp = props.lineClampTitle
    ? LINE_CLAMP_MAP[props.lineClampTitle]
    : "";
  const descriptionClamp = props.lineClampDescription
    ? LINE_CLAMP_MAP[props.lineClampDescription]
    : "";

  return {
    ...overrides,
    ...(titleClamp || overrides.title
      ? { title: [overrides.title, titleClamp].filter(Boolean).join(" ") }
      : {}),
    ...(descriptionClamp || overrides.description
      ? {
          description: [overrides.description, descriptionClamp]
            .filter(Boolean)
            .join(" "),
        }
      : {}),
  };
});

/** 外部链接属性 */
const linkAttrs = computed(() =>
  props.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {}
);

/** 标准化 Badge 配置 */
const normalizedBadge = computed(() => {
  if (!props.badge) return null;

  if (typeof props.badge === "string") {
    return {
      label: props.badge,
      color: "neutral" as BadgeColor,
      variant: "subtle" as BadgeVariant,
    };
  }

  return {
    label: props.badge.label,
    color: props.badge.color ?? ("neutral" as BadgeColor),
    variant: props.badge.variant ?? ("subtle" as BadgeVariant),
  };
});

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * 处理点击事件
 * UPageCard 内部的 ULink 已处理键盘导航，这里只需处理 click
 */
const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit("click", event);

  // Analytics 处理
  if (props.analytics) {
    const payload: AnalyticsPayload = {
      title: props.title,
      to: props.to,
      external: props.external,
    };

    if (typeof props.analytics === "function") {
      props.analytics(payload);
    } else {
      emit("analytics", payload);
    }
  }
};
</script>

<template>
  <UPageCard
    :title="badge ? undefined : title"
    :description="description"
    :to="disabled ? undefined : (to as any)"
    :orientation="orientation"
    :icon="icon as any"
    :spotlight="spotlight"
    :spotlight-color="spotlightColor"
    :variant="variant"
    :ui="mergedUi"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="containerClass"
    :reverse="reverse"
    v-bind="linkAttrs"
    @click="handleClick">
    <!-- 自定义标题 slot：当有 badge 时渲染标题 + badge -->
    <template
      v-if="badge && title"
      #title>
      <span class="inline-flex items-center gap-2">
        <span>{{ title }}</span>
        <UBadge
          :label="normalizedBadge!.label"
          :color="normalizedBadge!.color"
          :variant="normalizedBadge!.variant"
          size="sm" />
      </span>
    </template>

    <template #default>
      <slot />
    </template>
  </UPageCard>
</template>
