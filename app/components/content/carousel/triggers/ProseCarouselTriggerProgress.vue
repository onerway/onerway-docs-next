<script setup lang="ts">
export interface ProseCarouselTriggerProgressProps {
  activeIndex: number;
  total: number;
  showCounter?: boolean;
}

const props = withDefaults(
  defineProps<ProseCarouselTriggerProgressProps>(),
  {
    showCounter: false,
  }
);

const emit = defineEmits<{
  select: [index: number];
}>();

const handleSelect = (index: number) => {
  if (index === props.activeIndex) return;
  emit("select", index);
};

const currentLabel = computed(() =>
  String(props.activeIndex + 1).padStart(2, "0")
);
const totalLabel = computed(() =>
  String(props.total).padStart(2, "0")
);

const styles = {
  root: "space-y-3",
  dotsWrap: "flex items-center justify-center gap-2",
  dotButton:
    "group flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-1 py-1",
  barBase: "h-1 rounded-full transition-all",
  barActive: "w-10 bg-foreground",
  barIdle:
    "w-6 bg-muted group-hover:bg-muted-foreground/40",
  counter:
    "text-center text-sm tabular-nums text-muted-foreground",
  counterCurrent: "text-foreground",
};
</script>

<template>
  <div :class="styles.root">
    <UProgress
      :model-value="activeIndex + 1"
      :max="total"
      color="primary"
      size="sm"
      :get-value-label="
        (value, max) => `Slide ${value ?? 0} of ${max}`
      " />

    <div :class="styles.dotsWrap">
      <button
        v-for="index in total"
        :key="index"
        type="button"
        :class="styles.dotButton"
        :aria-label="`Go to slide ${index}`"
        :aria-current="
          activeIndex === index - 1 ? 'true' : 'false'
        "
        @click="handleSelect(index - 1)">
        <div
          :class="[
            styles.barBase,
            activeIndex === index - 1
              ? styles.barActive
              : styles.barIdle,
          ]" />
      </button>
    </div>

    <div
      v-if="showCounter"
      :class="styles.counter">
      <span :class="styles.counterCurrent">{{
        currentLabel
      }}</span>
      <span class="mx-1">/</span>
      <span>{{ totalLabel }}</span>
    </div>
  </div>
</template>
