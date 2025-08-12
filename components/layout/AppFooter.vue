<script setup lang="ts">
import { computed } from "vue";

// 获取当前年份
const currentYear = computed(() =>
  new Date().getFullYear()
);

// 快速链接数据
const quickLinks = computed(() => [
  {
    label: "footer.product",
    children: [
      {
        label: "footer.payment",
        to: "/payments",
        icon: "i-heroicons-credit-card",
      },
      {
        label: "footer.acquiring",
        to: "/payments", // 重定向到payments，因为acquiring内容不存在
        icon: "i-heroicons-building-storefront",
      },
      {
        label: "footer.api",
        to: "/payments", // 重定向到payments，因为api内容不存在
        icon: "i-heroicons-code-bracket",
      },
      {
        label: "footer.webhooks",
        to: "/payments", // 重定向到payments，因为webhooks内容不存在
        icon: "i-heroicons-arrow-path",
      },
    ],
  },
  {
    label: "footer.resources",
    children: [
      {
        label: "footer.docs",
        to: "/get-started",
        icon: "i-heroicons-document-text",
      },
      {
        label: "footer.guides",
        to: "/get-started",
        icon: "i-heroicons-academic-cap",
      },
      {
        label: "footer.developmentResources",
        to: "/development-resources",
        icon: "i-heroicons-clock",
      },
      {
        label: "footer.samples",
        to: "/get-started", // 重定向到get-started，因为samples内容不存在
        icon: "i-heroicons-code-bracket-square",
      },
    ],
  },
  {
    label: "footer.developers",
    children: [
      {
        label: "footer.apiReference",
        to: "/payments", // 重定向到payments，因为api-reference内容不存在
        icon: "i-heroicons-book-open",
      },
      {
        label: "footer.sdks",
        to: "/get-started", // 重定向到get-started，因为sdks内容不存在
        icon: "i-heroicons-cube",
      },
      {
        label: "footer.testing",
        to: "/get-started", // 重定向到get-started，因为testing内容不存在
        icon: "i-heroicons-beaker",
      },
      {
        label: "footer.tools",
        to: "/get-started", // 重定向到get-started，因为tools内容不存在
        icon: "i-heroicons-wrench-screwdriver",
      },
    ],
  },
  {
    label: "footer.support",
    children: [
      {
        label: "footer.contact",
        to: "mailto:support@onerway.com", // 改为邮件链接
        icon: "i-heroicons-envelope",
      },
      {
        label: "footer.help",
        to: "/get-started", // 重定向到get-started
        icon: "i-heroicons-question-mark-circle",
      },
      {
        label: "footer.status",
        to: "https://status.onerway.com",
        target: "_blank",
        icon: "i-heroicons-signal",
      },
      {
        label: "footer.community",
        to: "https://github.com/onerway", // 改为GitHub链接
        target: "_blank",
        icon: "i-heroicons-user-group",
      },
    ],
  },
]);

// 社交媒体链接
const socialLinks = computed(() => [
  {
    name: "GitHub",
    icon: "i-simple-icons-github",
    href: "https://github.com/onerway",
    color: "gray",
    hoverColor: "hover:text-gray-900 dark:hover:text-white",
  },
  {
    name: "Twitter",
    icon: "i-simple-icons-twitter",
    href: "https://twitter.com/onerway",
    color: "blue",
    hoverColor: "hover:text-blue-500",
  },
  {
    name: "Discord",
    icon: "i-simple-icons-discord",
    href: "https://discord.gg/onerway",
    color: "indigo",
    hoverColor: "hover:text-indigo-500",
  },
  {
    name: "LinkedIn",
    icon: "i-simple-icons-linkedin",
    href: "https://linkedin.com/company/onerway",
    color: "blue",
    hoverColor: "hover:text-blue-600",
  },
]);

// 法律链接
// const legalLinks = computed(() => [
//   {
//     label: "footer.privacy",
//     to: "/privacy",
//   },
//   {
//     label: "footer.terms",
//     to: "/terms",
//   },
//   {
//     label: "footer.security",
//     to: "/security",
//   },
//   {
//     label: "footer.compliance",
//     to: "/compliance",
//   },
// ]);
</script>

<template>
  <footer
    class="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 dark:from-gray-900 dark:to-slate-900 dark:border-gray-700">
    <!-- 主要内容区域 -->
    <div
      v-show="false"
      class="py-12 pb-8">
      <UContainer>
        <div
          class="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 lg:gap-12 items-start">
          <!-- 品牌区域 -->
          <div class="max-w-80">
            <!-- Logo 和品牌名 -->
            <div class="flex items-center mb-4">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-credit-card"
                  class="h-7 w-7 text-blue-500" />
                <span
                  class="text-2xl font-bold text-primary"
                  >Onerway</span
                >
              </div>
              <UBadge
                variant="subtle"
                color="primary"
                size="xs"
                class="ml-2">
                Docs
              </UBadge>
            </div>

            <!-- 品牌描述 -->
            <p
              class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {{ $t("footer.brandDescription") }}
            </p>

            <!-- 快速状态指示器 -->
            <div
              class="flex items-center gap-2 mb-6 p-2 px-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/10 dark:border-green-800/20">
              <div
                class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span
                class="text-sm text-green-700 dark:text-green-400 font-medium"
                >{{
                  $t("footer.allSystemsOperational")
                }}</span
              >
            </div>

            <!-- 社交媒体链接 -->
            <div class="mt-6">
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block"
                >{{ $t("footer.followUs") }}</span
              >
              <div class="flex gap-2">
                <UButton
                  v-for="social in socialLinks"
                  :key="social.name"
                  :to="social.href"
                  target="_blank"
                  :icon="social.icon"
                  variant="ghost"
                  size="sm"
                  :class="social.hoverColor"
                  :aria-label="social.name"
                  class="transition-all duration-200 hover:-translate-y-0.5" />
              </div>
            </div>
          </div>

          <!-- 链接列 -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8">
            <div
              v-for="section in quickLinks"
              :key="section.label"
              class="min-w-0">
              <h3
                class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                {{ $t(section.label) }}
              </h3>
              <ul class="list-none p-0 m-0 space-y-2">
                <li
                  v-for="link in section.children"
                  :key="link.label"
                  class="mb-2">
                  <NuxtLink
                    :to="link.to"
                    :target="link.target"
                    class="flex items-center gap-2 py-1 text-gray-600 dark:text-gray-400 text-sm transition-all duration-200 hover:text-blue-600 hover:translate-x-0.5 dark:hover:text-blue-400 no-underline">
                    <UIcon
                      :name="link.icon"
                      class="h-4 w-4 opacity-70" />
                    {{ $t(link.label) }}
                    <UIcon
                      v-if="link.target === '_blank'"
                      name="i-heroicons-arrow-top-right-on-square"
                      class="h-3 w-3 opacity-50 ml-auto" />
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- 订阅区域 -->
          <div class="max-w-80">
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
              {{ $t("footer.stayUpdated") }}
            </h3>
            <p
              class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              {{ $t("footer.newsletterDescription") }}
            </p>

            <!-- 邮件订阅表单 -->
            <form
              class="mb-4"
              @submit.prevent>
              <div class="flex flex-col gap-3">
                <UInput
                  type="email"
                  :placeholder="
                    $t('footer.emailPlaceholder')
                  "
                  icon="i-heroicons-envelope"
                  size="md"
                  class="flex-1" />
                <UButton
                  type="submit"
                  color="primary"
                  size="md"
                  icon="i-heroicons-paper-airplane"
                  class="w-full">
                  {{ $t("footer.subscribe") }}
                </UButton>
              </div>
            </form>

            <!-- 订阅说明 -->
            <p
              class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {{ $t("footer.subscribeNote") }}
            </p>

            <!-- 快速访问 -->
            <div
              class="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4
                class="text-sm font-semibold text-gray-900 dark:text-white mb-3"
                >{{ $t("footer.quickAccess") }}</h4
              >
              <div class="flex flex-col gap-2">
                <UButton
                  to="/get-started"
                  variant="outline"
                  size="sm"
                  icon="i-heroicons-rocket-launch">
                  {{ $t("footer.getStarted") }}
                </UButton>
                <UButton
                  to="/payments"
                  variant="outline"
                  size="sm"
                  icon="i-heroicons-code-bracket">
                  {{ $t("footer.apiDocs") }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- 底部区域 -->
    <div
      class="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 py-6 flex items-center">
      <!-- 版权信息 -->
      <div class="flex items-center gap-3 mx-auto">
        <span
          class="text-sm text-gray-600 dark:text-gray-400">
          © {{ currentYear }} Onerway.
          {{ $t("footer.rights") }}
        </span>
        <UBadge
          variant="subtle"
          size="xs"
          >Docs</UBadge
        >
      </div>
    </div>
  </footer>
</template>
