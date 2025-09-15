<script setup lang="ts">
import { Html } from "#components";
import * as locales from "@nuxt/ui/locale";
import { getCurrentUILocale } from "~/composables/shared/module";
// ==================== 应用配置 ====================

const { locale } = useI18n();
const appConfig = useAppConfig();

// SEO 配置
const { setupSEO } = useAppSEO();
setupSEO();

// 导航数据管理
const { filteredNavigation, setupNavigationProvider } =
  useAppNavigation();
setupNavigationProvider();

// 搜索功能
const { files, searchLinks } = useAppSearch();

// 最近访问页面
useRecentPages();

// ==================== UI 语言配置 ====================

// 计算当前语言环境的 UI 配置
const currentUILocale = computed(() =>
  getCurrentUILocale(locale.value as any, locales)
);
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
