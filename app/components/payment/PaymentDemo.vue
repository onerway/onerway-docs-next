<script setup lang="ts">
/**
 * 支付方式演示主容器
 * 管理 header 配置（location、size、layout）和整体布局
 */
interface Props {
  allowedMethods?: string[] | string;
}

const props = withDefaults(defineProps<Props>(), {
  allowedMethods: undefined,
});

const { t } = useI18n();
const {
  countries,
  getFilteredPaymentMethods,
  getValidCountryCode,
  getStorageKey,
} = usePaymentConfig();

/**
 * 从 User-Agent 推断设备类型（用于 SSR）
 */
const detectDeviceFromUA = (
  ua?: string
): "desktop" | "mobile" => {
  if (!ua) return "desktop";
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return mobileRegex.test(ua.toLowerCase())
    ? "mobile"
    : "desktop";
};

/**
 * 检测客户端设备类型（用于客户端）
 */
const detectClientDevice = (): "mobile" | "desktop" => {
  if (!import.meta.client) return "desktop";

  const isMobileWidth = window.innerWidth < 768;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  return isMobileWidth || (isMobileUA && isTouchDevice)
    ? "mobile"
    : "desktop";
};

// ========== Size 状态管理（使用 Cookie，SSR 友好）==========
const selectedSize = useCookie<"desktop" | "mobile">(
  "payment-demo-size",
  {
    default: () => {
      // SSR 时通过 User-Agent 推断
      if (import.meta.server) {
        const headers = useRequestHeaders(["user-agent"]);
        return detectDeviceFromUA(headers["user-agent"]);
      }
      return "desktop";
    },
  }
);

// 客户端首次访问时，如果检测到移动端但 cookie 是默认值，则更新
onMounted(() => {
  if (selectedSize.value === "desktop") {
    const detected = detectClientDevice();
    if (detected === "mobile") {
      selectedSize.value = "mobile";
    }
  }
});

// ========== 其他状态管理（保持 localStorage）==========
const selectedCountry = ref("US");
const selectedLayout = ref<"tabs" | "accordion">(
  "accordion"
);

// localStorage 偏好恢复
const restoreCountryPreference = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(
      getStorageKey("country")
    );
    if (saved) {
      selectedCountry.value = getValidCountryCode(saved);
    }
  }
};

const restoreLayoutPreference = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem(
      getStorageKey("layout")
    ) as "tabs" | "accordion" | null;
    if (
      saved &&
      (saved === "tabs" || saved === "accordion")
    ) {
      selectedLayout.value = saved;
    }
  }
};

// 监听状态变化，保存到 localStorage
watch(selectedCountry, (v) => {
  if (import.meta.client) {
    localStorage.setItem(getStorageKey("country"), v);
  }
});

watch(selectedLayout, (v) => {
  if (import.meta.client) {
    localStorage.setItem(getStorageKey("layout"), v);
  }
});

onMounted(() => {
  restoreCountryPreference();
  restoreLayoutPreference();
});

// 当前选中的支付方式
const selectedPaymentMethod = ref("");

// 计算可用的支付方式
const availablePaymentMethods = computed(() => {
  return getFilteredPaymentMethods(
    selectedCountry.value,
    props.allowedMethods
  );
});

// 国家选择选项 - PC 端完整显示
const countryOptions = countries.map((country) => ({
  value: country.code,
  label: `${country.flag} ${t(country.name)} (${country.currency})`,
}));

// 国家选择选项 - 移动端简化显示
const countryOptionsMobile = countries.map((country) => ({
  value: country.code,
  label: t(country.name),
  flag: country.flag,
}));

// 当前选中的国家信息
const selectedCountryInfo = computed(() => {
  return countries.find(
    (c) => c.code === selectedCountry.value
  );
});

// Size 选项
const sizeOptions = [
  {
    value: "desktop",
    label: t("payment.sizes.desktop"),
    icon: "i-heroicons-computer-desktop",
  },
  {
    value: "mobile",
    label: t("payment.sizes.mobile"),
    icon: "i-heroicons-device-phone-mobile",
  },
];

// Layout 选项
const layoutOptions = [
  {
    value: "tabs",
    label: t("payment.layouts.tabs"),
    icon: "i-heroicons-squares-2x2",
  },
  {
    value: "accordion",
    label: t("payment.layouts.accordion"),
    icon: "i-heroicons-bars-3",
  },
];

// 响应式容器宽度
const containerWidth = computed(() => {
  return selectedSize.value === "mobile"
    ? "max-w-sm"
    : "max-w-3xl";
});
</script>

<template>
  <div
    class="w-full mx-auto py-4 sm:py-8"
    role="region"
    :aria-label="t('payment.title')">
    <UCard
      variant="outline"
      :ui="{
        root: 'overflow-visible rounded-xl shadow-lg',
      }">
      <!-- Header: Configuration Controls -->
      <template #header>
        <!-- ========== 移动端 Header ========== -->
        <div class="sm:hidden">
          <div
            class="flex items-center justify-between gap-3">
            <!-- 左侧: 国家选择 -->
            <USelectMenu
              v-model="selectedCountry"
              :items="countryOptionsMobile"
              value-key="value"
              :aria-label="t('payment.customerLocation')"
              :ui="{
                base: 'min-w-[120px]',
                itemLeadingIcon: 'hidden',
              }">
              <template #leading>
                <span class="text-base">
                  {{ selectedCountryInfo?.flag }}
                </span>
              </template>
              <template #item="{ item }">
                <span class="flex items-center gap-2">
                  <span class="text-base">{{
                    item.flag
                  }}</span>
                  <span>{{ item.label }}</span>
                </span>
              </template>
            </USelectMenu>

            <!-- 右侧: 切换控件 -->
            <div class="flex items-center gap-2">
              <!-- 设备类型切换 -->
              <UFieldGroup size="xs">
                <UButton
                  :color="
                    selectedSize === 'desktop'
                      ? 'primary'
                      : 'neutral'
                  "
                  :variant="
                    selectedSize === 'desktop'
                      ? 'solid'
                      : 'ghost'
                  "
                  icon="i-heroicons-computer-desktop"
                  :aria-label="t('payment.sizes.desktop')"
                  square
                  @click="selectedSize = 'desktop'" />
                <UButton
                  :color="
                    selectedSize === 'mobile'
                      ? 'primary'
                      : 'neutral'
                  "
                  :variant="
                    selectedSize === 'mobile'
                      ? 'solid'
                      : 'ghost'
                  "
                  icon="i-heroicons-device-phone-mobile"
                  :aria-label="t('payment.sizes.mobile')"
                  square
                  @click="selectedSize = 'mobile'" />
              </UFieldGroup>

              <!-- 分隔符 -->
              <div class="h-4 w-px bg-default" />

              <!-- 展示风格切换 -->
              <UFieldGroup size="xs">
                <UButton
                  :color="
                    selectedLayout === 'tabs'
                      ? 'primary'
                      : 'neutral'
                  "
                  :variant="
                    selectedLayout === 'tabs'
                      ? 'solid'
                      : 'ghost'
                  "
                  icon="i-heroicons-squares-2x2"
                  :aria-label="t('payment.layouts.tabs')"
                  square
                  @click="selectedLayout = 'tabs'" />
                <UButton
                  :color="
                    selectedLayout === 'accordion'
                      ? 'primary'
                      : 'neutral'
                  "
                  :variant="
                    selectedLayout === 'accordion'
                      ? 'solid'
                      : 'ghost'
                  "
                  icon="i-heroicons-bars-3"
                  :aria-label="
                    t('payment.layouts.accordion')
                  "
                  square
                  @click="selectedLayout = 'accordion'" />
              </UFieldGroup>
            </div>
          </div>
        </div>

        <!-- ========== PC 端 Header ========== -->
        <div class="hidden sm:block space-y-3">
          <!-- Customer Location - Full Width Row -->
          <div class="flex items-center gap-2">
            <span
              class="text-sm text-muted whitespace-nowrap shrink-0">
              {{ t("payment.customerLocation") }}
            </span>
            <USelectMenu
              v-model="selectedCountry"
              :items="countryOptions"
              value-key="value"
              :aria-label="t('payment.customerLocation')"
              class="flex-1 min-w-0" />
          </div>

          <!-- Size and Layout Controls - Grid Layout -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Size Selector -->
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-sm text-muted whitespace-nowrap shrink-0">
                {{ t("payment.size") }}
              </span>
              <USelectMenu
                v-model="selectedSize"
                :items="sizeOptions"
                value-key="value"
                :aria-label="t('payment.size')"
                class="flex-1 min-w-0">
                <template #leading>
                  <UIcon
                    :name="
                      sizeOptions.find(
                        (o) => o.value === selectedSize
                      )?.icon ||
                      'i-heroicons-computer-desktop'
                    "
                    class="size-4 shrink-0" />
                </template>
              </USelectMenu>
            </div>

            <!-- Layout Selector -->
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-sm text-muted whitespace-nowrap shrink-0">
                {{ t("payment.layout") }}
              </span>
              <USelectMenu
                v-model="selectedLayout"
                :items="layoutOptions"
                value-key="value"
                :aria-label="t('payment.layout')"
                class="flex-1 min-w-0">
                <template #leading>
                  <UIcon
                    :name="
                      layoutOptions.find(
                        (o) => o.value === selectedLayout
                      )?.icon || 'i-heroicons-squares-2x2'
                    "
                    class="size-4 shrink-0" />
                </template>
              </USelectMenu>
            </div>
          </div>
        </div>
      </template>

      <!-- Body: Payment Method Selector -->
      <div
        class="transition-all duration-300 mx-auto"
        :class="containerWidth">
        <PaymentMethodSelector
          v-model="selectedPaymentMethod"
          :layout="selectedLayout"
          :size="selectedSize"
          :payment-methods="availablePaymentMethods" />
      </div>

      <!-- Footer: Disclaimer -->
      <template #footer>
        <div
          class="flex items-start gap-2 text-xs text-muted"
          role="note">
          <UIcon
            name="i-heroicons-information-circle"
            class="size-4 shrink-0 mt-0.5"
            aria-hidden="true" />
          <p>{{ t("payment.disclaimer") }}</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
