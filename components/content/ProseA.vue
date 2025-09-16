<script setup lang="ts">
import { createLogger } from "~/composables/shared/logger";

/**
 * Enhanced ProseA Component - Optimized with NuxtLink and Glossary Support
 *
 * Leverages NuxtLink's native intelligent link detection:
 * - Automatically handles internal vs external links
 * - Native security attributes (rel="noopener noreferrer")
 * - Built-in prefetching for internal links
 * - SSR safe with no hydration mismatch
 *
 * Enhanced with Glossary Integration:
 * - Supports glossary key lookup for term definitions
 * - Fallback to manual tooltip when glossary term not found
 * - Multi-language support through useGlossary composable
 *
 * Only adds visual enhancements (icons) for different link types.
 */
interface ProseAProps {
  /** Link URL - can be internal path or external URL */
  href?: string;
  /** Alternative to href */
  to?: string;
  /** Force open in new tab */
  target?: string;
  /** Show icon for external/email/phone links */
  showExternalIcon?: boolean;
  /** Show underline by default */
  underline?: boolean;
  /** Disable the link */
  disabled?: boolean;
  /** Custom external behavior */
  external?: boolean;
  /** Prefetch control */
  prefetch?: boolean;
  /** No prefetch */
  noPrefetch?: boolean;
  /** Standardized explanation text (fallback when glossary not found) */
  tooltip?: string;
  /** Tooltip open */
  open?: boolean;
  /** Glossary key - preferred way to provide explanations */
  glossary?: string;
  /** Glossary tooltip placement */
  side?: "top" | "bottom" | "left" | "right";
}

const props = withDefaults(defineProps<ProseAProps>(), {
  href: "",
  to: "",
  target: undefined,
  showExternalIcon: true,
  underline: false,
  disabled: false,
  external: undefined,
  prefetch: undefined,
  noPrefetch: undefined,
  tooltip: undefined,
  glossary: undefined,
  side: "top",
  open: false,
});

// Glossary integration
const { getTerm } = useGlossary();

const logger = createLogger("ProseA");

/**
 * 计算最终的链接地址
 */
const linkUrl = computed(
  () => props.to || props.href || ""
);

/**
 * 检测链接类型 - 简化版本
 */
const linkType = computed(() => {
  if (!linkUrl.value) return "empty";
  if (linkUrl.value.startsWith("mailto:")) return "mailto";
  if (linkUrl.value.startsWith("tel:")) return "tel";
  if (
    linkUrl.value.startsWith("http://") ||
    linkUrl.value.startsWith("https://")
  ) {
    return "external";
  }
  return "internal";
});

/**
 * 动态类名计算 - 简化版本
 */
const linkClasses = computed(() => [
  // 基础样式
  "inline-flex items-center gap-1 transition-colors duration-200",

  // 默认链接颜色
  "text-primary hover:text-default",

  // 下划线样式
  {
    "underline decoration-1 underline-offset-2":
      props.underline,
    "no-underline":
      !props.underline &&
      props.tooltip?.length === 0 &&
      props.glossary?.length === 0,
  },

  // 禁用状态
  {
    "opacity-50 cursor-not-allowed pointer-events-none":
      props.disabled,
  },

  // 焦点样式
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded-sm",

  // 外部链接稍微加粗
  {
    "font-medium": linkType.value === "external",
  },

  // 有解释说明时额外视觉提示（虚线下划线 + 轻微颜色 + background 效果）
  {
    "px-1 underline decoration-1 decoration-dotted underline-offset-4 decoration-neutral-500/40 hover:decoration-neutral-500/100 dark:decoration-neutral-300/40 hover:dark:decoration-neutral-300/100":
      !props.underline &&
      (!!props.tooltip || !!props.glossary),
    "hover:bg-primary/20 hover:dark:bg-default/40 hover:rounded":
      !props.underline &&
      (!!props.tooltip || !!props.glossary),
  },
]);

/**
 * 获取链接图标
 */
const linkIcon = computed(() => {
  if (!props.showExternalIcon) return null;

  switch (linkType.value) {
    case "mailto":
      return "i-heroicons-envelope";
    case "tel":
      return "i-heroicons-phone";
    case "external":
      return "i-heroicons-arrow-top-right-on-square";
    default:
      return null;
  }
});

/**
 * NuxtLink 属性计算
 */
const nuxtLinkProps = computed(() => {
  const baseProps: Record<
    string,
    string | number | boolean
  > = {
    to: linkUrl.value,
  };

  // 传递原生 NuxtLink 属性
  if (props.external !== undefined)
    baseProps.external = props.external;
  if (props.prefetch !== undefined)
    baseProps.prefetch = props.prefetch;
  if (props.noPrefetch)
    baseProps.noPrefetch = props.noPrefetch;

  // 禁用状态
  if (props.disabled) {
    baseProps["aria-disabled"] = "true";
    baseProps.tabindex = -1;
  }

  return baseProps;
});

/**
 * 计算最终显示的提示文本
 * 优先级：glossary > tooltip > empty
 */
const tooltipText = computed(() => {
  // 如果有 glossary key，尝试从术语表获取定义
  if (props.glossary) {
    const glossaryTerm = getTerm(props.glossary);
    if (glossaryTerm) {
      return glossaryTerm.definition;
    }
  }

  // 降级到手动提供的 tooltip
  return props.tooltip || "";
});

const hasTooltip = computed(() => !!tooltipText.value);

/**
 * 根据内容来源显示不同的提示图标
 */
const tooltipIcon = computed(() => {
  if (!hasTooltip.value) return null;

  // 如果是从 glossary 获取的定义，使用术语解释图标
  if (props.glossary && getTerm(props.glossary)) {
    return "i-heroicons-question-mark-circle";
  }

  // 默认解释图标
  return "i-heroicons-question-mark-circle";
});

const handleUpdateOpen = (open: boolean) => {
  logger.info("tooltip state changed", open);
};
</script>

<template>
  <!-- 使用 NuxtLink 的智能链接检测 -->
  <NuxtLink
    v-if="linkUrl"
    v-bind="nuxtLinkProps"
    :target="linkType === 'external' ? '_blank' : '_self'"
    :class="linkClasses">
    <!-- 链接内容 -->
    <!-- 带解释说明：使用 Nuxt UI 的 Tooltip 在 hover 时展示 -->
    <UTooltip
      v-if="hasTooltip"
      :text="tooltipText"
      :data-text="tooltipText"
      :content="{ side: props.side }"
      :delay-duration="200"
      @update:open="handleUpdateOpen">
      <span class="inline-flex items-center group">
        <slot />

        <!-- 解释说明提示图标 -->
        <UIcon
          v-if="tooltipIcon"
          :name="tooltipIcon"
          class="ml-1 size-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
          :aria-hidden="true" />

        <!-- 链接类型图标 -->
        <UIcon
          v-if="linkIcon"
          :name="linkIcon"
          class="ml-1 size-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
          :aria-hidden="true" />
      </span>
    </UTooltip>

    <!-- 无解释说明：保持原样 -->
    <span
      v-else
      class="inline-flex items-center group">
      <slot />

      <!-- 链接类型图标 -->
      <UIcon
        v-if="linkIcon"
        :name="linkIcon"
        class="ml-1 size-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
        :aria-hidden="true" />
    </span>
  </NuxtLink>

  <!-- 无链接时作为普通 span -->
  <span
    v-else
    :class="linkClasses"
    :aria-disabled="props.disabled ? 'true' : undefined">
    <UTooltip
      v-if="hasTooltip"
      :text="tooltipText"
      :data-text="tooltipText"
      :delay-duration="200"
      :content="{ side: props.side }"
      @update:open="handleUpdateOpen">
      <span class="inline-flex items-center group">
        <slot />

        <UIcon
          v-if="tooltipIcon"
          :name="tooltipIcon"
          class="ml-1 size-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
          :aria-hidden="true" />
      </span>
    </UTooltip>
    <span
      v-else
      class="inline-flex items-center">
      <slot />
    </span>
  </span>
</template>
