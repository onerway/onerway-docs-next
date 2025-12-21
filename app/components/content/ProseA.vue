<script setup lang="ts">
/**
 * ProseA 组件
 * 用于渲染 Markdown 文档中的链接，区分内部/外部链接并显示对应图标
 *
 * 特点：
 * - 无下划线样式
 * - 内部链接：始终显示 → 图标
 * - 外部链接：hover 时显示 ↗ 图标
 * - 外部链接自动添加 rel="noopener noreferrer" 安全属性
 * - 支持 Badge：在链接和图标之间显示徽章标签
 *
 * @example MDC 用法
 * ```markdown
 * # 内部链接
 * [开始使用](/docs/getting-started)
 *
 * # 外部链接
 * [Nuxt 官网](https://nuxt.com)
 *
 * # 外部链接（显式 target）
 * [GitHub](https://github.com){target="_blank"}
 *
 * # 带 Badge 的链接
 * [API Overview](https://docs.onerway.com/apis/en/v0.6/){badge="API"}
 * [Checkout Session](/api/checkout){badge="v0.6"}
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface ProseAProps {
  /** 链接目标 URL */
  href?: string;
  /** 链接打开方式 */
  target?:
    | "_blank"
    | "_parent"
    | "_self"
    | "_top"
    | (string & object)
    | null;
  /** 徽章文本（显示在链接和图标之间） */
  badge?: string;
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(defineProps<ProseAProps>(), {
  href: "",
  target: undefined,
  badge: undefined,
});

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * 判断是否为外部链接
 * - 以 http:// 或 https:// 开头
 * - 以 // 开头（协议相对 URL）
 * - 明确设置 target="_blank"
 */
const isExternal = computed(() => {
  if (!props.href) return false;
  return (
    props.href.startsWith("http://") ||
    props.href.startsWith("https://") ||
    props.href.startsWith("//") ||
    props.target === "_blank"
  );
});

/**
 * 外部链接的 rel 属性
 * 添加 noopener noreferrer 以防止安全漏洞
 */
const relAttr = computed(() => {
  return isExternal.value
    ? "noopener noreferrer"
    : undefined;
});

/**
 * 外部链接的 target 属性
 * 外部链接默认在新标签页打开
 */
const targetAttr = computed(() => {
  if (props.target) return props.target;
  return isExternal.value ? "_blank" : undefined;
});

// ============================================================================
// Styles
// ============================================================================

/**
 * 统一样式配置
 * 使用命名 group（group/link）避免与父容器的 group 冲突
 */
const styles = {
  /** 链接基础样式 */
  link: [
    "inline-flex items-center gap-1.5",
    "text-primary font-medium",
    "hover:text-default",
    "transition duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:rounded-sm",
  ],
  /** Badge 样式 */
  badge: [
    "shrink-0",
    "transition-opacity duration-200",
    "group-hover/link:opacity-90",
  ],
  /** 图标样式（内部/外部链接共用） */
  icon: [
    "size-3.5",
    "transition-transform duration-200",
    "group-hover/link:translate-x-0.5",
    isExternal.value && "group-hover/link:-translate-y-0.5",
  ],
};
</script>

<template>
  <NuxtLink
    :href="href"
    :target="targetAttr"
    :rel="relAttr"
    :class="['group/link', styles.link]">
    <slot />
    <!-- Badge -->
    <UBadge
      v-if="badge"
      :label="badge"
      color="primary"
      variant="solid"
      size="sm"
      :class="styles.badge" />
    <!-- 外部链接图标 -->
    <UIcon
      v-if="isExternal"
      name="i-lucide-external-link"
      :class="styles.icon" />
    <!-- 内部链接图标 -->
    <UIcon
      v-else
      name="i-lucide-arrow-right"
      :class="styles.icon" />
  </NuxtLink>
</template>
