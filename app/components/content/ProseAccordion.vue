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

interface AccordionItemData {
  index: number;
  value: string;
  /** 前置图标 */
  icon?: string;
  /** 自定义 trailing icon */
  trailingIcon?: string;
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

  return {
    index,
    value: String(index),
    icon: slot.props?.icon as string | undefined,
    trailingIcon: slot.props?.trailingIcon as
      | string
      | undefined,
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

// ========== 样式配置 ==========
const styles = computed(() => ({
  // 容器样式
  root: [
    "w-full my-5",
    props.numbered &&
      "ms-4 border-s border-(--ui-border) ps-8 [counter-reset:step]",
  ]
    .filter(Boolean)
    .join(" "),

  // 每个 item
  item: [
    "border-b border-(--ui-border) last:border-b-0",
    "relative group/item",
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
    "group flex-1 flex items-center gap-1.5",
    "font-medium text-base py-3.5",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ui-primary)",
    "min-w-0 cursor-pointer",
  ].join(" "),

  // Reka UI 使用 data-[state=open/closed] 属性
  content: [
    "overflow-hidden focus:outline-none",
    "data-[state=open]:animate-[accordion-down_200ms_ease-out]",
    "data-[state=closed]:animate-[accordion-up_200ms_ease-out]",
  ].join(" "),

  body: "text-sm pb-3.5",

  leadingIcon: "shrink-0 size-5",

  // Reka UI 使用 group-data-[state=open] 来检测展开状态
  trailingIcon: [
    "shrink-0 size-5 ms-auto",
    "transition-transform duration-200",
    "group-data-[state=open]:rotate-180",
  ].join(" "),

  // 标题 margin 通过 scoped CSS 重置，见底部 <style scoped>
  label: "flex-1 text-start break-words",
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
          <!-- Label slot content -->
          <span :class="[styles.label, 'accordion-label']">
            <template v-if="item.labelSlot">
              <component
                :is="node"
                v-for="(node, idx) in item.labelSlot"
                :key="idx" />
            </template>
            <template v-else>
              项目 {{ item.index + 1 }}
            </template>
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
/* 重置 label slot 中标题的 margin 样式 */
:deep(.accordion-label h1),
:deep(.accordion-label h2),
:deep(.accordion-label h3),
:deep(.accordion-label h4),
:deep(.accordion-label h5),
:deep(.accordion-label h6) {
  margin: 0 !important;
}
</style>
