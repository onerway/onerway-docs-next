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
 */
import type { NavigationMenuItem } from "@nuxt/ui";
import type { ContentNavigationItem } from "@nuxt/content";

const props = defineProps<{
  navigation: Ref<ContentNavigationItem[]>;
}>();

const route = useRoute();

// 获取完整导航数据（包括顶层模块）
const {
  topLevelModules,
  currentModule,
  currentModuleMenu,
  getCurrentModule,
} = useDocsNav(props.navigation, {
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
</script>

<template>
  <div class="h-full flex flex-col overflow-y-auto">
    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="-translate-x-full opacity-0">
      <!-- 模块列表视图 -->
      <div
        v-if="viewMode === 'modules'"
        key="modules"
        class="flex-1 flex flex-col p-1 overflow-y-auto">
        <UCard variant="outline">
          <UNavigationMenu
            :items="moduleMenuItems"
            orientation="vertical"
            variant="link"
            trailing-icon="i-lucide-chevron-right" />
        </UCard>
      </div>

      <!-- 子菜单视图 -->
      <div
        v-else
        key="submenu"
        class="flex-1 flex flex-col p-1">
        <UCard
          variant="outline"
          class="flex-1 flex flex-col overflow-y-auto">
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

          <!-- 模块子菜单 - 使用 default slot -->
          <UNavigationMenu
            v-if="
              selectedModule?.children || currentModuleMenu
            "
            :items="
              selectedModule?.children || currentModuleMenu
            "
            variant="link"
            trailing-icon="i-lucide-chevron-right"
            orientation="vertical" />
        </UCard>
      </div>
    </Transition>
  </div>
</template>
