<script setup lang="ts">
import type { PageCollections } from "@nuxt/content";

// 从 app.config.ts 读取站点配置
const { seo } = useAppConfig();
const { locale } = useI18n();

// 获取当前语言环境的导航树。我们将动态集合名称转换为 `keyof PageCollections`，
// 因为 `queryCollectionNavigation` 需要已知集合名称的联合类型。如果不进行此转换，
// TypeScript 会推断出一个通用的 `string` 类型，该类型无法分配给所需的联合类型，
// 并导致错误 "Argument of type 'string' is not assignable to parameter of type '"content"'"。
const { data: navigation } = await useAsyncData(
  () => `navigation-${locale.value}`,
  () => {
    const collection =
      `docs_${locale.value}` as keyof PageCollections;
    return queryCollectionNavigation(collection);
  },
  { watch: [locale] }
);

// 在客户端延迟获取当前语言环境的搜索部分。我们使用与上面相同的类型转换来满足
// TypeScript 对集合名称的约束。动态键确保来自不同语言环境的数据不会在 Nuxt 的
// 数据缓存中发生冲突。
const { data: files } = useLazyAsyncData(
  () => `search-${locale.value}`,
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

// 通过 Vue 的 provide/inject 机制向后代组件提供导航树。
provide("navigation", navigation);
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <!-- <AppHeader /> -->

    <UMain>
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
