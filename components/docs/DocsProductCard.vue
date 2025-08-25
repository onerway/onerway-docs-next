<script setup lang="ts">
import type { EnhancedProduct } from "../business/ProductCard.vue";
import { createLogger } from "~/composables/shared/logger";
import ProductCard from "../business/ProductCard.vue";

interface Props {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  to?: string;
  docsCount?: number;
  lastUpdated?: string;
  tags?: string[];
  status?: "new" | "beta" | "updated";
  showStats?: boolean;
  showTags?: boolean;
  showStatus?: boolean;
  maxTags?: number;
  clickable?: boolean;
  external?: boolean | undefined;
  target?: string;
  rel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showStats: true,
  showTags: true,
  showStatus: true,
  maxTags: 3,
  clickable: true,
  external: undefined,
});

const { t } = useI18n();
const logger = createLogger("DocsProductCard");
logger.info(props.title, "初始化");

const isExternal = computed<boolean>(() => {
  if (props.external !== undefined) return props.external;
  if (!props.to) return false;
  return /^(?:https?:)?\/\//i.test(props.to);
});

const computedTarget = computed<string | undefined>(() => {
  if (!props.to) return undefined;
  return (
    props.target ??
    (isExternal.value ? "_blank" : undefined)
  );
});

const computedRel = computed<string | undefined>(() => {
  if (!props.to) return undefined;
  return (
    props.rel ??
    (isExternal.value ? "noopener noreferrer" : undefined)
  );
});

const product = computed<EnhancedProduct>(() => ({
  id: props.id,
  title: props.title,
  description: props.description,
  icon: props.icon || "i-heroicons-question-mark-circle",
  to: props.to || "",
  docsCount: props.docsCount,
  lastUpdated: props.lastUpdated,
  tags: props.tags,
  status: props.status,
}));

const ariaLabel = computed<string>(() => {
  if (props.to && props.clickable) {
    return `${t("productCard.clickToView")} ${props.title}`;
  }
  return `${t("productCard.productInfo")} ${props.title}`;
});
</script>

<template>
  <!-- link (internal or external via NuxtLink) -->
  <NuxtLink
    v-if="to && clickable"
    :to="to as any"
    :target="computedTarget"
    :rel="computedRel"
    :aria-label="ariaLabel"
    class="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl h-full motion-reduce:transition-none">
    <ProductCard
      :product="product"
      :show-stats="showStats"
      :show-tags="showTags"
      :show-status="showStatus"
      :max-tags="maxTags"
      :clickable="isExternal" />
  </NuxtLink>

  <!-- non-clickable card -->
  <div
    v-else
    :aria-label="ariaLabel"
    class="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl h-full motion-reduce:transition-none">
    <ProductCard
      :product="product"
      :show-stats="showStats"
      :show-tags="showTags"
      :show-status="showStatus"
      :max-tags="maxTags"
      :clickable="isExternal" />
  </div>
</template>
<style scoped></style>
