<script setup lang="ts">
interface SeeAlsoProps {
  /** Section title */
  title?: string;
  /** Custom icon name */
  icon?: string;
  /** Additional CSS classes */
  class?: string;
  /** Compact layout without card styling */
  compact?: boolean;
  /** Hide the header section entirely */
  hideHeader?: boolean;
  /** Custom section ID for accessibility */
  id?: string;
}

interface SeeAlsoSlots {
  /** Main content area for see-also items */
  default: () => unknown;
  /** Custom title content */
  title?: () => unknown;
  /** Custom icon content */
  icon?: () => unknown;
}

const props = withDefaults(defineProps<SeeAlsoProps>(), {
  title: "See Also",
  icon: "lucide:arrow-right",
  compact: false,
  hideHeader: false,
});

defineSlots<SeeAlsoSlots>();

// Remove unused i18n import

// Generate unique ID for accessibility
const sectionId = computed(() => {
  return (
    props.id ||
    `see-also-${Math.random().toString(36).substr(2, 9)}`
  );
});

// Compute container classes based on props
const containerClasses = computed(() => {
  if (props.compact) {
    return ["not-prose my-6", props.class];
  }

  return [
    "not-prose my-6",
    "border-l-6 border-l-primary",
    "bg-default",
    "border-primary",
    "rounded-lg",
    props.class,
  ];
});

// Card UI configuration
const cardUi = computed(() => ({
  body: {
    padding: props.compact ? "p-0" : "p-4 sm:p-6",
  } as Record<string, string>,
  header: {
    padding: props.compact
      ? "p-0 pb-3"
      : "px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3",
  } as Record<string, string>,
}));
</script>

<template>
  <!-- Compact layout without card wrapper -->
  <section
    v-if="props.compact"
    :id="sectionId"
    :class="containerClasses"
    role="complementary"
    :aria-labelledby="
      props.hideHeader ? undefined : `${sectionId}-title`
    ">
    <!-- Header for compact layout -->
    <header
      v-if="!props.hideHeader"
      class="mb-4">
      <div class="flex items-center gap-2">
        <slot name="icon">
          <UIcon
            :name="props.icon"
            class="h-5 w-5 text-primary shrink-0"
            aria-hidden="true" />
        </slot>
        <h3
          :id="`${sectionId}-title`"
          class="text-lg font-semibold text-default m-0">
          <slot name="title">
            {{ props.title }}
          </slot>
        </h3>
      </div>
    </header>

    <!-- Content area for compact layout -->
    <div
      class="space-y-3"
      role="list">
      <slot />
    </div>
  </section>

  <!-- Full card layout -->
  <UCard
    v-else
    :class="containerClasses"
    :ui="cardUi as any"
    role="complementary"
    :aria-labelledby="
      props.hideHeader ? undefined : `${sectionId}-title`
    ">
    <template
      v-if="!props.hideHeader"
      #header>
      <div class="flex items-center gap-2">
        <slot name="icon">
          <UIcon
            :name="props.icon"
            class="h-5 w-5 text-default shrink-0"
            aria-hidden="true" />
        </slot>
        <ClientOnly>
          <h3
            :id="`${sectionId}-title`"
            class="text-lg font-semibold text-default m-0">
            <slot name="title">
              {{ props.title }}
            </slot>
          </h3>
        </ClientOnly>
      </div>
    </template>

    <!-- Content area for card layout -->
    <div
      class="space-y-3"
      role="list">
      <slot />
    </div>
  </UCard>
</template>
