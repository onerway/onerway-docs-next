<script setup lang="ts">
/**
 * HeroSection
 * 首页 Hero 区域，包含标题、描述、按钮、RecentlyViewed 侧边栏和测试卡片预览
 */

const { t } = useI18n();

const heroLinks = computed(() => [
  {
    label: t("heroStart"),
    to: "/get-started",
    color: "primary" as const,
    size: "xl" as const,
    icon: "i-lucide-square-play",
  },
  {
    label: t("heroExplore"),
    to: "#products",
    color: "neutral" as const,
    variant: "link" as const,
    size: "lg" as const,
    trailingIcon: "lucide:chevron-right",
  },
]);

const isMobileWidth = computed(() =>
  import.meta.client ? window.innerWidth < 768 : false
);
</script>

<template>
  <UPageSection
    :ui="{
      container: 'py-4 sm:py-8 lg:py-12',
    }">
    <UPageHero
      :title="t('heroTitle')"
      :description="t('heroDesc')"
      orientation="horizontal"
      :links="heroLinks"
      :reverse="isMobileWidth ? true : false"
      :ui="{
        container: 'py-4 sm:py-8 lg:py-12',
        title: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
        description: 'text-lg',
      }">
      <!-- Recently viewed and test card -->
      <aside
        class="relative sm:max-w-xs sm:-translate-y-1/4"
        aria-label="Recently viewed pages and test card">
        <div class="relative z-10">
          <RecentlyViewed
            class="backdrop-blur-xs bg-white/40 dark:bg-gray-900/95 border border-gray-200/40 dark:border-gray-700/40 shadow-2xl shadow-black/10 rounded-xl" />
        </div>

        <!-- Test card preview -->
        <div
          class="hidden lg:block absolute pointer-events-none -z-10">
          <TestCreditCard
            class="transform -rotate-12 translate-x-1/3 -translate-y-1/3 hover:-rotate-15 hover:scale-102 transition-transform duration-500 ease-out pointer-events-auto" />
        </div>
      </aside>
    </UPageHero>
  </UPageSection>
</template>
