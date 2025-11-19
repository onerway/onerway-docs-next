<script setup lang="ts">
import type { PageCollections } from "@nuxt/content";
import { findPageHeadline } from "@nuxt/content/utils";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";

definePageMeta({
  layout: "docs",
});

const route = useRoute();
const { locale } = useI18n();

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

const headline = computed(() =>
  findPageHeadline(navigation?.value, page.value?.path)
);

// 使用 useState 设置全局状态，让 layout 和其他组件可以访问
// useState 是 Nuxt 提供的 SSR 安全的全局状态管理
const currentPage = useState<DocPage | null>(
  CURRENT_PAGE_STATE_KEY,
  () => null
);
currentPage.value = page.value as unknown as DocPage;

console.log(
  "page route path from [...slug].vue",
  route.path
);
console.log("page", page.value);
console.log(
  "page navigation from [...slug].vue",
  navigation?.value
);
</script>

<template>
  <UContainer>
    <UDashboardSidebarCollapse variant="ghost" />
    <UPageHeader
      :title="page?.title ?? ''"
      :description="page?.description ?? ''"
      :headline="headline" />

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
  </UContainer>
</template>
