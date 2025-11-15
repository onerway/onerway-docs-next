<script setup lang="ts">
import type {
  ContentNavigationItem,
  PageCollections,
} from "@nuxt/content";
import { findPageHeadline } from "@nuxt/content/utils";

definePageMeta({
  layout: "docs",
});

const route = useRoute();
const { locale } = useI18n();
const navigation =
  inject<Ref<ContentNavigationItem[]>>("navigation");

const { data: page } = await useAsyncData(
  route.path,
  () => {
    const collection =
      `docs_${locale.value}` as keyof PageCollections;
    return queryCollection(collection)
      .path(route.path)
      .first();
  }
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
  }
);

const title = page.value.seo?.title || page.value.title;
const description =
  page.value.seo?.description || page.value.description;

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
});

const headline = computed(() =>
  findPageHeadline(navigation?.value, page.value?.path)
);

// 将获取到的 page 对象提供给子组件/布局
provide("currentPage", page);

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
    <UPageHeader
      :title="page?.title ?? ''"
      :description="page?.description ?? ''"
      :headline="headline" />

    <ContentRenderer
      v-if="page"
      :value="page" />
    <USeparator v-if="surround?.length" />

    <UContentSurround
      v-if="surround?.length"
      :surround="surround" />
  </UContainer>
</template>
