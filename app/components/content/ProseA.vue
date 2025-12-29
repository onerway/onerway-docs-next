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
 * - 特殊协议链接（mailto/tel/sms）：不显示导航图标
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
 *
 * # 特殊协议链接
 * [发送邮件](mailto:support@onerway.com)
 * [拨打电话](tel:+1234567890)
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/**
 * 链接类型枚举
 */
enum LinkType {
  /** 特殊协议链接（mailto、tel、sms 等） */
  SPECIAL = "special",
  /** 外部链接（http、https、// 开头） */
  EXTERNAL = "external",
  /** 页面内锚点链接 */
  HASH = "hash",
  /** 内部路由链接 */
  INTERNAL = "internal",
}

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
// Constants
// ============================================================================

/** 外部链接的 rel 安全属性 */
const EXTERNAL_LINK_REL = "noopener noreferrer" as const;

/** 特殊协议链接的正则表达式（mailto、tel、sms、javascript） */
const SPECIAL_PROTOCOLS = /^(mailto|tel|sms|javascript):/i;

/** 图标名称常量 */
const ICON_EXTERNAL = "i-lucide-external-link" as const;
const ICON_INTERNAL = "i-lucide-arrow-right" as const;

// ============================================================================
// Composables
// ============================================================================

const route = useRoute();
const { navigateToHash } = useDocsScroll();

// ============================================================================
// Helpers
// ============================================================================

/**
 * 规范化路径：移除尾部斜杠和查询参数
 */
const normalizePath = (path: string): string => {
  // 移除查询参数
  const pathWithoutQuery = path.split("?")[0] ?? path;
  // 移除尾部斜杠（保留根路径 "/"）
  return pathWithoutQuery.replace(/\/$/, "") || "/";
};

/**
 * 判断 href 是否为当前页面的锚点链接
 * @param href - 链接地址
 * @param currentPath - 当前路由路径
 */
const isCurrentPageHash = (
  href: string,
  currentPath: string
): boolean => {
  if (!href.includes("#")) return false;
  // 纯 hash 链接：#section-id
  if (href.startsWith("#")) return true;

  // 同页面 hash 链接：/current-path#section-id
  const [path = ""] = href.split("#");
  const hrefPath = normalizePath(path);
  const normalizedCurrent = normalizePath(currentPath);

  // 空路径或与当前路径相同
  return (
    !hrefPath ||
    hrefPath === "/" ||
    hrefPath === normalizedCurrent
  );
};

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * 解析 href，提取路径和 hash
 * 缓存 split 结果，避免重复计算
 */
const parsedHref = computed(() => {
  if (!props.href) return { path: "", hash: "" };
  const [path = "", hash = ""] = props.href.split("#");
  return { path, hash };
});

/**
 * 统一的链接类型判断
 * 所有链接类型逻辑集中在此处，便于维护和扩展
 */
const linkType = computed<LinkType>(() => {
  if (!props.href) return LinkType.INTERNAL;

  // 特殊协议链接（mailto、tel、sms、javascript）
  if (SPECIAL_PROTOCOLS.test(props.href)) {
    return LinkType.SPECIAL;
  }

  // 外部链接（http、https、协议相对 URL、或显式 target="_blank"）
  if (
    props.href.startsWith("http://") ||
    props.href.startsWith("https://") ||
    props.href.startsWith("//") ||
    props.target === "_blank"
  ) {
    return LinkType.EXTERNAL;
  }

  // 页面内锚点链接
  if (isCurrentPageHash(props.href, route.path)) {
    return LinkType.HASH;
  }

  // 默认：内部路由链接
  return LinkType.INTERNAL;
});

/**
 * 从 href 中提取 hash 值（不含 # 前缀）
 */
const hashId = computed(() => parsedHref.value.hash);

/**
 * 外部链接的 rel 属性
 * 添加 noopener noreferrer 以防止安全漏洞
 */
const relAttr = computed(() => {
  return linkType.value === LinkType.EXTERNAL
    ? EXTERNAL_LINK_REL
    : undefined;
});

/**
 * 外部链接的 target 属性
 * 外部链接默认在新标签页打开
 */
const targetAttr = computed(() => {
  if (props.target) return props.target;
  return linkType.value === LinkType.EXTERNAL
    ? "_blank"
    : undefined;
});

/**
 * 是否应该显示导航图标
 * Hash 链接和特殊协议链接不显示图标
 */
const shouldShowIcon = computed(() => {
  return (
    linkType.value !== LinkType.HASH &&
    linkType.value !== LinkType.SPECIAL
  );
});

/**
 * 图标名称
 * 外部链接显示外链图标，内部链接显示箭头图标
 */
const iconName = computed(() => {
  return linkType.value === LinkType.EXTERNAL
    ? ICON_EXTERNAL
    : ICON_INTERNAL;
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
  if (linkType.value !== LinkType.HASH || !hashId.value)
    return;

  event.preventDefault();
  navigateToHash(hashId.value);
};

// ============================================================================
// Styles
// ============================================================================

/**
 * 链接基础样式
 * 使用 computed 便于未来根据 props 动态调整
 */
const linkClass = computed(() => [
  "inline-flex items-center gap-1.5",
  "text-primary font-medium",
  "hover:text-default",
  "transition duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:rounded-sm",
]);

/**
 * Badge 样式
 * 使用 computed 保持与其他样式定义一致
 */
const badgeClass = computed(() => [
  "shrink-0",
  "transition-opacity duration-200",
  "group-hover/link:opacity-80",
]);

/**
 * 图标样式
 * 根据链接类型动态计算，外部链接增加向上移动效果
 */
const iconClass = computed(() => {
  const base = [
    "size-3.5",
    "transition-transform duration-200",
    "group-hover/link:translate-x-0.5",
  ];

  // 外部链接增加向上移动效果
  if (linkType.value === LinkType.EXTERNAL) {
    base.push("group-hover/link:-translate-y-0.5");
  }

  return base;
});
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
    <!-- 导航图标（外部链接和内部链接） -->
    <UIcon
      v-if="shouldShowIcon"
      :name="iconName"
      :class="iconClass" />
  </NuxtLink>
</template>
