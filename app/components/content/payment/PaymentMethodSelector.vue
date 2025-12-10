<script setup lang="ts">
/**
 * 支付方式选择器
 * 可复用的核心组件，支持 tabs 和 accordion 两种布局
 */
import type { PaymentMethod } from "~/composables/usePaymentConfig";

interface Props {
  layout: "tabs" | "accordion";
  paymentMethods: PaymentMethod[];
  modelValue?: string;
  size: "desktop" | "mobile"; // 必需，由父组件传入
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "0",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { t } = useI18n();

// 当前选中的支付方式
const selectedMethod = computed({
  get: () => props.modelValue || "0",
  set: (value: string) => emit("update:modelValue", value),
});

// Tabs 数据结构
const tabItems = computed(() => {
  return props.paymentMethods.map((pm) => ({
    key: pm.id,
    label: t(pm.name),
    icon: pm.icon,
    slot: pm.id,
  }));
});

// Accordion 数据结构
const accordionItems = computed(() => {
  return props.paymentMethods.map((pm) => ({
    key: pm.id,
    label: t(pm.name),
    icon: pm.icon,
    slot: pm.id,
    defaultOpen: false,
    class: "data-[state=open]:text-primary",
  }));
});
</script>

<template>
  <div
    class="w-full"
    role="region"
    :aria-label="t('payment.paymentMethodSelector')">
    <!-- Tabs Layout -->
    <UTabs
      v-if="layout === 'tabs'"
      v-model="selectedMethod"
      :items="tabItems"
      variant="pill">
      <template
        v-for="method in paymentMethods"
        :key="method.id"
        #[method.id]>
        <div
          :class="
            size === 'mobile' ? 'p-2' : 'p-2 sm:p-12'
          ">
          <PaymentMethodCard
            v-if="
              method.type === 'card' &&
              method.cardImplementation === 'custom'
            "
            :size="size" />
          <PaymentMethodWallet
            v-else-if="method.type === 'wallet'"
            :size="size"
            :payment-method-id="method.id"
            :icon="method.icon"
            :name="t(method.name)"
            :description="
              method.description
                ? t(method.description)
                : undefined
            "
            :icon-size="method.iconSize"
            :interaction-type="method.interactionType" />
        </div>
      </template>
    </UTabs>

    <!-- Accordion Layout -->
    <UAccordion
      v-else-if="layout === 'accordion'"
      v-model="selectedMethod"
      :items="accordionItems"
      type="single"
      variant="pill">
      <template
        v-for="method in paymentMethods"
        :key="method.id"
        #[method.id]>
        <div
          :class="
            size === 'mobile' ? 'p-2' : 'p-2 sm:p-12'
          ">
          <PaymentMethodCard
            v-if="
              method.type === 'card' &&
              method.cardImplementation === 'custom'
            "
            :size="size" />
          <PaymentMethodWallet
            v-else-if="method.type === 'wallet'"
            :size="size"
            :payment-method-id="method.id"
            :icon="method.icon"
            :name="t(method.name)"
            :description="
              method.description
                ? t(method.description)
                : undefined
            "
            :icon-size="method.iconSize"
            :interaction-type="method.interactionType" />
        </div>
      </template>
    </UAccordion>
  </div>
</template>
