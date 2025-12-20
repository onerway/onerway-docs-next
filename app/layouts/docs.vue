<script setup lang="ts">
import { useDocsNav } from "~/composables/useDocsNav";
import {
  NAVIGATION_KEY,
  CURRENT_PAGE_STATE_KEY,
  type DocPage,
} from "~/types/injection-keys";
import type { ContentNavigationItem } from "@nuxt/content";
import type { NavigationMenuItem } from "@nuxt/ui";

// 使用类型安全的 injection key 获取导航树
const navigation = inject(NAVIGATION_KEY);

// 使用 useState 获取当前页面配置
// useState 可以在 layout（父组件）和 page（子组件）之间共享状态
const page = useState<DocPage | null>(
  CURRENT_PAGE_STATE_KEY
);

// 转换导航树为 NavigationMenu 所需的数据结构
// currentModuleKey 用于强制重新渲染 NavigationMenu，确保 defaultOpen 生效
const { currentModuleMenu, currentModuleKey } = useDocsNav(
  navigation as Ref<ContentNavigationItem[]>
);

/**
 * 递归查找菜单项（通过标签文本）
 */
function findMenuItemByLabel(
  items: NavigationMenuItem[],
  label: string
): NavigationMenuItem | null {
  for (const item of items) {
    if (item.label === label) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemByLabel(
        item.children as NavigationMenuItem[],
        label
      );
      if (found) return found;
    }
  }
  return null;
}

/**
 * 处理导航菜单点击事件
 * 用于实现 trigger 类型菜单项的"展开 + 跳转"功能
 */
function handleNavigationClick(e: MouseEvent) {
  // 查找被点击的按钮（AccordionTrigger）
  const button = (e.target as HTMLElement).closest(
    "button"
  );
  if (!button) return;

  // 从按钮中提取文本内容
  const labelElement = button.querySelector("span[title]");
  if (!labelElement) return;

  const label = labelElement.getAttribute("title");
  if (!label) return;

  // 在菜单数据中查找对应的 item
  const item = findMenuItemByLabel(
    currentModuleMenu.value,
    label
  );
  if (!item) return;

  // 如果是 trigger 类型且有跳转目标，执行跳转
  if (item.type === "trigger" && item.to) {
    navigateTo(item.to);
  }
}
</script>

<template>
  <!-- 外层容器，垂直排列 header、主体和 footer -->
  <UContainer>
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
              :items="currentModuleMenu">
              <!--
                自定义前缀：箭头 + 图标
                使用占位符方案确保所有菜单项完美对齐
              -->
              <template #item-label="{ item }">
                <div
                  :class="[
                    'flex gap-2 cursor-pointer whitespace-normal wrap-break-word text-pretty',
                    item.module
                      ? 'cursor-text select-text inline-block'
                      : '',
                  ]">
                  <span
                    :title="item.label"
                    class="line-clamp-2 lg:line-clamp-none"
                    >{{ item.label }}</span
                  >
                </div>
              </template>
            </UNavigationMenu>
          </div>
        </template>
      </UDashboardSidebar>

      <!-- 右侧内容区 -->
      <UDashboardPanel
        class="pt-layout"
        :ui="{ body: 'docs-scroll-container p-6' }">
        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UContainer>
</template>
