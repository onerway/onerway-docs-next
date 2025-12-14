<script setup lang="ts">
/**
 * ProseCarouselTriggerTabs
 * Carousel 的 Tabs Trigger（内部组件）。
 *
 * 注意：通常你只需要在 MDC 里使用 `::prose-carousel{variant="tabs"}`，
 * 不需要直接使用本组件。这里给出最小示例便于排障/调试。
 *
 * @example MDC（不推荐，仅排障）
 * ```mdc
 * ::prose-carousel-trigger-tabs
 * ---
 * activeIndex: 0
 * orientation: vertical
 * items:
 *   - label: Tab 1
 *   - label: Tab 2
 * ---
 * ::
 * ```
 */
// ============================================================================
// Types
// ============================================================================

type TabsItem = {
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
};

export interface ProseCarouselTriggerTabsProps {
  items: TabsItem[];
  activeIndex: number;
  orientation?: "horizontal" | "vertical";
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(
  defineProps<ProseCarouselTriggerTabsProps>(),
  {
    orientation: "horizontal",
  }
);

const emit = defineEmits<{
  select: [index: number];
}>();

// ============================================================================
// Computed Properties
// ============================================================================

const modelValue = computed({
  get: () => props.activeIndex,
  set: (v: number | string) => {
    const idx = typeof v === "string" ? parseInt(v, 10) : v;
    if (!Number.isFinite(idx)) return;
    if (idx === props.activeIndex) return;
    emit("select", idx);
  },
});

const tabItems = computed(() =>
  props.items.map((item, index) => ({
    label: item.label,
    icon: item.icon,
    badge: item.badge,
    disabled: item.disabled,
    value: index,
  }))
);

// ============================================================================
// Styles
// ============================================================================

const styles = computed(() => ({
  root: [
    "max-w-full",
    props.orientation === "horizontal"
      ? "overflow-x-auto"
      : "h-full min-h-0 overflow-y-auto",
  ],
  ui: {
    root:
      props.orientation === "vertical"
        ? "h-full"
        : "flex-row",
    list: [
      "p-2",
      props.orientation === "horizontal"
        ? "min-w-max"
        : "h-full w-full items-stretch justify-around",
    ],
    trigger: [
      "cursor-pointer",
      props.orientation === "vertical"
        ? "w-full justify-start flex-none shrink-0 h-auto"
        : undefined,
    ],
  },
}));
</script>

<template>
  <div :class="styles.root">
    <UTabs
      v-model="modelValue"
      :items="tabItems"
      :content="false"
      :orientation="orientation"
      variant="pill"
      color="primary"
      :ui="styles.ui" />
  </div>
</template>
