<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import {
  useBreakpoints,
  useDebounceFn,
  whenever,
} from "@vueuse/core";
import { kebabCase } from "scule";
import { createLogger } from "~/composables/shared/logger";
import { buildCollectionName } from "~/composables/shared/module";
import { useSharedPathInfo } from "~/composables/shared/path";

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
  `${kebabCase(pathInfo.value.contentPath)}`,
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
      // @ts-expect-error: Dynamic collection name from pathInfo
      pathInfo.value.collectionName
    )
      .path(pathInfo.value.contentPath)
      .first();

    // 2) 若不存在，回退到英文内容
    if (!doc && pathInfo.value.module) {
      const fallbackLocale = "en";
      const fallbackCollection = buildCollectionName(
        pathInfo.value.module,
        fallbackLocale as "en"
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

      doc = await queryCollection(
        // @ts-expect-error: Dynamic collection name from buildCollectionName
        fallbackCollection
      )
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
const { data: surround } = await useAsyncData(
  `${kebabCase(route.path)}-surround`,
  async () => {
    const info = pathInfo.value;

    if (!info.collectionName) {
      return null;
    }

    const surroundings =
      await queryCollectionItemSurroundings(
        // @ts-expect-error: Dynamic collection name from pathInfo
        info.collectionName,
        info.contentPath,
        {
          fields: ["description", "title"],
        }
      );

    logger.info("surroundings", surroundings);
    return surroundings;
  },
  {
    watch: [() => route.path, locale], // 监听路径和语言
  }
);

// ==================== 导航数据处理 ====================

// 从 app.vue 注入的导航数据
const navigation =
  inject<Ref<ContentNavigationItem[]>>("navigation");

logger.info("slug-navigation", navigation);

// 生成 headline（暂时未使用）
// const headline = findPageHeadline(
//   navigation.value,
//   page.value?.path
// );

// ==================== 计算属性 ====================

const isHomePage = computed(() => pathInfo.value.isRoot);

const hasNavigation = computed(() => {
  const showNav =
    (page.value as { showNavigation?: boolean })
      ?.showNavigation ?? true;
  return (
    showNav && !!navigation && navigation.value.length > 0
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

// ==================== 响应式布局 ====================

// 定义断点（与 Tailwind CSS 保持一致）
const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
});

// 响应式方向：小屏幕垂直，大屏幕水平
const surroundDirection = computed(() => {
  return breakpoints.smaller("md").value
    ? "vertical"
    : "horizontal";
});

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

const title = computed(() => {
  if (!page.value) return "";
  return typeof page.value.navigation === "object" &&
    page.value.navigation?.title
    ? page.value.navigation.title
    : page.value.title || "";
});
const description = page.value?.description;

useSeoMeta({
  titleTemplate: "%s - Onerway Docs",
  title,
  ogTitle: computed(() => `${title.value} - Onerway Docs`),
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
  });
}
</script>

<template>
  <UContainer class="px-6 sm:px-16 lg:px-20">
    <UPage v-if="page">
      <!-- 粘性面包屑导航 -->
      <DocsBreadcrumb
        v-if="!isHomePage && page"
        :navigation="navigation"
        :current-path="route.path"
        :show-home-icon="true"
        :show-icons="true"
        :sticky="true" />
      <!-- 页面标题区域 -->
      <UPageHeader
        v-if="!isHomePage"
        :ui="{
          root: 'border-none',
        }"
        class="sm:mt-12">
        <template #description>
          {{ page.description }}
        </template>

        <template #title>
          <div class="flex items-center gap-2">
            <p class="">
              {{ page.title }}
            </p>
            <UBadge
              v-if="currentVersion"
              :label="currentVersion"
              color="primary"
              variant="soft"
              size="md" />
          </div>
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
          <USeparator
            v-if="
              surround?.filter(Boolean).length &&
              page.showFooter
            "
            class="my-8" />

          <PageSurround
            v-if="surround && page.showFooter"
            :key="`${surround}-${locale}`"
            :surround="surround"
            show-descriptions
            variant="elevated"
            :direction="surroundDirection" />
        </div>
      </UPageBody>

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
  </UContainer>
</template>
