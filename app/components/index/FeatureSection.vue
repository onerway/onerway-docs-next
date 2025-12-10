<script setup lang="ts">
/**
 * FeatureSection
 * 首页特性展示区域，三列布局展示 Merchant Center、Payment Integration、Developer Resources
 */

const { t } = useI18n();

const features = computed(() => [
  {
    title: t("featureMerchant"),
    description: t("featureMerchantDesc"),
    icon: "i-heroicons-building-storefront",
    links: [
      {
        label: t("featureMerchantPayments"),
        to: "/payments",
      },
      {
        label: t("featureMerchantDashboard"),
        to: "https://sandbox-portal.onerway.com/",
      },
      {
        label: t("featureMerchantSettlement"),
        to: "https://docs.onerway.com/apis/zh/v0.6/settlement-file",
      },
    ],
  },
  {
    title: t("featureIntegration"),
    description: t("featureIntegrationDesc"),
    icon: "i-heroicons-credit-card",
    links: [
      {
        label: t("featureIntegrationPostman"),
        to: "https://postman.onerway.com/",
      },
      {
        label: t("featureIntegrationDocs"),
        to: "/payments",
      },
    ],
  },
  {
    title: t("featureDeveloper"),
    description: t("featureDeveloperDesc"),
    icon: "i-heroicons-code-bracket",
    links: [
      { label: t("featureDeveloperSdk"), to: "/payments" },
      {
        label: t("featureDeveloperSamples"),
        to: "/payments",
      },
      { label: t("featureDeveloperApi"), to: "/payments" },
    ],
  },
]);
</script>

<template>
  <UPageSection
    :ui="{
      container: 'py-6 sm:py-8 lg:py-12',
    }">
    <template #features>
      <UPageCard
        v-for="feature in features"
        :key="feature.title"
        :title="feature.title"
        :description="feature.description"
        :ui="{
          root: 'group relative overflow-hidden rounded-xl p-2 lg:p-4 hover:shadow-lg transition-all duration-300',
          title: 'text-xl font-bold mb-3',
          description: 'mb-6',
        }">
        <template #leading>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20"
            aria-hidden="true">
            <UIcon
              :name="feature.icon"
              class="h-6 w-6 text-primary" />
          </div>
        </template>
        <template #description>
          <div class="space-y-2">
            <UPageLinks
              :links="feature.links"
              class="text-primary"
              :ui="{
                item: 'group/link',
                link: 'relative',
              }">
              <template #link-trailing>
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="size-4 text-muted opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
              </template>
            </UPageLinks>
          </div>
        </template>
      </UPageCard>
    </template>
  </UPageSection>
</template>
