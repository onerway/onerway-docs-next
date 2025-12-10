<script setup lang="ts">
/**
 * ProductSection
 * 首页产品网格展示，包含 Payments 和 Transfer 子分类
 */

const { t } = useI18n();

const products = computed(() => [
  {
    title: t("productWeb"),
    description: t("productWebDesc"),
    icon: "i-heroicons-globe-alt",
    to: "/web-platform",
  },
  {
    title: t("productMobile"),
    description: t("productMobileDesc"),
    icon: "i-heroicons-device-phone-mobile",
    to: "/mobile-sdk",
  },
  {
    title: t("productCloud"),
    description: t("productCloudDesc"),
    icon: "i-heroicons-cloud",
    to: "/cloud-services",
  },
  {
    title: t("productAnalytics"),
    description: t("productAnalyticsDesc"),
    icon: "i-heroicons-chart-bar",
    to: "/data-analytics",
  },
  {
    title: t("productSecurity"),
    description: t("productSecurityDesc"),
    icon: "i-heroicons-shield-check",
    to: "/security-tools",
  },
]);
</script>

<template>
  <UPageSection
    id="products"
    :ui="{
      container: 'gap-4 sm:gap-8 py-4 sm:py-6 lg:py-8',
    }">
    <ProseH2 class="my-0">{{ t("productsTitle") }}</ProseH2>

    <!-- Payments subsection -->
    <section :id="`payments`">
      <ProseH3 class="text-muted">
        {{ t("productsPayments") }}
      </ProseH3>

      <UPageGrid>
        <UPageCard
          v-for="product in products"
          :key="product.title"
          :title="product.title"
          :description="product.description"
          :icon="product.icon"
          :to="product.to"
          variant="outline"
          class="hover:scale-[1.02] transition-transform duration-300" />
      </UPageGrid>
    </section>

    <!-- Transfer subsection -->
    <section>
      <ProseH3 class="text-muted">
        {{ t("productsTransfer") }}
        <UBadge
          class="font-bold rounded-lg ml-2 -translate-y-0.5"
          trailing-icon="i-heroicons-clock">
          {{ t("comingSoon") }}
        </UBadge>
      </ProseH3>
    </section>
  </UPageSection>
</template>
