<script setup lang="ts">
/**
 * CtaSection
 * 首页底部行动召唤区域
 */

const { t } = useI18n();

const ctaLinks = computed(() => [
  {
    label: t("ctaStart"),
    to: "/get-started",
    size: "lg" as const,
  },
]);
</script>

<template>
  <UPageSection :ui="{ container: 'py-6 sm:py-8' }">
    <UPageCTA
      :title="t('ctaTitle')"
      :description="t('ctaDesc')"
      :links="ctaLinks"
      :ui="{
        container:
          'flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 gap-8 sm:gap-12',
        footer: 'mt-6',
      }" />
  </UPageSection>
</template>
