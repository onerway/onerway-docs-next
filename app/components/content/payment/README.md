# Payment Demo 组件

一个可复用的支付方式演示组件，支持多国家、多支付方式的展示，可轻松复制到其他 Nuxt 项目使用。

## 快速开始

### 在 Markdown (MDC) 中使用

```md
::payment-demo
::
```

### 在 Vue 组件中使用

```vue
<template>
  <PaymentDemo />
</template>
```

### 限制支付方式

```md
::payment-demo{allowed-methods="card,google_pay,apple_pay"}
::
```

## 组件结构

```
app/components/payment/
├── PaymentDemo.vue           # 主容器组件
├── PaymentMethodSelector.vue # 支付方式选择器
├── PaymentMethodCard.vue     # 银行卡支付表单
├── PaymentMethodWallet.vue   # 钱包类支付展示
└── README.md                 # 本文档

app/composables/
├── usePaymentConfig.ts       # 配置和工具函数
└── payment/
    └── types.ts              # 类型导出
```

## Props API

### PaymentDemo

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `allowedMethods` | `string[] \| string` | `undefined` | 限制显示的支付方式，支持数组或逗号分隔字符串 |

### PaymentMethodSelector

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `layout` | `'tabs' \| 'accordion'` | - | 布局模式 |
| `paymentMethods` | `PaymentMethod[]` | - | 支付方式列表 |
| `modelValue` | `string` | `'0'` | 当前选中的支付方式 ID |

## 自定义配置

### 使用自定义国家和支付方式

```typescript
const {
  countries,
  paymentMethods,
  getFilteredPaymentMethods,
} = usePaymentConfig({
  countries: [
    { code: 'CN', name: 'payment.countries.cn', currency: 'CNY', currencySymbol: '¥', flag: '🇨🇳' },
  ],
  paymentMethods: [
    { id: 'alipay', type: 'wallet', name: 'payment.methods.alipay', icon: 'payment:alipay' },
  ],
  countryPaymentMethods: {
    CN: ['alipay'],
  },
  storagePrefix: 'my-app-payment', // 自定义 localStorage 前缀
});
```

## i18n 翻译 Key

组件使用以下 i18n key，请确保在项目的翻译文件中定义：

### 界面文案

| Key | 说明 |
|-----|------|
| `payment.title` | 组件标题 |
| `payment.customerLocation` | 客户所在地标签 |
| `payment.size` | 尺寸选择标签 |
| `payment.layout` | 布局选择标签 |
| `payment.disclaimer` | 免责声明 |
| `payment.paymentMethodSelector` | 无障碍标签 |
| `payment.sizes.desktop` | 桌面端 |
| `payment.sizes.mobile` | 移动端 |
| `payment.layouts.tabs` | 标签页布局 |
| `payment.layouts.accordion` | 折叠面板布局 |

### 国家名称

| Key | 说明 |
|-----|------|
| `payment.countries.us` | 美国 |
| `payment.countries.gb` | 英国 |
| `payment.countries.de` | 德国 |
| `payment.countries.br` | 巴西 |
| `payment.countries.id` | 印度尼西亚 |
| `payment.countries.mx` | 墨西哥 |
| `payment.countries.jp` | 日本 |

### 支付方式

| Key | 说明 |
|-----|------|
| `payment.methods.card` | 银行卡 |
| `payment.methods.googlePay` | Google Pay |
| `payment.methods.applePay` | Apple Pay |
| `payment.methods.wechat` | 微信支付 |
| `payment.methods.sepa` | SEPA 直接借记 |
| `payment.methods.ideal` | iDEAL |
| `payment.methods.bancontact` | Bancontact |
| `payment.methods.przelewy24` | Przelewy24 |
| `payment.methods.afterpay` | Afterpay |
| `payment.methods.boleto` | Boleto |
| `payment.methods.oxxo` | OXXO |
| `payment.methods.konbini` | 便利店支付 |
| `payment.methods.dana` | DANA |
| `payment.methods.qris` | QRIS |
| `payment.methods.ovo` | OVO |
| `payment.methods.paypay` | PayPay |
| `payment.methods.selected` | 已选择 |
| `payment.methods.cardPayment` | 银行卡支付 |
| `payment.methods.walletPayment` | {method} 支付 |
| `payment.methods.walletNotice` | 钱包支付提示 |
| `payment.methods.wechatQrNotice` | 微信扫码提示 |
| `payment.methods.bankTransferNotice` | 银行转账提示 |
| `payment.methods.redirectNotice` | 跳转支付提示 |
| `payment.methods.voucherNotice` | 凭证支付提示 |
| `payment.methods.qrCodeNotice` | 扫码支付提示 |

### 表单字段

| Key | 说明 |
|-----|------|
| `payment.form.cardNumber` | 卡号 |
| `payment.form.cardNumberPlaceholder` | 卡号占位符 |
| `payment.form.expiryDate` | 有效期 |
| `payment.form.expiryDatePlaceholder` | 有效期占位符 |
| `payment.form.cvv` | CVV |
| `payment.form.cvvPlaceholder` | CVV 占位符 |
| `payment.form.cardholderName` | 持卡人姓名 |
| `payment.form.cardholderNamePlaceholder` | 持卡人姓名占位符 |

### 错误信息

| Key | 说明 |
|-----|------|
| `payment.form.errors.invalidCardNumber` | 无效卡号 |
| `payment.form.errors.invalidExpiryDate` | 无效有效期 |
| `payment.form.errors.cardExpired` | 卡已过期 |
| `payment.form.errors.invalidCvv` | 无效 CVV |
| `payment.form.errors.invalidName` | 无效姓名 |
| `payment.form.errors.nameTooShort` | 姓名过短 |

## 图标依赖

组件使用 `payment:` 前缀的自定义图标集合，需要在 `nuxt.config.ts` 中配置：

```typescript
export default defineNuxtConfig({
  icon: {
    customCollections: [
      {
        prefix: "payment",
        dir: "./app/assets/icons/payment",
      },
    ],
  },
});
```

需要的图标文件（SVG 格式）：

- `visa.svg`
- `amex.svg`
- `google-pay.svg`
- `apple-pay.svg`
- `wechat.svg`
- `sepa.svg`
- `ideal.svg`
- `bancontact.svg`
- `przelewy24.svg`
- `afterpay.svg`
- `boleto.svg`
- `oxxo.svg`
- `konbini.svg`
- `dana.svg`
- `qris.svg`
- `ovo.svg`
- `paypay.svg`

## 复制到其他项目

### 1. 复制文件

```bash
# 组件
cp -r app/components/payment/ <target>/app/components/payment/

# Composables
cp app/composables/usePaymentConfig.ts <target>/app/composables/
mkdir -p <target>/app/composables/payment/
cp app/composables/payment/types.ts <target>/app/composables/payment/

# 图标
cp -r app/assets/icons/payment/ <target>/app/assets/icons/payment/
```

### 2. 更新 nuxt.config.ts

```typescript
icon: {
  customCollections: [
    {
      prefix: "payment",
      dir: "./app/assets/icons/payment",
    },
  ],
}
```

### 3. 添加 i18n 翻译

将上述 i18n key 添加到项目的翻译文件中。

### 4. 依赖要求

- `@nuxt/ui` >= 4.0
- `@nuxtjs/i18n`
- `@vueuse/nuxt`（用于 `useWindowSize`、`useIntervalFn`）

## 类型导出

```typescript
import type {
  CountryConfig,
  PaymentMethod,
  PaymentInteractionType,
  IconSize,
  PaymentConfigOptions,
} from '~/composables/payment/types';

// 默认配置
import {
  DEFAULT_COUNTRIES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_COUNTRY_PAYMENT_METHODS,
} from '~/composables/payment/types';
```


