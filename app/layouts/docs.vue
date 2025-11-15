<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { useDocsNav } from "~/composables/useDocsNav";

// 注入导航树并转换为 NavigationMenuItem 数组
const rawNav = inject("navigation") as Ref<
  ContentNavigationItem[] | undefined
>;

// 从 provide 中获取当前页面的文档数据，包含 front‑matter 中的 showNavigation、showToc 等控制字段
const page = inject("currentPage") as Ref<
  Record<string, unknown>
>;

const { navigationItems } = useDocsNav(rawNav);
</script>

<template>
  <!-- 外层容器，垂直排列 header、主体和 footer -->
  <div class="min-h-screen flex flex-col">
    <!-- 顶部栏 -->
    <AppHeader />

    <!-- 主体区域：DashboardGroup 管理 sidebar 和正文 -->
    <UDashboardGroup class="flex-1">
      <!-- 左侧侧边栏：依据 front‑matter 的 showNavigation 控制是否显示 -->
      <UDashboardSidebar
        v-if="page?.showNavigation !== false"
        collapsible
        resizable
        :ui="{ footer: 'border-t border-default' }">
        <template #header="{ collapsed }">
          <Logo
            v-if="!collapsed"
            class="h-5 w-auto" />
          <UIcon
            v-else
            name="i-lucide-book-open"
            class="size-5 mx-auto" />
        </template>

        <template #default="{ collapsed }">
          <!-- 全局搜索按钮，可根据需要放置 -->
          <UButton
            :label="collapsed ? undefined : '搜索…'"
            icon="i-lucide-search"
            color="neutral"
            variant="outline"
            :square="collapsed"
            block />
          <!-- 导航菜单 -->
          <UNavigationMenu
            orientation="vertical"
            :collapsed="collapsed"
            :items="navigationItems" />
          <!-- <UContentNavigation
            highlight
            :navigation="rawNav" /> -->
        </template>
      </UDashboardSidebar>

      <!-- 右侧内容区 -->
      <UDashboardPanel>
        <!-- 渲染文档内容 -->
        <slot />
        <!-- 文档底部可自定义区域 -->
        <div
          v-if="page?.showFooter !== false"
          class="mt-8">
          <AppFooter />
        </div>
      </UDashboardPanel>

      <!-- 若需要右侧目录，可使用 Toc 组件，根据 showToc 控制显示 -->
      <UToc v-if="page?.showToc !== false" />
    </UDashboardGroup>
  </div>
</template>
