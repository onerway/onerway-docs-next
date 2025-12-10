<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: t("heroTitle"),
});
</script>

<template>
  <main
    role="main"
    aria-label="Onerway Documentation Homepage">
    <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
      <HeroSection />
      <FeatureSection />
      <DemoSection />
      <ProductSection />
      <CtaSection />
    </div>
  </main>
</template>
