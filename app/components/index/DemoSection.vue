<script setup lang="ts">
/**
 * DemoSection
 * 首页 API 演示轮播区域，展示交互式 API 示例
 * 仅在大屏幕显示 (lg:block)
 */

interface ApiDemo {
  id: string;
  label: string;
  icon: string;
  command: string;
  code: string;
  docsLink: string;
}

const { t } = useI18n();
const { copy, copied } = useClipboard();

const demos = computed<ApiDemo[]>(() => [
  {
    id: "payment",
    label: t("apiPayment"),
    icon: "i-heroicons-credit-card",
    command: "onerway payment_intents create",
    code: `{
  "merchantNo": 800209,
  "merchantTxnId": "txn-uuid-here",
  "orderAmount": 99.99,
  "orderCurrency": "USD",
  "productType": "CARD",
  "txnType": "SALE",
  "billingInformation": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}`,
    docsLink: "/payments",
  },
  {
    id: "tokenization",
    label: t("apiTokenization"),
    icon: "i-heroicons-key",
    command: "onerway tokenization create",
    code: `{
  "appId": "your-app-id",
  "cardInfo": {
    "holderName": "John Doe",
    "cardNumber": "4242424242424242",
    "month": "12",
    "year": "26",
    "cvv": "123"
  }
}`,
    docsLink: "/tokenization",
  },
  {
    id: "subscription",
    label: t("apiSubscription"),
    icon: "i-heroicons-calendar-days",
    command: "onerway subscriptions create",
    code: `{
  "subscription": {
    "productName": "Pro Plan",
    "frequencyType": "M",
    "bindCard": true,
    "expireDate": "2025-12-31"
  },
  "orderAmount": 29.99,
  "orderCurrency": "USD"
}`,
    docsLink: "/subscriptions",
  },
  {
    id: "reconciliation",
    label: t("apiReconciliation"),
    icon: "i-heroicons-scale",
    command: "onerway transactions list",
    code: `{
  "page": 1,
  "limit": 10,
  "filters": {
    "status": "completed",
    "dateRange": "2025-01-01 to 2025-01-31"
  }
}`,
    docsLink: "/reconciliation",
  },
]);

const currentIndex = ref(0);
const currentDemo = computed(
  () => demos.value[currentIndex.value]
);

const handleCopy = () => {
  if (!currentDemo.value) return;
  copy(currentDemo.value.code, {
    successTitle: t("copied"),
  });
};

const handleSelect = (index: number) => {
  currentIndex.value = index;
};
</script>

<template>
  <UPageSection
    class="hidden lg:block"
    :ui="{
      container: 'py-4 sm:py-8 lg:py-12',
    }">
    <div
      class="flex flex-col lg:flex-row gap-6 p-6 rounded-xl bg-elevated/50 border border-default"
      aria-label="Interactive API examples">
      <!-- Left: Navigation -->
      <div class="w-full lg:w-72 space-y-2">
        <div class="mb-4">
          <h3
            class="text-lg font-semibold text-highlighted">
            {{ t("apiTitle") }}
          </h3>
          <p class="text-sm text-muted mt-1">
            {{ t("apiSubtitle") }}
          </p>
        </div>

        <button
          v-for="(demo, index) in demos"
          :key="demo.id"
          class="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left"
          :class="[
            currentIndex === index
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'hover:bg-elevated text-muted hover:text-highlighted',
            'border border-transparent',
          ]"
          @click="handleSelect(index)">
          <UIcon
            :name="demo.icon"
            class="size-5 shrink-0" />
          <span class="font-medium text-sm">{{
            demo.label
          }}</span>
          <div
            v-if="currentIndex === index"
            class="ml-auto size-2 rounded-full bg-primary animate-pulse" />
        </button>
      </div>

      <!-- Right: Code Display -->
      <div class="flex-1 min-w-0">
        <div
          class="rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
          <!-- Terminal Header -->
          <div
            class="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <div class="flex gap-1.5">
                <div
                  class="size-3 rounded-full bg-red-500" />
                <div
                  class="size-3 rounded-full bg-yellow-500" />
                <div
                  class="size-3 rounded-full bg-green-500" />
              </div>
              <div
                class="flex items-center gap-2 text-sm font-mono">
                <span class="text-green-400">$</span>
                <span class="text-white truncate">{{
                  currentDemo?.command
                }}</span>
              </div>
            </div>

            <UButton
              :icon="
                copied
                  ? 'i-heroicons-check'
                  : 'i-heroicons-clipboard-document'
              "
              size="xs"
              :color="copied ? 'success' : 'neutral'"
              variant="ghost"
              :title="t('apiCopy')"
              @click="handleCopy" />
          </div>

          <!-- Code Content -->
          <div class="p-4 overflow-auto max-h-80">
            <pre
              class="text-sm font-mono text-gray-200 whitespace-pre-wrap"
              >{{ currentDemo?.code }}</pre
            >
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-t border-gray-700">
            <UButton
              :to="currentDemo?.docsLink"
              color="primary"
              size="sm"
              icon="i-heroicons-play">
              {{ t("apiTryIt") }}
            </UButton>

            <UButton
              :to="currentDemo?.docsLink"
              color="neutral"
              variant="ghost"
              size="sm"
              trailing-icon="i-heroicons-arrow-top-right-on-square">
              {{ t("apiLearnMore") }}
            </UButton>
          </div>
        </div>

        <!-- Dots Indicator -->
        <div
          class="flex items-center justify-center gap-2 mt-4">
          <button
            v-for="(_, index) in demos"
            :key="index"
            class="size-2.5 rounded-full transition-all duration-200"
            :class="[
              currentIndex === index
                ? 'bg-primary scale-125'
                : 'bg-muted hover:bg-primary/50',
            ]"
            :aria-label="`Go to slide ${index + 1}`"
            @click="handleSelect(index)" />
        </div>
      </div>
    </div>
  </UPageSection>
</template>
