<script setup lang="ts">
import { computed } from "vue";

// 获取当前年份
const currentYear = computed(() =>
  new Date().getFullYear()
);

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
