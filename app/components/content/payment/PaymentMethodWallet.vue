<script setup lang="ts">
/**
 * 数字钱包支付组件
 * 用于展示 Google Pay / Apple Pay 等钱包支付方式
 */
import type { IconSize } from "~/composables/usePaymentConfig";

interface Props {
  size: "desktop" | "mobile"; // 必需，由父组件传入
  paymentMethodId?: string;
  icon: string | object; // Iconify string or Vue component
  name: string;
  description?: string;
  iconSize?: IconSize; // 图标大小配置
  interactionType?:
    | "direct"
    | "redirect"
    | "qr_code"
    | "voucher"
    | "bank_transfer"; // 交互类型（可选，用于未来扩展）
}

const props = defineProps<Props>();

// size 作为唯一控制源
const isMobile = computed(() => props.size === "mobile");

const { t } = useI18n();

/**
 * 根据配置和 size 获取图标大小类
 * size 作为唯一控制源，不使用媒体查询
 */
const iconClasses = computed(() => {
  // 根据 iconSize 配置和 isMobile 状态计算图标大小
  const iconSize = props.iconSize || "md";

  // 移动端使用较小的图标
  if (isMobile.value) {
    const mobileSizeMap: Record<IconSize, string> = {
      sm: "size-6",
      md: "size-8",
      lg: "size-10",
      xl: "size-12",
    };
    return mobileSizeMap[iconSize];
  }

  // 桌面端使用较大的图标
  const desktopSizeMap: Record<IconSize, string> = {
    sm: "size-8",
    md: "size-12",
    lg: "size-16",
    xl: "size-20",
  };
  return desktopSizeMap[iconSize];
});

/**
 * 根据交互类型返回对应的信息图标
 */
const infoIcon = computed(() => {
  const iconMap: Record<
    NonNullable<typeof props.interactionType>,
    string
  > = {
    direct: "i-heroicons-check-circle", // 直接支付 - 完成图标
    redirect: "i-heroicons-arrow-top-right-on-square", // 跳转 - 外部链接
    qr_code: "i-heroicons-qr-code", // 扫码 - 二维码图标
    voucher: "i-heroicons-ticket", // 凭证 - 票据图标
    bank_transfer: "i-heroicons-building-library", // 银行转账 - 银行图标
  };

  return (
    (props.interactionType &&
      iconMap[props.interactionType]) ||
    "i-heroicons-information-circle"
  );
});
</script>

<template>
  <div
    class="bg-background rounded-lg border border-default"
    :class="isMobile ? 'space-y-3 p-4' : 'space-y-4 p-6'"
    role="region"
    :aria-label="
      t('payment.methods.walletPayment', {
        method: name,
      })
    ">
    <!-- Wallet Icon and Name -->
    <div
      class="flex items-center"
      :class="isMobile ? 'gap-3' : 'gap-4'">
      <div
        class="flex items-center justify-center rounded-lg dark:bg-inverted p-2"
        aria-hidden="true">
        <UIcon
          :name="icon"
          :class="iconClasses" />
      </div>
      <div>
        <p
          class="font-medium text-default dark:text-highlighted"
          :class="isMobile ? 'text-sm' : 'text-base'">
          {{ name }}
        </p>
        <p
          class="text-muted"
          :class="isMobile ? 'text-xs' : 'text-sm'">
          {{ t("payment.methods.selected") }}
        </p>
      </div>
    </div>

    <!-- Information Notice -->
    <div
      v-if="description"
      class="flex items-start bg-muted rounded-lg border border-default"
      :class="isMobile ? 'gap-2 p-3' : 'gap-3 p-4'"
      role="alert"
      aria-live="polite">
      <UIcon
        :name="infoIcon"
        class="text-muted shrink-0 mt-0.5"
        :class="isMobile ? 'size-4' : 'size-5'"
        aria-hidden="true" />
      <p
        class="text-muted"
        :class="isMobile ? 'text-xs' : 'text-sm'">
        {{ description }}
      </p>
    </div>
  </div>
</template>
