<script setup lang="ts">
/**
 * ProseCarouselTriggerNumbers
 * Carousel 的 Numbers Trigger（内部组件）。
 *
 * 注意：通常你只需要在 MDC 里使用 `::prose-carousel{variant="numbers"}`，
 * 不需要直接使用本组件。这里给出最小示例便于排障/调试。
 *
 * @example MDC（不推荐，仅排障）
 * ```mdc
 * ::prose-carousel-trigger-numbers
 * ---
 * activeIndex: 0
 * total: 5
 * format: "01"
 * maxVisible: 4
 * ---
 * ::
 * ```
 */
export interface ProseCarouselTriggerNumbersProps {
  activeIndex: number;
  total: number;
  format?: "1" | "01" | "roman";
  maxVisible?: number;
}

const props = withDefaults(
  defineProps<ProseCarouselTriggerNumbersProps>(),
  {
    format: "1",
    maxVisible: undefined,
  }
);

const emit = defineEmits<{
  select: [index: number];
}>();

const toRoman = (num: number) => {
  if (num <= 0) return "";
  const map: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let n = num;
  let out = "";
  for (const [value, symbol] of map) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
};

const formatLabel = (index: number) => {
  const value = index + 1;
  if (props.format === "roman") return toRoman(value);
  if (props.format === "01")
    return String(value).padStart(2, "0");
  return String(value);
};

type DisplayToken =
  | { type: "number"; index: number }
  | { type: "ellipsis"; key: string };

const tokens = computed<DisplayToken[]>(() => {
  const maxVisible = props.maxVisible;
  const total = props.total;
  if (
    !maxVisible ||
    maxVisible <= 0 ||
    maxVisible >= total
  ) {
    return Array.from({ length: total }).map((_, i) => ({
      type: "number" as const,
      index: i,
    }));
  }

  const windowSize = Math.max(3, maxVisible);
  const current = props.activeIndex;
  const half = Math.floor(windowSize / 2);

  let start = current - half;
  let end = current + half;

  if (start < 0) {
    start = 0;
    end = windowSize - 1;
  }
  if (end > total - 1) {
    end = total - 1;
    start = Math.max(0, total - windowSize);
  }

  const result: DisplayToken[] = [];

  const pushNumber = (i: number) => {
    result.push({ type: "number", index: i });
  };

  // first
  pushNumber(0);

  if (start > 1) {
    result.push({ type: "ellipsis", key: "left" });
  }

  for (
    let i = Math.max(1, start);
    i <= Math.min(total - 2, end);
    i++
  ) {
    pushNumber(i);
  }

  if (end < total - 2) {
    result.push({ type: "ellipsis", key: "right" });
  }

  // last
  if (total > 1) pushNumber(total - 1);

  // 去重（防止 window 覆盖到首尾导致重复）
  const seen = new Set<number>();
  return result.filter((t) => {
    if (t.type === "ellipsis") return true;
    if (seen.has(t.index)) return false;
    seen.add(t.index);
    return true;
  });
});

const handleSelect = (index: number) => {
  if (index === props.activeIndex) return;
  emit("select", index);
};

const styles = {
  root: "flex items-center justify-center gap-1 overflow-x-auto py-1",
  ellipsis:
    "px-2 text-sm text-muted-foreground select-none",
  buttonBase:
    "min-w-9 h-9 px-3 rounded-md text-sm font-medium tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  buttonActive: "bg-primary text-primary-foreground",
  buttonIdle:
    "bg-muted hover:bg-muted-foreground/20 text-foreground",
};
</script>

<template>
  <div :class="styles.root">
    <template
      v-for="token in tokens"
      :key="
        token.type === 'ellipsis' ? token.key : token.index
      ">
      <span
        v-if="token.type === 'ellipsis'"
        :class="styles.ellipsis"
        aria-hidden="true">
        …
      </span>
      <button
        v-else
        type="button"
        :class="[
          styles.buttonBase,
          activeIndex === token.index
            ? styles.buttonActive
            : styles.buttonIdle,
        ]"
        :aria-label="`Go to slide ${token.index + 1}`"
        :aria-current="
          activeIndex === token.index ? 'true' : 'false'
        "
        @click="handleSelect(token.index)">
        {{ formatLabel(token.index) }}
      </button>
    </template>
  </div>
</template>
