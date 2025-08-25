<script setup lang="ts">
const { t } = useI18n();
const {
  recentThreePages,
  formatTimeI18n,
  getTimeColor,
  removePage,
  clearPages,
} = useRecentPages();

// Performance optimization: use computed data to avoid repeated calculations
const displayData = computed(() => {
  return recentThreePages.value.map((page) => ({
    ...page,
    // 直接使用已存储的数据，避免异步调用
    displayTitle: page.title,
    displayDescription: page.description,
    icon: page.icon || "i-heroicons-document",
    iconColor: page.iconColor || "text-primary",
    timeColor: getTimeColor(page.timestamp),
    formattedTime: formatTimeI18n(page.timestamp),
  }));
});

// Event handlers
const handleRemovePage = (path: string) => {
  removePage(path);
};

const handleClearAll = () => {
  clearPages();
};
</script>

<template>
  <!-- 有浏览记录时显示 -->
  <UCard
    v-if="recentThreePages.length > 0"
    class="overflow-hidden transform-gpu"
    role="region"
    :aria-label="t('recentlyViewed.title')"
    :ui="{
      root: 'divide-none',
      header: 'p-4 sm:px-6 sm:pb-0',
      body: 'p-4 sm:p-6 sm:pb-0',
      footer: 'p-4 sm:px-6 sm:pt-0',
    }">
    <!-- 标题 -->
    <template #header>
      <div class="flex items-center justify-between">
        <h3
          id="recent-pages-title"
          class="text-md font-semibold bg-clip-text text-default">
          {{ t("recentlyViewed.title") }}
        </h3>
        <!-- 清除所有按钮 -->
        <UButton
          variant="ghost"
          size="xs"
          icon="i-heroicons-x-mark"
          :aria-label="t('recentlyViewed.clearAll')"
          :title="t('recentlyViewed.clearAll')"
          class="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          @click="handleClearAll" />
      </div>
    </template>

    <!-- 最近浏览的页面内容 -->
    <template #default>
      <div class="space-y-1">
        <div
          v-for="item in displayData"
          :key="item.path"
          class="group relative">
          <NuxtLink
            :to="item.path"
            :aria-label="`${t('recentlyViewed.visitPage')}: ${item.displayTitle} - ${item.displayDescription}`"
            tabindex="0"
            class="flex items-start space-x-3 p-2 -mx-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-gray-50 dark:focus:bg-gray-800/50">
            <!-- 图标容器 -->
            <div class="flex-shrink-0 mt-0.5">
              <div class="relative">
                <UIcon
                  :name="item.icon"
                  class="size-4 transition-all duration-200 group-hover:scale-110"
                  :class="item.iconColor"
                  aria-hidden="true" />
                <!-- 图标背景光晕效果 -->
                <div
                  class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur-sm -z-10"
                  :class="
                    item.iconColor.replace('text-', 'bg-')
                  " />
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="flex-1 min-w-0">
              <UPopover
                v-if="item.displayDescription"
                mode="hover"
                :content="{
                  side: 'right',
                  sideOffset: 30,
                }">
                <div
                  class="flex items-center justify-between gap-1">
                  <div class="flex-1">
                    <h4
                      class="text-sm font-medium text-primary/90 group-hover:text-highlighted transition-colors duration-200 line-clamp-2 text-wrap">
                      {{ item.displayTitle }}
                    </h4>
                    <p
                      class="text-xs mt-1 font-medium transition-colors duration-200 group-hover:opacity-80"
                      :class="item.timeColor"
                      :aria-label="`${t('recentlyViewed.lastVisited')}: ${item.formattedTime}`">
                      {{ item.formattedTime }}
                    </p>
                  </div>
                  <!-- 模块名称标签 -->
                  <UBadge
                    v-if="item.moduleName"
                    variant="soft"
                    color="primary"
                    class="line-clamp-2"
                    size="sm">
                    {{ item.moduleName }}
                  </UBadge>
                  <!-- 页面描述图标 - 仅作为视觉提示 -->
                  <UIcon
                    name="i-heroicons-information-circle"
                    class="size-3 text-gray-400 hover:text-primary transition-colors duration-200 flex-shrink-0 opacity-60 group-hover:opacity-100"
                    :aria-label="
                      t('recentlyViewed.showDescription')
                    "
                    aria-hidden="true" />
                </div>

                <template #content>
                  <div
                    class="p-3 max-w-xs"
                    role="tooltip">
                    <p
                      class="text-sm text-gray-700 dark:text-gray-300">
                      {{ item.displayDescription }}
                    </p>
                  </div>
                </template>
              </UPopover>

              <!-- 没有描述时的内容 -->
              <div v-else>
                <div class="flex items-center gap-1">
                  <h4
                    class="text-sm font-medium text-primary/90 group-hover:text-highlighted transition-colors duration-200 line-clamp-2 text-wrap">
                    {{ item.displayTitle }}
                  </h4>
                  <!-- 模块名称标签 -->
                  <span
                    v-if="item.moduleName"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
                    {{ item.moduleName }}
                  </span>
                </div>
                <p
                  class="text-xs mt-1 font-medium transition-colors duration-200 group-hover:opacity-80"
                  :class="item.timeColor"
                  :aria-label="`${t('recentlyViewed.lastVisited')}: ${item.formattedTime}`">
                  {{ item.formattedTime }}
                </p>
              </div>
            </div>

            <!-- 右侧箭头指示器 -->
            <div
              class="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
              <UIcon
                name="i-heroicons-chevron-right"
                class="size-3 text-gray-400 dark:text-gray-500"
                aria-hidden="true" />
            </div>
          </NuxtLink>

          <!-- 移除按钮 -->
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-x-mark"
            :aria-label="`${t('recentlyViewed.remove')}: ${item.displayTitle}`"
            class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity size-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:cursor-pointer"
            :title="t('recentlyViewed.remove')"
            @click.stop="handleRemovePage(item.path)" />
        </div>
      </div>
    </template>

    <!-- 底部信息 -->
    <template #footer>
      <div class="pt-4">
        <p class="text-xs text-muted">
          {{ t("recentlyViewed.footer.signInPrompt") }}
          <UButton
            to="https://sandbox-portal.onerway.com/user/login"
            target="_blank"
            variant="link"
            size="xs"
            class="text-xs p-0 h-auto font-semibold hover:text-gray-900"
            :aria-label="t('recentlyViewed.footer.signIn')">
            {{ t("recentlyViewed.footer.signIn") }}
          </UButton>
          {{ t("recentlyViewed.footer.loadKeys") }}
        </p>
      </div>
    </template>
  </UCard>

  <!-- 无浏览记录时显示空状态 -->
  <UCard
    v-else
    class="overflow-hidden"
    role="region"
    :aria-label="t('recentlyViewed.empty.title')"
    :ui="{
      root: 'divide-none',
      header: 'p-4 sm:px-6 sm:pb-0',
      body: 'p-2 sm:p-2',
    }">
    <!-- 标题 -->
    <template #header>
      <div class="flex items-center justify-between">
        <h3
          id="recent-pages-title"
          class="text-md font-semibold bg-clip-text text-default">
          {{ t("recentlyViewed.title") }}
        </h3>
      </div>
    </template>

    <!-- 空状态内容 -->
    <template #default>
      <div class="text-center">
        <UIcon
          name="hugeicons:file-empty-02"
          class="size-10 text-gray-400 dark:text-gray-500"
          aria-hidden="true" />
      </div>
    </template>

    <!-- 底部信息 -->
    <template #footer>
      <div>
        <p class="text-xs text-muted">
          {{ t("recentlyViewed.footer.signInPrompt") }}
          <UButton
            to="https://sandbox-portal.onerway.com/user/login"
            target="_blank"
            variant="link"
            size="xs"
            class="text-xs p-0 h-auto font-semibold hover:text-gray-900"
            :aria-label="t('recentlyViewed.footer.signIn')">
            {{ t("recentlyViewed.footer.signIn") }}
          </UButton>
          {{ t("recentlyViewed.footer.loadKeys") }}
        </p>
      </div>
    </template>
  </UCard>
</template>

<style scoped>
/* 添加一些自定义样式以提升用户体验 */
.group:hover .size-6 {
  transform: scale(1.05);
}

/* 确保移除按钮不会干扰链接点击 */
.group .absolute {
  pointer-events: auto;
}

/* 平滑的变换效果 */
.transform-gpu {
  transform: translateZ(0);
}
</style>
