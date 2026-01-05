<script setup lang="ts">
/**
 * ProseAccordion 组件
 * 基于 Reka UI 封装的 Accordion 组件，用于 MDC 文档
 *
 * 特点：
 * - 直接使用 Reka UI 的 Accordion 组件
 * - 支持子组件通过 #label 和 #content slot 定义内容
 * - 可选的步骤编号功能
 *
 * @see https://reka-ui.com/docs/components/accordion
 */
import {
  computed,
  ref,
  onBeforeUpdate,
  type VNode,
} from "vue";
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from "reka-ui";
import type { BadgeProps } from "@nuxt/ui";

export interface ProseAccordionProps {
  /** Accordion 类型：single 或 multiple */
  type?: "single" | "multiple";
  /** 默认展开的项（数组形式，如 ['0', '1']） */
  defaultValue?: string[];
  /** 是否可收起（仅 single 模式有效） */
  collapsible?: boolean;
  /** 是否显示编号 */
  numbered?: boolean;
  /** 自定义 class */
  class?: string;
}

/** Badge 配置，复用 Nuxt UI BadgeProps 类型 */
export interface BadgeConfig {
  label: string;
  color?: BadgeProps["color"];
  variant?: BadgeProps["variant"];
}

interface AccordionItemData {
  index: number;
  value: string;
  /** 前置图标 */
  icon?: string;
  /** 自定义 trailing icon */
  trailingIcon?: string;
  /** 标准化后的 badges（预计算，避免模板中重复调用） */
  normalizedBadges: BadgeConfig[];
  /** label slot 内容（VNode 数组） */
  labelSlot: VNode[] | null;
  /** content slot 内容（VNode 数组） */
  contentSlot: VNode[] | null;
}

const props = withDefaults(
  defineProps<ProseAccordionProps>(),
  {
    type: "multiple",
    defaultValue: undefined,
    collapsible: true,
    numbered: false,
    class: undefined,
  }
);

const slots = defineSlots<{
  default(): VNode[];
}>();

const { t } = useI18n();
const rerenderCount = ref(1);

/**
 * 从 VNode 的 children 中提取指定 slot 的内容
 */
const extractSlotContent = (
  children: unknown,
  slotName: string
): VNode[] | null => {
  if (!children || typeof children !== "object")
    return null;

  // children 可能是对象形式的 slots
  if (!Array.isArray(children)) {
    const childrenObj = children as Record<
      string,
      () => VNode[]
    >;
    if (typeof childrenObj[slotName] === "function") {
      return childrenObj[slotName]();
    }
    return null;
  }

  return null;
};

/**
 * 标准化 badges 数据
 * - 支持单个 badge（字符串）
 * - 支持多个 badges（数组）
 */
const normalizeBadges = (
  badge?: string,
  badges?: BadgeConfig[]
): BadgeConfig[] => {
  const result: BadgeConfig[] = [];

  // 处理 badges 数组
  if (badges?.length) {
    result.push(...badges);
  }

  // 处理单个 badge
  if (badge) {
    result.push({ label: badge });
  }

  return result;
};

/**
 * 从 slot 中提取 AccordionItem 数据
 */
const transformSlot = (
  slot: VNode,
  index: number
): AccordionItemData | AccordionItemData[] | undefined => {
  // 处理 Fragment 类型
  if (typeof slot.type === "symbol") {
    return (slot.children as VNode[])?.map(
      transformSlot
    ) as AccordionItemData[];
  }

  // 提取 #label 和 #content slot 内容
  const labelSlot = extractSlotContent(
    slot.children,
    "label"
  );
  const contentSlot = extractSlotContent(
    slot.children,
    "content"
  );

  // 提取 props
  const badge = slot.props?.badge as string | undefined;
  const badges = slot.props?.badges as
    | BadgeConfig[]
    | undefined;

  return {
    index,
    value: String(index),
    icon: slot.props?.icon as string | undefined,
    trailingIcon: slot.props?.trailingIcon as
      | string
      | undefined,
    // 预计算 badges，避免模板中重复调用
    normalizedBadges: normalizeBadges(badge, badges),
    labelSlot,
    contentSlot,
  };
};

const items = computed<AccordionItemData[]>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  rerenderCount.value;
  return (
    (slots
      .default?.()
      ?.flatMap(transformSlot)
      .filter(Boolean) as AccordionItemData[]) || []
  );
});

/**
 * 计算默认展开值
 * - multiple 模式：默认全部展开
 * - single 模式：默认展开第一项
 */
const computedDefaultValue = computed(() => {
  if (props.defaultValue) return props.defaultValue;

  if (props.type === "multiple") {
    // multiple 模式默认全部展开
    return items.value.map((item) => item.value);
  }

  // single 模式默认展开第一项
  return items.value.length > 0
    ? (items.value[0]?.value ?? undefined)
    : undefined;
});

onBeforeUpdate(() => rerenderCount.value++);

// ============================================================================
// Styles
// ============================================================================
const styles = computed(() => ({
  // 容器样式
  root: [
    "w-full my-5",
    // 卡片式布局：每个 item 有间距
    "space-y-3",
    props.numbered &&
      "ms-4 border-s border-(--ui-border) ps-8 [counter-reset:step]",
  ]
    .filter(Boolean)
    .join(" "),

  // 每个 item - 卡片风格
  item: [
    "relative group/item",
    // 卡片样式：圆角、边框、背景
    "rounded-xl border bg-(--ui-bg)",
    "transition-all duration-300",
    // 收起状态：默认边框
    "border-(--ui-border)",
    // 收起状态 hover：边框变亮 + 阴影
    "hover:border-(--ui-primary)/20 hover:shadow-md",
    // 展开状态：primary 边框 + ring + 阴影
    "data-[state=open]:border-(--ui-primary)/30",
    "data-[state=open]:shadow-lg",
    "data-[state=open]:shadow-(--ui-primary)/5",
    "data-[state=open]:ring-1",
    "data-[state=open]:ring-(--ui-primary)/10",
    props.numbered && "[counter-increment:step]",
    // 圆形编号（通过伪元素）
    props.numbered &&
      [
        "before:absolute",
        "before:size-7",
        "before:bg-(--ui-bg-elevated)",
        "before:rounded-full",
        "before:font-semibold",
        "before:text-sm",
        "before:tabular-nums",
        "before:inline-flex",
        "before:items-center",
        "before:justify-center",
        "before:ring-4",
        "before:ring-(--ui-bg)",
        "before:-ms-[48.5px]",
        "before:mt-3.5",
        "before:content-[counter(step)]",
      ].join(" "),
  ]
    .filter(Boolean)
    .join(" "),

  header: "flex",

  trigger: [
    "group flex-1 flex items-center gap-2",
    "font-medium text-base p-4",
    "rounded-t-xl",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    "min-w-0 cursor-pointer",
    // 展开状态：文字变 primary
    "group-data-[state=open]/item:text-(--ui-primary)/90",
    // 收起状态 hover：文字变 primary
    "group-data-[state=closed]/item:hover:text-(--ui-primary)/70",
    "transition-all duration-300",
  ].join(" "),

  // Reka UI 使用 data-[state=open/closed] 属性
  content: [
    "overflow-hidden focus:outline-none",
    "data-[state=open]:animate-[accordion-down_200ms_ease-out]",
    "data-[state=closed]:animate-[accordion-up_200ms_ease-out]",
  ].join(" "),

  // 内容区域分隔线 + padding
  body: "mx-4 pt-3 pb-4 border-t border-(--ui-border)/50",

  // Leading icon：移动端 16px，桌面端 20px
  leadingIcon: "shrink-0 size-4 md:size-5",

  // Trailing icon：移动端 16px，桌面端 20px
  trailingIcon: [
    "shrink-0 size-4 md:size-5 ms-auto",
    "transition-transform duration-200",
    "group-data-[state=open]:rotate-180",
  ].join(" "),

  // Label 容器：flex 布局让标题和 badges 在同一行
  label: [
    "flex-1 min-w-0 text-start",
    // flex 布局 + flex-wrap，只有真正空间不够时才换行
    "flex flex-wrap items-baseline gap-x-2 gap-y-1",
  ].join(" "),

  // 单个 Badge 样式（作为独立 flex 子项）
  badge: "shrink-0",
}));
</script>

<template>
  <AccordionRoot
    :type="type"
    :default-value="computedDefaultValue"
    :collapsible="collapsible"
    :class="[styles.root, props.class]">
    <AccordionItem
      v-for="item in items"
      :key="item.index"
      :value="item.value"
      :class="styles.item">
      <AccordionHeader :class="styles.header">
        <AccordionTrigger :class="styles.trigger">
          <!-- Leading icon -->
          <UIcon
            v-if="item.icon"
            :name="item.icon"
            :class="styles.leadingIcon" />
          <!-- Label + Badges -->
          <span :class="[styles.label, 'accordion-label']">
            <template v-if="item.labelSlot">
              <component
                :is="node"
                v-for="(node, idx) in item.labelSlot"
                :key="idx" />
            </template>
            <template v-else>
              {{
                t("accordion.defaultItem", {
                  index: item.index + 1,
                })
              }}
            </template>
            <!-- Badges 作为独立 flex 子项，可以部分换行 -->
            <UBadge
              v-for="(badge, idx) in item.normalizedBadges"
              :key="`badge-${idx}`"
              :class="styles.badge"
              :color="badge.color ?? 'primary'"
              :variant="badge.variant ?? 'solid'"
              size="sm">
              {{ badge.label }}
            </UBadge>
          </span>
          <!-- Trailing icon -->
          <UIcon
            :name="
              item.trailingIcon || 'i-lucide-chevron-down'
            "
            :class="styles.trailingIcon" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent :class="styles.content">
        <div :class="styles.body">
          <template v-if="item.contentSlot">
            <component
              :is="node"
              v-for="(node, idx) in item.contentSlot"
              :key="idx" />
          </template>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<style scoped>
/* 重置 label slot 中标题的样式，让其在 flex 容器中正常显示 */
:deep(.accordion-label h1),
:deep(.accordion-label h2),
:deep(.accordion-label h3),
:deep(.accordion-label h4),
:deep(.accordion-label h5),
:deep(.accordion-label h6) {
  margin: 0 !important;
  /* flex 子项：允许缩小，过长时换行 */
  min-width: 0;
  word-break: break-word;
  hyphens: auto;
}

/* 隐藏 label 内 ProseHx 组件的 anchor link hash 图标 */
:deep(.accordion-label a > span:first-child) {
  display: none;
}

/* 重置 anchor link 的样式，让标题正常显示 */
:deep(.accordion-label a) {
  color: inherit;
  /* 禁用点击，避免标题 anchor link 导致页面跳转，
     因为 accordion 触发器已包裹整个标题区域 */
  pointer-events: none;
}
</style>
