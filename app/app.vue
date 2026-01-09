<script setup lang="ts">
import type { PageCollections } from "@nuxt/content";
import * as locales from "@nuxt/ui/locale";
import { NAVIGATION_KEY } from "~/types/injection-keys";

// 从 app.config.ts 读取站点配置
const { seo } = useAppConfig();
const { locale } = useI18n();

/**
 * Nuxt UI i18n 集成（官方推荐方式）
 * locale code 与 Nuxt UI 导出名一致，可直接索引访问
 */
const uiLocale = computed(
  () =>
    locales[locale.value as keyof typeof locales] ??
    locales.en
);

/**
 * 获取当前语言环境的导航树
 * 动态集合名称需要类型转换，因为 queryCollectionNavigation 需要已知集合名称的联合类型
 */
const { data: navigation } = await useAsyncData(
  () => `navigation-${locale.value}`,
  () => {
    const collection =
      `docs_${locale.value}` as keyof PageCollections;
    return queryCollectionNavigation(collection, [
      "to",
      "hidden",
      "toc",
      "footer",
      "navigation"
    ]);
  },
  { watch: [locale] }
);

if (import.meta.client && import.meta.dev) {
  console.log("navigation", navigation.value);
}

/**
 * 延迟获取搜索索引（仅客户端）
 * 动态 key 确保不同语言环境的数据不会在缓存中冲突
 */
const { data: files } = useLazyAsyncData(
  `search-${locale.value}`,
  () => {
    const collection =
      `docs_${locale.value}` as keyof PageCollections;
    return queryCollectionSearchSections(collection);
  },
  { server: false, watch: [locale] }
);

// 设置 head 标签和属性。`useHead` 组合式函数接受一个对象或返回对象的函数。
// 这里我们返回一个函数，以便在 `locale.value` 更改时更新 `lang` 属性。
useHead(() => ({
  meta: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: locale.value,
  },
}));

// 定义 SEO 元数据。
useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  twitterCard: "summary_large_image",
});

// 通过 Vue 的 provide/inject 机制向后代组件提供导航树
// 使用类型安全的 injection key 避免命名冲突
provide(NAVIGATION_KEY, navigation);
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLoadingIndicator />

    <AppHeader />

    <UMain class="pt-layout">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <!-- <AppFooter /> -->

    <ClientOnly>
      <LazyUContentSearch
        v-if="files"
        :files="files"
        :navigation="navigation" />
    </ClientOnly>
  </UApp>
</template>
