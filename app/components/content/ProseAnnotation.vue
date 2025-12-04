<script setup lang="ts">
/**
 * ProseAnnotation 组件
 * 用于在文档中对概念进行行内注释，支持 hover 显示富内容
 *
 * 特点：
 * - 行内使用，不破坏文本流
 * - 支持特殊样式标识（下划线虚线、高亮颜色等）
 * - Hover 时显示 Popover 注释内容
 * - 注释内容支持 markdown 语法渲染
 * - 桌面端 hover 显示，移动端点击显示（可配置）
 * - 支持自定义图标和颜色主题
 *
 * @example MDC 用法
 * ```mdc
 * # 行内语法 - slot 内容
 * :prose-annotation[technical term]{annotation="A brief explanation"}
 *
 * # 行内语法 - text prop
 * :prose-annotation{text="technical term" annotation="A brief explanation"}
 *
 * # 带颜色主题
 * :prose-annotation[API endpoint]{annotation="REST API endpoint" color="primary"}
 *
 * # 富 Markdown 内容注释（使用 slot）
 * ::prose-annotation
 * ---
 * color: primary
 * icon: i-lucide-info
 * ---
 *
 * #default
 * merchant credentials
 *
 * #annotation
 * Your merchant credentials include:
 * - **Merchant Number**: Unique identifier
 * - **Secret Key**: Used for signing requests
 * - `Application ID`: OAuth application identifier
 * ::
 * ```
 */

import type { VNode } from "vue";

// ============================================================================
// Types
// ============================================================================

export interface ProseAnnotationProps {
  /** 触发文本（当没有 slot 内容时使用） */
  text?: string;
  /** 注释内容（纯文本） */
  annotation?: string;
  /**
   * 颜色主题
   * - inherit: 继承父元素颜色（用于容器内自动适配）
   * - primary/secondary/...: 使用固定颜色
   */
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "neutral";
  /** 前置图标 */
  icon?: string;
  /** 后置图标 */
  trailingIcon?: string;
  /** 注释弹窗中的标题（可选） */
  title?: string;
  /** 自定义 class */
  class?: string;
  /** 是否在移动端显示（默认 true） */
  showOnMobile?: boolean;
  /** 下划线样式 */
  underline?: "dotted" | "dashed" | "solid" | "none";
  /** 是否为行内模式（默认 false，设为 true 时组件会尝试与前后文本保持在同一行） */
  inline?: boolean;
}

// ============================================================================
// Props & Slots
// ============================================================================

const props = withDefaults(
  defineProps<ProseAnnotationProps>(),
  {
    text: undefined,
    annotation: undefined,
    color: "inherit",
    icon: undefined,
    trailingIcon: "i-lucide-info",
    title: undefined,
    class: undefined,
    showOnMobile: true,
    underline: "dashed",
    inline: false,
  }
);

const slots = defineSlots<{
  default(): VNode[];
  annotation(): VNode[];
}>();

// ============================================================================
// Reactive State
// ============================================================================

/** 检测设备是否支持 hover（桌面端） */
const supportsHover = ref(false);

onMounted(() => {
  supportsHover.value = window.matchMedia(
    "(hover: hover)"
  ).matches;
});

// ============================================================================
// Constants
// ============================================================================

/**
 * 颜色主题映射
 * 使用 Nuxt UI 主题令牌 + border 颜色
 * @see https://ui.nuxt.com/docs/getting-started/theme/css-variables
 */
const COLOR_MAP = {
  // inherit: 继承父元素颜色，用于容器内自动适配（如 warning/note 等）
  inherit: {
    text: "", // 不设置，继承父元素文字颜色
    border: "border-current/40 hover:border-current", // 使用 currentColor
  },
  primary: {
    text: "text-primary",
    border: "border-primary/50 hover:border-primary",
  },
  secondary: {
    text: "text-muted",
    border: "border-muted/50 hover:border-muted",
  },
  success: {
    text: "text-success",
    border: "border-success/50 hover:border-success",
  },
  warning: {
    text: "text-warning",
    border: "border-warning/50 hover:border-warning",
  },
  error: {
    text: "text-error",
    border: "border-error/50 hover:border-error",
  },
  neutral: {
    text: "text-default",
    border: "border-inverted/20 hover:border-inverted",
  },
} as const;

/**
 * 下划线样式映射
 * 使用 border-b 替代 underline，实现更精细的控制
 */
const UNDERLINE_MAP = {
  dotted: "border-b border-dotted",
  dashed: "border-b border-dashed",
  solid: "border-b border-solid",
  none: "",
} as const;

// ============================================================================
// Computed Properties
// ============================================================================

/** 是否显示 Popover */
const shouldShowPopover = computed(() => {
  return supportsHover.value || props.showOnMobile;
});

/** 是否有富内容注释 slot */
const hasAnnotationSlot = computed(
  () => !!slots.annotation
);

/** 是否有注释内容 */
const hasAnnotation = computed(() => {
  return props.annotation || hasAnnotationSlot.value;
});

// ============================================================================
// Styles
// ============================================================================

/**
 * 统一样式配置
 * 参考 React Annotation 组件样式，使用 border-b 实现底部线条
 */
const styles = computed(() => {
  const colorStyle = COLOR_MAP[props.color];

  return {
    // 触发元素样式 - 参考 React 版本使用 border-b 替代 underline
    trigger: [
      "inline-flex items-center gap-1 px-1",
      "cursor-help", // 帮助光标，表示可查看更多信息
      UNDERLINE_MAP[props.underline],
      colorStyle.text,
      colorStyle.border,
      "transition-colors duration-200",
      props.class,
    ]
      .filter(Boolean)
      .join(" "),

    // Popover UI 配置 - 使用 Nuxt UI 主题令牌
    popover: {
      content: [
        "w-max max-w-xs", // 自适应宽度，最大 320px
        "px-3 py-2", // 紧凑的 padding
        "rounded-lg",
        "bg-default", // Nuxt UI 背景令牌
        "border border-default", // 边框
        "shadow-lg", // 阴影
        "text-sm leading-relaxed", // 文字样式
      ].join(" "),
    },

    // 标题样式 - 沿用 Nuxt UI prose h4 默认样式
    title: "text-base text-highlighted font-semibold mb-2",

    // Markdown prose 样式 - 让 Nuxt Content 的 prose 组件使用默认样式
    prose: "",

    // 纯文本样式 - 使用 Nuxt UI 文本令牌
    text: "text-default leading-relaxed m-0",
  };
});
</script>

<template>
  <span>
    <!-- 有注释内容时显示 Popover -->
    <UPopover
      v-if="shouldShowPopover && hasAnnotation"
      :dismissible="showOnMobile"
      :close-delay="200"
      :mode="supportsHover ? 'hover' : 'click'"
      :content="{
        side: 'top',
        align: 'center',
        sideOffset: 12,
      }"
      arrow
      :ui="styles.popover">
      <!-- 触发元素 -->
      <span :class="styles.trigger">
        <UIcon
          v-if="icon"
          :name="icon"
          class="inline size-3.5" />
        <!-- 优先使用 slot，其次使用 text prop -->
        <slot>{{ text }}</slot>
        <UIcon
          v-if="trailingIcon"
          :name="trailingIcon"
          class="inline size-3.5" />
      </span>

      <!-- Popover 内容 -->
      <template #content>
        <div class="annotation-content">
          <!-- 可选标题 -->
          <h4
            v-if="title"
            :class="styles.title">
            {{ title }}
          </h4>

          <!-- 富 Markdown 内容（来自 slot） -->
          <div
            v-if="hasAnnotationSlot"
            :class="styles.prose">
            <slot name="annotation" />
          </div>

          <!-- 纯文本注释 -->
          <p
            v-else-if="annotation"
            :class="styles.text">
            {{ annotation }}
          </p>
        </div>
      </template>
    </UPopover>

    <!-- 无注释内容时的降级显示 -->
    <span
      v-else
      :class="styles.trigger">
      <UIcon
        v-if="icon"
        :name="icon"
        class="inline size-3.5" />
      <slot>{{ text }}</slot>
    </span>
  </span>
</template>
