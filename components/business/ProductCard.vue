<script setup lang="ts">
// Type definition - compatible with existing paymentCards structure
export interface EnhancedProduct {
  id?: string;
  title: string;
  description: string;
  icon: string;
  to: string;
  docsCount?: number;
  lastUpdated?: string;
  tags?: string[];
  status?: "new" | "beta" | "updated";
}

// Props interface
interface Props {
  product: EnhancedProduct;
  showStats?: boolean;
  showTags?: boolean;
  showStatus?: boolean;
  maxTags?: number;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showStats: true,
  showTags: true,
  showStatus: true,
  maxTags: 3,
  clickable: true,
});

// Emits
const emit = defineEmits<{
  click: [product: EnhancedProduct];
}>();

// Color configuration (curated, high-contrast cross-hue gradients)
const colorPalettes = [
  {
    from: "from-blue-500",
    to: "to-violet-600",
    shadow: "group-hover:shadow-violet-500/25",
    glow: "from-blue-500/20 via-indigo-400/10 to-violet-500/20",
  },
  {
    from: "from-indigo-500",
    to: "to-cyan-500",
    shadow: "group-hover:shadow-cyan-500/25",
    glow: "from-indigo-500/20 via-blue-400/10 to-cyan-500/20",
  },
  {
    from: "from-teal-500",
    to: "to-emerald-600",
    shadow: "group-hover:shadow-emerald-500/25",
    glow: "from-teal-500/20 via-emerald-400/10 to-green-500/20",
  },
  {
    from: "from-green-500",
    to: "to-teal-600",
    shadow: "group-hover:shadow-teal-500/25",
    glow: "from-green-500/20 via-teal-400/10 to-cyan-500/20",
  },
  {
    from: "from-lime-500",
    to: "to-green-600",
    shadow: "group-hover:shadow-green-500/25",
    glow: "from-lime-500/20 via-green-400/10 to-teal-500/20",
  },
  {
    from: "from-yellow-500",
    to: "to-amber-600",
    shadow: "group-hover:shadow-amber-500/25",
    glow: "from-yellow-500/20 via-amber-400/10 to-orange-500/20",
  },
  {
    from: "from-amber-500",
    to: "to-orange-600",
    shadow: "group-hover:shadow-orange-500/25",
    glow: "from-amber-500/20 via-orange-400/10 to-red-500/20",
  },
  {
    from: "from-orange-500",
    to: "to-rose-600",
    shadow: "group-hover:shadow-rose-500/25",
    glow: "from-orange-500/20 via-rose-400/10 to-pink-500/20",
  },
  {
    from: "from-rose-500",
    to: "to-pink-600",
    shadow: "group-hover:shadow-pink-500/25",
    glow: "from-rose-500/20 via-pink-400/10 to-fuchsia-500/20",
  },
  {
    from: "from-pink-500",
    to: "to-fuchsia-600",
    shadow: "group-hover:shadow-fuchsia-500/25",
    glow: "from-pink-500/20 via-fuchsia-400/10 to-purple-500/20",
  },
  {
    from: "from-fuchsia-500",
    to: "to-purple-600",
    shadow: "group-hover:shadow-purple-500/25",
    glow: "from-fuchsia-500/20 via-purple-400/10 to-indigo-500/20",
  },
  {
    from: "from-purple-500",
    to: "to-indigo-600",
    shadow: "group-hover:shadow-indigo-500/25",
    glow: "from-purple-500/20 via-indigo-400/10 to-blue-500/20",
  },
  {
    from: "from-cyan-500",
    to: "to-sky-600",
    shadow: "group-hover:shadow-sky-500/25",
    glow: "from-cyan-500/20 via-sky-400/10 to-blue-500/20",
  },
  {
    from: "from-sky-500",
    to: "to-blue-600",
    shadow: "group-hover:shadow-blue-500/25",
    glow: "from-sky-500/20 via-blue-400/10 to-indigo-500/20",
  },
  {
    from: "from-red-500",
    to: "to-rose-600",
    shadow: "group-hover:shadow-red-500/25",
    glow: "from-red-500/20 via-rose-400/10 to-pink-500/20",
  },
  {
    from: "from-violet-500",
    to: "to-purple-700",
    shadow: "group-hover:shadow-violet-500/25",
    glow: "from-violet-500/20 via-purple-400/10 to-fuchsia-500/20",
  },
];

// Composables
const { t, locale } = useI18n();

// Event handlers
const handleClick = () => {
  if (!props.clickable) return;
  emit("click", props.product);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.clickable) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  handleClick();
};

const themeClasses = computed(() => ({
  card: "bg-default",
  cardHover: "hover:shadow-default",
  border: "border-default hover:border-primary/20",
  text: {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted",
  },
}));

const formatDate = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: locale.value.startsWith("zh")
      ? "2-digit"
      : "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(
    locale.value,
    formatOptions
  ).format(date);
};

// Simple string hash function
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Computed properties
const visibleTags = computed(() => {
  return (props.product.tags || []).slice(0, props.maxTags);
});

const remainingTagsCount = computed(() => {
  const totalTags = props.product.tags?.length || 0;
  return totalTags > props.maxTags
    ? totalTags - props.maxTags
    : 0;
});

const hiddenTags = computed(() => {
  return (props.product.tags || []).slice(props.maxTags);
});

const statusConfig = computed(() => {
  const status = props.product.status;
  if (!status) return null;

  const configs = {
    new: {
      variant: "solid" as const,
      color: "success" as const,
    },
    beta: {
      variant: "outline" as const,
      color: "warning" as const,
    },
    updated: {
      variant: "soft" as const,
      color: "info" as const,
    },
  };

  return (
    configs[status] || {
      variant: "soft" as const,
      color: "neutral" as const,
    }
  );
});

const iconColorClasses = computed(() => {
  const seedParts = [
    props.product.id,
    props.product.title,
    props.product.to,
    ...(props.product.tags || []),
  ].filter(Boolean) as string[];
  const seed = seedParts.join("|");
  const hash = hashString(seed);
  const mixed = (hash ^ (hash >>> 16)) >>> 0; // stronger distribution
  const colorIndex = mixed % colorPalettes.length;
  const palette = colorPalettes[colorIndex];

  return {
    gradient: `bg-gradient-to-br ${palette?.from} ${palette?.to}`,
    shadow: palette?.shadow,
    glow: palette?.glow,
  };
});
</script>

<template>
  <div class="group relative h-full">
    <!-- 外围光晕效果 - 只在悬停时显示 -->
    <div
      class="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none blur-md motion-reduce:transition-none"
      :class="`bg-gradient-to-br ${iconColorClasses.glow}`"
      aria-hidden="true"></div>

    <!-- 卡片主体 -->
    <div
      class="relative h-full rounded-2xl hover:shadow-xl transition-all duration-300 border transform hover:-translate-y-1 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 motion-reduce:transition-none motion-reduce:transform-none"
      :class="[
        themeClasses.card,
        themeClasses.cardHover,
        themeClasses.border,
        { 'cursor-pointer': clickable },
      ]"
      :tabindex="clickable ? 0 : -1"
      :role="clickable ? 'button' : 'article'"
      :aria-label="
        clickable
          ? `${t('productCard.clickToView')} ${product.title}`
          : `${t('productCard.productInfo')} ${product.title}`
      "
      @click="handleClick"
      @keydown="handleKeyDown">
      <!-- 左右布局容器 -->
      <div class="flex items-center gap-4">
        <!-- 产品图标 -->
        <div
          class="flex items-center justify-center size-12 rounded-xl text-white shadow-lg transition-shadow duration-300 motion-reduce:transition-none"
          :class="[
            iconColorClasses.gradient,
            iconColorClasses.shadow,
          ]">
          <UIcon
            :name="product.icon"
            class="w-6 h-6" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="flex-1 min-w-0">
          <!-- 产品信息 -->
          <div class="mb-1">
            <div class="flex items-center mb-2">
              <h3
                :id="`product-title-${product.id}`"
                class="text-lg font-semibold text-primary group-hover:text-default transition-colors duration-200 text-wrap line-clamp-3 motion-reduce:transition-none">
                {{ product.title }}
              </h3>
              <span
                v-if="
                  showStatus &&
                  product.status &&
                  statusConfig
                "
                class="flex-shrink-0 ml-2">
                <UBadge
                  :label="
                    t(
                      `productCard.status.${product.status}`
                    )
                  "
                  :variant="statusConfig.variant"
                  :color="statusConfig.color"
                  size="md"
                  :aria-label="`${t('productCard.status.label')} ${t(`productCard.status.${product.status}`)}`" />
              </span>
            </div>

            <p
              :id="`product-desc-${product.id}`"
              class="text-sm line-clamp-3 transition-colors duration-200 motion-reduce:transition-none">
              {{ product.description }}
            </p>
          </div>

          <!-- 统计信息 -->
          <div
            v-if="
              showStats &&
              (product.docsCount || product.lastUpdated)
            "
            class="flex items-center justify-between text-xs mb-4"
            role="group"
            :aria-label="t('productCard.statistics')">
            <span
              v-if="product.docsCount"
              class="flex items-center gap-1"
              :aria-label="
                t('productCard.docsCount', {
                  count: product.docsCount,
                })
              ">
              <UIcon
                name="i-heroicons-document-text"
                class="w-3 h-3"
                :aria-hidden="true" />
              {{
                t("productCard.docsCount", {
                  count: product.docsCount,
                })
              }}
            </span>
            <span
              v-if="product.lastUpdated"
              class="flex items-center gap-1 font-semibold"
              :aria-label="`${t('common.updated')} ${formatDate(product.lastUpdated)}`">
              <UIcon
                name="i-heroicons-clock"
                class="w-3 h-3"
                :aria-hidden="true" />
              {{ t("common.updated") }}
              {{ formatDate(product.lastUpdated) }}
            </span>
          </div>

          <!-- 标签 -->
          <div
            v-if="showTags && product.tags?.length"
            class="flex flex-wrap gap-1"
            role="group"
            :aria-label="t('productCard.tags.label')">
            <UBadge
              v-for="tag in visibleTags"
              :key="tag"
              :label="tag"
              variant="soft"
              size="md"
              class="font-medium"
              :aria-label="`${t('productCard.tags.item')} ${tag}`" />
            <UPopover
              v-if="remainingTagsCount > 0"
              mode="hover"
              :popper="{ placement: 'top' }">
              <UBadge
                :label="`+${remainingTagsCount}`"
                variant="outline"
                size="md"
                class="font-medium text-muted transition-colors cursor-pointer"
                role="button"
                :tabindex="0"
                :aria-label="
                  t('productCard.tags.additional', {
                    count: remainingTagsCount,
                  })
                " />

              <template #content>
                <div
                  class="p-2 max-w-xs"
                  role="tooltip">
                  <h3 class="sr-only">{{
                    t("productCard.tags.additional", {
                      count: remainingTagsCount,
                    })
                  }}</h3>
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="tag in hiddenTags"
                      :key="tag"
                      :label="tag"
                      variant="soft"
                      size="sm"
                      class="font-medium" />
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
      </div>

      <!-- 箭头指示器 -->
      <div
        v-if="clickable"
        class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:transition-none"
        aria-hidden="true">
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="w-4 h-4 text-primary-500" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
