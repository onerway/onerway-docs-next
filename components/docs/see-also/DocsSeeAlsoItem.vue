<script setup lang="ts">
import { createLogger } from "~/composables/shared/logger";
import { usePageData } from "~/composables/usePageData";

interface SeeAlsoItemProps {
  /** Link destination URL or route path */
  to: string;
  /** Link title text */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Force external link behavior */
  external?: boolean;
  /** Custom icon name (overrides default icon selection) */
  icon?: string;
  /** Additional CSS classes */
  class?: string;
  /** Disable the link */
  disabled?: boolean;
}

interface SeeAlsoItemSlots {
  /** Custom content to replace description */
  default?: () => unknown;
  /** Custom icon slot */
  icon?: () => unknown;
}

const props = withDefaults(
  defineProps<SeeAlsoItemProps>(),
  {
    external: false,
    disabled: false,
  }
);

defineSlots<SeeAlsoItemSlots>();

const logger = createLogger("DocsSeeAlsoItem");

// ==================== 页面数据获取 ====================

// 获取当前页面数据（可选功能，供父组件或内部逻辑使用）
const {
  page: currentPage,
  isLoading: isCurrentPageLoading,
} = usePageData({
  watchRoute: true,
  enableFallback: true,
  includeSurround: false,
});

// 响应式的目标页面信息（当 to 是内部路径时）
const targetPageInfo = ref<{
  title?: string;
  description?: string;
} | null>(null);
const isTargetPageLoading = ref(false);

// 监听 to 属性变化，获取目标页面信息（仅对内部链接有效）
watch(
  () => props.to,
  async (newTo) => {
    if (
      !newTo ||
      props.external ||
      newTo.startsWith("http")
    ) {
      targetPageInfo.value = null;
      return;
    }

    try {
      isTargetPageLoading.value = true;
      const pageInfo = await getPageInfo(newTo);
      targetPageInfo.value = pageInfo;

      if (import.meta.dev) {
        logger.info("Target page info fetched", {
          to: newTo,
          pageInfo,
        });
      }
    } catch (error) {
      logger.warn("Failed to fetch target page info", {
        to: newTo,
        error,
      });
      targetPageInfo.value = null;
    } finally {
      isTargetPageLoading.value = false;
    }
  },
  { immediate: true }
);

// 暴露当前页面数据给父组件使用
defineExpose({
  /** 当前页面数据 */
  currentPage: readonly(currentPage),
  /** 当前页面加载状态 */
  isCurrentPageLoading: readonly(isCurrentPageLoading),
  /** 目标页面信息 */
  targetPageInfo: readonly(targetPageInfo),
  /** 目标页面加载状态 */
  isTargetPageLoading: readonly(isTargetPageLoading),
});

// Link target and security attributes
const linkAttrs = computed(() => {
  const isExternalLink =
    props.external || props.to?.startsWith("http");

  if (isExternalLink) {
    return {
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }

  return {
    target: undefined,
    rel: undefined,
  };
});

// External link detection
const isExternal = computed(() => {
  return (
    props.external ||
    props.to?.startsWith("http") ||
    props.to?.startsWith("https")
  );
});

// Icon selection logic
const iconName = computed(() => {
  if (props.icon) return props.icon;
  return "heroicons:document-text";
});

// Accessibility attributes
const ariaAttrs = computed(() => {
  const attrs: Record<string, string | undefined> = {
    "aria-disabled": props.disabled ? "true" : undefined,
  };

  if (isExternal.value) {
    attrs["aria-label"] =
      `${props.title} (opens in new tab)`;
  }

  return attrs;
});

// Link classes with disabled state
const linkClasses = computed(() => {
  const baseClasses =
    "group flex items-start gap-3 py-3 rounded-lg border-none transition-colors duration-200 no-underline";
  const interactiveClasses =
    "focus:ring-2 focus:ring-default focus:ring-offset-2";
  const disabledClasses =
    "opacity-50 cursor-not-allowed pointer-events-none";

  return [
    baseClasses,
    props.disabled ? disabledClasses : interactiveClasses,
    props.class,
  ];
});

if (import.meta.dev) {
  logger.info("DocsSeeAlsoItem debug info:", {
    currentPage: currentPage.value,
    targetPageInfo: targetPageInfo.value,
    isCurrentPageLoading: isCurrentPageLoading.value,
    isTargetPageLoading: isTargetPageLoading.value,
  });
}
</script>

<template>
  <ClientOnly>
    <ULink
      :to="props.disabled ? undefined : props.to"
      v-bind="{ ...linkAttrs, ...ariaAttrs }"
      :class="linkClasses"
      :tabindex="props.disabled ? -1 : undefined"
      raw>
      <!-- Icon slot or default icon -->
      <div class="flex-shrink-0 mt-0.5">
        <slot name="icon">
          <UIcon
            :name="iconName"
            class="size-6 text-primary shrink-0 group-hover:text-default transition-colors duration-200"
            aria-hidden="true" />
        </slot>
      </div>

      <!-- Content area -->
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <div
          class="text-sm font-medium text-primary group-hover:text-default transition-colors duration-200 flex items-center">
          {{ props.title || targetPageInfo?.title }}
          <UIcon
            v-if="isExternal"
            name="i-lucide-external-link"
            class="size-3 text-primary shrink-0 group-hover:text-default transition-colors duration-200 ml-2 opacity-0 group-hover:opacity-100"
            aria-hidden="true" />
        </div>

        <!-- Description -->
        <div
          v-if="
            props.description ||
            $slots.default ||
            targetPageInfo?.description
          "
          class="mt-1 text-sm text-muted group-hover:text-default transition-colors duration-200">
          <slot>
            {{
              props.description ||
              targetPageInfo?.description
            }}
          </slot>
        </div>
      </div>

      <!-- External link indicator (for screen readers) -->
      <span
        v-if="isExternal"
        class="sr-only">
        (opens in new tab)
      </span>
    </ULink>
  </ClientOnly>
</template>
