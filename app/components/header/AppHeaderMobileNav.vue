<script setup lang="ts">
/**
 * AppHeaderMobileNav 组件
 * 移动端导航菜单，实现双层导航交互
 *
 * 特点：
 * - 双层导航：模块列表 ↔ 当前模块子菜单
 * - 平滑的左右滑动过渡动画
 * - 自动检测当前路由并高亮对应模块
 * - 支持返回上一级导航
 * - 作为 AppHeader 的子组件在移动端抽屉中使用
 * - 底部固定 API 入口链接
 */
import type { NavigationMenuItem, PageLink } from "@nuxt/ui";
import type { ContentNavigationItem } from "@nuxt/content";
import { navigationMenuResponsiveUi } from "~/composables/useNavigationMenuResponsiveUi";
import { useNavigationMenuTriggerClick } from "~/composables/useNavigationMenuTriggerClick";

const props = defineProps<{
  /** 导航树数据 */
  navigation: ContentNavigationItem[];
}>();

const route = useRoute();
const { header } = useAppConfig();
const { t } = useI18n();

// API 链接（用于 UPageLinks）
const apis = computed<PageLink[]>(() =>
  (header.apiLinks || []).map((link) => ({
    label: t(link.labelKey),
    ...(link.icon && { icon: link.icon }),
    to: link.to,
    color: "primary",
    target: "_blank",
  }))
);

// 将 props 转换为响应式 Ref 供 composable 使用
const navigationRef = computed(() => props.navigation);

// 获取完整导航数据（包括顶层模块）
const { topLevelModules, currentModule, currentModuleMenu, getCurrentModule } =
  useDocsNav(navigationRef, {
    includeModules: true,
  });

// 视图模式状态
type ViewMode = "modules" | "submenu";
const viewMode = ref<ViewMode>("modules");
const selectedModule = ref<NavigationMenuItem | null>(null);

// 初始化：如果在文档页面，自动进入当前模块子菜单
watch(
  [currentModule, topLevelModules],
  ([module]) => {
    if (module && !selectedModule.value) {
      selectedModule.value = module.root;
      viewMode.value = "submenu";
    }
  },
  { immediate: true }
);

// 监听路由变化，自动切换到对应模块
watch(
  () => route.path,
  () => {
    const module = getCurrentModule(route.path);
    if (module && module.root !== selectedModule.value) {
      selectedModule.value = module.root;
      viewMode.value = "submenu";
    }
  }
);

/**
 * 选择模块
 * 如果模块有子菜单，进入子菜单视图；否则直接跳转
 */
function handleModuleSelection(module: NavigationMenuItem) {
  if (!module.children?.length) {
    // 如果没有子菜单，直接跳转到模块首页
    if (module.to) {
      navigateTo(module.to);
    }
    return;
  }

  // 有子菜单，切换到子菜单视图
  selectedModule.value = module;
  viewMode.value = "submenu";
}

/**
 * 为模块列表项添加 onSelect 回调
 * NavigationMenu 组件通过 item.onSelect 回调处理点击事件
 */
const moduleMenuItems = computed(() =>
  topLevelModules.value.map((item) => ({
    ...item,
    onSelect: () => handleModuleSelection(item),
  }))
);

/**
 * 返回模块列表
 */
function backToModules() {
  viewMode.value = "modules";
}

// 当前子菜单数据（响应式）
const currentSubmenuItems = computed(
  () =>
    (selectedModule.value?.children as NavigationMenuItem[]) ||
    currentModuleMenu.value
);

// trigger + 跳转处理器（无参数，从 data-nav-to 获取路径）
const { handleClick: handleTriggerClick } = useNavigationMenuTriggerClick();
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 导航内容区域（可滚动） -->
    <div class="flex-1 overflow-y-auto">
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="-translate-x-full opacity-0">
        <div
          v-if="viewMode === 'modules'"
          key="modules"
          class="p-1">
          <!-- 模块列表视图 -->
          <UCard variant="outline">
            <!-- 事件委托：捕获 trigger 类型菜单项的点击，实现展开 + 跳转 -->
            <div @click.capture="handleTriggerClick">
              <UNavigationMenu
                :items="moduleMenuItems"
                orientation="vertical"
                variant="link"
                :ui="navigationMenuResponsiveUi"
                trailing-icon="i-lucide-chevron-right">
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
          </UCard>
        </div>

        <div
          v-else
          key="submenu"
          class="p-1">
          <!-- 子菜单视图 -->
          <UCard variant="outline">
            <template #header>
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-lucide-arrow-left"
                  color="neutral"
                  variant="solid"
                  size="sm"
                  :label="selectedModule?.label"
                  @click="backToModules" />
              </div>
            </template>

            <!-- 模块子菜单 -->
            <!-- 事件委托：捕获 trigger 类型菜单项的点击，实现展开 + 跳转 -->
            <div @click.capture="handleTriggerClick">
              <UNavigationMenu
                v-if="currentSubmenuItems?.length"
                :items="currentSubmenuItems"
                variant="link"
                :ui="navigationMenuResponsiveUi"
                trailing-icon="i-lucide-chevron-right"
                orientation="vertical">
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
          </UCard>
        </div>
      </Transition>
    </div>

    <!-- 底部固定 API 入口 -->
    <div class="shrink-0 p-1">
      <UPageCard variant="outline">
        <template #body>
          <UPageLinks
            :title="t('header.api.title')"
            :links="apis"
            :ui="{
              list: 'ms-auto',
            }" />
        </template>
      </UPageCard>
    </div>
  </div>
</template>
