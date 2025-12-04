<script setup lang="ts">
import type { PageCollections } from "@nuxt/content";
import { findPageBreadcrumb } from "@nuxt/content/utils";
import { NAVIGATION_KEY } from "~/types/injection-keys";
import { mapContentNavigation } from "@nuxt/ui/utils/content";

definePageMeta({
  layout: "docs",
});

const route = useRoute();
const { locale, t } = useI18n();

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

console.log("[slug] page", page.value);

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

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
      { indexAsChild: true }
    )
  ).map(({ icon, ...link }) => link)
);
</script>

<template>
  <UContainer>
    <UBreadcrumb
      v-if="breadcrumb.length"
      :items="breadcrumb" />

    <!-- 两栏布局：主内容 + TOC -->
    <div class="lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
      <!-- 左侧：主内容区 -->
      <div class="min-w-0">
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
        <ContentToc
          v-if="page?.body?.toc?.links?.length"
          :links="page.body.toc.links"
          :title="t('toc.title')"
          heading-selector="h2, h3, h4, h5"
          highlight />
      </ClientOnly>
    </div>
  </UContainer>
</template>
