<script setup lang="ts">
import type { RecentPage } from "~/composables/shared/types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 获取查询参数中的原始路径
const route = useRoute();
const originalPath =
  (route.query.path as string) || route.path;

// 获取最近访问的页面
const { recentThreePages, getTimeColor, formatTimeI18n } =
  useRecentPages();

// 推荐的页面链接
const suggestedPages = computed(() => [
  {
    title: t("404.suggestions.getStarted.title"),
    description: t(
      "404.suggestions.getStarted.description"
    ),
    to: "/get-started",
    icon: "i-heroicons-rocket-launch",
  },
  {
    title: t("404.suggestions.payments.title"),
    description: t("404.suggestions.payments.description"),
    to: "/payments",
    icon: "i-heroicons-credit-card",
  },
  {
    title: t("404.suggestions.api.title"),
    description: t("404.suggestions.api.description"),
    to: "/payments",
    icon: "i-heroicons-code-bracket",
  },
]);

// 计算属性：判断是否有最近访问的页面
const hasRecentPages = computed(
  () => recentThreePages.value.length > 0
);

// 处理最近页面的访问
const handleRecentPageClick = async (page: RecentPage) => {
  await navigateTo(page.path);
};

// SEO Meta
useSeoMeta({
  title: t("404.seo.title"),
  description: t("404.seo.description"),
  robots: "noindex, nofollow",
});

// 设置404状态码
// setResponseStatus(404);

// 搜索功能
const searchQuery = ref("");

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  await navigateTo(
    `/?search=${encodeURIComponent(searchQuery.value)}`
  );
};
</script>

<template>
  <ClientOnly>
    <div
      class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div
        class="max-w-2xl w-full space-y-6 sm:space-y-8 text-center">
        <!-- 错误图标和状态码 -->
        <div class="space-y-3 sm:space-y-4">
          <div class="flex justify-center">
            <div class="relative">
              <!-- 大号状态码 -->
              <div
                class="text-6xl sm:text-7xl md:text-8xl font-bold text-primary/20 dark:text-primary/30">
                404
              </div>
              <!-- 搜索图标装饰 -->
              <div
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <UIcon
                  name="i-heroicons-magnifying-glass"
                  class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>
          </div>

          <!-- 错误标题 -->
          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white px-4">
            {{ t("404.title") }}
          </h1>

          <!-- 错误描述 -->
          <p
            class="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4 max-w-xl mx-auto leading-relaxed">
            {{ t("404.description") }}
          </p>

          <!-- 尝试访问的路径 -->
          <div
            class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-sm mx-4 sm:mx-0 break-all">
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-2">
              <span
                class="text-gray-500 dark:text-gray-400 flex-shrink-0"
                >{{ t("404.attemptedPath") }}:</span
              >
              <code
                class="text-primary font-mono text-xs sm:text-sm"
                >{{ originalPath }}</code
              >
            </div>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="space-y-4 px-4 sm:px-0">
          <div
            class="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
            <UInput
              v-model="searchQuery"
              :placeholder="t('404.searchPlaceholder')"
              :aria-label="t('a11y.searchInput')"
              icon="i-heroicons-magnifying-glass"
              size="lg"
              class="flex-1 w-full"
              @keyup.enter="handleSearch" />
            <UButton
              size="lg"
              :disabled="!searchQuery.trim()"
              :aria-label="t('404.search')"
              class="cursor-pointer w-full sm:w-auto flex-shrink-0"
              @click="handleSearch">
              <span class="sm:hidden">{{
                t("404.search")
              }}</span>
              <span class="hidden sm:inline">{{
                t("404.search")
              }}</span>
            </UButton>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div
          class="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0 max-w-md mx-auto">
          <UButton
            size="lg"
            icon="i-heroicons-home"
            to="/"
            class="w-full sm:w-auto">
            {{ t("404.backHome") }}
          </UButton>

          <UButton
            size="lg"
            variant="outline"
            icon="i-heroicons-arrow-left"
            class="cursor-pointer w-full sm:w-auto"
            @click="$router.go(-1)">
            {{ t("404.goBack") }}
          </UButton>
        </div>

        <!-- 最近访问的页面 -->
        <div
          v-if="hasRecentPages"
          class="space-y-4 px-4 sm:px-0">
          <div
            class="flex items-center justify-center gap-2">
            <UIcon
              name="i-heroicons-clock"
              class="w-5 h-5 text-primary" />
            <h2
              class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {{ t("recentlyViewed.title") }}
            </h2>
          </div>

          <div class="space-y-3 sm:space-y-4">
            <UCard
              v-for="page in recentThreePages"
              :key="page.path"
              class="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 text-left overflow-hidden"
              :ui="{ body: 'p-3 sm:p-4' }"
              role="button"
              :aria-label="`${t('recentlyViewed.visitPage')}: ${page.title}`"
              tabindex="0"
              @click="handleRecentPageClick(page)"
              @keyup.enter="handleRecentPageClick(page)"
              @keyup.space="handleRecentPageClick(page)">
              <div
                class="flex items-start gap-3 sm:gap-4 min-w-0">
                <UIcon
                  :name="
                    page.icon || 'i-heroicons-document'
                  "
                  class="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-primary flex-shrink-0" />
                <div class="flex-1 min-w-0 overflow-hidden">
                  <h3
                    class="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors text-sm sm:text-base">
                    {{ page.title }}
                  </h3>
                  <p
                    class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {{ page.description }}
                  </p>
                  <div
                    class="flex flex-col gap-1 mt-2 sm:flex-row sm:items-center sm:gap-2">
                    <span
                      :class="`text-xs ${getTimeColor(page.timestamp)} flex-shrink-0`">
                      {{ formatTimeI18n(page.timestamp) }}
                    </span>
                    <span
                      class="text-xs text-gray-400 hidden sm:inline"
                      >•</span
                    >
                    <code
                      class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono break-all leading-tight max-w-full overflow-hidden">
                      {{ page.path }}
                    </code>
                  </div>
                </div>
                <UIcon
                  name="i-heroicons-arrow-top-right-on-square"
                  class="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </div>
            </UCard>
          </div>
        </div>

        <!-- 推荐页面 -->
        <div class="space-y-4 px-4 sm:px-0">
          <div
            class="flex items-center justify-center gap-2">
            <UIcon
              name="i-heroicons-light-bulb"
              class="w-5 h-5 text-primary" />
            <h2
              class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {{ t("404.suggestionsTitle") }}
            </h2>
          </div>

          <div class="space-y-3 sm:space-y-4">
            <UCard
              v-for="page in suggestedPages"
              :key="page.to"
              class="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 text-left overflow-hidden"
              :ui="{ body: 'p-3 sm:p-4' }"
              @click="navigateTo(page.to)">
              <div
                class="flex items-center gap-3 sm:gap-4 min-w-0">
                <UIcon
                  :name="page.icon"
                  class="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <div
                  class="text-left flex-1 min-w-0 overflow-hidden">
                  <h3
                    class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {{ page.title }}
                  </h3>
                  <p
                    class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {{ page.description }}
                  </p>
                </div>
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
