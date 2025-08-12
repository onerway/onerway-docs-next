<script setup lang="ts">
definePageMeta({ layout: "docs" });

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

useHead({
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const handleBack = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back();
    return;
  }
  navigateTo("/");
};
</script>

<template>
  <UPage>
    <UContainer class="px-12 sm:px-18 lg:px-24">
      <UPageHeader
        :title="t('mock.title')"
        class="sm:mt-12">
        <template #description>
          {{ t("mock.description") }}
        </template>
      </UPageHeader>

      <div
        class="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <span class="mr-2">{{ t("mock.pathLabel") }}:</span>
        <code class="break-all">{{ route.fullPath }}</code>
      </div>

      <UPageBody>
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-lucide-info"
          class="mb-6">
          <template #title>
            {{ t("mock.noticeTitle") }}
          </template>
          <template #description>
            {{ t("mock.noticeDescription") }}
          </template>
        </UAlert>

        <div class="flex items-center gap-3">
          <UButton
            color="primary"
            :aria-label="t('a11y.previousPage')"
            class="cursor-pointer"
            @click="handleBack"
            >{{ t("buttons.back") }}</UButton
          >
          <UButton
            color="neutral"
            variant="ghost"
            to="/"
            :aria-label="t('a11y.backToHome')"
            >{{ t("buttons.home") }}</UButton
          >
        </div>
      </UPageBody>
    </UContainer>
  </UPage>
</template>
