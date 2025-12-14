<script setup lang="ts">
export interface ProseCarouselTriggerDotsProps {
  activeIndex: number;
  total: number;
}

const props = defineProps<ProseCarouselTriggerDotsProps>();

const emit = defineEmits<{
  select: [index: number];
}>();

const handleSelect = (index: number) => {
  if (index === props.activeIndex) return;
  emit("select", index);
};

const styles = {
  root: "flex items-center justify-center gap-2",
  buttonBase:
    "size-2.5 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  buttonActive: "bg-primary",
  buttonIdle: "bg-muted hover:bg-muted-foreground/40",
};
</script>

<template>
  <div :class="styles.root">
    <button
      v-for="index in total"
      :key="index"
      type="button"
      :class="[
        styles.buttonBase,
        activeIndex === index - 1
          ? styles.buttonActive
          : styles.buttonIdle,
      ]"
      :aria-label="`Go to slide ${index}`"
      :aria-current="
        activeIndex === index - 1 ? 'true' : 'false'
      "
      @click="handleSelect(index - 1)" />
  </div>
</template>
