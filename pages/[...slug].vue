<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import {
  useBreakpoints,
  useDebounceFn,
  whenever,
} from "@vueuse/core";
import { createLogger } from "~/composables/shared/logger";
import { useSharedPathInfo } from "~/composables/shared/path";
import { usePageData } from "~/composables/usePageData";

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

// 使用新的页面数据获取组合式函数
const { page, surround, isLoading, error } = usePageData({
  watchRoute: true,
  enableFallback: true,
  includeSurround: true,
});

logger.info("page", page.value);

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

// 使用新的页面标题组合式函数
const title = computed(() => page.value?.title || "");
const description = computed(
  () => page.value?.description || ""
);

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
    isLoading: isLoading.value,
    hasError: !!error.value,
  });
}
</script>

<template>
  <UContainer class="px-6 sm:px-8 lg:px-12">
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
          root: 'border-b border-default',
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
              Array.isArray(surround) &&
              surround.filter(Boolean).length &&
              page.showFooter
            "
            class="my-8" />

          <PageSurround
            v-if="
              Array.isArray(surround) && page.showFooter
            "
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
            class="overflow-auto text-sm"
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
                <span class="block w-full line-clamp-2">
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
