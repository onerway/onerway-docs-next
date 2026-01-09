---
title: 概览
description: 为 Onerway 集成准备你的开发环境



---

## 前置条件

开始之前，请确保：

- [ ] **API 凭据** —— 注册开发者账户
- [ ] **开发环境** —— 你偏好的编程语言
- [ ] **HTTPS 支持** —— Webhook 端点需要
- [ ] **基础知识** —— 了解 REST API 与 HTTP

## 设置步骤

### 1. 创建你的账户

1. 访问
[Onerway 开发者门户](https://developers.onerway.com)
2. 注册免费的开发者账户
3. 验证你的邮箱
4. 完善资料

### 2. 获取你的 API 密钥

1. 前往 **API Keys**
2. 生成 **测试模式** 凭据：
  - **Publishable Key** —— 前端使用
  - **Secret Key** —— 后端使用（妥善保管）
3. 安全保存这些密钥

### 3. 环境配置

#### Web 应用

```javascript
// Example environment variables
ONERWAY_PUBLISHABLE_KEY = pk_test_your_key_here;
ONERWAY_SECRET_KEY = sk_test_your_secret_key_here;
ONERWAY_WEBHOOK_SECRET = whsec_your_webhook_secret;
```

#### 移动应用

```javascript
// iOS (Swift)
let publishableKey = "pk_test_your_key_here"

// Android (Kotlin)
val publishableKey = "pk_test_your_key_here"
```

### 4. 安装 SDK（可选）

选择你偏好的集成方式：

#### JavaScript/Node.js

```bash
npm install @onerway/onerway-js
```

#### Python

```bash
pip install onerway
```

#### PHP

```bash
composer require onerway/onerway-php
```

#### 移动 SDK

- [iOS SDK 文档](../../.../mock/payments/mobile/ios)
- [Android SDK 文档](../../../mock/payments/mobile/ios)

## 快速测试

让我们发起第一笔 API 调用，验证一切正常：

```javascript
const onerway = require("@onerway/onerway-js")(
  "sk_test_..."
);

// Create a simple payment intent
async function createPayment() {
  try {
    const paymentIntent =
      await onerway.paymentIntents.create({
        amount: 1000, // $10.00 in cents
        currency: "usd",
        description: "Test payment",
      });

    console.log("Success!", paymentIntent.id);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

createPayment();
```

## 接下来？

现在你已经准备就绪：

1. 📖 [阅读 API 概览](./api-overview) —— 了解 API 结构
2. 🔧 [环境配置](./mock/environment-config) —— 详细配置
3. 🔒 [安全最佳实践](./mock/security) —— 保障安全
4. 🚀 [完成首笔支付](./mock/first-payment) —— 发起真实支付

## 需要帮助？

- 📚 [API 文档](../../../payments/) —— 完整参考
- 💬 [开发者支持](mailto:dev-support@onerway.com) —— 技术支持
- 🐛 [报告问题](https://github.com/onerway/issues) —— 反馈与需求

准备更进一步？前往
[API 概览](./api-overview)。


