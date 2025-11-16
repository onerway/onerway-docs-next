<script setup lang="ts">
import { useDocsNav } from "~/composables/useDocsNav";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";
import type { NavigationMenuItem } from "@nuxt/ui";
import type { ContentNavigationItem } from "@nuxt/content";

const { header } = useAppConfig();

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

/**
 * 判断菜单项是否有可展开的子项
 */
const hasExpandableChildren = (
  item: NavigationMenuItem
): boolean => {
  return Boolean(
    item.children &&
      item.children.length > 0 &&
      item.type !== "label"
  );
};
</script>

<template>
  <!-- 外层容器，垂直排列 header、主体和 footer -->
  <div>
    <!-- 主体区域：DashboardGroup 管理 sidebar 和正文 -->
    <UDashboardGroup>
      <!-- 左侧侧边栏：依据 front‑matter 的 showNavigation 控制是否显示 -->
      <UDashboardSidebar
        v-if="page?.navigation !== false"
        collapsible
        resizable
        :ui="{
          body: 'pt-(--ui-header-height) px-0',
        }">
        <template #toggle>
          <UDashboardSidebarToggle variant="subtle" />
        </template>

        <template #default>
          <!-- 导航菜单 -->
          <UNavigationMenu
            orientation="vertical"
            variant="link"
            :items="navigationItems"
            :ui="{
              label: 'px-1 py-1',
              linkLabel: 'whitespace-normal text-left', // 一级 label 换行，左对齐
              childLinkLabel: 'whitespace-normal text-left', // 子级 label 换行，左对齐
              linkTrailingIcon: 'hidden', // 隐藏默认箭头
            }">
            <!-- 
              自定义前缀：箭头 + 图标
              使用占位符方案确保所有菜单项完美对齐
            -->
            <template #item-leading="{ item }">
              <span class="inline-flex items-center gap-1">
                <!-- 箭头区域：始终占位，确保对齐 -->
                <span class="inline-block">
                  <UIcon
                    v-if="hasExpandableChildren(item)"
                    name="i-lucide-chevron-right"
                    class="size-3 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </span>
                <!-- 图标区域：始终占位，确保对齐 -->
                <span class="inline-block">
                  <UIcon
                    v-if="item.icon"
                    :name="item.icon"
                    class="size-3" />
                </span>
              </span>
            </template>
          </UNavigationMenu>
        </template>
      </UDashboardSidebar>

      <!-- 右侧内容区 -->
      <UDashboardPanel class="pt-(--ui-header-height)">
        <template #header>
          <UDashboardNavbar>
            <template #leading>
              <ULink
                :to="header?.to || '/'"
                class="flex items-center gap-2">
                <UIcon
                  name="i-custom-onerway"
                  class="sm:size-10" />
                <AppLogo class="max-sm:hidden h-5 w-auto" />
              </ULink>
            </template>
          </UDashboardNavbar>
        </template>
        <template #body>
          <!-- 渲染文档内容 -->
          <slot />
          <!-- 若需要右侧目录，可使用 Toc 组件，根据 showToc 控制显示 -->
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </div>
</template>
