---
title: 概览
description: 了解 Onerway 的 API 架构、设计原则，以及如何高效使用我们的 REST API
order: 2
showToc: true
showNavigation: true
---

## API 概览

Onerway 的 API 以简洁、安全、可扩展为目标设计。
我们的 REST API 使用可预测的 URL，接受 JSON 请求、返回 JSON 响应，并采用标准的 HTTP 状态码。

## 核心 API 原则

### **RESTful 设计**

- 清晰的资源型 URL
- 标准 HTTP 方法（GET、POST、PUT、DELETE）
- 一致的响应格式
- 恰当的 HTTP 状态码

### **对开发者友好**

- 提供示例的完整文档
- 覆盖主流语言的 SDK
- 交互式 API Explorer
- 详细的错误信息

### **安全优先**

- 全链路 TLS 加密
- API Key 鉴权
- Webhook 签名校验
- PCI DSS 合规

## API 架构

### 基础地址

所有 API 请求都发送至：

```
https://api.onerway.com/v1/
```

### 认证

在 Authorization 头中使用你的 Secret API Key：

```bash
curl -H "Authorization: Bearer sk_test_..." \
  https://api.onerway.com/v1/payment_intents
```

### 请求格式

使用 JSON 负载发送请求：

```javascript
const response = await fetch(
  "https://api.onerway.com/v1/payment_intents",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer sk_test_...",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 2000,
      currency: "usd",
    }),
  }
);
```

## 核心 API 资源

### **Payment Intents**

创建并管理支付交易。

```javascript
// Create a payment intent
POST /v1/payment_intents
{
  "amount": 2000,
  "currency": "usd",
  "payment_method_types": ["card"]
}

// Retrieve a payment intent
GET /v1/payment_intents/pi_1234567890
```

### **Payment Methods**

存储并管理客户的支付方式。

```javascript
// Create a payment method
POST /v1/payment_methods
{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123"
  }
}
```

### **Customers**

管理客户信息与关系。

```javascript
// Create a customer
POST /v1/customers
{
  "email": "customer@example.com",
  "name": "John Doe"
}

// List customer payment methods
GET /v1/customers/cus_1234567890/payment_methods
```

### **Transfers**

在账户与外部目标之间转移资金。

```javascript
// Create a transfer
POST /v1/transfers
{
  "amount": 1000,
  "currency": "usd",
  "destination": "acct_1234567890"
}
```

## API 设计模式

### **幂等性（Idempotency）**

使用幂等键安全地重试请求：

```javascript
const response = await fetch(
  "https://api.onerway.com/v1/payment_intents",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer sk_test_...",
      "Content-Type": "application/json",
      "Idempotency-Key": "unique-key-123",
    },
    body: JSON.stringify(paymentData),
  }
);
```

### **分页（Pagination）**

在大结果集中进行分页导航：

```javascript
// Request with pagination
GET /v1/payment_intents?limit=10&starting_after=pi_1234567890

// Response includes pagination info
{
  "object": "list",
  "data": [...],
  "has_more": true,
  "url": "/v1/payment_intents"
}
```

### **过滤与排序**

```javascript
// Filter by date range and status
GET /v1/payment_intents?created[gte]=1609459200&status=succeeded

// Sort by creation date
GET /v1/payment_intents?created[gte]=1609459200&limit=10
```

## 错误处理

### HTTP 状态码

- `200` - OK：请求成功
- `400` - Bad Request：请求参数无效
- `401` - Unauthorized：无效的 API Key
- `403` - Forbidden：权限不足
- `404` - Not Found：资源不存在
- `429` - Rate Limited：请求过多
- `500` - Server Error：服务器错误

### 错误响应格式

```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "Your card was declined.",
    "param": "card",
    "decline_code": "generic_decline"
  }
}
```

### 常见错误类型

- `api_error` - 服务端问题
- `card_error` - 卡片相关问题
- `invalid_request_error` - 无效参数
- `rate_limit_error` - 请求过多

## Webhooks

### 事件驱动架构

接收关键事件的实时通知：

```javascript
// Example webhook payload
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      // PaymentIntent object
    }
  },
  "created": 1609459200
}
```

### Webhook 安全

验证 webhook 签名以确保真实性：

```javascript
const onerway = require("@onerway/onerway-js");

const verifyWebhook = (payload, signature, secret) => {
  try {
    const event = onerway.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
    return event;
  } catch (err) {
    throw new Error(
      "Webhook signature verification failed"
    );
  }
};
```

## 速率限制（Rate Limiting）

### 限额

- **测试模式**：每秒 100 次请求
- **生产模式**：每个 API Key 每秒 1000 次请求
- **突发**：1 秒内最多 1000 次请求

### 响应头

监控你的速率限制状态：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459260
```

### 最佳实践

- 对速率限制错误使用指数退避
- 在可能时缓存响应
- 使用批量操作（若可用）

## API 版本管理

### 当前版本

所有请求默认使用 API 版本 `2024-11-01`。

### 指定版本

在请求中覆盖版本：

```bash
curl -H "Onerway-Version: 2024-06-01" \
  https://api.onerway.com/v1/payment_intents
```

### 更新日志

请关注 [API 变更](../../../changelog/) 与迁移指南。

## 测试与开发

### 测试模式

使用测试 API Key 进行安全开发：

- 测试密钥以 `pk_test_` 或 `sk_test_` 开头
- 不涉及真实资金流转
- 使用测试卡号覆盖不同场景

### 测试卡

```javascript
const testCards = {
  visa: "4242424242424242", // Succeeds
  declined: "4000000000000002", // Declined
  insufficient: "4000000000009995", // Insufficient funds
  expired: "4000000000000069", // Expired card
  processing: "4000000000000119", // Processing error
};
```

### 沙盒环境

- 完整的 API 功能
- 模拟支付处理
- Webhook 测试能力

## SDK 与库

### 官方 SDK

- **JavaScript/Node.js**：`@onerway/onerway-js`
- **Python**：`onerway`
- **PHP**：`onerway/onerway-php`
- **Ruby**：`onerway`
- **Go**：`github.com/onerway/onerway-go`

### 社区库

- **Java**：社区维护
- **C#**：社区维护
- **Swift**：社区维护

## API 限额与配额

### 对象上限

- **Customer**：每账户 50,000 个
- **Payment Methods**：每客户 500 个
- **Payment Intents**：不限

### 请求大小

- 最大负载：16MB
- 最大 URL 长度：8KB

### 数据保留

- API 日志：90 天
- Webhook 尝试：30 天
- 对象数据：无限期（除非被删除）

## 下一步

准备好使用我们的 API 开发了吗？

1. 🚀 [开始开发](../start-developing) —— 配置开发环境
2. 🤖 [使用 LLM 构建](../mock/build-with-llm) —— AI 辅助开发
3. 🎯 [无代码使用](../use-stripe-without-code) —— 无代码集成
4. 📚 [深入支付](/payments/) —— 深入了解支付
5. 💸 [了解转账](/transfers/) —— 了解转账

## 资源

- 📖 [API 参考](../../../mock/payments/api-reference) —— 完整 API 文档
- 🔧 [API 状态](https://status.onerway.com) —— 服务状态与运行时
- 📊 [速率限制指南](../../../guides/rate-limits) —— 详细说明
- 🔒 [安全指南](../../../guides/security) —— 最佳实践

对我们的 API 有疑问？
[联系开发者支持](mailto:dev-support@onerway.com)。


