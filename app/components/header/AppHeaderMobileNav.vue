<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { ContentNavigationItem } from "@nuxt/content";

/**
 * 移动端导航组件
 * 实现双层导航：模块列表 ↔ 当前模块子菜单
 */

const props = defineProps<{
  navigation:
    | Ref<ContentNavigationItem[] | undefined>
    | undefined;
}>();

const route = useRoute();

// 获取完整导航数据（包括顶层模块）
// 在 Vue 3 中，通过 props 传递的 Ref 会被自动解包
// 所以我们需要将它重新包装为 Ref
const navigationRef = toRef(() => props.navigation);
const { modules } = useDocsNav(
  navigationRef as Ref<ContentNavigationItem[] | undefined>,
  {
    includeModules: true,
  }
);

// 视图模式状态
type ViewMode = "modules" | "submenu";
const viewMode = ref<ViewMode>("modules");
const selectedModule = ref<NavigationMenuItem | null>(null);

// 当前模块（根据路由自动检测）
const currentModule = computed(() =>
  modules.getCurrent(route.path)
);

// 初始化：如果在文档页面，自动进入当前模块子菜单
watch(
  [currentModule, modules.list],
  ([module]) => {
    if (module && !selectedModule.value) {
      selectedModule.value = module;
      viewMode.value = "submenu";
    }
  },
  { immediate: true }
);

// 监听路由变化，自动切换到对应模块
watch(
  () => route.path,
  () => {
    const module = modules.getCurrent(route.path);
    if (module && module !== selectedModule.value) {
      selectedModule.value = module;
      viewMode.value = "submenu";
    }
  }
);

/**
 * 选择模块
 * 如果模块有子菜单，进入子菜单视图；否则直接跳转
 */
function selectModule(module: NavigationMenuItem) {
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
 * 返回模块列表
 */
function backToModules() {
  viewMode.value = "modules";
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
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
            :items="modules.list.value"
            orientation="vertical"
            variant="link"
            trailing-icon="i-lucide-chevron-right"
            @select="selectModule" />
        </UCard>
      </div>

      <!-- 子菜单视图 -->
      <div
        v-else
        key="submenu"
        class="flex-1 flex flex-col p-1">
        <UCard
          variant="outline"
          class="flex-1 flex flex-col overflow-hidden">
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
            v-if="selectedModule?.children"
            :items="selectedModule.children"
            variant="link"
            trailing-icon="i-lucide-chevron-right"
            orientation="vertical" />
        </UCard>
      </div>
    </Transition>
  </div>
</template>
