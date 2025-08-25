<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import { getContentLocale } from "~/composables/shared/module";
import { parsePathInfo } from "~/composables/shared/path";

interface SurroundLink {
  title?: string;
  description?: string;
  path?: string;
  [key: string]: unknown;
}

interface PageSurroundProps {
  surround?: (SurroundLink | null)[];
  showLabels?: boolean;
  showDescriptions?: boolean;
  titleMaxLength?: number;
  descriptionMaxLength?: number;
  variant?: "default" | "compact" | "elevated";
  direction?: "horizontal" | "vertical";
  uiOverride?: {
    container?: string;
    navigation?: string;
    item?: string;
    content?: string;
    title?: string;
    description?: string;
    icon?: string;
    label?: string;
  };
}

const props = withDefaults(
  defineProps<PageSurroundProps>(),
  {
    surround: () => [],
    showLabels: true,
    showDescriptions: false,
    titleMaxLength: 60,
    descriptionMaxLength: 120,
    variant: "default",
    direction: "horizontal",
    uiOverride: () => ({}),
  }
);

const { t, locale } = useI18n();

// Convert full path to simplified path
const convertToSimplifiedPath = (
  fullPath: string
): string => {
  if (!fullPath) return fullPath;

  const contentLocale = getContentLocale(
    locale.value as any
  );
  const pathInfo = parsePathInfo(fullPath, contentLocale);

  // If already simplified or is root, return as is
  if (pathInfo.isSimplified || pathInfo.isRoot) {
    return fullPath;
  }

  // Convert to simplified format: /module/subPath
  if (pathInfo.module && pathInfo.subPath) {
    return `/${pathInfo.module}/${pathInfo.subPath}`;
  }

  return fullPath;
};

// Computed surround data with fallback handling
const computedSurround = computed(() => {
  const [prev, next] = props.surround || [null, null];
  return { prev, next };
});

// Check if navigation is available
const hasNavigation = computed(() => {
  const { prev, next } = computedSurround.value;
  return !!(prev || next);
});

// Truncate text helper
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

// Navigation items with computed properties
const navigationItems = computed(() => {
  const { prev, next } = computedSurround.value;

  return {
    prev: prev
      ? {
          title:
            prev.title || t("docs.surround.previousPage"),
          description: prev.description,
          to: convertToSimplifiedPath(
            prev.path || ""
          ) as RouteLocationRaw,
          displayTitle: truncateText(
            prev.title || t("docs.surround.previousPage"),
            props.titleMaxLength
          ),
          displayDescription: prev.description
            ? truncateText(
                prev.description,
                props.descriptionMaxLength
              )
            : undefined,
        }
      : null,
    next: next
      ? {
          title: next.title || t("docs.surround.nextPage"),
          description: next.description,
          to: convertToSimplifiedPath(
            next.path || ""
          ) as RouteLocationRaw,
          displayTitle: truncateText(
            next.title || t("docs.surround.nextPage"),
            props.titleMaxLength
          ),
          displayDescription: next.description
            ? truncateText(
                next.description,
                props.descriptionMaxLength
              )
            : undefined,
        }
      : null,
  };
});

// Computed classes for styling
const containerClass = computed(() => {
  const base = [
    "w-full",
    "transition-all duration-300",
    "motion-reduce:transition-none",
  ];

  if (props.direction === "vertical") {
    base.push("space-y-4");
  } else {
    base.push("grid grid-cols-2 gap-4");
  }

  if (props.variant === "elevated") {
    base.push("rounded-lg");
  } else if (props.variant === "compact") {
    base.push("space-y-2");
  }

  return [base.join(" "), props.uiOverride.container]
    .filter(Boolean)
    .join(" ");
});

const itemClass = computed(() => {
  const base = [
    "group relative block w-full h-full p-4 rounded-lg border transition-all duration-200 border-default",
    "hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
    "cursor-pointer",
  ];

  if (props.variant === "compact") {
    base.push("p-3");
  }

  return [base.join(" "), props.uiOverride.item]
    .filter(Boolean)
    .join(" ");
});

const titleClass = computed(() => {
  const base = [
    "font-medium text-primary",
    "group-hover:text-default",
    "transition-colors duration-200",
    "motion-reduce:transition-none",
  ];

  if (props.variant === "compact") {
    base.push("text-sm");
  }

  return [base.join(" "), props.uiOverride.title]
    .filter(Boolean)
    .join(" ");
});

const descriptionClass = computed(() => {
  const base = [
    "text-sm text-muted hover:text-default mt-1 leading-relaxed",
  ];

  return [base.join(" "), props.uiOverride.description]
    .filter(Boolean)
    .join(" ");
});

const labelClass = computed(() => {
  const base = [
    "text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1",
  ];

  return [base.join(" "), props.uiOverride.label]
    .filter(Boolean)
    .join(" ");
});

const iconClass = computed(() => {
  const base = [
    "w-4 h-4 text-default group-hover:text-primary transition-colors duration-200",
    "motion-reduce:transition-none",
  ];

  if (props.variant === "compact") {
    base.push("w-3 h-3");
  }

  return [base.join(" "), props.uiOverride.icon]
    .filter(Boolean)
    .join(" ");
});

// Handle link click
const handleClick = (
  direction: "prev" | "next",
  to: RouteLocationRaw
) => {
  navigateTo(to);
};

// Handle keyboard navigation
const handleKeydown = (
  event: KeyboardEvent,
  direction: "prev" | "next",
  to: RouteLocationRaw
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleClick(direction, to);
  }
};
</script>

<template>
  <nav
    v-if="hasNavigation"
    :class="containerClass"
    :aria-label="t('docs.surround.navigation')"
    role="navigation">
    <!-- Previous Page -->
    <div
      v-if="navigationItems.prev"
      :class="
        direction === 'horizontal' ? 'col-span-1' : ''
      ">
      <NuxtLink
        :to="navigationItems.prev.to"
        :class="itemClass"
        :aria-label="
          t('docs.surround.goToPrevious', {
            title: navigationItems.prev.title,
          })
        "
        @click="
          handleClick('prev', navigationItems.prev.to)
        "
        @keydown="
          handleKeydown(
            $event,
            'prev',
            navigationItems.prev.to
          )
        ">
        <div class="flex items-center space-x-2">
          <UIcon
            name="i-heroicons-arrow-left-20-solid"
            :class="iconClass"
            :aria-hidden="true" />

          <div class="flex-1 min-w-0">
            <div
              v-if="showLabels"
              :class="labelClass">
              {{ t("docs.surround.previous") }}
            </div>

            <div :class="titleClass">
              <span
                :title="
                  navigationItems.prev.displayTitle !==
                  navigationItems.prev.title
                    ? t('docs.surround.truncated')
                    : undefined
                "
                class="block">
                {{ navigationItems.prev.displayTitle }}
              </span>
            </div>

            <div
              v-if="
                showDescriptions &&
                navigationItems.prev.displayDescription
              "
              :class="descriptionClass">
              <span
                :title="
                  navigationItems.prev
                    .displayDescription !==
                  navigationItems.prev.description
                    ? t('docs.surround.truncated')
                    : undefined
                ">
                {{
                  navigationItems.prev.displayDescription
                }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Spacer for horizontal layout when only one item exists -->
    <div
      v-else-if="direction === 'horizontal'"
      class="col-span-1"
      aria-hidden="true">
    </div>

    <!-- Next Page -->
    <div
      v-if="navigationItems.next"
      :class="
        direction === 'horizontal' ? 'col-span-1' : ''
      ">
      <NuxtLink
        :to="navigationItems.next.to"
        :class="itemClass"
        :aria-label="
          t('docs.surround.goToNext', {
            title: navigationItems.next.title,
          })
        "
        @click="
          handleClick('next', navigationItems.next.to)
        "
        @keydown="
          handleKeydown(
            $event,
            'next',
            navigationItems.next.to
          )
        ">
        <div class="flex items-center space-x-2">
          <div class="flex-1 min-w-0 text-right">
            <div
              v-if="showLabels"
              :class="labelClass">
              {{ t("docs.surround.next") }}
            </div>

            <div :class="titleClass">
              <span
                :title="
                  navigationItems.next.displayTitle !==
                  navigationItems.next.title
                    ? t('docs.surround.truncated')
                    : undefined
                "
                class="block">
                {{ navigationItems.next.displayTitle }}
              </span>
            </div>

            <div
              v-if="
                showDescriptions &&
                navigationItems.next.displayDescription
              "
              :class="descriptionClass">
              <span
                :title="
                  navigationItems.next
                    .displayDescription !==
                  navigationItems.next.description
                    ? t('docs.surround.truncated')
                    : undefined
                ">
                {{
                  navigationItems.next.displayDescription
                }}
              </span>
            </div>
          </div>

          <UIcon
            name="i-heroicons-arrow-right-20-solid"
            :class="iconClass"
            :aria-hidden="true" />
        </div>
      </NuxtLink>
    </div>
  </nav>

  <!-- Accessible fallback when no navigation is available -->
  <div
    v-else
    class="sr-only"
    :aria-label="t('docs.surround.noNavigation')"
    role="region">
    {{ t("docs.surround.noNavigation") }}
  </div>
</template>
