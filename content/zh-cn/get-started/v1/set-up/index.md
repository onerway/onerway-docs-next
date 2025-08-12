---
title: 设置指南
description: 为 Onerway 集成准备您的开发环境
order: 1
showToc: true
showNavigation: true
---

# 设置指南

本指南将引导您设置开发环境并向 Onerway 平台进行第一次 API 调用。

## 前置条件

开始之前，请确保您具备：

- [ ] **API 凭证** - 注册开发者账户
- [ ] **开发环境** - 您偏好的编程语言
- [ ] **HTTPS 支持** - Webhook 端点必需
- [ ] **基础知识** - 了解 REST API 和 HTTP

## 设置步骤

### 1. 创建您的账户

1. 访问 [Onerway 开发者门户](https://developers.onerway.com)
2. 注册免费开发者账户
3. 验证您的邮箱地址
4. 完善您的个人资料信息

### 2. 获取您的 API 密钥

1. 导航到 **API 密钥** 部分
2. 生成您的 **测试模式** 凭证：
   - **可发布密钥** - 用于前端代码
   - **私密密钥** - 用于后端代码（请保密！）
3. 安全保存这些密钥

### 3. 环境配置

#### Web 应用程序

```javascript
// 环境变量示例
ONERWAY_PUBLISHABLE_KEY = pk_test_your_key_here;
ONERWAY_SECRET_KEY = sk_test_your_secret_key_here;
ONERWAY_WEBHOOK_SECRET = whsec_your_webhook_secret;
```

#### 移动应用程序

```javascript
// iOS (Swift)
let publishableKey = "pk_test_your_key_here"

// Android (Kotlin)
val publishableKey = "pk_test_your_key_here"
```

### 4. 安装 SDK（可选）

选择您偏好的集成方式：

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

让我们进行第一次 API 调用来验证一切正常：

```javascript
const onerway = require("@onerway/onerway-js")(
  "sk_test_..."
);

// 创建简单的支付意图
async function createPayment() {
  try {
    const paymentIntent =
      await onerway.paymentIntents.create({
        amount: 1000, // 10.00 美元，以分为单位
        currency: "usd",
        description: "测试支付",
      });

    console.log("成功！", paymentIntent.id);
  } catch (error) {
    console.error("错误：", error.message);
  }
}

createPayment();
```

## 接下来做什么？

现在您已经完成了所有设置：

1. 📖 [阅读 API 概览](./api-overview) - 了解我们的 API 结构
2. 🔧 [环境配置](./mock/environment-config) - 详细的环境设置
3. 🔒 [安全最佳实践](./mock/security) - 保持您的集成安全
4. 🚀 [进行首次支付](./mock/first-payment) - 处理真实支付

## 需要帮助？

- 📚 [API 文档](../../../payments/) - 完整的 API 参考
- 💬
  [开发者支持](mailto:dev-support@onerway.com) - 获取技术帮助
- 🐛
  [报告问题](https://github.com/onerway/issues) - 错误报告和功能请求

准备深入了解？继续阅读 [API 概览](./api-overview)。
