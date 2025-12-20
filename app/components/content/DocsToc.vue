<script lang="ts">
import type { TocLink } from "@nuxt/content";
</script>

<script setup lang="ts">
/**
 * DocsToc 组件
 * 文档目录导航，支持桌面端固定显示和移动端抽屉模式
 *
 * 特点：
 * - 基于 Nuxt UI ContentToc 组件的自定义实现
 * - 支持灵活配置 IntersectionObserver 监听的标题级别
 * - 移动端使用右上角浮动按钮 + 侧边抽屉
 * - 桌面端始终展开
 *
 * @see https://ui.nuxt.com/docs/components/content-toc
 */
import { computed, watch, ref } from "vue";
import { useScrollSpy } from "~/composables/useScrollSpy";

// ============================================================================
// Types
// ============================================================================

export interface DocsTocLink extends TocLink {
  class?: string;
}

export interface DocsTocProps {
  /**
   * 渲染的根元素类型
   * @defaultValue 'nav'
   */
  as?: string;
  /**
   * 目录数据结构
   */
  links?: DocsTocLink[];
  /**
   * 目录标题
   * @defaultValue 'Table of Contents'
   */
  title?: string;
  /**
   * 链接颜色
   * @defaultValue 'primary'
   */
  color?: string;
  /**
   * 是否显示活动指示器
   * @defaultValue false
   */
  highlight?: boolean;
  /**
   * 活动指示器颜色（Tailwind 颜色名）
   * @defaultValue 'primary'
   */
  highlightColor?: string;
  /**
   * IntersectionObserver 监听的标题选择器
   * @defaultValue 'h2, h3, h4, h5'
   */
  headingSelector?: string;
  /**
   * 移动端默认是否展开
   * @defaultValue false
   */
  defaultOpen?: boolean;
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(defineProps<DocsTocProps>(), {
  as: "nav",
  title: undefined,
  color: "primary",
  highlight: false,
  highlightColor: "primary",
  headingSelector: "h2, h3, h4, h5",
  defaultOpen: false,
});

const emit = defineEmits<{
  move: [id: string];
}>();

// ============================================================================
// Composables
// ============================================================================

const nuxtApp = useNuxtApp();
const router = useRouter();
const { t } = useI18n();
const { activeHeadings, updateHeadings } = useScrollSpy();
const { scrollToElement } = useDocsScroll();

// ============================================================================
// Constants
// ============================================================================

/** TOC 链接行高（px），需与 CSS 样式保持同步 */
const TOC_LINK_HEIGHT = 28;
/** TOC 链接间距（px） */
const TOC_LINK_GAP = 0;

// ============================================================================
// Reactive State
// ============================================================================

// 移动端折叠状态
const isOpen = ref(props.defaultOpen);

/**
 * 可见标题的 ID 列表（用于过滤 TOC 链接）
 * - null: 未初始化状态，显示所有链接
 * - Set: 已初始化，只显示 Set 中的链接
 */
const visibleHeadingIds = ref<Set<string> | null>(null);

// ============================================================================
// Methods
// ============================================================================

/**
 * 检查元素是否在所有激活的 Tab 中
 * 支持嵌套 tabs：需要所有层级的 data-tab-active 都为 true
 * @param el - 要检查的元素
 * @returns 如果元素在所有激活的 Tab 中，返回 true
 */
const isInActiveTab = (el: Element): boolean => {
  let current: Element | null = el;

  // 向上遍历所有祖先元素，检查每一层的 data-tab-active
  while (current) {
    const tabContent: Element | null = current.closest(
      "[data-tab-active]"
    );
    if (!tabContent) {
      // 没有更多的 tab 容器，说明已检查完所有层级
      break;
    }

    // 如果当前层级的 tab 不是激活状态，返回 false
    if (
      tabContent.getAttribute("data-tab-active") !== "true"
    ) {
      return false;
    }

    // 继续检查上一层的 tab 容器
    current = tabContent.parentElement;
  }

  return true;
};

/**
 * 刷新标题元素列表
 * 根据 headingSelector 从 DOM 中获取标题元素并更新 ScrollSpy
 * 过滤掉隐藏 Tab 中的标题（支持嵌套 tabs）
 */
const refreshHeadings = () => {
  const allHeadings = document.querySelectorAll(
    props.headingSelector
  );

  // 过滤掉隐藏 Tab 中的标题
  // 对于嵌套 tabs，需要检查所有层级的 data-tab-active 属性
  const visibleHeadings =
    Array.from(allHeadings).filter(isInActiveTab);

  // 更新可见标题 ID 列表（用于过滤 TOC 链接）
  visibleHeadingIds.value = new Set(
    visibleHeadings.map((el) => el.id).filter(Boolean)
  );

  updateHeadings(visibleHeadings);
};

/**
 * 将嵌套的目录链接扁平化为一维数组
 */
function flattenLinks(links: DocsTocLink[]): DocsTocLink[] {
  return links.flatMap((link) => [
    link,
    ...(link.children
      ? flattenLinks(link.children as DocsTocLink[])
      : []),
  ]);
}

/**
 * 递归过滤链接，只保留可见标题
 * 如果 visibleHeadingIds 为 null（未初始化），显示所有链接
 */
function filterLinks(links: DocsTocLink[]): DocsTocLink[] {
  // 未初始化时显示所有链接
  if (visibleHeadingIds.value === null) {
    return links;
  }

  const visibleIds = visibleHeadingIds.value;

  return links
    .map((link) => {
      // 递归处理子链接
      const filteredChildren = link.children
        ? filterLinks(link.children as DocsTocLink[])
        : [];

      // 如果当前链接可见，或者有可见的子链接，保留它
      const isVisible = visibleIds.has(link.id);
      const hasVisibleChildren =
        filteredChildren.length > 0;

      if (isVisible || hasVisibleChildren) {
        return {
          ...link,
          children:
            filteredChildren.length > 0
              ? filteredChildren
              : undefined,
        };
      }
      return null;
    })
    .filter(Boolean) as DocsTocLink[];
}

/**
 * 点击目录链接时滚动到对应标题
 */
function scrollToHeading(id: string) {
  scrollToElement(id);
  // 使用 router.replace 更新 hash，保持 Vue Router 状态同步
  // 由于 page 的 watch 只监听 route.path，不会触发重复滚动
  router.replace({ hash: `#${encodeURIComponent(id)}` });
  emit("move", id);
}

/**
 * 移动端点击目录链接：关闭抽屉并滚动
 */
function handleMobileScrollTo(id: string) {
  isOpen.value = false;
  scrollToHeading(id);
}

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * 目录标题：优先使用 prop，否则使用 i18n 翻译
 */
const tocTitle = computed(
  () => props.title ?? t("toc.title")
);

/**
 * 过滤后的链接列表（只显示可见标题）
 */
const filteredLinks = computed(() => {
  return filterLinks(props.links || []);
});

/**
 * 计算活动指示器的样式（位置和大小）
 */
const indicatorStyle = computed(() => {
  if (!activeHeadings.value?.length) {
    return;
  }

  const flatLinks = flattenLinks(filteredLinks.value || []);
  const activeIndex = flatLinks.findIndex((link) =>
    activeHeadings.value.includes(link.id)
  );

  return {
    "--indicator-size": `${TOC_LINK_HEIGHT * activeHeadings.value.length + TOC_LINK_GAP * (activeHeadings.value.length - 1)}px`,
    "--indicator-position":
      activeIndex >= 0
        ? `${activeIndex * (TOC_LINK_HEIGHT + TOC_LINK_GAP)}px`
        : "0px",
  };
});

/**
 * 指示器的 class 和 style 绑定
 * 抽取为计算属性，减少模板中的重复代码
 */
const indicatorBindings = computed(() => ({
  class: [
    "absolute left-0 w-0.5 rounded-full transition-all duration-200",
    `bg-${props.highlightColor}`,
  ].join(" "),
  style: {
    height: indicatorStyle.value?.["--indicator-size"],
    top: indicatorStyle.value?.["--indicator-position"],
    marginLeft: "-1px",
  },
}));

// ============================================================================
// Lifecycle & Watchers
// ============================================================================

/**
 * 页面加载完成后使用 headingSelector 获取标题元素
 * 只在客户端执行，避免 SSR hydration 问题
 *
 * 重要：所有 hook 注册都需要在 onUnmounted 时取消，避免内存泄漏
 */
if (import.meta.client) {
  // 注册 hooks 并保存 unregister 函数
  const unregisterPageLoadingEnd = nuxtApp.hooks.hook(
    "page:loading:end",
    refreshHeadings
  );
  const unregisterPageTransitionFinish = nuxtApp.hooks.hook(
    "page:transition:finish",
    refreshHeadings
  );

  // 监听 Tab 切换，刷新标题列表（过滤隐藏 Tab 中的标题）
  const unregisterTabsChange = nuxtApp.hooks.hook(
    // @ts-expect-error content:tabs-change 是自定义 hook，Nuxt 类型定义中不存在
    "content:tabs-change",
    refreshHeadings
  );

  // 监听 headingSelector 变化，重新获取标题元素
  watch(() => props.headingSelector, refreshHeadings);

  // 监听 links 变化（语言切换时 page.body.toc.links 会变化）
  // 等待 ContentRenderer 完成 DOM 渲染后再刷新标题
  watch(
    () => props.links,
    () => {
      // 使用 setTimeout 确保 ContentRenderer 完全渲染完成
      // nextTick 只等待一个 tick，可能不够
      setTimeout(() => {
        refreshHeadings();
      }, 100);
    },
    { deep: true }
  );

  // 组件卸载时取消所有 hook 注册，防止内存泄漏
  onUnmounted(() => {
    unregisterPageLoadingEnd();
    unregisterPageTransitionFinish();
    unregisterTabsChange();
  });
}
</script>

<template>
  <component
    :is="as"
    v-if="filteredLinks?.length">
    <!-- 移动端：浮动按钮 + 侧边抽屉 -->
    <div class="lg:hidden">
      <!-- 浮动按钮 -->
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-book"
        class="fixed right-6 top-20 z-50 shadow-lg"
        :aria-label="tocTitle"
        @click="isOpen = true" />

      <!-- 侧边抽屉 -->
      <USlideover
        v-model:open="isOpen"
        :title="tocTitle"
        side="right"
        class="w-80">
        <template #body>
          <div
            class="relative border-l border-default pl-4">
            <!-- 活动指示器 -->
            <div
              v-if="highlight"
              v-bind="indicatorBindings" />

            <!-- 递归渲染目录链接 -->
            <DocsTocList
              :links="filteredLinks"
              :level="0"
              :active-headings="activeHeadings"
              :color="color"
              @scroll-to="handleMobileScrollTo" />
          </div>
        </template>
      </USlideover>
    </div>

    <!-- 桌面端：始终显示 -->
    <div
      class="hidden lg:block sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <!-- 标题 -->
      <p
        class="text-sm font-semibold text-highlighted mb-3">
        {{ tocTitle }}
      </p>

      <div class="relative border-l border-default pl-4">
        <!-- 活动指示器 -->
        <div
          v-if="highlight"
          v-bind="indicatorBindings" />

        <!-- 递归渲染目录链接 -->
        <DocsTocList
          :links="filteredLinks"
          :level="0"
          :active-headings="activeHeadings"
          :color="color"
          @scroll-to="scrollToHeading" />
      </div>
    </div>
  </component>
</template>
