<script setup lang="ts">
const { t } = useI18n();
const {
  recentThreePages,
  formatTimeI18n,
  getTimeColor,
  removePage,
  clearPages,
} = useRecentPages();
</script>

<template>
  <UCard
    variant="subtle"
    :ui="{
      header: 'p-2 sm:p-3',
      body: 'p-3 sm:p-5',
      footer: 'p-2 sm:p-3',
    }">
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-clock"
            class="size-4 text-primary" />
          <h3 class="text-sm font-semibold">
            {{ t("recentTitle") }}
          </h3>
        </div>
        <UButton
          v-if="recentThreePages.length > 0"
          variant="ghost"
          color="error"
          size="xs"
          icon="i-heroicons-trash"
          :title="t('recentClear')"
          @click="clearPages" />
      </div>
    </template>

    <!-- Body -->
    <template #default>
      <!-- Has recent pages -->
      <UPageList v-if="recentThreePages.length > 0">
        <div
          v-for="page in recentThreePages"
          :key="page.path"
          class="group relative">
          <UPageCard
            variant="naked"
            :to="page.path"
            :ui="{
              wrapper: 'flex-row items-start gap-2.5 p-2.5',
              leading: 'mb-0 mt-0.5',
              body: 'flex-1 min-w-0',
            }">
            <template #leading>
              <UIcon
                :name="page.icon || 'i-heroicons-document'"
                class="size-4 text-primary group-hover:text-default transition-colors" />
            </template>
            <template #body>
              <!-- Title + Time row -->
              <div class="flex items-center gap-2">
                <p
                  class="flex-1 min-w-0 text-sm font-medium text-primary line-clamp-1 group-hover:text-default transition-colors">
                  {{ page.title }}
                </p>
                <span
                  class="shrink-0 text-xs"
                  :class="getTimeColor(page.timestamp)">
                  {{ formatTimeI18n(page.timestamp) }}
                </span>
                <!-- Delete button -->
                <UButton
                  variant="ghost"
                  color="error"
                  size="xs"
                  icon="i-heroicons-x-mark"
                  :aria-label="t('recentRemove')"
                  class="z-10 opacity-0 transition-opacity group-hover:opacity-100"
                  @click.stop.prevent="
                    removePage(page.path)
                  " />
              </div>
              <!-- Description -->
              <p
                v-if="page.description"
                class="text-xs text-muted mt-0.5 line-clamp-1">
                {{ page.description }}
              </p>
            </template>
          </UPageCard>
        </div>
      </UPageList>

      <!-- Empty state -->
      <UEmpty
        v-else
        variant="naked"
        size="sm"
        icon="hugeicons:file-empty-02"
        :title="t('recentEmpty')" />
    </template>

    <!-- Footer -->
    <template #footer>
      <p class="text-xs text-default">
        {{ t("recentSignInPrompt") }}
        <UButton
          to="https://sandbox-portal.onerway.com/user/login"
          target="_blank"
          variant="link"
          color="primary"
          size="xs"
          class="p-0! h-auto! font-semibold">
          {{ t("recentSignIn") }}
        </UButton>
        {{ t("recentLoadKeys") }}
      </p>
    </template>
  </UCard>
</template>
