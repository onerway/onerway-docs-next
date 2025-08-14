---
title: 概览
description: 使用 Onerway 的开发工具开启你的集成之旅，并完成第一个集成
order: 1
showToc: true
showNavigation: true
---

## 开发入门

准备好与 Onerway 一起构建了吗？本指南将帮助你完成开发环境配置，并创建你的第一个集成。

## 前置条件

在开始开发之前，请确保你已具备：

- [ ] **Onerway 账户** —— 如果尚未注册，请先
[创建账户](/mock/set-up-onerway/create-an-account)
- [ ] **API 密钥** —— 从开发者控制台获取
- [ ] **开发环境** —— 你偏好的 IDE 与编程语言
- [ ] **基础 HTTP 知识** —— 了解 REST API 与 JSON

## 选择你的开发路径

### 快速入门选项

#### 🚀 **快捷集成（Express Integration）**

适合以最少配置快速上手。

```javascript
// Install the Onerway SDK
npm install @onerway/onerway-js

// Basic payment setup
const onerway = require('@onerway/onerway-js')('sk_test_...');

const payment = await onerway.paymentIntents.create({
  amount: 2000,
  currency: 'usd'
});
```

#### 🔧 **自定义集成**

直接使用我们的 REST API 构建定制化方案。

```bash
curl -X POST https://api.onerway.com/v1/payment_intents \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 2000, "currency": "usd"}'
```

## 开发流程

### 1. 初始化项目

选择你偏好的语言与框架：

::code-group

```javascript [Node.js]
mkdir my-onerway-app
cd my-onerway-app
npm init -y
npm install @onerway/onerway-js express
```

```python [Python]
mkdir my-onerway-app
cd my-onerway-app
pip install onerway flask
```

```php [PHP]
composer require onerway/onerway-php
```

::

### 2. 配置环境

创建你的环境配置：

```bash
# .env file
ONERWAY_SECRET_KEY=sk_test_your_secret_key
ONERWAY_PUBLISHABLE_KEY=pk_test_your_publishable_key
ONERWAY_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. 创建你的第一笔支付

::code-group

```javascript [Node.js]
const express = require("express");
const onerway = require("@onerway/onerway-js")(
  process.env.ONERWAY_SECRET_KEY
);

const app = express();
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent =
      await onerway.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(3000, () =>
  console.log("Server running on port 3000")
);
```

```python [Python]
import onerway
from flask import Flask, request, jsonify

app = Flask(__name__)
onerway.api_key = "sk_test_..."

@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        data = request.get_json()

        intent = onerway.PaymentIntent.create(
            amount=data['amount'],
            currency=data['currency'],
            automatic_payment_methods={
                'enabled': True,
            },
        )

        return jsonify({
            'client_secret': intent.client_secret,
        })
    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(debug=True)
```

::

### 4. 测试你的集成

使用 Onerway 的测试模式验证你的实现：

```javascript
// Test with sample data
const testPayment = {
  amount: 1000, // $10.00
  currency: "usd",
};

// Use test card numbers
const testCards = {
  visa: "4242424242424242",
  mastercard: "5555555555554444",
  amex: "378282246310005",
};
```

## 开发工具

### **Onerway CLI**（即将推出）

用于快速开发与测试的命令行工具。

### **Webhook 测试**

使用 ngrok 等工具进行本地 Webhook 测试：

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the HTTPS URL in your webhook settings
```

### **API Explorer**

在浏览器中直接测试 API 端点：

- [Payments API Explorer](../../../mock/payments/api-reference)
- [Transfers API Explorer](../../../mock/transfers/api-reference)

## 常见开发模式

### 错误处理

```javascript
try {
  const payment =
    await onerway.paymentIntents.create(paymentData);
  // Handle success
} catch (error) {
  switch (error.type) {
    case "card_error":
      // 处理卡类错误
      break;
    case "rate_limit_error":
      // 处理速率限制
      break;
    case "api_error":
      // 处理 API 错误
      break;
    default:
      // 处理其他错误
      break;
  }
}
```

### Webhook 验证

```javascript
const express = require("express");
const onerway = require("@onerway/onerway-js");

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["onerway-signature"];
    let event;

    try {
      event = onerway.webhooks.constructEvent(
        req.body,
        sig,
        process.env.ONERWAY_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(
        `Webhook signature verification failed.`,
        err.message
      );
      return res
        .status(400)
        .send(`Webhook Error: ${err.message}`);
    }

    // 处理事件
    switch (event.type) {
      case "payment_intent.succeeded":
        // 处理支付成功
        break;
      case "payment_intent.payment_failed":
        // 处理支付失败
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);
```

## 下一步

既然你已经开始开发：

1. 🔍 [了解 API](/mock/about-the-apis) —— 理解我们的 API 架构
2. 🤖 [使用 LLM 构建](/mock/build-with-llm) —— AI 驱动的开发
3. 🎯 [无代码使用](/use-stripe-without-code) —— 无代码方案
4. 📚 [浏览支付方式](../../.../mock/payments/) —— 支持多种支付类型

## 需要帮助？

- 📖 [API 文档](../../../mock/payments/) —— 完整参考
- 💬 [开发者社区](https://community.onerway.com) —— 与其他开发者交流
- 🐛 [GitHub Issues](https://github.com/onerway/issues) —— 提交问题与需求
- 📧 [开发者支持](mailto:dev-support@onerway.com) —— 获得技术支持

准备更深入？前往
[关于 API](/mock/about-the-apis)。


