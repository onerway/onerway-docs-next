<script setup lang="ts">
/**
 * ProseTabs 组件
 * 基于 Reka UI 封装的 Tabs 组件，用于 MDC 文档
 *
 * 特点：
 * - 直接使用 Reka UI 的 Tabs 组件
 * - 支持 sync 属性实现 localStorage 同步
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

// ============================================================================
// Constants
// ============================================================================

/** hash 滚动延迟（毫秒），等待 Tab 内容切换动画完成 */
const HASH_SCROLL_DELAY = 200;

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

onBeforeUpdate(() => rerenderCount.value++);

// ============================================================================
// Styles
// ============================================================================

// 基础样式（所有变体共用）
const baseStyles = {
  root: "flex flex-col items-start gap-2 my-5",
  trigger: [
    "group relative inline-flex items-center justify-center gap-1.5 min-w-0",
    "text-sm font-medium",
    "data-[state=inactive]:text-(--ui-text-muted)",
    "hover:data-[state=inactive]:not-disabled:text-(--ui-text)",
    "disabled:cursor-not-allowed disabled:opacity-75",
    "transition-colors",
  ],
  triggerIcon: "shrink-0 size-4",
  triggerLabel: "truncate",
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
    list: "relative flex p-1 bg-(--ui-bg-elevated) rounded-lg",
    indicator: [
      "absolute transition-[translate,width] duration-200",
      "inset-y-1 left-0",
      "w-(--reka-tabs-indicator-size)",
      "translate-x-(--reka-tabs-indicator-position)",
      "bg-(--ui-bg) rounded-md shadow-xs",
    ].join(" "),
    trigger: [
      "grow px-3 py-1.5 rounded-md",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    ].join(" "),
  },

  // 底部线条：下划线指示器
  link: {
    list: "relative flex border-b border-(--ui-border) -mb-px",
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
    list: "relative flex gap-1",
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
      "relative flex p-0.5",
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
      "grow px-4 py-1.5 rounded-md z-10",
      "data-[state=active]:text-(--ui-text-highlighted)",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    ].join(" "),
  },
};

const styles = computed(() => {
  const variant = variantStyles[props.variant];
  return {
    root: baseStyles.root,
    list: variant.list,
    indicator: variant.indicator,
    trigger: [...baseStyles.trigger, variant.trigger].join(
      " "
    ),
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
    <TabsList :class="styles.list">
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
        <span :class="styles.triggerLabel">
          {{ item.label }}
        </span>
      </TabsTrigger>
    </TabsList>

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
