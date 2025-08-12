<script setup lang="ts">
import { Html } from "#components";
import * as locales from "@nuxt/ui-pro/locale";
import colors from "tailwindcss/colors";
import { withoutTrailingSlash } from "ufo";
import {
  createLogger,
  generateSearchLinks,
  getAllCollectionNames,
  getCurrentUILocale,
} from "~/composables/shared/utils";

const route = useRoute();
const appConfig = useAppConfig();
const colorMode = useColorMode();
const { locale, t } = useI18n();
const logger = createLogger("app");

// ==================== 全局导航数据管理 ====================

// 根据当前语言获取所有集合的导航数据
const { data: allNavigations } = await useAsyncData(
  "navigation",
  async () => {
    const collections = getAllCollectionNames();

    logger.info("collections", collections);
    const navigationPromises = collections.map(
      (collection) =>
        queryCollectionNavigation(collection as any, [
          "icon",
          "title",
          "description",
          "version",
          "showToc",
          "showNavigation",
          "path",
          "module",
          "defaultOpen",
          "ui",
        ])
          .where("draft", "<>", true)
          .catch(() => []) // 防止某些集合不存在时报错
    );

    const results = await Promise.all(navigationPromises);

    //   最终返回格式：
    // {
    //   'get_started_en': [...navigation items],
    //   'payments_en': [...navigation items],
    //   'transfers_en': [...navigation items]
    // }
    return collections.reduce(
      (acc, collection, index) => {
        const result = results[index];
        if (result && result.length > 0) {
          acc[collection] = result;
        }
        return acc;
      },
      {} as Record<string, any[]>
    );
  }
);

logger.info("allNavigations", allNavigations.value);
// 映射和过滤导航数据
const { mappedNavigation, filteredNavigation } =
  useContentNavigation(
    allNavigations as Ref<Record<string, any[]> | null>
  );

// ==================== 搜索功能 ====================

// 获取搜索数据 - 合并所有集合的搜索内容
const { data: files } = useLazyAsyncData(
  "search",
  async () => {
    // 只获取英文集合用于搜索（避免重复内容）
    const searchCollections = getAllCollectionNames([
      locale.value as any,
    ]);

    const searchPromises = searchCollections.map(
      (collection) =>
        queryCollectionSearchSections(
          collection as any
        ).catch(() => [])
    );

    const results = await Promise.all(searchPromises);
    return results.flat();
  },
  {
    server: false,
  }
);

// 搜索链接配置 - 基于配置动态生成
const searchLinks = computed(() => generateSearchLinks(t));

// ==================== 主题和样式配置 ====================

const color = computed(() =>
  colorMode.value === "dark"
    ? (colors as any)[appConfig.ui.colors.neutral][900]
    : "white"
);

const radius = computed(
  () =>
    `:root { --ui-radius: ${appConfig.theme?.radius || 0.5}rem; }`
);

// ==================== 语言环境配置 ====================

// 计算当前语言环境的 UI 配置
const currentUILocale = computed(() =>
  getCurrentUILocale(locale.value as any, locales)
);

// ==================== SEO 和元数据 ====================

useHead({
  meta: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      key: "theme-color",
      name: "theme-color",
      content: color,
    },
  ],
  link: [
    {
      rel: "canonical",
      href: `https://docs.onerway.com${withoutTrailingSlash(route.path)}`,
    },
  ],
  style: [
    {
      innerHTML: radius,
      id: "nuxt-ui-radius",
      tagPriority: -2,
    },
  ],
  htmlAttrs: {
    lang: locale.value,
  },
});

// ==================== 全局状态管理 ====================

// 注入导航数据供子组件使用
provide("navigation", filteredNavigation);

logger.info("mappedNavigation", mappedNavigation.value);

// 初始化最近访问页面功能
useRecentPages();
</script>

<template>
  <Html :lang="locale">
    <Body>
      <UApp
        :locale="currentUILocale"
        :toaster="appConfig.toaster">
        <!-- 加载指示器 -->
        <NuxtLoadingIndicator
          color="var(--ui-primary)"
          :height="3" />

        <!-- 全局顶部导航 -->
        <AppHeader />

        <!-- 主要布局 -->
        <NuxtLayout>
          <NuxtRouteAnnouncer />
          <NuxtPage />
        </NuxtLayout>

        <!-- 全局页脚 -->
        <AppFooter />

        <!-- 全局搜索组件 -->
        <ClientOnly>
          <LazyUContentSearch
            :files="files"
            :links="searchLinks"
            :navigation="filteredNavigation"
            :fuse="{ resultLimit: 100 }"
            shortcut="meta_k" />
        </ClientOnly>
      </UApp>
    </Body>
  </Html>
</template>
