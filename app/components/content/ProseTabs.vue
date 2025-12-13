<script setup lang="ts">
/**
 * ProseTabs 组件
 * 基于 Reka UI 封装的 Tabs 组件，用于 MDC 文档
 *
 * 特点：
 * - 直接使用 Reka UI 的 Tabs 组件
 * - 支持 sync 属性实现 localStorage 同步
 * - Tabs 头部支持横向滚动，并提供左右滚动按钮（tabs 过多/label 过长时更易用）
 * - Tab 切换后自动滚动到当前激活项，避免“激活项在视窗外”
 * - Tab label 默认截断显示（避免极长 label 撑爆布局），完整文本可通过 title 查看
 * - 使用 data-tab-active 属性标记激活状态，配合 DocsToc 过滤标题
 * - Tab 切换时触发 content:tabs-change hook 通知 TOC 刷新
 *
 * @example MDC 用法
 * ```mdc
 * ::tabs{variant="pill" sync="package-manager"}
 *
 * :::tabs-item{label="pnpm" icon="i-simple-icons-pnpm"}
 * pnpm 的内容
 * :::
 *
 * :::tabs-item{label="npm" icon="i-simple-icons-npm"}
 * npm 的内容
 * :::
 *
 * ::
 * ```
 *
 * @see https://reka-ui.com/docs/components/tabs
 */
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUpdate,
  onUnmounted,
  type ComponentPublicInstance,
  type VNode,
} from "vue";
import {
  TabsRoot,
  TabsList,
  TabsIndicator,
  TabsTrigger,
  TabsContent,
} from "reka-ui";

// ============================================================================
// Types
// ============================================================================

export type TabsVariant =
  | "pill"
  | "link"
  | "underline"
  | "segment";

export interface ProseTabsProps {
  /** 默认选中的 Tab（索引字符串，如 '0', '1'） */
  defaultValue?: string;
  /** 与 localStorage 同步的键名 */
  sync?: string;
  /** 切换时滚动到的锚点 */
  hash?: string;
  /**
   * 变体样式
   * - pill: 药丸形状，有背景色指示器（默认）
   * - link: 底部线条指示器
   * - underline: 下划线指示器（无背景）
   * - segment: 分段控制器风格
   * @defaultValue 'pill'
   */
  variant?: TabsVariant;
  /** 自定义 class */
  class?: string;
}

interface TabItemData {
  index: number;
  value: string;
  label: string;
  icon?: string;
  /** 内容 VNode */
  component: VNode;
}

// ============================================================================
// Props & Slots
// ============================================================================

const props = withDefaults(defineProps<ProseTabsProps>(), {
  defaultValue: "0",
  sync: undefined,
  hash: undefined,
  variant: "pill",
  class: undefined,
});

const slots = defineSlots<{
  /** Tab 项列表（ProseTabsItem 组件） */
  default(): VNode[];
}>();

// ============================================================================
// Composables
// ============================================================================

const nuxtApp = useNuxtApp();

// ============================================================================
// Reactive State
// ============================================================================

/**
 * 强制 items computed 在组件更新时重新计算
 *
 * Vue 的 computed 默认只在响应式依赖变化时重新计算，
 * 但 slots.default() 不是响应式的，导致动态 slot 变化时不会更新。
 * 通过在 onBeforeUpdate 中递增此值，强制 computed 重新执行。
 */
const rerenderCount = ref(1);

// 当前激活的 Tab 值
const model = ref<string>(props.defaultValue);

// TabsList DOM 引用（用于横向滚动与溢出检测）
const tabsListRef = ref<HTMLElement | null>(null);

// 是否可向左/右滚动（用于显示左右按钮）
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

/**
 * 兼容 Reka UI 组件 ref：ref 指向组件实例时，通过 $el 拿到真实 DOM
 */
const setTabsListRef = (
  instance: ComponentPublicInstance | Element | null
) => {
  if (!instance) {
    tabsListRef.value = null;
    return;
  }

  if (instance instanceof HTMLElement) {
    tabsListRef.value = instance;
    return;
  }

  // Vue component instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabsListRef.value = (instance as any)
    .$el as HTMLElement | null;
};

// ============================================================================
// Constants
// ============================================================================

/** hash 滚动延迟（毫秒），等待 Tab 内容切换动画完成 */
const HASH_SCROLL_DELAY = 200;

/** 左右渐变遮罩预留（像素），用于判断 active tab 是否“足够可见” */
const SCROLL_SAFE_PADDING = 40;

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * 扁平化 slots，处理 Fragment 类型
 * Fragment 是 Vue 内部用于包装多个子节点的符号类型
 */
const flattenSlots = (vnodes: VNode[]): VNode[] => {
  return vnodes.flatMap((slot) =>
    typeof slot.type === "symbol"
      ? (slot.children as VNode[]) || []
      : slot
  );
};

/**
 * 从 slots 中提取 TabItem 数据
 * 先扁平化处理 Fragment，再用正确的全局索引
 */
const items = computed<TabItemData[]>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  rerenderCount.value; // 触发响应式依赖，见上方注释

  const flatSlots = flattenSlots(slots.default?.() || []);
  return flatSlots.map((slot, index) => ({
    index,
    value: String(index),
    label:
      (slot.props?.label as string) || `Tab ${index + 1}`,
    icon: slot.props?.icon as string | undefined,
    component: slot,
  }));
});

// ============================================================================
// Methods
// ============================================================================

/**
 * 检查 TabsList 的滚动位置，决定是否显示左右滚动按钮
 */
const checkScrollPosition = () => {
  const container = tabsListRef.value;
  if (!container) return;

  const { scrollLeft, scrollWidth, clientWidth } =
    container;
  canScrollLeft.value = scrollLeft > 1;
  canScrollRight.value =
    scrollLeft < scrollWidth - clientWidth - 1;
};

/**
 * 左右滚动 TabsList
 */
const scrollTabs = (direction: "left" | "right") => {
  const container = tabsListRef.value;
  if (!container) return;

  const scrollAmount = container.clientWidth * 0.6;
  container.scrollBy({
    left:
      direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });
};

/**
 * 将当前激活的 Tab 自动滚动到可视区域（尽量居中）
 */
const scrollToActiveTab = () => {
  const container = tabsListRef.value;
  if (!container) return;

  const activeElement =
    container.querySelector<HTMLElement>(
      '[data-state="active"]'
    );
  if (!activeElement) return;

  const containerRect = container.getBoundingClientRect();
  const activeRect = activeElement.getBoundingClientRect();

  const isVisible =
    activeRect.left >=
      containerRect.left + SCROLL_SAFE_PADDING &&
    activeRect.right <=
      containerRect.right - SCROLL_SAFE_PADDING;

  if (isVisible) return;

  const left =
    activeRect.left -
    containerRect.left +
    container.scrollLeft;
  const scrollTo =
    left - container.clientWidth / 2 + activeRect.width / 2;

  container.scrollTo({
    left: scrollTo,
    behavior: "smooth",
  });
};

/**
 * TabsList scroll / window resize 监听函数（需在 setup 顶层定义，确保可移除）
 */
const handleTabsListScroll = () => {
  checkScrollPosition();
};

const handleWindowResize = () => {
  checkScrollPosition();
  scrollToActiveTab();
};

/**
 * Tab 切换处理
 * - 更新 model
 * - 触发 content:tabs-change hook 通知 DocsToc 刷新
 * - 处理 hash 滚动
 */
const handleTabChange = (value: string) => {
  model.value = value;

  // 通知 DocsToc 刷新标题列表
  nextTick(() => {
    // @ts-expect-error content:tabs-change 是自定义 hook
    nuxtApp.callHook("content:tabs-change");

    // Tab 切换后将激活项滚动到可视区域
    checkScrollPosition();
    scrollToActiveTab();
  });

  // 处理 hash 滚动
  if (props.hash) {
    const hash = props.hash.startsWith("#")
      ? props.hash
      : `#${props.hash}`;
    setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView();
    }, HASH_SCROLL_DELAY);
  }
};

// ============================================================================
// Lifecycle & Watchers
// ============================================================================

/**
 * localStorage 同步功能
 */
onMounted(() => {
  if (props.sync && import.meta.client) {
    const syncKey = `tabs-${props.sync}`;
    const savedValue = localStorage.getItem(syncKey);

    // 从 localStorage 恢复值
    if (savedValue) {
      model.value = savedValue;
      // 初始化时也需要通知 TOC
      nextTick(() => {
        // @ts-expect-error content:tabs-change 是自定义 hook
        nuxtApp.callHook("content:tabs-change");
        checkScrollPosition();
        scrollToActiveTab();
      });
    }

    // 监听变化并保存到 localStorage
    watch(model, (newValue) => {
      if (newValue) {
        localStorage.setItem(syncKey, newValue);
      }
    });
  }
});

onMounted(() => {
  if (!import.meta.client) return;

  // 初次渲染后检查溢出状态
  nextTick(() => {
    checkScrollPosition();
    scrollToActiveTab();
  });

  const container = tabsListRef.value;
  if (!container) return;

  // 滚动时更新左右按钮显示状态
  container.addEventListener(
    "scroll",
    handleTabsListScroll,
    {
      passive: true,
    }
  );

  // resize 时也需要重新判断溢出，同时保证 active tab 可见
  window.addEventListener("resize", handleWindowResize, {
    passive: true,
  });
});

onUnmounted(() => {
  if (!import.meta.client) return;

  const container = tabsListRef.value;
  if (container) {
    container.removeEventListener(
      "scroll",
      handleTabsListScroll
    );
  }

  window.removeEventListener("resize", handleWindowResize);
});

onBeforeUpdate(() => rerenderCount.value++);

// ============================================================================
// Styles
// ============================================================================

const isScrollable = computed(
  () => canScrollLeft.value || canScrollRight.value
);

const triggerFlexClass = computed(() => {
  // pill / segment 以前是等分（grow），但在可滚动场景会导致挤压
  if (
    props.variant === "pill" ||
    props.variant === "segment"
  ) {
    return isScrollable.value ? "shrink-0" : "grow";
  }

  // 其他变体默认不等分，避免 label 过长时换行/挤压
  return "shrink-0";
});

// 基础样式（所有变体共用）
const baseStyles = {
  root: "flex flex-col items-start gap-2 my-5",
  list: [
    "relative flex items-center gap-1 sm:gap-2",
    "overflow-x-auto scroll-smooth",
    "min-w-0 w-full",
    // 隐藏滚动条（跨浏览器）
    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    // 给左右按钮与渐变遮罩预留空间
    "px-0.5 sm:px-1",
  ].join(" "),
  trigger: [
    "group relative inline-flex items-center justify-center gap-1.5 min-w-0",
    "text-sm font-medium",
    "whitespace-nowrap select-text",
    "data-[state=inactive]:text-(--ui-text-muted)",
    "hover:data-[state=inactive]:not-disabled:text-(--ui-text) hover:data-[state=inactive]:not-disabled:cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-75",
    "transition-colors",
  ],
  triggerIcon: "shrink-0 size-4",
  // 注意：truncate 需要 block/inline-block 才能正确生效
  triggerLabel: "max-w-[10rem] sm:max-w-[14rem]",
  content: "focus:outline-none w-full",
};

// 变体样式配置
const variantStyles: Record<
  TabsVariant,
  {
    list: string;
    indicator: string;
    trigger: string;
  }
> = {
  // 药丸形状：有背景色容器和白色指示器
  pill: {
    list: "p-1 bg-elevated rounded-lg",
    indicator: [
      "absolute transition-[translate,width] duration-200",
      "inset-y-1 left-0",
      "w-(--reka-tabs-indicator-size)",
      "translate-x-(--reka-tabs-indicator-position)",
      "bg-(--ui-bg) rounded-md shadow-xs",
    ].join(" "),
    trigger: [
      "px-3 py-1.5 rounded-md",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    ].join(" "),
  },

  // 底部线条：下划线指示器
  link: {
    list: "border-b border-default -mb-px",
    indicator: [
      "absolute transition-[translate,width] duration-200",
      "-bottom-px left-0 h-0.5",
      "w-(--reka-tabs-indicator-size)",
      "translate-x-(--reka-tabs-indicator-position)",
      "bg-(--ui-primary) rounded-full",
    ].join(" "),
    trigger: [
      "px-3 py-2",
      "data-[state=active]:text-(--ui-primary)",
      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--ui-primary)",
    ].join(" "),
  },

  // 下划线：简洁的下划线样式（无容器背景）
  underline: {
    list: "gap-1",
    indicator: [
      "absolute transition-[translate,width] duration-200",
      "-bottom-px left-0 h-0.5",
      "w-(--reka-tabs-indicator-size)",
      "translate-x-(--reka-tabs-indicator-position)",
      "bg-(--ui-primary)",
    ].join(" "),
    trigger: [
      "px-3 py-2 border-b-2 border-transparent -mb-px",
      "data-[state=active]:text-(--ui-primary)",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    ].join(" "),
  },

  // 分段控制器：iOS 风格
  segment: {
    list: [
      "p-0.5",
      "bg-(--ui-bg-elevated) rounded-lg",
      "border border-(--ui-border)",
    ].join(" "),
    indicator: [
      "absolute transition-[translate,width] duration-200",
      "inset-y-0.5 left-0",
      "w-(--reka-tabs-indicator-size)",
      "translate-x-(--reka-tabs-indicator-position)",
      "bg-(--ui-bg) rounded-md shadow-sm",
      "border border-(--ui-border-accented)",
    ].join(" "),
    trigger: [
      "px-4 py-1.5 rounded-md z-10",
      "data-[state=active]:text-(--ui-text-highlighted)",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    ].join(" "),
  },
};

const styles = computed(() => {
  const variant = variantStyles[props.variant];
  return {
    root: baseStyles.root,
    list: [baseStyles.list, variant.list].join(" "),
    indicator: variant.indicator,
    trigger: [
      ...baseStyles.trigger,
      triggerFlexClass.value,
      variant.trigger,
    ].join(" "),
    triggerIcon: baseStyles.triggerIcon,
    triggerLabel: baseStyles.triggerLabel,
    content: baseStyles.content,
  };
});
</script>

<template>
  <TabsRoot
    :model-value="model"
    :default-value="defaultValue"
    :unmount-on-hide="false"
    :class="[styles.root, props.class]"
    @update:model-value="handleTabChange">
    <div class="relative w-full">
      <!-- Left scroll button -->
      <div
        class="absolute left-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200"
        :class="
          canScrollLeft
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        ">
        <div
          class="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-default to-transparent pointer-events-none" />
        <UButton
          variant="link"
          color="neutral"
          aria-label="向左滚动 Tabs"
          icon="i-lucide-chevron-left"
          @click="scrollTabs('left')" />
      </div>

      <!-- Tabs container (scrollable) -->
      <TabsList
        :ref="setTabsListRef"
        :class="styles.list">
        <TabsIndicator :class="styles.indicator" />

        <TabsTrigger
          v-for="item in items"
          :key="item.index"
          :value="item.value"
          :class="styles.trigger">
          <UIcon
            v-if="item.icon"
            :name="item.icon"
            :class="styles.triggerIcon" />
          <span
            :class="styles.triggerLabel"
            :title="item.label">
            {{ item.label }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Right scroll button -->
      <div
        class="absolute right-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200"
        :class="
          canScrollRight
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        ">
        <div
          class="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-default to-transparent pointer-events-none" />
        <UButton
          variant="ghost"
          color="neutral"
          aria-label="向右滚动 Tabs"
          icon="i-lucide-chevron-right"
          @click="scrollTabs('right')" />
      </div>
    </div>

    <!-- 
      使用 data-tab-active 属性标记当前激活状态
      DocsToc 会根据此属性过滤隐藏 Tab 中的标题
    -->
    <TabsContent
      v-for="item in items"
      :key="item.index"
      :value="item.value"
      :class="styles.content"
      :data-tab-active="model === item.value">
      <component :is="item.component" />
    </TabsContent>
  </TabsRoot>
</template>
