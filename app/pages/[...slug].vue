<script setup lang="ts">
import type { PageCollections } from "@nuxt/content";
import { findPageBreadcrumb } from "~/composables/useDocsNav";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";
import { mapContentNavigation } from "@nuxt/ui/utils/content";

definePageMeta({
  layout: "docs",
  validate: (route) => {
    // 不要用文档 catch-all 来处理 Nuxt 内部前缀
    if (
      route.path.startsWith("/_nuxt") ||
      route.path.startsWith("/__nuxt")
    ) {
      return false;
    }
    return true;
  },
});

const route = useRoute();
const { locale, t } = useI18n();

// 记录最近访问的页面
const { addPage } = useRecentPages();

// 使用类型安全的 injection key 获取导航树
const navigation = inject(NAVIGATION_KEY);

const { data: page } = await useAsyncData(
  route.path,
  () => {
    const collection =
      `docs_${locale.value}` as keyof PageCollections;
    return queryCollection(collection)
      .path(route.path)
      .first();
  },
  { watch: [locale] }
);

if (import.meta.client && import.meta.dev) {
  console.log("[slug] page", page.value);
}

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

const { data: surround } = await useAsyncData(
  `${route.path}-surround`,
  () => {
    const collection =
      `docs_${locale.value}` as keyof PageCollections;
    return queryCollectionItemSurroundings(
      collection,
      route.path,
      {
        fields: ["description"],
      }
    );
  },
  { watch: [locale] }
);

const title = page.value.seo?.title || page.value.title;
const description =
  page.value.seo?.description || page.value.description;

useSeoMeta({
  title,
  ogTitle: title,
  description,
});

// 使用 useState 设置全局状态，让 layout 和其他组件可以访问
// useState 是 Nuxt 提供的 SSR 安全的全局状态管理
const breadcrumb = computed(() =>
  mapContentNavigation(
    findPageBreadcrumb(
      navigation?.value,
      page.value?.path,
      { current: true, indexAsChild: true }
    )
  )
);

// 处理路由切换和初始 hash 的滚动行为
const { scrollToHash } = useDocsScroll();
const handleScroll = () => scrollToHash(route.hash);

// 监听页面路径变化（不监听 hash，避免与 TOC 点击滚动冲突）
watch(
  () => route.path,
  () => nextTick(handleScroll)
);

// 初始加载时，等待页面渲染完成后再处理 hash 滚动
const nuxtApp = useNuxtApp();
nuxtApp.hooks.hookOnce("page:finish", handleScroll);

// 记录页面访问历史（仅客户端）
watch(
  () => page.value,
  (newPage) => {
    if (import.meta.client && newPage) {
      addPage({
        path: newPage.path || route.path,
        title: newPage.title || "",
        description: newPage.description,
        icon:
          newPage.navigation === true
            ? "i-lucide-file"
            : (newPage.navigation as { icon?: string })
                ?.icon,
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- 两栏布局：主内容 + TOC（移除 UContainer，避免与 layout 双重嵌套） -->
  <div
    class="w-full max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
    <!-- 左侧：主内容区 -->
    <div class="min-w-0">
      <UBreadcrumb
        v-if="breadcrumb.length"
        :ui="{
          list: 'flex-wrap',
        }"
        :items="breadcrumb" />
      <UPageHeader
        :title="page?.title ?? ''"
        :description="page?.description ?? ''"
        class="py-2" />
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
    </div>

    <!-- TOC：移动端浮动按钮，桌面端右侧显示 -->
    <ClientOnly>
      <DocsToc
        v-if="
          page?.showToc && page?.body?.toc?.links?.length
        "
        :links="page.body.toc.links"
        :title="t('toc.title')"
        heading-selector="h2, h3, h4, h5"
        highlight />
    </ClientOnly>
  </div>
</template>
