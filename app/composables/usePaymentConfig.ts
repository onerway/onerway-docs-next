/**
 * Payment Configuration Composable
 * 支付配置和工具函数
 */

export interface CountryConfig {
  code: string;
  name: string; // i18n key
  currency: string;
  currencySymbol: string;
  flag: string;
}

/**
 * 支付方式交互类型
 * - direct: 直接支付（如 Google Pay、Apple Pay）
 * - redirect: 跳转到第三方页面（如 Afterpay）
 * - qr_code: 扫码支付（如 WeChat）
 * - voucher: 凭证/票据支付（如 OXXO、Konbini、Boleto）
 * - bank_transfer: 银行转账（如 SEPA、iDEAL）
 */
export type PaymentInteractionType =
  | "direct"
  | "redirect"
  | "qr_code"
  | "voucher"
  | "bank_transfer";

/**
 * 图标大小配置
 * - sm: 小图标
 * - md: 中等图标（默认）
 * - lg: 大图标
 * - xl: 超大图标（适合二维码等）
 */
export type IconSize = "sm" | "md" | "lg" | "xl";

export interface PaymentMethod {
  id: string;
  type: "card" | "wallet";
  name: string; // i18n key
  icon: string;
  description?: string; // i18n key
  cardImplementation?: "sdk" | "custom"; // 卡片实现方式
  interactionType?: PaymentInteractionType; // 交互类型
  iconSize?: IconSize; // 自定义图标大小（可选，默认根据 interactionType 自动判断）
}

/**
 * 配置选项接口
 * 支持外部注入自定义配置
 */
export interface PaymentConfigOptions {
  /** 自定义国家/地区列表 */
  countries?: CountryConfig[];
  /** 自定义支付方式列表 */
  paymentMethods?: PaymentMethod[];
  /** 自定义国家支付方式映射 */
  countryPaymentMethods?: Record<string, string[]>;
  /** localStorage key 前缀，默认 'payment-demo' */
  storagePrefix?: string;
}

/**
 * 默认支持的国家/地区配置
 */
export const DEFAULT_COUNTRIES: CountryConfig[] = [
  {
    code: "US",
    name: "payment.countries.us",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇺🇸",
  },
  {
    code: "GB",
    name: "payment.countries.gb",
    currency: "GBP",
    currencySymbol: "£",
    flag: "🇬🇧",
  },
  {
    code: "DE",
    name: "payment.countries.de",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇩🇪",
  },
  {
    code: "BR",
    name: "payment.countries.br",
    currency: "BRL",
    currencySymbol: "R$",
    flag: "🇧🇷",
  },
  {
    code: "ID",
    name: "payment.countries.id",
    currency: "IDR",
    currencySymbol: "Rp",
    flag: "🇮🇩",
  },
  {
    code: "MX",
    name: "payment.countries.mx",
    currency: "MXN",
    currencySymbol: "$",
    flag: "🇲🇽",
  },
  {
    code: "JP",
    name: "payment.countries.jp",
    currency: "JPY",
    currencySymbol: "¥",
    flag: "🇯🇵",
  },
];

/**
 * 默认支付方式配置
 */
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  // Card Payment
  {
    id: "card",
    type: "card",
    name: "payment.methods.card",
    icon: "i-heroicons-credit-card",
    cardImplementation: "custom",
    interactionType: "direct",
  },
  // Digital Wallets - Direct Payment
  {
    id: "google_pay",
    type: "wallet",
    name: "payment.methods.googlePay",
    icon: "payment:google-pay",
    description: "payment.methods.walletNotice",
    interactionType: "direct",
    iconSize: "lg",
  },
  {
    id: "apple_pay",
    type: "wallet",
    name: "payment.methods.applePay",
    icon: "payment:apple-pay",
    description: "payment.methods.walletNotice",
    interactionType: "direct",
    iconSize: "lg",
  },
  {
    id: "wechat",
    type: "wallet",
    name: "payment.methods.wechat",
    icon: "payment:wechat",
    description: "payment.methods.wechatQrNotice",
    interactionType: "qr_code",
    iconSize: "lg",
  },
  // Bank Transfers
  {
    id: "sepa",
    type: "wallet",
    name: "payment.methods.sepa",
    icon: "payment:sepa",
    description: "payment.methods.bankTransferNotice",
    interactionType: "bank_transfer",
    iconSize: "lg",
  },
  {
    id: "ideal",
    type: "wallet",
    name: "payment.methods.ideal",
    icon: "payment:ideal",
    description: "payment.methods.bankTransferNotice",
    interactionType: "bank_transfer",
    iconSize: "lg",
  },
  {
    id: "bancontact",
    type: "wallet",
    name: "payment.methods.bancontact",
    icon: "payment:bancontact",
    description: "payment.methods.bankTransferNotice",
    interactionType: "bank_transfer",
    iconSize: "lg",
  },
  {
    id: "przelewy24",
    type: "wallet",
    name: "payment.methods.przelewy24",
    icon: "payment:przelewy24",
    description: "payment.methods.bankTransferNotice",
    interactionType: "bank_transfer",
    iconSize: "lg",
  },
  // BNPL & Redirect-based
  {
    id: "afterpay",
    type: "wallet",
    name: "payment.methods.afterpay",
    icon: "payment:afterpay",
    description: "payment.methods.redirectNotice",
    interactionType: "redirect",
    iconSize: "lg",
  },
  // Voucher & Cash-based
  {
    id: "boleto",
    type: "wallet",
    name: "payment.methods.boleto",
    icon: "payment:boleto",
    description: "payment.methods.voucherNotice",
    interactionType: "voucher",
    iconSize: "lg",
  },
  {
    id: "oxxo",
    type: "wallet",
    name: "payment.methods.oxxo",
    icon: "payment:oxxo",
    description: "payment.methods.voucherNotice",
    interactionType: "voucher",
    iconSize: "xl",
  },
  {
    id: "konbini",
    type: "wallet",
    name: "payment.methods.konbini",
    icon: "payment:konbini",
    description: "payment.methods.voucherNotice",
    interactionType: "voucher",
    iconSize: "lg",
  },
  // Asia-Pacific - Direct & QR
  {
    id: "dana",
    type: "wallet",
    name: "payment.methods.dana",
    icon: "payment:dana",
    description: "payment.methods.walletNotice",
    interactionType: "direct",
    iconSize: "lg",
  },
  {
    id: "qris",
    type: "wallet",
    name: "payment.methods.qris",
    icon: "payment:qris",
    description: "payment.methods.qrCodeNotice",
    interactionType: "qr_code",
    iconSize: "xl",
  },
  {
    id: "ovo",
    type: "wallet",
    name: "payment.methods.ovo",
    icon: "payment:ovo",
    description: "payment.methods.walletNotice",
    interactionType: "direct",
    iconSize: "lg",
  },
  {
    id: "paypay",
    type: "wallet",
    name: "payment.methods.paypay",
    icon: "payment:paypay",
    description: "payment.methods.walletNotice",
    interactionType: "direct",
    iconSize: "lg",
  },
];

/**
 * 默认国家支持的支付方式映射
 */
export const DEFAULT_COUNTRY_PAYMENT_METHODS: Record<
  string,
  string[]
> = {
  DE: [
    "card",
    "sepa",
    "google_pay",
    "ideal",
    "przelewy24",
    "apple_pay",
  ],
  US: ["card", "google_pay", "afterpay", "apple_pay"],
  GB: ["card", "wechat", "google_pay", "apple_pay"],
  BR: ["card", "boleto", "google_pay", "apple_pay"],
  ID: ["dana", "qris", "ovo"],
  MX: ["card", "oxxo", "google_pay", "apple_pay"],
  JP: [
    "card",
    "konbini",
    "paypay",
    "google_pay",
    "apple_pay",
  ],
};

/**
 * 根据图标大小配置返回对应的 CSS 类
 * @param size 图标大小
 * @param breakpoint 断点前缀（如 'sm:'）
 */
export const getIconSizeClass = (
  size: IconSize = "md",
  breakpoint?: string
): string => {
  const prefix = breakpoint || "";
  const sizeMap: Record<IconSize, string> = {
    sm: `${prefix}size-8`,
    md: `${prefix}size-12`,
    lg: `${prefix}size-16`,
    xl: `${prefix}size-20`,
  };
  return sizeMap[size];
};

/**
 * 根据支付方式获取推荐的图标大小类（移动端 + 桌面端）
 * @param paymentMethod 支付方式
 */
export const getPaymentMethodIconClasses = (
  paymentMethod: PaymentMethod
): string => {
  const iconSize = paymentMethod.iconSize || "md";

  // 移动端图标固定为较小尺寸
  const mobileSize: IconSize =
    iconSize === "xl" ? "md" : "sm";

  return `${getIconSizeClass(mobileSize)} ${getIconSizeClass(iconSize, "sm:")}`;
};

/**
 * 支付配置 Composable
 * @param options 可选配置项，支持自定义国家、支付方式和存储前缀
 */
export const usePaymentConfig = (
  options?: PaymentConfigOptions
) => {
  // 合并配置
  const countries = options?.countries ?? DEFAULT_COUNTRIES;
  const paymentMethods =
    options?.paymentMethods ?? DEFAULT_PAYMENT_METHODS;
  const countryPaymentMethods =
    options?.countryPaymentMethods ??
    DEFAULT_COUNTRY_PAYMENT_METHODS;
  const storagePrefix =
    options?.storagePrefix ?? "payment-demo";

  /**
   * 获取 localStorage key
   */
  const getStorageKey = (key: string): string => {
    return `${storagePrefix}-${key}`;
  };

  /**
   * 获取国家配置
   */
  const getCountryConfig = (
    countryCode: string
  ): CountryConfig | undefined => {
    return countries.find((c) => c.code === countryCode);
  };

  /**
   * 判断支付方式在指定国家/地区是否可用
   */
  const isPaymentMethodAvailable = (
    paymentMethodId: string,
    countryCode: string
  ): boolean => {
    const supportedMethods =
      countryPaymentMethods[countryCode];
    if (!supportedMethods) return false;
    return supportedMethods.includes(paymentMethodId);
  };

  /**
   * 获取指定国家可用的支付方式
   */
  const getAvailablePaymentMethods = (
    countryCode: string
  ): PaymentMethod[] => {
    return paymentMethods.filter((pm) =>
      isPaymentMethodAvailable(pm.id, countryCode)
    );
  };

  /**
   * 解析支付方式列表（支持数组或逗号分隔字符串）
   */
  const parsePaymentMethodIds = (
    input?: string[] | string
  ): string[] | undefined => {
    if (!input) return undefined;
    if (Array.isArray(input)) return input;
    return input
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  };

  /**
   * 获取过滤后的可用支付方式
   * @param countryCode 国家代码
   * @param allowedIds 允许的支付方式 ID 列表（可选，支持数组或逗号分隔字符串）
   */
  const getFilteredPaymentMethods = (
    countryCode: string,
    allowedIds?: string[] | string
  ): PaymentMethod[] => {
    const parsedIds = parsePaymentMethodIds(allowedIds);
    const available =
      getAvailablePaymentMethods(countryCode);

    if (!parsedIds) return available;

    return available.filter((pm) =>
      parsedIds.includes(pm.id)
    );
  };

  /**
   * 验证国家代码是否在支持列表中
   */
  const isCountrySupported = (
    countryCode: string
  ): boolean => {
    return countries.some((c) => c.code === countryCode);
  };

  /**
   * 获取有效的国家代码（如果不支持则返回默认值 US）
   */
  const getValidCountryCode = (
    countryCode?: string
  ): string => {
    if (!countryCode) return "US";
    const upperCode = countryCode.toUpperCase();
    return isCountrySupported(upperCode) ? upperCode : "US";
  };

  return {
    // 配置数据
    countries,
    paymentMethods,
    countryPaymentMethods,
    storagePrefix,
    // 工具函数
    getStorageKey,
    getCountryConfig,
    isPaymentMethodAvailable,
    getAvailablePaymentMethods,
    getFilteredPaymentMethods,
    isCountrySupported,
    getValidCountryCode,
  };
};
