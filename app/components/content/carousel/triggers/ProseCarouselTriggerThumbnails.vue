<script setup lang="ts">
// ============================================================================
// Types
// ============================================================================

type ThumbnailsItem = {
  src: string;
  alt?: string;
  disabled?: boolean;
};

export interface ProseCarouselTriggerThumbnailsProps {
  items: ThumbnailsItem[];
  activeIndex: number;
  size?: "sm" | "md" | "lg";
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(
  defineProps<ProseCarouselTriggerThumbnailsProps>(),
  {
    size: "md",
  }
);

const emit = defineEmits<{
  select: [index: number];
}>();

// ============================================================================
// Computed Properties
// ============================================================================

const sizeClasses = computed(() => {
  const map: Record<
    NonNullable<typeof props.size>,
    string
  > = {
    sm: "size-10",
    md: "size-12",
    lg: "size-14",
  };
  return map[props.size];
});

// ============================================================================
// Methods
// ============================================================================

const handleSelect = (index: number) => {
  const item = props.items[index];
  if (!item) return;
  if (item.disabled) return;
  if (index === props.activeIndex) return;
  emit("select", index);
};

// ============================================================================
// Styles
// ============================================================================

const styles = {
  root: "flex items-center gap-2 overflow-x-auto py-1",
  buttonBase:
    "shrink-0 rounded-lg overflow-hidden transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  buttonDisabled: "opacity-40 cursor-not-allowed",
  buttonEnabled: "hover:opacity-100",
  buttonActive: "ring-2 ring-foreground",
  buttonIdle: "opacity-70",
  img: "h-full w-full object-cover",
  placeholder:
    "h-full w-full bg-muted flex items-center justify-center",
  placeholderText:
    "text-xs text-muted-foreground tabular-nums",
};
</script>

<template>
  <div :class="styles.root">
    <button
      v-for="(item, index) in items"
      :key="index"
      type="button"
      :class="[
        styles.buttonBase,
        sizeClasses,
        item.disabled
          ? styles.buttonDisabled
          : styles.buttonEnabled,
        activeIndex === index
          ? styles.buttonActive
          : styles.buttonIdle,
      ]"
      :disabled="item.disabled"
      :aria-label="`Go to slide ${index + 1}`"
      :aria-current="
        activeIndex === index ? 'true' : 'false'
      "
      @click="handleSelect(index)">
      <NuxtImg
        v-if="item.src"
        :src="item.src"
        :alt="item.alt || `Thumbnail ${index + 1}`"
        :class="styles.img" />
      <div
        v-else
        :class="styles.placeholder">
        <span :class="styles.placeholderText">{{
          index + 1
        }}</span>
      </div>
    </button>
  </div>
</template>
