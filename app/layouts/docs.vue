<script setup lang="ts">
import { useDocsNav } from "~/composables/useDocsNav";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";
import type { ContentNavigationItem } from "@nuxt/content";

// 使用类型安全的 injection key 获取导航树
const navigationTree = inject(NAVIGATION_KEY);

// 使用 useState 获取当前页面配置
// useState 可以在 layout（父组件）和 page（子组件）之间共享状态
const page = useState<DocPage | null>(
  CURRENT_PAGE_STATE_KEY
);

// 转换导航树为 NavigationMenu 所需的数据结构
const { navigationItems } = useDocsNav(
  navigationTree as Ref<ContentNavigationItem[] | undefined>
);
</script>

<template>
  <!-- 外层容器，垂直排列 header、主体和 footer -->
  <UContainer>
    <!-- 主体区域：DashboardGroup 管理 sidebar 和正文 -->
    <UDashboardGroup>
      <!-- 左侧侧边栏：依据 front‑matter 的 showNavigation 控制是否显示 -->
      <UDashboardSidebar
        v-if="page?.navigation !== false"
        collapsible
        resizable
        :ui="{
          body: 'pt-[calc(var(--ui-header-height)+8px)] px-4',
        }">
        <template #toggle>
          <UDashboardSidebarToggle variant="subtle" />
        </template>

        <template #default>
          <!-- 导航菜单 -->
          <UNavigationMenu
            orientation="vertical"
            variant="link"
            trailing-icon="i-lucide-chevron-right"
            :items="navigationItems">
            <!-- 
              自定义前缀：箭头 + 图标
              使用占位符方案确保所有菜单项完美对齐
            -->
          </UNavigationMenu>
        </template>
      </UDashboardSidebar>

      <!-- 右侧内容区 -->
      <UDashboardPanel class="pt-(--ui-header-height)">
        <template #body>
          <!-- 渲染文档内容 -->
          <slot />
          <!-- 若需要右侧目录，可使用 Toc 组件，根据 showToc 控制显示 -->
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UContainer>
</template>
