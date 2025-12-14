<script setup lang="ts">
import { computed, ref, useSlots, watch } from "vue";
import type { EmblaCarouselType } from "embla-carousel";

// ============================================================================
// Types
// ============================================================================

type Variant =
  | "dots"
  | "tabs"
  | "thumbnails"
  | "numbers"
  | "progress"
  | "none";

type TabsItem = {
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
};

type ThumbnailsItem = {
  src: string;
  alt?: string;
  disabled?: boolean;
};

export interface ProseCarouselProps {
  /**
   * Trigger 变体
   * @defaultValue 'dots'
   */
  variant?: Variant;

  /**
   * Trigger 的布局位置。
   * - auto: 默认规则（tabs 且 vertical => left，其它 => bottom）
   */
  triggerPlacement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "auto";

  /** Trigger 容器额外 class（便于控制宽度/间距） */
  triggersClass?: string;

  /** Carousel 容器额外 class */
  carouselClass?: string;

  /**
   * 透传给 Nuxt UI `UCarousel` 的 props
   * 用于承载 loop、autoplay、fade、autoHeight、arrows 等行为配置
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  carouselProps?: Record<string, any>;

  tabs?: {
    items?: TabsItem[];
    orientation?: "horizontal" | "vertical";
  };

  thumbnails?: {
    items?: ThumbnailsItem[];
    size?: "sm" | "md" | "lg";
  };

  numbers?: {
    format?: "1" | "01" | "roman";
    maxVisible?: number;
  };

  progress?: {
    showCounter?: boolean;
  };

  /**
   * 自动播放开启时，点击/触发切换 slide 是否暂停 autoplay
   * @defaultValue true
   */
  pauseOnInteraction?: boolean;

  /** 自定义 class */
  class?: string;
}

// ============================================================================
// Props & Expose
// ============================================================================

const props = withDefaults(
  defineProps<ProseCarouselProps>(),
  {
    variant: "dots",
    triggerPlacement: "auto",
    triggersClass: undefined,
    carouselClass: undefined,
    carouselProps: () => ({}),
    tabs: undefined,
    thumbnails: undefined,
    numbers: undefined,
    progress: undefined,
    pauseOnInteraction: true,
    class: undefined,
  }
);

const slots = useSlots();

const carouselRef = useTemplateRef<{
  emblaApi?: EmblaCarouselType | null;
}>("carousel");

const activeIndex = ref(0);

// ============================================================================
// State helpers
// ============================================================================

const getAutoplayPlugin = () => {
  const api = carouselRef.value?.emblaApi;
  if (!api) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (api as any).plugins?.()?.autoplay as
    | {
        play: () => void;
        stop: () => void;
        isPlaying: () => boolean;
      }
    | undefined
    | null;
};

const stopAutoplayIfNeeded = () => {
  if (!props.pauseOnInteraction) return;
  if (!props.carouselProps?.autoplay) return;
  getAutoplayPlugin()?.stop();
};

type SlideEntry = {
  slotName: string;
  order: number;
};

const slideEntries = computed<SlideEntry[]>(() => {
  const entries = Object.keys(slots)
    .map((name) => {
      const match = /^slide-(\d+)$/.exec(name);
      if (!match) return null;
      if (typeof slots[name] !== "function") return null;
      return {
        slotName: name,
        order: parseInt(match[1] ?? "0", 10),
      };
    })
    .filter(Boolean) as SlideEntry[];

  if (entries.length) {
    return [...entries].sort((a, b) => a.order - b.order);
  }

  // 兼容：如果没有 slide-n 命名 slot，则将 default slot 视为 slide-1
  if (typeof slots.default === "function") {
    return [{ slotName: "default", order: 1 }];
  }

  return [];
});

const slides = computed(() =>
  slideEntries.value.map((entry, index) => ({
    slotName: entry.slotName,
    index,
  }))
);

const totalSlides = computed(() => slides.value.length);

const resolvedTriggerPlacement = computed<
  "top" | "bottom" | "left" | "right"
>(() => {
  const placement = props.triggerPlacement ?? "auto";
  if (placement !== "auto") return placement;

  // auto rules: vertical tabs => left, others => bottom
  if (
    props.variant === "tabs" &&
    props.tabs?.orientation === "vertical"
  ) {
    return "left";
  }
  return "bottom";
});

const isSidePlacement = computed(
  () =>
    resolvedTriggerPlacement.value === "left" ||
    resolvedTriggerPlacement.value === "right"
);

const shouldRenderTriggers = computed(
  () => props.variant !== "none" && totalSlides.value > 1
);

const resolvedTabsItems = computed<TabsItem[]>(() => {
  const items = props.tabs?.items;
  if (items?.length) return items;
  return Array.from({ length: totalSlides.value }).map(
    (_, i) => ({
      label: `Slide ${i + 1}`,
    })
  );
});

const resolvedThumbnails = computed<ThumbnailsItem[]>(
  () => {
    const items = props.thumbnails?.items;
    if (items?.length) return items;
    return Array.from({ length: totalSlides.value }).map(
      (_, i) => ({
        src: "",
        alt: `Thumbnail ${i + 1}`,
      })
    );
  }
);

const startIndex = computed(() => {
  const raw = props.carouselProps?.startIndex ?? 0;
  const parsed =
    typeof raw === "string"
      ? parseInt(raw, 10)
      : Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
});

watch(
  startIndex,
  (v) => {
    activeIndex.value = v;
  },
  { immediate: true }
);

// ============================================================================
// Methods
// ============================================================================

const handleSelect = (selectedIndex: number) => {
  activeIndex.value = selectedIndex;
};

const select = (index: number) => {
  if (index < 0 || index >= totalSlides.value) return;
  carouselRef.value?.emblaApi?.scrollTo(index);
  stopAutoplayIfNeeded();
};

defineExpose({
  emblaApi: computed(
    () => carouselRef.value?.emblaApi ?? null
  ),
  activeIndex,
  totalSlides,
  select,
});

// ============================================================================
// Styles
// ============================================================================

const styles = computed(() => ({
  root: props.class,
  triggersTopBottom: ["mt-2", props.triggersClass],
  contentRow: [
    "flex gap-4",
    isSidePlacement.value ? "items-stretch" : "items-start",
  ],
  triggersSide: [
    "self-stretch min-h-0",
    props.triggersClass,
  ],
  carouselWrap: [
    "min-w-0 flex-1 overflow-hidden",
    props.carouselClass,
  ],
  slide: "w-full",
}));
</script>

<template>
  <div
    :class="styles.root"
    role="region"
    aria-roledescription="carousel">
    <!-- Triggers (top) -->
    <div
      v-if="
        shouldRenderTriggers &&
        resolvedTriggerPlacement === 'top'
      "
      :class="styles.triggersTopBottom">
      <ProseCarouselTriggerDots
        v-if="variant === 'dots'"
        :active-index="activeIndex"
        :total="totalSlides"
        @select="select" />

      <ProseCarouselTriggerTabs
        v-else-if="variant === 'tabs'"
        :items="resolvedTabsItems"
        :active-index="activeIndex"
        :orientation="tabs?.orientation ?? 'horizontal'"
        @select="select" />

      <ProseCarouselTriggerThumbnails
        v-else-if="variant === 'thumbnails'"
        :items="resolvedThumbnails"
        :active-index="activeIndex"
        :size="thumbnails?.size ?? 'md'"
        @select="select" />

      <ProseCarouselTriggerNumbers
        v-else-if="variant === 'numbers'"
        :active-index="activeIndex"
        :total="totalSlides"
        :format="numbers?.format ?? '1'"
        :max-visible="numbers?.maxVisible"
        @select="select" />

      <ProseCarouselTriggerProgress
        v-else-if="variant === 'progress'"
        :active-index="activeIndex"
        :total="totalSlides"
        :show-counter="progress?.showCounter ?? false"
        @select="select" />
    </div>

    <!-- Content row: left trigger + carousel + right trigger -->
    <div :class="styles.contentRow">
      <!-- Triggers (left) -->
      <div
        v-if="
          shouldRenderTriggers &&
          resolvedTriggerPlacement === 'left'
        "
        :class="styles.triggersSide">
        <ProseCarouselTriggerTabs
          v-if="variant === 'tabs'"
          :items="resolvedTabsItems"
          :active-index="activeIndex"
          :orientation="tabs?.orientation ?? 'vertical'"
          @select="select" />

        <ProseCarouselTriggerThumbnails
          v-else-if="variant === 'thumbnails'"
          :items="resolvedThumbnails"
          :active-index="activeIndex"
          :size="thumbnails?.size ?? 'md'"
          @select="select" />

        <ProseCarouselTriggerNumbers
          v-else-if="variant === 'numbers'"
          :active-index="activeIndex"
          :total="totalSlides"
          :format="numbers?.format ?? '1'"
          :max-visible="numbers?.maxVisible"
          @select="select" />

        <ProseCarouselTriggerProgress
          v-else-if="variant === 'progress'"
          :active-index="activeIndex"
          :total="totalSlides"
          :show-counter="progress?.showCounter ?? false"
          @select="select" />

        <ProseCarouselTriggerDots
          v-else-if="variant === 'dots'"
          :active-index="activeIndex"
          :total="totalSlides"
          @select="select" />
      </div>

      <!-- Carousel -->
      <div :class="styles.carouselWrap">
        <UCarousel
          ref="carousel"
          :items="slides"
          v-bind="carouselProps"
          @select="handleSelect">
          <template #default="{ item, index }">
            <div
              role="group"
              aria-roledescription="slide"
              :aria-label="`Slide ${index + 1} of ${totalSlides}`"
              :aria-hidden="activeIndex !== index"
              :class="styles.slide">
              <slot :name="item.slotName" />
            </div>
          </template>
        </UCarousel>
      </div>

      <!-- Triggers (right) -->
      <div
        v-if="
          shouldRenderTriggers &&
          resolvedTriggerPlacement === 'right'
        "
        :class="styles.triggersSide">
        <ProseCarouselTriggerTabs
          v-if="variant === 'tabs'"
          :items="resolvedTabsItems"
          :active-index="activeIndex"
          :orientation="tabs?.orientation ?? 'vertical'"
          @select="select" />

        <ProseCarouselTriggerThumbnails
          v-else-if="variant === 'thumbnails'"
          :items="resolvedThumbnails"
          :active-index="activeIndex"
          :size="thumbnails?.size ?? 'md'"
          @select="select" />

        <ProseCarouselTriggerNumbers
          v-else-if="variant === 'numbers'"
          :active-index="activeIndex"
          :total="totalSlides"
          :format="numbers?.format ?? '1'"
          :max-visible="numbers?.maxVisible"
          @select="select" />

        <ProseCarouselTriggerProgress
          v-else-if="variant === 'progress'"
          :active-index="activeIndex"
          :total="totalSlides"
          :show-counter="progress?.showCounter ?? false"
          @select="select" />

        <ProseCarouselTriggerDots
          v-else-if="variant === 'dots'"
          :active-index="activeIndex"
          :total="totalSlides"
          @select="select" />
      </div>
    </div>

    <!-- Triggers (bottom) -->
    <div
      v-if="
        shouldRenderTriggers &&
        resolvedTriggerPlacement === 'bottom'
      "
      :class="styles.triggersTopBottom">
      <ProseCarouselTriggerDots
        v-if="variant === 'dots'"
        :active-index="activeIndex"
        :total="totalSlides"
        @select="select" />

      <ProseCarouselTriggerTabs
        v-else-if="variant === 'tabs'"
        :items="resolvedTabsItems"
        :active-index="activeIndex"
        :orientation="tabs?.orientation ?? 'horizontal'"
        @select="select" />

      <ProseCarouselTriggerThumbnails
        v-else-if="variant === 'thumbnails'"
        :items="resolvedThumbnails"
        :active-index="activeIndex"
        :size="thumbnails?.size ?? 'md'"
        @select="select" />

      <ProseCarouselTriggerNumbers
        v-else-if="variant === 'numbers'"
        :active-index="activeIndex"
        :total="totalSlides"
        :format="numbers?.format ?? '1'"
        :max-visible="numbers?.maxVisible"
        @select="select" />

      <ProseCarouselTriggerProgress
        v-else-if="variant === 'progress'"
        :active-index="activeIndex"
        :total="totalSlides"
        :show-counter="progress?.showCounter ?? false"
        @select="select" />
    </div>

    <!-- 预留 footer slot（非 scoped，MDC 兼容） -->
    <slot name="footer" />
  </div>
</template>
