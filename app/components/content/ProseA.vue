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
 * - 页面内锚点链接：自动处理自定义滚动容器中的滚动
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
 *
 * # 页面内锚点链接
 * [跳转到配置](#configure-base-settings)
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
// Composables
// ============================================================================

const router = useRouter();
const route = useRoute();
const { scrollToElement } = useDocsScroll();

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
 * 判断是否为页面内锚点链接
 * - 纯 hash 链接：#section-id
 * - 同页面 hash 链接：/current-path#section-id
 */
const isHashLink = computed(() => {
  if (!props.href) return false;
  // 纯 hash 链接
  if (props.href.startsWith("#")) return true;
  // 同页面 hash 链接（包含 # 且路径与当前页面相同）
  if (props.href.includes("#")) {
    const [path] = props.href.split("#");
    // 空路径或与当前路径相同
    return !path || path === route.path;
  }
  return false;
});

/**
 * 从 href 中提取 hash 值（不含 # 前缀）
 */
const hashId = computed(() => {
  if (!props.href?.includes("#")) return "";
  return props.href.split("#")[1] || "";
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
// Methods
// ============================================================================

/**
 * 处理链接点击
 * 对于锚点链接，手动滚动到目标元素（解决自定义滚动容器中 hash 链接不生效的问题）
 */
const handleClick = (event: MouseEvent) => {
  // 非锚点链接，使用默认行为
  if (!isHashLink.value || !hashId.value) return;

  event.preventDefault();
  scrollToElement(hashId.value);
  router.replace({
    hash: `#${encodeURIComponent(hashId.value)}`,
  });
};

// ============================================================================
// Styles
// ============================================================================

/** 链接基础样式 */
const linkClass = [
  "inline-flex items-center gap-1.5",
  "text-primary font-medium",
  "hover:text-default",
  "transition duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:rounded-sm",
];

/** Badge 样式 */
const badgeClass = [
  "shrink-0",
  "transition-opacity duration-200",
  "group-hover/link:opacity-80",
];

/** 图标样式（响应式，根据链接类型动态计算） */
const iconClass = computed(() => [
  "size-3.5",
  "transition-transform duration-200",
  "group-hover/link:translate-x-0.5",
  isExternal.value && "group-hover/link:-translate-y-0.5",
]);
</script>

<template>
  <NuxtLink
    :href="href"
    :target="targetAttr"
    :rel="relAttr"
    :class="['group/link', linkClass]"
    @click="handleClick">
    <slot />
    <!-- Badge -->
    <UBadge
      v-if="badge"
      :label="badge"
      color="primary"
      variant="solid"
      size="sm"
      :class="badgeClass" />
    <!-- 外部链接图标 -->
    <UIcon
      v-if="isExternal"
      name="i-lucide-external-link"
      :class="iconClass" />
    <!-- 内部链接图标（锚点链接不显示） -->
    <UIcon
      v-else-if="!isHashLink"
      name="i-lucide-arrow-right"
      :class="iconClass" />
  </NuxtLink>
</template>
