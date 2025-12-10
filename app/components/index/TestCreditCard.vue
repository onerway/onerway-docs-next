<script setup lang="ts">
/**
 * TestCreditCard
 * 测试信用卡预览组件，支持多字段独立复制
 * 深色科技感设计，遵循 Nuxt UI 主题令牌规范
 */

interface Props {
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  testCardsUrl?: string;
}

withDefaults(defineProps<Props>(), {
  cardNumber: "4242 4242 4242 4242",
  cardHolder: "JOHN DOE",
  expiryDate: "12/28",
  cvv: "123",
  testCardsUrl:
    "https://docs.onerway.com/apis/zh/v0.6/test",
});

const { t } = useI18n();
const { copy } = useClipboard();

// 跟踪当前复制的字段
type CopyField =
  | "cardNumber"
  | "cardHolder"
  | "expiryDate"
  | "cvv"
  | null;
const copiedField = ref<CopyField>(null);
let resetTimeout: ReturnType<typeof setTimeout> | null =
  null;

const handleCopy = (value: string, field: CopyField) => {
  copy(value, {
    successTitle: t("copied"),
    transform: (text) => text.replace(/\s/g, ""),
  });

  copiedField.value = field;

  // 重置复制状态
  if (resetTimeout) clearTimeout(resetTimeout);
  resetTimeout = setTimeout(() => {
    copiedField.value = null;
  }, 2000);
};

onUnmounted(() => {
  if (resetTimeout) clearTimeout(resetTimeout);
});
</script>

<template>
  <div
    class="w-[280px] sm:w-[320px] md:w-[360px] aspect-[1.586/1]">
    <div
      class="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50 dark:shadow-black/70">
      <!-- 主背景渐变 -->
      <div
        class="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black" />

      <!-- 科技感光晕 -->
      <div
        class="absolute inset-0 opacity-40"
        style="
          background-image:
            radial-gradient(
              ellipse at 20% 20%,
              rgba(99, 102, 241, 0.12) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse at 80% 80%,
              rgba(16, 185, 129, 0.08) 0%,
              transparent 50%
            );
        " />

      <!-- 网格线效果 -->
      <div
        class="absolute inset-0 opacity-[0.02]"
        style="
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        " />

      <!-- 卡片内容 -->
      <div
        class="relative h-full flex flex-col justify-between p-4 sm:p-5 md:p-6">
        <!-- NFC 图标 - 右上角 -->
        <UIcon
          name="i-lucide-wifi"
          class="absolute top-4 right-4 sm:top-5 sm:right-5 size-4 sm:size-5 text-white/30 rotate-90" />

        <!-- 顶部占位 -->
        <div class="h-4 sm:h-5 md:h-6" />

        <!-- 中间：芯片 + 卡号 -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- 卡号 -->
          <button
            class="group flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            :aria-label="t('testCardCopy')"
            @click="handleCopy(cardNumber, 'cardNumber')">
            <span
              class="text-white text-sm sm:text-base md:text-lg tracking-[0.04em] font-mono">
              {{ cardNumber }}
            </span>
            <span
              class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <UIcon
                :name="
                  copiedField === 'cardNumber'
                    ? 'i-lucide-check'
                    : 'i-lucide-copy'
                "
                :class="[
                  'size-3',
                  copiedField === 'cardNumber'
                    ? 'text-emerald-400'
                    : 'text-white/40',
                ]" />
            </span>
          </button>
          <!-- 芯片 -->
          <CardChip class="shrink-0" />
        </div>

        <!-- 底部区域 -->
        <div class="space-y-3">
          <!-- 卡片详情行：持卡人 + 有效期 + CVV -->
          <div class="flex items-end justify-between gap-2">
            <!-- 持卡人 -->
            <button
              class="group flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              @click="handleCopy(cardHolder, 'cardHolder')">
              <div class="text-left">
                <p
                  class="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/40 mb-0.5">
                  {{ t("testCardHolder") }}
                </p>
                <p
                  class="text-white text-[10px] sm:text-xs tracking-wider font-medium">
                  {{ cardHolder }}
                </p>
              </div>
              <span
                class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <UIcon
                  :name="
                    copiedField === 'cardHolder'
                      ? 'i-lucide-check'
                      : 'i-lucide-copy'
                  "
                  :class="[
                    'size-3',
                    copiedField === 'cardHolder'
                      ? 'text-emerald-400'
                      : 'text-white/40',
                  ]" />
              </span>
            </button>

            <!-- 有效期 -->
            <button
              class="group flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              @click="handleCopy(expiryDate, 'expiryDate')">
              <div class="text-left">
                <p
                  class="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/40 mb-0.5">
                  {{ t("testCardExpires") }}
                </p>
                <p
                  class="text-white text-[10px] sm:text-xs tracking-wider font-medium font-mono">
                  {{ expiryDate }}
                </p>
              </div>
              <span
                class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <UIcon
                  :name="
                    copiedField === 'expiryDate'
                      ? 'i-lucide-check'
                      : 'i-lucide-copy'
                  "
                  :class="[
                    'size-3',
                    copiedField === 'expiryDate'
                      ? 'text-emerald-400'
                      : 'text-white/40',
                  ]" />
              </span>
            </button>

            <!-- CVV -->
            <button
              class="group flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              @click="handleCopy(cvv, 'cvv')">
              <div class="text-left">
                <p
                  class="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/40 mb-0.5">
                  {{ t("testCardCvv") }}
                </p>
                <p
                  class="text-white text-[10px] sm:text-xs tracking-wider font-medium font-mono">
                  {{ cvv }}
                </p>
              </div>
              <span
                class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <UIcon
                  :name="
                    copiedField === 'cvv'
                      ? 'i-lucide-check'
                      : 'i-lucide-copy'
                  "
                  :class="[
                    'size-3',
                    copiedField === 'cvv'
                      ? 'text-emerald-400'
                      : 'text-white/40',
                  ]" />
              </span>
            </button>
          </div>

          <!-- 底部状态栏 -->
          <div
            class="flex items-center justify-between pt-2 border-t border-white/6">
            <!-- Test Mode 指示器 -->
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-1.5 w-1.5">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span
                  class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span
                class="text-emerald-400/80 text-[9px] sm:text-[10px] font-medium tracking-wide uppercase">
                {{ t("testCardTestMode") }}
              </span>
            </div>

            <!-- 文档链接 -->
            <UButton
              :to="testCardsUrl"
              target="_blank"
              variant="link"
              size="xs"
              trailing-icon="i-lucide-external-link"
              :ui="{
                trailingIcon:
                  'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform size-2.5 sm:size-3',
              }"
              class="group text-white/50 hover:text-white/70 text-[9px] sm:text-[10px] p-0">
              {{ t("testCard") }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- 装饰性全息光点 -->
      <div
        class="absolute top-4 right-16 sm:right-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-linear-to-br from-cyan-400/10 via-purple-400/10 to-pink-400/10 blur-md pointer-events-none"
        aria-hidden="true" />
    </div>
  </div>
</template>
