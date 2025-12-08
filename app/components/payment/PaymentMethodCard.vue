<script setup lang="ts">
/**
 * 自定义支付表单组件
 * 实现卡四要素输入和实时校验，不包含提交按钮
 */

interface Props {
  size: "desktop" | "mobile"; // 必需，由父组件传入
}

const props = defineProps<Props>();

const { t } = useI18n();

// size 作为唯一控制源，不再使用窗口宽度检测
const isMobile = computed(() => props.size === "mobile");
// 表单数据
const formData = reactive({
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "",
});

// 校验错误
const errors = reactive({
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "",
});

// 卡品牌类型
type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "jcb"
  | "unknown";
const cardBrand = ref<CardBrand>("unknown");

// 所有支持的卡种列表（用于未识别时展示）
const SUPPORTED_CARD_BRANDS: CardBrand[] = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "jcb",
];

// 移动端轮播状态
const currentCarouselIndex = ref(0);

// 轮播逻辑（移动端自动轮播）
const { pause: pauseCarousel, resume: resumeCarousel } =
  useIntervalFn(
    () => {
      currentCarouselIndex.value =
        (currentCarouselIndex.value + 1) %
        SUPPORTED_CARD_BRANDS.length;
    },
    2000,
    { immediate: false }
  );

// 监听卡种和移动端状态，控制轮播
watch(
  [isMobile, cardBrand],
  ([mobile, brand]) => {
    // 只在移动端且未识别卡种时启动轮播
    if (mobile && brand === "unknown") {
      currentCarouselIndex.value = 0;
      resumeCarousel();
    } else {
      pauseCarousel();
    }
  },
  { immediate: true }
);

// 计算要显示的卡种图标
const displayedCardBrands = computed<CardBrand[]>(() => {
  // 已识别卡种：只显示识别出的图标
  if (cardBrand.value !== "unknown") {
    return [cardBrand.value];
  }

  // 未识别：桌面端显示全部，移动端显示当前轮播的一个
  if (isMobile.value) {
    return [
      SUPPORTED_CARD_BRANDS[currentCarouselIndex.value]!,
    ];
  }

  return SUPPORTED_CARD_BRANDS;
});

/**
 * 识别卡品牌
 * 支持 Visa, Mastercard, Amex, Discover, JCB, UnionPay
 */
const getCardBrand = (cardNumber: string): CardBrand => {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(cleaned)) return "mastercard";
  if (/^3[47]/.test(cleaned)) return "amex";
  if (/^6(?:011|5)/.test(cleaned)) return "discover";
  if (cleaned.startsWith("35")) return "jcb";

  return "unknown";
};

/**
 * 卡品牌图标映射
 */
const cardBrandIcons: Record<CardBrand, string> = {
  visa: "payment:visa",
  mastercard: "logos:mastercard",
  amex: "payment:amex",
  discover: "logos:discover",
  jcb: "logos:jcb",

  unknown: "i-heroicons-credit-card",
};

/**
 * CVV 长度根据卡类型
 * Amex: 4位, 其他: 3位
 */
const cvvLength = computed(() => {
  return cardBrand.value === "amex" ? 4 : 3;
});

/**
 * 格式化卡号：每4位添加空格
 * 4000020951595032 → 4000 0209 5159 5032
 */
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, "");
  const formatted = cleaned
    .replace(/(\d{4})/g, "$1 ")
    .trim();
  return formatted;
};

/**
 * 格式化有效期：自动添加斜杠
 * 1224 → 12/24
 */
const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};

/**
 * Luhn 算法校验卡号
 */
const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits[i] || "0", 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * 校验卡号
 */
const validateCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, "");
  if (!cleaned) return "";
  if (cleaned.length < 13 || cleaned.length > 19) {
    return t("payment.form.errors.invalidCardNumber");
  }
  if (!validateLuhn(cleaned)) {
    return t("payment.form.errors.invalidCardNumber");
  }
  return "";
};

/**
 * 校验有效期
 */
const validateExpiryDate = (value: string): string => {
  if (!value) return "";

  const parts = value.split("/");
  if (parts.length !== 2) {
    return t("payment.form.errors.invalidExpiryDate");
  }

  const month = Number.parseInt(parts[0] || "0", 10);
  const year = Number.parseInt(parts[1] || "0", 10);

  if (month < 1 || month > 12) {
    return t("payment.form.errors.invalidExpiryDate");
  }

  // 检查是否过期
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // 两位年份
  const currentMonth = now.getMonth() + 1;

  if (
    year < currentYear ||
    (year === currentYear && month < currentMonth)
  ) {
    return t("payment.form.errors.cardExpired");
  }

  return "";
};

/**
 * 校验 CVV
 */
const validateCvv = (value: string): string => {
  if (!value) return "";
  const expectedLength = cvvLength.value;
  if (
    !/^\d+$/.test(value) ||
    value.length !== expectedLength
  ) {
    return t("payment.form.errors.invalidCvv");
  }
  return "";
};

/**
 * 校验持卡人姓名
 */
const validateCardholderName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return t("payment.form.errors.invalidName");
  }
  // 姓名至少需要2个字符
  if (trimmed.length < 2) {
    return t("payment.form.errors.nameTooShort");
  }
  // 允许字母、空格、连字符、撇号
  if (!/^[a-z\s\-']+$/i.test(value)) {
    return t("payment.form.errors.invalidName");
  }
  return "";
};

/**
 * 处理卡号输入
 */
const handleCardNumberInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cleaned = input.value
    .replace(/\s/g, "")
    .replace(/\D/g, "");

  // 限制最大长度为19位
  if (cleaned.length > 19) {
    input.value = formData.cardNumber;
    return;
  }

  const formatted = formatCardNumber(cleaned);
  formData.cardNumber = formatted;

  // 同步更新 input 显示值
  input.value = formatted;

  // 更新卡品牌
  cardBrand.value = getCardBrand(cleaned);

  // 开始输入时清除错误，完整输入后再校验
  if (errors.cardNumber && cleaned.length > 0) {
    errors.cardNumber = "";
  }

  // 输入完成后进行校验（长度足够时）
  if (cleaned.length >= 13) {
    errors.cardNumber = validateCardNumber(formatted);
  }
};

/**
 * 处理有效期输入
 */
const handleExpiryDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const formatted = formatExpiryDate(input.value);
  formData.expiryDate = formatted;

  // 同步更新 input 显示值
  input.value = formatted;

  // 开始输入时清除错误
  if (errors.expiryDate && formatted.length > 0) {
    errors.expiryDate = "";
  }

  // 输入完成后进行校验（格式完整时）
  if (formatted.length === 5) {
    errors.expiryDate = validateExpiryDate(formatted);
  }
};

/**
 * 处理 CVV 输入
 */
const handleCvvInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cleaned = input.value.replace(/\D/g, "");
  formData.cvv = cleaned.substring(0, cvvLength.value);

  // 同步更新 input 显示值
  input.value = formData.cvv;

  // 开始输入时清除错误
  if (errors.cvv && formData.cvv.length > 0) {
    errors.cvv = "";
  }

  // 输入完成后进行校验（长度足够时）
  if (formData.cvv.length >= 3) {
    errors.cvv = validateCvv(formData.cvv);
  }
};

/**
 * 处理持卡人姓名输入
 */
const handleCardholderNameInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // 只允许字母、空格、连字符、撇号
  if (/^[a-z\s\-']*$/i.test(value)) {
    formData.cardholderName = value.toUpperCase();
  }

  // 开始输入时清除错误
  if (
    errors.cardholderName &&
    formData.cardholderName.length > 0
  ) {
    errors.cardholderName = "";
  }

  // 输入完成后进行校验（长度足够时）
  if (formData.cardholderName.trim().length >= 2) {
    errors.cardholderName = validateCardholderName(
      formData.cardholderName
    );
  }
};

/**
 * 处理卡号失焦
 */
const handleCardNumberBlur = () => {
  const cleaned = formData.cardNumber.replace(/\s/g, "");
  if (cleaned) {
    // 非空时触发校验
    errors.cardNumber = validateCardNumber(
      formData.cardNumber
    );
  } else {
    // 清空时清除错误
    errors.cardNumber = "";
  }
};

/**
 * 处理有效期失焦
 */
const handleExpiryDateBlur = () => {
  if (formData.expiryDate) {
    // 非空时触发校验
    errors.expiryDate = validateExpiryDate(
      formData.expiryDate
    );
  } else {
    // 清空时清除错误
    errors.expiryDate = "";
  }
};

/**
 * 处理 CVV 失焦
 */
const handleCvvBlur = () => {
  if (formData.cvv) {
    // 非空时触发校验
    errors.cvv = validateCvv(formData.cvv);
  } else {
    // 清空时清除错误
    errors.cvv = "";
  }
};

/**
 * 处理持卡人姓名失焦
 */
const handleCardholderNameBlur = () => {
  const trimmed = formData.cardholderName.trim();
  if (trimmed) {
    // 非空时触发校验
    errors.cardholderName = validateCardholderName(
      formData.cardholderName
    );
  } else {
    // 清空时清除错误
    errors.cardholderName = "";
  }
};

// 暴露表单数据和校验状态（供父组件使用）
defineExpose({
  formData,
  errors,
  cardBrand,
  isValid: computed(() => {
    return (
      !errors.cardNumber &&
      !errors.expiryDate &&
      !errors.cvv &&
      !errors.cardholderName &&
      formData.cardNumber &&
      formData.expiryDate &&
      formData.cvv &&
      formData.cardholderName
    );
  }),
});
</script>

<template>
  <ClientOnly>
    <div class="space-y-6">
      <!-- 表单字段 -->
      <div
        class="space-y-6 rounded-lg"
        :class="isMobile ? 'p-4' : 'ps-2 pe-6'"
        role="form"
        :aria-label="t('payment.methods.cardPayment')">
        <!-- 卡号输入 -->
        <UFormField
          :label="t('payment.form.cardNumber')"
          :error="errors.cardNumber || undefined"
          required
          size="xl">
          <UInput
            :model-value="formData.cardNumber"
            type="text"
            class="w-full"
            autocomplete="cc-number"
            size="xl"
            :placeholder="
              t('payment.form.cardNumberPlaceholder')
            "
            maxlength="23"
            :aria-invalid="!!errors.cardNumber"
            :aria-describedby="
              errors.cardNumber
                ? 'card-number-error'
                : undefined
            "
            @input="handleCardNumberInput"
            @blur="handleCardNumberBlur">
            <template #trailing>
              <div class="flex items-center gap-1.5">
                <UIcon
                  v-for="brand in displayedCardBrands"
                  :key="brand"
                  :name="cardBrandIcons[brand]"
                  class="w-8 h-6 shrink-0 dark:bg-inverted rounded-sm"
                  aria-hidden="true" />
              </div>
            </template>
          </UInput>
        </UFormField>

        <!-- 有效期 + CVV -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 有效期 -->
          <UFormField
            :label="t('payment.form.expiryDate')"
            :error="errors.expiryDate || undefined"
            required
            size="xl">
            <UInput
              :model-value="formData.expiryDate"
              type="text"
              autocomplete="cc-exp"
              size="xl"
              class="w-full"
              :placeholder="
                t('payment.form.expiryDatePlaceholder')
              "
              maxlength="5"
              :aria-invalid="!!errors.expiryDate"
              :aria-describedby="
                errors.expiryDate
                  ? 'expiry-date-error'
                  : undefined
              "
              @input="handleExpiryDateInput"
              @blur="handleExpiryDateBlur" />
          </UFormField>

          <!-- CVV -->
          <UFormField
            :label="t('payment.form.cvv')"
            :error="errors.cvv || undefined"
            required
            size="xl">
            <UInput
              :model-value="formData.cvv"
              type="text"
              autocomplete="cc-csc"
              size="xl"
              class="w-full"
              :placeholder="
                t('payment.form.cvvPlaceholder')
              "
              :maxlength="cvvLength"
              :aria-invalid="!!errors.cvv"
              :aria-describedby="
                errors.cvv ? 'cvv-error' : undefined
              "
              @input="handleCvvInput"
              @blur="handleCvvBlur" />
          </UFormField>
        </div>

        <!-- 持卡人姓名 -->
        <UFormField
          :label="t('payment.form.cardholderName')"
          :error="errors.cardholderName || undefined"
          required
          size="xl">
          <UInput
            :model-value="formData.cardholderName"
            type="text"
            class="w-full"
            autocomplete="cc-name"
            size="xl"
            :placeholder="
              t('payment.form.cardholderNamePlaceholder')
            "
            :aria-invalid="!!errors.cardholderName"
            :aria-describedby="
              errors.cardholderName
                ? 'cardholder-name-error'
                : undefined
            "
            @input="handleCardholderNameInput"
            @blur="handleCardholderNameBlur" />
        </UFormField>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
/* 增强 focus ring 过渡流畅度 */
:deep(input) {
  transition-property:
    color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity,
    box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
