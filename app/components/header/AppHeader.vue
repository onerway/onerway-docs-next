<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { useDocsNav } from "~/composables/useDocsNav";
import { NAVIGATION_KEY } from "~/types/injection-keys";

const { header } = useAppConfig();

// 使用类型安全的 injection key 获取导航树
const navigation = inject(NAVIGATION_KEY);

// 转换导航树为水平导航菜单所需的数据结构
// includeModules: true 获取完整的顶层模块，悬浮时会自动展开子菜单
const { navigationItems } = useDocsNav(
  navigation as Ref<ContentNavigationItem[] | undefined>,
  {
    includeModules: true,
  }
);
</script>

<template>
  <UHeader>
    <!-- Left 插槽 - Logo 区域 -->
    <template #left>
      <ULink
        :to="header?.to || '/'"
        class="flex items-center gap-2">
        <UIcon
          name="i-custom-onerway"
          class="sm:size-10" />
        <AppLogo class="max-sm:hidden h-5 w-auto" />
      </ULink>
    </template>

    <!-- Default 插槽 - 搜索框（桌面端可见） -->
    <UContentSearchButton
      :collapsed="false"
      class="hidden lg:flex" />

    <template #body>
      <UNavigationMenu
        :items="navigationItems"
        variant="link"
        orientation="vertical" />
    </template>

    <!-- Right 插槽 - 操作按钮 -->
    <template #right>
      <!-- 移动端搜索按钮 -->
      <UContentSearchButton class="lg:hidden" />

      <!-- 颜色模式切换按钮 -->
      <UColorModeButton />
    </template>

    <!-- Bottom 插槽 - 水平导航菜单 -->
    <!-- <template #bottom>
      <USeparator class="hidden lg:flex" />
      <UNavigationMenu
        :items="navigationItems"
        variant="link"
        class="w-full" />
    </template> -->
  </UHeader>
</template>
