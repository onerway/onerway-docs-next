---
title: API 概览
description: 了解 Onerway 的 API 结构和核心概念
order: 2
showToc: true
showNavigation: true
---

# API 概览

了解 Onerway 的 REST
API 结构、核心概念以及如何有效使用我们的端点。

## API 架构

### RESTful 设计

我们的 API 遵循 REST 原则，具有可预测的面向资源的 URL、标准 HTTP 方法和 JSON 响应。

```
基础 URL: https://api.onerway.com/v1/
```

### HTTP 方法

- **GET** - 检索资源
- **POST** - 创建新资源
- **PUT** - 更新现有资源
- **DELETE** - 删除资源

### 响应格式

所有 API 响应都是 JSON 格式：

```json
{
  "id": "pi_1234567890",
  "object": "payment_intent",
  "status": "succeeded",
  "amount": 1000,
  "currency": "usd",
  "created": 1640995200
}
```

## 核心资源

### 支付意图

处理支付的主要对象：

```javascript
// 创建支付意图
const paymentIntent = await onerway.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  description: "来自示例商店的购买",
});
```

### 客户

存储客户信息以进行循环支付：

```javascript
// 创建客户
const customer = await onerway.customers.create({
  email: "customer@example.com",
  name: "张三",
});
```

### 支付方式

代表客户可以支付的不同方式：

```javascript
// 创建支付方式
const paymentMethod = await onerway.paymentMethods.create({
  type: "card",
  card: {
    number: "4242424242424242",
    exp_month: 12,
    exp_year: 2025,
    cvc: "123",
  },
});
```

## 身份验证

### API 密钥

使用您的私密密钥进行服务器端请求：

```bash
curl https://api.onerway.com/v1/payment_intents \
  -H "Authorization: Bearer sk_test_your_secret_key"
```

### 可发布密钥

使用您的可发布密钥进行客户端代码：

```javascript
const onerway = Onerway("pk_test_your_publishable_key");
```

## 错误处理

我们的 API 使用标准 HTTP 状态码并返回详细的错误信息：

```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "您的卡片被拒绝。",
    "decline_code": "insufficient_funds"
  }
}
```

### 常见状态码

- **200** - 成功
- **400** - 请求错误
- **401** - 未授权
- **402** - 需要支付
- **404** - 未找到
- **500** - 服务器错误

## 分页

列表端点支持分页：

```javascript
// 检索带分页的支付
const payments = await onerway.paymentIntents.list({
  limit: 10,
  starting_after: "pi_1234567890",
});
```

## Webhook

获取您账户中事件的通知：

```javascript
// 处理 webhook 事件
app.post("/webhook", (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("支付成功！", event.data.object);
      break;
    default:
      console.log("未处理的事件类型：", event.type);
  }

  res.status(200).send("OK");
});
```

## 速率限制

我们的 API 有速率限制以确保服务稳定性：

- **测试模式**：每秒 100 个请求
- **生产模式**：每秒 1000 个请求

响应中包含速率限制头：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995260
```

## 下一步

准备配置您的环境？继续阅读：

- [环境配置](./mock/environment-config) - 详细设置指南
- [安全最佳实践](./mock/security) - 保持您的集成安全
