<script setup lang="ts">
import {
  breakpointsTailwind,
  useBreakpoints,
} from "@vueuse/core";

/**
 * DemoSection
 * 首页 API 演示轮播区域，展示交互式 API 示例
 * 仅在大屏幕显示 (lg:block)
 *
 * 使用 ProseCarousel（面向文档内容的 Carousel 封装）实现：
 * - 基于 Nuxt UI `UCarousel`
 * - Tabs triggers（未来可平滑迁移到 MDC 写法）
 * - 自动播放，交互后暂停
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

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(
  () => breakpoints.smaller("sm").value
);
</script>

<template>
  <UPageSection
    :ui="{
      container:
        'px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12',
    }">
    <h3 class="text-2xl font-bold text-default">
      {{ t("apiTitle") }}
    </h3>
    <ProseCarousel
      variant="tabs"
      :trigger-placement="isMobile ? 'top' : 'auto'"
      :tabs="{
        items: demos.map((d) => ({
          label: d.label,
          icon: d.icon,
        })),
        orientation: isMobile ? 'horizontal' : 'vertical',
      }"
      :carousel-props="{
        loop: true,
        fade: true,
        autoHeight: true,
        autoplay: { delay: 3000, stopOnInteraction: true },
        ui: {
          // 只控制 autoHeight 的高度过渡；宽度请在外层容器限制，避免 track/viewport 对齐问题
          container: 'transition-[height] duration-300',
        },
      }"
      pause-on-interaction
      class="w-full max-w-5xl mx-auto"
      aria-label="API Demo Carousel">
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template
        v-for="(demo, idx) in demos"
        :key="demo.id"
        #[`slide-${idx+1}`]>
        <ProseCodeCard
          :command="demo.command"
          :code="demo.code"
          fixed-height
          :copy-label="t('apiCopy')"
          :footer="{
            tryItTo: demo.docsLink,
            learnMoreTo: demo.docsLink,
            tryItLabel: t('apiTryIt'),
            learnMoreLabel: t('apiLearnMore'),
          }" />
      </template>
    </ProseCarousel>
  </UPageSection>
</template>
