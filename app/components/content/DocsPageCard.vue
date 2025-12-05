<script setup lang="ts">
/**
 * DocsPageCard 组件
 * 可点击的文档卡片，用于展示文档入口和导航链接
 *
 * 特点：
 * - 基于 UPageCard 封装，继承 Nuxt UI 设计语言
 * - 支持多种变体（elevated/flat/ghost）
 * - 支持 spotlight 高亮效果
 * - 支持内部链接和外部链接
 * - 完整的可访问性支持（键盘导航、ARIA 属性）
 * - 支持自定义分析事件追踪
 *
 * @example MDC 用法
 * ```mdc
 * ::docs-page-card{title="快速开始" description="5分钟上手" to="/get-started" icon="i-lucide-rocket"}
 * ::
 * ```
 */
import type { RouteLocationRaw } from "vue-router";

type SpotlightColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";
type CardVariant = "elevated" | "flat" | "ghost";

interface DocsPageCardProps {
  title?: string;
  description?: string;
  to?: string | RouteLocationRaw;
  spotlight?: boolean;
  spotlightColor?: SpotlightColor;
  icon?: string;
  ariaLabel?: string;
  uiOverride?: Record<string, string>;
  variant?: CardVariant;
  clickable?: boolean;
  disabled?: boolean;
  external?: boolean;
  lineClampTitle?: number;
  lineClampDescription?: number;
  externalIndicator?: boolean;
  externalA11yLabel?: string;
  reverse?: boolean;
  orientation?: "horizontal" | "vertical";
  analytics?:
    | Record<string, unknown>
    | ((payload: {
        title?: string;
        to?: string | RouteLocationRaw;
        external: boolean;
      }) => void);
}

const props = withDefaults(
  defineProps<DocsPageCardProps>(),
  {
    spotlight: false,
    spotlightColor: "secondary",
    variant: "elevated",
    clickable: undefined,
    disabled: false,
    external: false,
    reverse: false,
    orientation: "vertical",
  }
);

const emit = defineEmits<{
  (
    e: "activate",
    payload: {
      event: Event;
      title?: string;
      to?: string | RouteLocationRaw;
      external: boolean;
    }
  ): void;
  (
    e: "analytics",
    payload: {
      title?: string;
      to?: string | RouteLocationRaw;
      external: boolean;
    }
  ): void;
}>();

const isClickable = computed<boolean>(() => {
  if (props.disabled) return false;
  if (props.clickable !== undefined) return props.clickable;
  return Boolean(props.to);
});

const computedAriaLabel = computed<string | undefined>(
  () => {
    return props.ariaLabel ?? props.title ?? undefined;
  }
);

const containerClass = computed<string>(() => {
  const base = [
    "col-span-1",
    "transition-all duration-300",
    // Respect reduced motion
    "motion-reduce:transition-none motion-reduce:transform-none",
    "group",
  ];

  if (props.variant === "elevated") {
    base.push(
      "shadow-md hover:shadow-xl hover:-translate-y-1"
    );
  } else if (props.variant === "flat") {
    // Keep flat minimal without hardcoded grayscale to preserve dark mode
  } else if (props.variant === "ghost") {
    // Ghost keeps minimal hover without hardcoded background to preserve dark mode
  }

  if (isClickable.value) base.push("cursor-pointer");
  if (props.disabled)
    base.push("opacity-60 pointer-events-none");

  // Focus styles rely on underlying link/button semantics; keep a visible outline for non-link cases
  base.push(
    "focus-visible:outline-primary",
    "focus-within:ring-2",
    "focus-within:ring-primary/50",
    "focus-within:ring-offset-0"
  );

  return base.join(" ");
});

const defaultTitleUi = computed<string>(() => {
  // Title emphasis and smooth transition, coordinated with group hover
  return "text-primary group-hover:text-default transition-colors duration-200";
});

const mergedUi = computed<Record<string, string>>(() => {
  const overrides = props.uiOverride || {};
  const combinedTitle = [
    defaultTitleUi.value,
    overrides.title,
  ]
    .filter(Boolean)
    .join(" ");
  const descriptionClamp = props.lineClampDescription
    ? `line-clamp-${props.lineClampDescription}`
    : "";
  const combinedDescription = [
    overrides.description,
    descriptionClamp,
  ]
    .filter(Boolean)
    .join(" ");
  const titleClamp = props.lineClampTitle
    ? `line-clamp-${props.lineClampTitle}`
    : "";
  const finalTitle = [combinedTitle, titleClamp]
    .filter(Boolean)
    .join(" ");
  return {
    ...overrides,
    title: finalTitle,
    ...(combinedDescription
      ? { description: combinedDescription }
      : {}),
  };
});

const computedTarget = computed<string | undefined>(() => {
  return props.external ? "_blank" : undefined;
});

const computedRel = computed<string | undefined>(() => {
  return props.external ? "noopener noreferrer" : undefined;
});

const roleAttr = computed<string | undefined>(() => {
  if (props.disabled) return undefined;
  if (!props.to && isClickable.value) return "button";
  return undefined;
});

const tabIndexAttr = computed<number | undefined>(() => {
  if (props.disabled) return -1;
  if (!props.to && isClickable.value) return 0;
  return undefined;
});

const activate = (event: Event) => {
  if (props.disabled) return;
  const payload = {
    title: props.title,
    to: props.to,
    external: !!props.external,
  };
  emit("activate", { event, ...payload });
  if (typeof props.analytics === "function") {
    props.analytics(payload);
  } else if (
    props.analytics &&
    typeof props.analytics === "object"
  ) {
    emit("analytics", payload);
  }
};

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  activate(event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (
    !props.to &&
    isClickable.value &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    activate(event);
  }
};

// Extend aria label when external indicator is requested and external
const extendedAriaLabel = computed<string | undefined>(
  () => {
    const base = computedAriaLabel.value;
    if (props.external && props.externalIndicator) {
      const suffix = props.externalA11yLabel
        ? ` ${props.externalA11yLabel}`
        : "";
      return base ? `${base}${suffix}` : undefined;
    }
    return base;
  }
);
</script>

<template>
  <UPageCard
    :title="title"
    :description="description"
    :to="to as any"
    :orientation="orientation"
    :icon="icon as any"
    :spotlight="spotlight"
    :spotlight-color="spotlightColor"
    :ui="mergedUi"
    :aria-label="extendedAriaLabel"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="tabIndexAttr"
    :target="computedTarget"
    :rel="computedRel"
    :class="containerClass"
    :role="roleAttr"
    :reverse="reverse"
    @click="handleClick"
    @keydown="handleKeydown">
    <template #default>
      <slot />
    </template>
  </UPageCard>
</template>
