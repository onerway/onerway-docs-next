<script setup lang="ts">
/**
 * 首页
 * 使用 home layout，展示产品概览和快速入口
 */
definePageMeta({
  layout: "home",
});

const { t } = useI18n();

useSeoMeta({
  title: t("heroTitle"),
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-layout">
    <HeroSection />
    <FeatureSection />
    <DemoSection />
    <ProductSection />
    <CtaSection />
  </div>
</template>
