<script setup lang="ts">
import { useDocsNav } from "~/composables/useDocsNav";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";
import type { ContentNavigationItem } from "@nuxt/content";

// 使用类型安全的 injection key 获取导航树
const navigation = inject(NAVIGATION_KEY);

// 使用 useState 获取当前页面配置
// useState 可以在 layout（父组件）和 page（子组件）之间共享状态
const page = useState<DocPage | null>(
  CURRENT_PAGE_STATE_KEY
);

// 转换导航树为 NavigationMenu 所需的数据结构
const { currentModuleMenu } = useDocsNav(
  navigation as Ref<ContentNavigationItem[] | undefined>
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
        resizable
        :ui="{
          body: 'pt-layout px-4',
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
            :items="currentModuleMenu"
            class="">
            <!-- 
              自定义前缀：箭头 + 图标
              使用占位符方案确保所有菜单项完美对齐
            -->
            <template #item-label="{ item }">
              <div
                :class="[
                  'flex gap-2 cursor-pointer',
                  item.module
                    ? 'cursor-text select-text inline-block'
                    : '',
                ]">
                <span>{{ item.label }}</span>
              </div>
            </template>
          </UNavigationMenu>
        </template>
      </UDashboardSidebar>

      <!-- 右侧内容区 -->
      <UDashboardPanel class="pt-layout">
        <template #body>
          <!-- 渲染文档内容 -->
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UContainer>
</template>
