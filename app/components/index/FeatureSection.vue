<script setup lang="ts">
import type { SpotlightColor } from "~/composables/useSpotlightColor";

/**
 * FeatureSection
 * 首页特性展示区域，三列布局展示 Merchant Center、Payment Integration、Developer Resources
 *
 * 特点：
 * - 使用 UPageCard 的 spotlight 效果增强视觉层次
 * - 语义化 slots 结构：leading(图标)、description(描述)、footer(链接)
 * - 链接悬停时带箭头滑动动画
 * - hover 上浮效果已在全局 pageCard 配置中定义
 * - 图标背景色跟随 spotlightColor 变化
 */

const { t } = useI18n();
const { getIconBgClass } = useSpotlightColor();

const features = computed(() => [
  {
    title: t("featureMerchant"),
    description: t("featureMerchantDesc"),
    icon: "i-heroicons-building-storefront",
    spotlightColor: "primary" as SpotlightColor,
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
    spotlightColor: "success" as SpotlightColor,
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
    spotlightColor: "warning" as SpotlightColor,
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

// 卡片局部样式覆盖（全局样式已在 app.config.ts 的 pageCard 中定义）
const cardUi = {
  root: "group",
  title: "text-xl font-bold",
  footer: "pt-4 mt-auto",
};
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
        spotlight
        :spotlight-color="feature.spotlightColor"
        variant="outline"
        :ui="cardUi">
        <template #leading>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-500 group-hover:rotate-360"
            :class="getIconBgClass(feature.spotlightColor)"
            aria-hidden="true">
            <UIcon
              :name="feature.icon"
              class="h-6 w-6" />
          </div>
        </template>
        <!-- 描述文字 -->
        <template #description>
          {{ feature.description }}
        </template>

        <!-- 链接列表 -->
        <template #footer>
          <UPageLinks
            :links="feature.links"
            :ui="{
              item: 'group/link',
              link: 'text-primary hover:text-primary/80 transition-colors',
            }">
            <template #link-trailing>
              <UIcon
                name="i-heroicons-arrow-right"
                class="size-4 text-muted opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
            </template>
          </UPageLinks>
        </template>
      </UPageCard>
    </template>
  </UPageSection>
</template>
