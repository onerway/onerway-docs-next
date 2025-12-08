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
   * 活动指示器颜色
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

const props = withDefaults(defineProps<DocsTocProps>(), {
  as: "nav",
  title: undefined,
  color: "primary",
  highlight: false,
  highlightColor: "primary",
  headingSelector: "h2, h3, h4, h5",
  defaultOpen: false,
});

const { t } = useI18n();

// 计算标题：优先使用 prop，否则使用 i18n 翻译
const tocTitle = computed(
  () => props.title ?? t("toc.title")
);

// 移动端折叠状态
const isOpen = ref(props.defaultOpen);

const emit = defineEmits<{
  move: [id: string];
}>();

const nuxtApp = useNuxtApp();
const { activeHeadings, updateHeadings } = useScrollSpy();

/**
 * 刷新标题元素列表
 * 根据 headingSelector 从 DOM 中获取标题元素并更新 ScrollSpy
 */
const refreshHeadings = () => {
  const headings = Array.from(
    document.querySelectorAll(props.headingSelector)
  );
  updateHeadings(headings);
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

const router = useRouter();
const { scrollToElement } = useDocsScroll();

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

/**
 * 计算活动指示器的样式（位置和大小）
 */
const indicatorStyle = computed(() => {
  if (!activeHeadings.value?.length) {
    return;
  }

  const flatLinks = flattenLinks(props.links || []);
  const activeIndex = flatLinks.findIndex((link) =>
    activeHeadings.value.includes(link.id)
  );
  const linkHeight = 28;
  const gapSize = 0;

  return {
    "--indicator-size": `${linkHeight * activeHeadings.value.length + gapSize * (activeHeadings.value.length - 1)}px`,
    "--indicator-position":
      activeIndex >= 0
        ? `${activeIndex * (linkHeight + gapSize)}px`
        : "0px",
  };
});

/**
 * 页面加载完成后使用 headingSelector 获取标题元素
 * 只在客户端执行，避免 SSR hydration 问题
 */
if (import.meta.client) {
  nuxtApp.hooks.hook("page:loading:end", refreshHeadings);
  nuxtApp.hooks.hook(
    "page:transition:finish",
    refreshHeadings
  );

  // 监听 headingSelector 变化，重新获取标题元素
  watch(() => props.headingSelector, refreshHeadings);
}
</script>

<template>
  <component
    :is="as"
    v-if="links?.length">
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
              class="absolute left-0 w-0.5 bg-primary rounded-full transition-all duration-200"
              :style="{
                height:
                  indicatorStyle?.['--indicator-size'],
                top: indicatorStyle?.[
                  '--indicator-position'
                ],
                marginLeft: '-1px',
              }" />

            <!-- 递归渲染目录链接 -->
            <DocsTocList
              :links="links"
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
          class="absolute left-0 w-0.5 bg-primary rounded-full transition-all duration-200"
          :style="{
            height: indicatorStyle?.['--indicator-size'],
            top: indicatorStyle?.['--indicator-position'],
            marginLeft: '-1px',
          }" />

        <!-- 递归渲染目录链接 -->
        <DocsTocList
          :links="links"
          :level="0"
          :active-headings="activeHeadings"
          :color="color"
          @scroll-to="scrollToHeading" />
      </div>
    </div>
  </component>
</template>
