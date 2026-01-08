<script setup lang="ts">
/**
 * 文档页面（动态路由）
 *
 * 这是文档站点的核心页面组件，处理所有文档内容的渲染和交互。
 *
 * 主要功能：
 * 1. 动态加载 Markdown 文档内容
 * 2. 生成面包屑导航
 * 3. 处理页面内 hash 导航（支持浏览器前进/后退）
 * 4. SEO 优化（标题、描述）
 * 5. 上下页导航（Surround）
 * 6. 访问历史记录
 *
 * 路由示例：
 * - /get-started/installation → 渲染对应的 Markdown 文件
 * - /api/checkout#create-session → 渲染并滚动到指定锚点
 */

// ============================================================================
// 类型导入
// ============================================================================

import type { PageCollections } from "@nuxt/content";
import { findPageBreadcrumb } from "~/composables/useDocsNav";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";
import { mapContentNavigation } from "@nuxt/ui/utils/content";

// ============================================================================
// 常量
// ============================================================================

/** Nuxt 内部路径前缀（不应该被文档 catch-all 路由处理） */
const NUXT_INTERNAL_PATHS = ["/_nuxt", "/__nuxt"] as const;

/** 默认文档图标 */
const DEFAULT_DOC_ICON = "i-lucide-file" as const;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取内容集合名称
 * @param locale - 当前语言
 */
const getCollectionName = (
  locale: string
): keyof PageCollections => {
  return `docs_${locale}` as keyof PageCollections;
};

/**
 * 从页面导航配置中提取图标
 * @param navigation - 页面的 navigation 配置
 */
const getPageIcon = (
  navigation: DocPage["navigation"]
): string => {
  if (navigation === true) {
    return DEFAULT_DOC_ICON;
  }
  return (navigation as { icon?: string })?.icon || "";
};

// ============================================================================
// Page Meta 配置
// ============================================================================

definePageMeta({
  layout: "docs",
  validate: (route) => {
    // 不要用文档 catch-all 来处理 Nuxt 内部前缀
    return !NUXT_INTERNAL_PATHS.some((prefix) =>
      route.path.startsWith(prefix)
    );
  },
});

// ============================================================================
// 全局状态和 Composables
// ============================================================================

const route = useRoute();
const { locale, t } = useI18n();
const nuxtApp = useNuxtApp();

// 使用类型安全的 injection key 获取导航树
const navigation = inject(NAVIGATION_KEY);

// 访问历史记录
const { addPage } = useRecentPages();

// ============================================================================
// TOC 显示逻辑
// ============================================================================

/**
 * 是否显示 TOC 组件
 * - 需要 frontmatter 中 toc 为 true（默认值）
 * - 且页面存在 TOC 链接
 */
const showToc = computed(() => {
  return Boolean(
    page.value?.toc && page.value?.body?.toc?.links?.length
  );
});

/**
 * 布局容器类名
 * - 有 TOC 时：两栏布局（主内容 + TOC）
 * - 无 TOC 时：单列布局，主内容占满宽度
 */
const layoutClass = computed(() => {
  if (showToc.value) {
    return "lg:grid lg:grid-cols-[1fr_250px] lg:gap-16";
  }
  return "";
});

// ============================================================================
// 数据获取：页面内容
// ============================================================================

const { data: page, status: pageStatus } =
  await useAsyncData(
    `${route.path}-${locale.value}`,
    () => {
      return queryCollection(
        getCollectionName(locale.value)
      )
        .path(route.path)
        .first();
    },
    { watch: [() => locale.value] }
  );

// 开发模式日志
if (import.meta.client && import.meta.dev) {
  console.log("[slug] page", page.value);
}

// 404 处理
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: false,
  });
}

// 同步页面数据到共享状态，让 layout 可以访问（如控制导航可见性）
const sharedPageState = useState<DocPage | null>(
  CURRENT_PAGE_STATE_KEY
);
watchEffect(() => {
  sharedPageState.value = page.value as DocPage | null;
});

// ============================================================================
// 数据获取：上下页导航
// ============================================================================

const { data: surround } = await useAsyncData(
  `${route.path}-${locale.value}-surround`,
  () => {
    return queryCollectionItemSurroundings(
      getCollectionName(locale.value),
      route.path,
      {
        fields: ["description"],
      }
    );
  },
  { watch: [() => locale.value] }
);

// ============================================================================
// SEO 配置
// ============================================================================

const seoTitle = page.value.seo?.title || page.value.title;
const seoDescription =
  page.value.seo?.description || page.value.description;

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
});

// ============================================================================
// 骨架屏显示逻辑
// ============================================================================
//
// 策略说明：
// - SSR 首屏：数据在服务端已获取，status 为 success，骨架屏不显示
// - 客户端路由切换：如果加载超过 200ms 才显示骨架屏（避免快速加载时闪烁）
//
// 注意：由于 Nuxt Content 的客户端缓存机制，大部分情况下 pending 状态极短暂，
// 骨架屏作为"保险"机制在极端慢网络或缓存未命中时生效。
//

/**
 * 延迟显示骨架屏
 * 加载超过 200ms 才显示，避免快速加载时骨架屏闪烁
 */
const { showSkeleton: shouldShowSkeleton } =
  useDelayedLoading(pageStatus, 200);

// ============================================================================
// Breadcrumb 生成
// ============================================================================

const breadcrumb = computed(() =>
  mapContentNavigation(
    findPageBreadcrumb(
      navigation?.value,
      page.value?.path,
      {
        current: true,
        indexAsChild: true,
      }
    )
  )
);

// ============================================================================
// Hash 导航处理逻辑
// ============================================================================
//
// 本页面负责监听路由变化并响应 hash 导航，与 useDocsScroll 配合工作：
//
// 职责划分：
// - useDocsScroll: 提供滚动能力（scrollToHash、checkProgrammaticScroll）
// - 本页面: 监听路由变化，决定何时滚动
//
// 为什么使用 scrollToHash 而非 navigateToHash？
// - 路由变化时，URL 已经由路由器/浏览器更新完成
// - 我们只需执行滚动操作，无需再次调用 router.replace()
// - 使用 navigateToHash() 会导致重复的 URL 更新
//
// 场景覆盖：
// 1. 浏览器前进/后退 → checkProgrammaticScroll() = false → 执行滚动
// 2. TOC 点击 → checkProgrammaticScroll() = true → 跳过（避免重复）
// 3. 页面首次加载 → page:finish hook → 执行滚动
//
const { scrollToHash, checkProgrammaticScroll } =
  useDocsScroll();

/**
 * 处理路由 hash 变化时的滚动行为
 */
const handleRouteHashChange = () => {
  // 如果是程序触发的滚动（TOC 点击、链接点击），跳过
  if (checkProgrammaticScroll()) {
    if (import.meta.dev) {
      console.log("[slug] 跳过程序触发的 hash 变化");
    }
    return;
  }

  // 使用底层 scrollToHash（不更新 URL）
  scrollToHash(route.hash);
};

// 监听路由变化，处理页面切换和 hash 导航
watch(
  () => [route.path, route.hash] as const,
  ([newPath, newHash], [oldPath, oldHash]) => {
    // 场景 1: 页面切换（如 /docs/a → /docs/b）
    // 需要等待 DOM 渲染后再处理 hash
    if (newPath !== oldPath) {
      nextTick(handleRouteHashChange);
      return;
    }

    // 场景 2: 仅 hash 变化（浏览器前进/后退或 TOC 点击）
    // TOC 点击会被 checkProgrammaticScroll() 拦截
    if (newHash !== oldHash) {
      handleRouteHashChange();
    }
  }
);

// 页面首次加载时，等待 Nuxt 页面完全渲染后再处理初始 hash
// 例如：用户直接访问 /docs/page#section-1
nuxtApp.hooks.hookOnce(
  "page:finish",
  handleRouteHashChange
);

// ============================================================================
// 访问历史记录
// ============================================================================

// 记录页面访问历史（仅客户端），用于"最近访问"功能
watch(
  () => page.value,
  (newPage) => {
    if (import.meta.client && newPage) {
      addPage({
        path: newPage.path || route.path,
        title: newPage.title || "",
        description: newPage.description,
        icon: getPageIcon(newPage.navigation!),
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- 两栏布局：主内容 + TOC（移除 UContainer，避免与 layout 双重嵌套） -->
  <div :class="['w-full max-w-7xl mx-auto', layoutClass]">
    <!-- 左侧：主内容区 -->
    <div class="min-w-0">
      <!-- 骨架屏：首屏加载或延迟超时后显示 -->
      <DocsPageSkeleton v-if="shouldShowSkeleton" />

      <!-- 实际内容：加载完成后显示 -->
      <template v-else>
        <UBreadcrumb
          v-if="breadcrumb.length"
          :ui="{
            list: 'flex-wrap',
          }"
          :items="breadcrumb" />
        <UPageHeader
          :title="page?.title ?? ''"
          :description="page?.description ?? ''"
          :ui="{
            root: 'border-none py-2 sm:py-4',
          }" />
        <USeparator
          v-if="surround?.length"
          icon="i-custom-onerway" />

        <ContentRenderer
          v-if="page"
          :value="page" />

        <USeparator
          v-if="surround?.length"
          class="my-4"
          icon="i-custom-onerway" />

        <UContentSurround
          v-if="surround?.length"
          :surround="surround" />
      </template>
    </div>

    <!-- TOC：移动端浮动按钮，桌面端右侧显示 -->
    <ClientOnly>
      <!-- TOC 骨架屏：客户端加载中显示 -->
      <DocsTocSkeleton v-if="shouldShowSkeleton" />
      <!-- 实际 TOC -->
      <DocsToc
        v-else-if="showToc"
        :links="page?.body?.toc?.links ?? []"
        :title="t('toc.title')"
        heading-selector="h2, h3, h4, h5"
        highlight />

      <!-- SSR fallback：服务端渲染时显示骨架屏占位，避免空白 -->
      <template #fallback>
        <DocsTocSkeleton v-if="showToc" />
      </template>
    </ClientOnly>
  </div>
</template>
