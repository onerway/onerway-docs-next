<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { findPageBreadcrumb } from "@nuxt/content/utils";
import { mapContentNavigation } from "@nuxt/ui-pro/utils/content";
import { useDebounceFn, whenever } from "@vueuse/core";
import { kebabCase } from "scule";
import {
  buildCollectionName,
  createLogger,
  useSharedPathInfo,
} from "~/composables/shared/utils";

// ==================== 路由和基础信息 ====================

const route = useRoute();
const { locale } = useI18n();
const logger = createLogger("slug");

definePageMeta({
  layout: "docs",
});

// 使用共享的路径解析工具
const { pathInfo } = useSharedPathInfo();

// ==================== 页面数据获取 ====================

logger.info("pathInfo", pathInfo.value);

// 获取页面内容（带英文回退）
const { data: page } = await useAsyncData(
  `${kebabCase(route.path)}-${locale.value}`,
  async () => {
    // 根据路径信息获取集合名称
    if (!pathInfo.value.collectionName) {
      throw createError({
        statusCode: 404,
        statusMessage: "Collection not found",
      });
    }

    logger.info(
      "collectionName",
      pathInfo.value.collectionName
    );

    // 1) 尝试当前语言内容
    let doc = await queryCollection(
      pathInfo.value.collectionName as any
    )
      .path(pathInfo.value.contentPath)
      .first();

    // 2) 若不存在，回退到英文内容
    if (!doc && pathInfo.value.module) {
      const fallbackLocale = "en";
      const fallbackCollection = buildCollectionName(
        pathInfo.value.module,
        fallbackLocale as any
      );
      // 将内容路径的首个语言段替换为 /en/
      const fallbackPath =
        pathInfo.value.contentPath.replace(
          /^\/[a-z]{2}(?:-[a-z]{2})?\//i,
          `/${fallbackLocale}/`
        );

      logger.info("fallback to EN", {
        fallbackCollection,
        fallbackPath,
      });

      doc = await queryCollection(fallbackCollection as any)
        .path(fallbackPath)
        .first();
    }

    return doc;
  },
  {
    watch: [() => route.path, locale], // 监听路径和语言
  }
);

logger.info("page", page.value);

// 获取周围导航（上一页/下一页）
// const { data: surround } = await useAsyncData(
//   `${kebabCase(route.path)}-surround`,
//   async () => {
//     const info = pathInfo.value;

//     if (!info.collectionName) {
//       return null;
//     }

//     return queryCollectionItemSurroundings(
//       info.collectionName as any,
//       info.contentPath,
//       {
//         fields: ["description", "title"],
//       }
//     );
//   }
// );

// ==================== 导航数据处理 ====================

// 从 app.vue 注入的导航数据
const navigation =
  inject<Ref<ContentNavigationItem[]>>("navigation");

logger.info("navigation", navigation?.value);

// 生成面包屑导航
const breadcrumb = computed(() =>
  mapContentNavigation(
    findPageBreadcrumb(
      navigation?.value,
      page.value?.path,
      { indexAsChild: true }
    )
  ).map(({ ...link }) => link)
);

logger.info("breadcrumb", breadcrumb.value);

// ==================== 计算属性 ====================

const isHomePage = computed(() => pathInfo.value.isRoot);

const hasNavigation = computed(() => {
  const showNav =
    (page.value as { showNavigation?: boolean })
      ?.showNavigation ?? true;
  return (
    showNav &&
    !!navigation?.value &&
    navigation.value.length > 0
  );
});

const tocLinks = computed(
  () => page.value?.body?.toc?.links || []
);

const hasToc = computed(() => {
  const showToc =
    (page.value as { showToc?: boolean })?.showToc ?? true;
  return showToc && tocLinks.value.length > 0;
});

const currentVersion = computed(
  () => pathInfo.value.version || "v1"
);

// ==================== TOC 重新渲染控制 ====================

const tocKey = ref(0);

const debouncedRefreshToc = useDebounceFn(() => {
  tocKey.value++;
}, 200);

whenever(
  () => !!page.value && tocLinks.value.length > 0,
  () => debouncedRefreshToc(),
  { immediate: false }
);

// ==================== SEO 设置 ====================

const title =
  page.value?.navigation?.title || page.value?.title;
const description = page.value?.description;

useSeoMeta({
  titleTemplate: "%s - Onerway Docs",
  title,
  ogTitle: `${title} - Onerway Docs`,
  description,
  ogDescription: description,
});

// ==================== 调试信息 ====================

if (import.meta.dev) {
  logger.info("slug debug info:", {
    path: route.path,
    hasPage: !!page.value,
    hasNavigation: hasNavigation.value,
    hasToc: hasToc.value,
    tocCount: tocLinks.value.length,
    breadcrumbCount: breadcrumb.value.length,
  });
}
</script>

<template>
  <UPage v-if="page">
    <UContainer class="px-12 sm:px-18 lg:px-24">
      <!-- 页面标题区域 -->
      <UPageHeader
        v-if="!isHomePage"
        v-bind="page"
        class="sm:mt-12">
        <template #headline>
          <UBreadcrumb
            v-if="breadcrumb.length"
            :items="breadcrumb" />
        </template>

        <template #description>
          {{ page.description }}
        </template>

        <template #title>
          {{ page.title }}
          <UBadge
            v-if="currentVersion && currentVersion !== 'v1'"
            :label="currentVersion"
            color="primary"
            variant="soft"
            size="sm"
            class="ml-2" />
        </template>
      </UPageHeader>

      <!-- 页面主体内容 -->
      <UPageBody>
        <!-- 常规页面内容 -->
        <div v-if="!isHomePage">
          <ContentRenderer
            v-if="page.body"
            :value="page" />

          <!-- 分隔线和上下页导航 -->
          <!-- <USeparator
            v-if="surround?.filter(Boolean).length"
            class="my-8" /> -->
          <!-- 
          <UContentSurround
            v-if="surround"
            :surround="surround" /> -->
        </div>
      </UPageBody>
    </UContainer>

    <!-- 右侧目录 -->
    <template
      #right
      v-if="!isHomePage && hasToc">
      <UPageAside
        :ui="{
          root: 'overflow-y-hidden',
        }">
        <UContentToc
          :key="tocKey"
          class="overflow-auto"
          :links="tocLinks"
          highlight
          highlight-color="primary"
          color="primary">
          <template #link="{ link }">
            <UTooltip
              arrow
              :text="link.text"
              :delay-duration="1000"
              :content="{
                side: 'right',
              }"
              class="block w-full text-left">
              <span class="block w-full truncate">
                {{ link.text }}
              </span>
            </UTooltip>
          </template>
        </UContentToc>
      </UPageAside>
    </template>
  </UPage>
</template>
