<script setup lang="ts">
import { useDocsNav } from "~/composables/useDocsNav";
import { useNavigationMenuTriggerClick } from "~/composables/useNavigationMenuTriggerClick";
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
const page = useState<DocPage | null>(CURRENT_PAGE_STATE_KEY);

// 转换导航树为 NavigationMenu 所需的数据结构
// currentModuleKey 用于强制重新渲染 NavigationMenu，确保 defaultOpen 生效
const { currentModuleMenu, currentModuleKey } = useDocsNav(
  navigation as Ref<ContentNavigationItem[]>
);

// 处理 trigger 类型菜单项的"展开 + 跳转"功能
const { handleClick: handleNavigationClick } = useNavigationMenuTriggerClick();
</script>

<template>
  <!-- 外层容器，垂直排列 header、主体和 footer -->
  <div>
    <AppHeader />

    <!-- 主体区域：DashboardGroup 管理 sidebar 和正文 -->
    <UDashboardGroup unit="px">
      <!-- 左侧侧边栏：依据 front‑matter 的 showNavigation 控制是否显示 -->
      <UDashboardSidebar
        v-if="page?.navigation !== false"
        resizable
        :min-size="256"
        :max-size="320"
        :default-size="288"
        class="min-w-64"
        :ui="{
          body: 'pt-layout px-4',
        }">
        <template #default>
          <!-- 事件委托容器：捕获导航菜单的点击事件，实现 trigger + 跳转 -->
          <div @click.capture="handleNavigationClick">
            <!-- 导航菜单：key 确保模块切换时重新渲染，使 defaultOpen 生效 -->
            <UNavigationMenu
              :key="currentModuleKey"
              orientation="vertical"
              variant="link"
              trailing-icon="i-lucide-chevron-right"
              :items="currentModuleMenu"
              :ui="{
                linkLabel:
                  'whitespace-normal wrap-break-word text-pretty line-clamp-2 lg:line-clamp-none',
              }">
              <!--
                slot 添加 data-nav-to 属性，用于 trigger + 跳转功能
                仅当父级菜单有独立页面（to 与 children[0].to 不同）时才启用跳转
              -->
              <template #item-label="{ item }">
                <span
                  :data-nav-to="
                    item.type === 'trigger' &&
                    item.to &&
                    item.children?.[0]?.to !== item.to
                      ? item.to
                      : undefined
                  ">
                  {{ item.label }}
                </span>
              </template>
            </UNavigationMenu>
          </div>
        </template>
      </UDashboardSidebar>

      <!-- 右侧内容区 -->
      <UDashboardPanel
        class="pt-layout"
        :ui="{
          body: 'docs-scroll-container p-8 sm:p-12',
        }">
        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>
