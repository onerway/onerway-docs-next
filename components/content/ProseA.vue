<script setup lang="ts">
/**
 * Enhanced ProseA Component - Optimized with NuxtLink
 *
 * Leverages NuxtLink's native intelligent link detection:
 * - Automatically handles internal vs external links
 * - Native security attributes (rel="noopener noreferrer")
 * - Built-in prefetching for internal links
 * - SSR safe with no hydration mismatch
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
});

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
    "no-underline": !props.underline,
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
</script>

<template>
  <!-- 使用 NuxtLink 的智能链接检测 -->
  <NuxtLink
    v-if="linkUrl"
    v-bind="nuxtLinkProps"
    :target="linkType === 'external' ? '_blank' : '_self'"
    :class="linkClasses">
    <!-- 链接内容 -->
    <ClientOnly>
      <span class="inline-flex items-center group">
        <slot />

        <!-- 链接类型图标 -->
        <UIcon
          v-if="linkIcon"
          :name="linkIcon"
          class="ml-1 size-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200"
          :aria-hidden="true" />
      </span>
    </ClientOnly>
  </NuxtLink>

  <!-- 无链接时作为普通 span -->
  <span
    v-else
    :class="linkClasses"
    :aria-disabled="props.disabled ? 'true' : undefined">
    <span class="inline-flex items-center">
      <slot />
    </span>
  </span>
</template>
