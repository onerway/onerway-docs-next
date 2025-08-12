<script setup lang="ts">
// Component props interface
interface Props {
  testCardNumber?: string;
  testCardsUrl?: string;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  testCardNumber: "4242 4242 4242 4242",
  testCardsUrl:
    "https://docs.onerway.com/apis/zh/v0.6/test",
  width: "w-80",
});

const { t } = useI18n();
const { copy, copied } = useClipboard();

// Copy test card number to clipboard
const handleCopyCardNumber = async () => {
  await copy(props.testCardNumber, {
    successTitle: t("testCard.copySuccess"),
    successDesc: t("testCard.copyDescription"),
    errorTitle: t("common.error"),
    errorDesc: t("testCard.copyDescription"),
    transform: (text) => text.replace(/\s/g, ""), // Remove spaces from card number
    duration: 3000,
  });
};

// Handle keyboard events
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  handleCopyCardNumber();
};

// Theme classes for consistent styling
const themeClasses = computed(() => ({
  card: "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-900",
  shadow:
    "shadow-xl shadow-blue-500/25 dark:shadow-blue-500/10",
  text: {
    primary: "text-white",
    hover: "hover:text-blue-100 dark:hover:text-blue-200",
  },
  border: "border-white/20 dark:border-gray-700/30",
}));
</script>

<template>
  <div
    class="rounded-xl border overflow-hidden aspect-[86/54] motion-reduce:transform-none transform-gpu"
    :class="[
      width,
      themeClasses.card,
      themeClasses.shadow,
      themeClasses.border,
    ]"
    role="article"
    :aria-label="t('testCard.ariaLabel')">
    <!-- Header section -->
    <div
      class="relative h-8 top-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 opacity-80"
      aria-hidden="true"></div>

    <!-- Content section -->
    <div class="p-6 space-y-4 pt-10">
      <!-- Test cards section -->
      <div class="flex items-center justify-between">
        <UButton
          variant="link"
          size="sm"
          trailing-icon="i-heroicons-arrow-right"
          target="_blank"
          :to="testCardsUrl"
          :class="[
            themeClasses.text.primary,
            themeClasses.text.hover,
          ]"
          :aria-label="t('testCard.viewDocsLabel')">
          <span class="font-medium text-xs">{{
            t("testCard.title")
          }}</span>
        </UButton>
        <CardChip
          class="rotate-6 scale-110 animate-pulse"
          aria-hidden="true" />
      </div>

      <!-- Test card number -->
      <UButton
        variant="link"
        size="md"
        class="w-full cursor-pointer flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md"
        :class="[
          themeClasses.text.primary,
          themeClasses.text.hover,
        ]"
        :trailing-icon="
          copied
            ? 'i-heroicons-check-circle'
            : 'i-heroicons-clipboard-document-list'
        "
        :aria-label="
          copied
            ? t('testCard.copiedLabel')
            : t('testCard.copyCardLabel')
        "
        tabindex="0"
        @click="handleCopyCardNumber"
        @keydown="handleKeyDown">
        <span class="font-mono font-semibold text-sm">{{
          testCardNumber
        }}</span>
      </UButton>
    </div>
  </div>
</template>
