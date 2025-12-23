# 翻译示例集

本文档提供 Onerway 文档翻译的实际示例，展示如何将英文文档意译/重写为中文，以及反向翻译。

## 使用方式
- 按需要查找对应元素的示例（祈使句、代码块、MDC、列表、表格等）。
- 以“✅”示例作为输出模板，避免“❌”模式。
- 发现新的常见场景时追加示例，而不是在其他文件重复描述。

---

## 示例 1：祈使句翻译（简洁性优先）

### 英文 → 中文

**❌ 直译（冗余）**
```markdown
To create a new payment, you need to send a POST request to the `/payments` endpoint.
```
→
```markdown
要创建一个新的支付，你需要发送一个 POST 请求到 `/payments` 端点。
```

**✅ 专业重写（简洁）**
```markdown
To create a new payment, you need to send a POST request to the `/payments` endpoint.
```
→
```markdown
创建支付时，向 `/payments` 端点发送 POST 请求。
```

**要点**：
- 删除 "你需要"、"一个新的" 等冗余表达
- 使用祈使句，直接说明操作
- 保持 `/payments` 端点不变

---

## 示例 2：代码块保留

### 英文 → 中文

**英文原文**
```markdown
Here's an example of creating a payment:

\`\`\`javascript
const payment = await onerway.payments.create({
  amount: 1000,
  currency: 'usd'
});
\`\`\`

The `amount` field is required and must be a positive integer.
```

**✅ 翻译**
```markdown
创建支付的示例：

\`\`\`javascript
const payment = await onerway.payments.create({
  amount: 1000,
  currency: 'usd'
});
\`\`\`

`amount` 字段为必需，且必须是正整数。
```

**要点**：
- 代码块**完全保留**，不翻译任何代码
- `amount` 作为字段名保持英文
- 翻译说明文字

---

## 示例 3：MDC 组件翻译

### 英文 → 中文

**英文原文**
```markdown
::note
Make sure to use your test API keys during development.
::

::warning
Never expose your secret API keys in client-side code.
::
```

**✅ 翻译**
```markdown
::note
开发期间请使用测试 API 密钥。
::

::warning
切勿在客户端代码中暴露密钥。
::
```

**要点**：
- 组件标签（`::note`、`::warning`）保持不变
- 翻译组件内容
- "API 密钥" 中的 "API" 保持英文

---

## 示例 4：列表翻译

### 英文 → 中文

**英文原文**
```markdown
To integrate Onerway, follow these steps:

1. Create an account on the Dashboard
2. Get your API keys
3. Install the SDK
4. Make your first API call
```

**✅ 翻译**
```markdown
集成 Onerway 的步骤：

1. 在控制台创建账户
2. 获取 API 密钥
3. 安装 SDK
4. 发起首次 API 调用
```

**要点**：
- "Onerway"、"API"、"SDK" 保持英文
- "Dashboard" 翻译为 "控制台"（上下文相关）
- 简化表达，删除冗余词汇

---

## 示例 5：表格翻译

### 英文 → 中文

**英文原文**
```markdown
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | integer | Yes | Payment amount in cents |
| currency | string | Yes | Three-letter ISO currency code |
| customer | string | No | Customer ID |
```

**✅ 翻译**
```markdown
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| amount | integer | 是 | 支付金额（分） |
| currency | string | 是 | 三位字母 ISO 货币代码 |
| customer | string | 否 | 客户 ID |
```

**要点**：
- 表头翻译（Parameter → 参数）
- 参数名保持英文（`amount`、`currency`）
- 类型保持英文（`integer`、`string`）
- "Yes/No" 翻译为 "是/否"
- "ID" 保持英文大写

---

## 示例 6：链接翻译

### 英文 → 中文

**英文原文**
```markdown
For more information, see the [API Reference](/docs/api/payments) or visit our [GitHub repository](https://github.com/onerway/sdk).
```

**✅ 翻译**
```markdown
详细信息请参考 [API 参考文档](/docs/api/payments) 或访问 [GitHub 仓库](https://github.com/onerway/sdk)。
```

**要点**：
- 翻译链接文本
- 保持链接 URL 不变
- "API Reference" → "API 参考文档"
- "GitHub repository" → "GitHub 仓库"

---

## 示例 7：Frontmatter 翻译

### 英文 → 中文

**英文原文**
```yaml
---
title: Getting Started with Payments
description: Learn how to accept payments using Onerway's APIs
---
```

**✅ 翻译**
```yaml
---
title: 支付入门
description: 了解如何使用 Onerway API 接受支付
---
```

**要点**：
- `title` 翻译，保持简洁
- `description` 翻译，保持 50-160 字符（SEO 优化）
- "Onerway's APIs" → "Onerway API"（简化）

---

## 示例 8：技术说明翻译

### 英文 → 中文

**英文原文**
```markdown
## Authentication

All API requests require authentication using your secret key. Include your secret key in the `Authorization` header:

\`\`\`
Authorization: Bearer sk_live_xxxxx
\`\`\`

**Important**: Never share your secret key publicly.
```

**✅ 翻译**
```markdown
## 身份验证

所有 API 请求都需要使用密钥进行身份验证。在 `Authorization` 请求头中包含密钥：

\`\`\`
Authorization: Bearer sk_live_xxxxx
\`\`\`

**重要提示**：切勿公开分享密钥。
```

**要点**：
- "Authentication" → "身份验证"
- "Authorization header" → "Authorization 请求头"（保持字段名英文）
- 代码示例完全保留
- "Important" → "重要提示"

---

## 示例 9：复杂 MDC 组件（标签页）

### 英文 → 中文

**英文原文**
```markdown
::tabs
  ::tab-item{label="Node.js"}
  \`\`\`javascript
  const onerway = require('onerway');
  \`\`\`
  ::

  ::tab-item{label="Python"}
  \`\`\`python
  import onerway
  \`\`\`
  ::
::
```

**✅ 翻译**
```markdown
::tabs
  ::tab-item{label="Node.js"}
  \`\`\`javascript
  const onerway = require('onerway');
  \`\`\`
  ::

  ::tab-item{label="Python"}
  \`\`\`python
  import onerway
  \`\`\`
  ::
::
```

**要点**：
- 组件结构**完全保持**
- label 中的语言名称（Node.js、Python）保持不变
- 代码块不翻译

---

## 示例 10：错误处理说明

### 英文 → 中文

**英文原文**
```markdown
## Error Handling

When an error occurs, the API returns a JSON response with the following structure:

\`\`\`json
{
  "error": {
    "type": "invalid_request",
    "message": "Missing required parameter: amount"
  }
}
\`\`\`

Common error types include:
- `invalid_request`: Invalid request parameters
- `authentication_error`: Invalid API key
- `rate_limit_exceeded`: Too many requests
```

**✅ 翻译**
```markdown
## 错误处理

发生错误时，API 返回以下结构的 JSON 响应：

\`\`\`json
{
  "error": {
    "type": "invalid_request",
    "message": "Missing required parameter: amount"
  }
}
\`\`\`

常见错误类型：
- `invalid_request`：请求参数无效
- `authentication_error`：API 密钥无效
- `rate_limit_exceeded`：请求过多
```

**要点**：
- "Error Handling" → "错误处理"
- JSON 结构完全保留
- 错误类型（`invalid_request`）保持英文
- 翻译错误类型的说明
- 保持列表格式

---

## 示例 11：中文 → 英文（反向翻译）

### 中文原文
```markdown
创建订单后，系统会自动生成订单号。你可以通过订单号查询订单状态。
```

**❌ 直译（不自然）**
```markdown
After create order, system will automatic generate order number. You can through order number query order status.
```

**✅ 专业重写（自然）**
```markdown
After creating an order, the system automatically generates an order ID. You can use this order ID to check the order status.
```

**要点**：
- 使用完整句子和适当的冠词（"an order", "the system"）
- "订单号" → "order ID"（更专业）
- "查询" → "check" 或 "query"（根据上下文）
- 使用主动语态

---

## 示例 12：专有名词处理

### 英文 → 中文

**英文原文**
```markdown
Onerway supports multiple payment methods including credit cards, ACH transfers, and digital wallets like Apple Pay and Google Pay.
```

**✅ 翻译**
```markdown
Onerway 支持多种支付方式，包括信用卡、ACH 转账以及 Apple Pay 和 Google Pay 等数字钱包。
```

**要点**：
- "Onerway" 保持不变
- "ACH" 保持英文（首次出现可加注释）
- "Apple Pay"、"Google Pay" 保持英文（品牌名）
- "credit cards" → "信用卡"
- "digital wallets" → "数字钱包"

---

## 示例 13：用户界面文本

### 英文 → 中文

**英文原文**
```markdown
Click the **Create Payment** button to proceed. You can also use the keyboard shortcut `Ctrl+P` (or `Cmd+P` on Mac).
```

**✅ 翻译**
```markdown
点击**创建支付**按钮继续。也可以使用快捷键 `Ctrl+P`（Mac 为 `Cmd+P`）。
```

**要点**：
- 删除 "the"（中文不需要）
- 保持加粗格式
- 快捷键保持不变
- 简化表达

---

## 示例 14：多段落文档

### 英文 → 中文

**英文原文**
```markdown
## Webhooks

Webhooks allow your application to receive real-time notifications about events in your Onerway account.

To set up a webhook, you need to:

1. Create a webhook endpoint on your server
2. Configure the webhook in your Dashboard
3. Handle the incoming webhook events

Your webhook endpoint must return a 200 status code to acknowledge receipt of the event.
```

**✅ 翻译**
```markdown
## Webhook

Webhook 允许你的应用实时接收 Onerway 账户中的事件通知。

设置 Webhook 的步骤：

1. 在服务器上创建 Webhook 端点
2. 在控制台中配置 Webhook
3. 处理传入的 Webhook 事件

Webhook 端点必须返回 200 状态码以确认接收事件。
```

**要点**：
- "Webhooks" → "Webhook"（标题用单数）
- "webhook" 保持英文
- 删除 "you need to"
- 保持步骤编号和格式
- "Dashboard" → "控制台"
- "200 status code" → "200 状态码"

---

## 总结：翻译原则

### 英文 → 中文
1. ✅ **简洁性**：删除冗余词汇（"you need to"、"a new"）
2. ✅ **直接性**：多用祈使句
3. ✅ **专业性**：使用专业术语
4. ✅ **保留性**：代码、API 端点、品牌名不翻译

### 中文 → 英文
1. ✅ **完整性**：使用完整句子和冠词
2. ✅ **自然性**：符合英文表达习惯
3. ✅ **准确性**：使用行业标准术语
4. ✅ **专业性**：遵循技术写作规范

### 通用原则
1. ✅ **保持代码完整**：绝不翻译代码块内容
2. ✅ **保持结构一致**：标题层级、MDC 组件结构不变
3. ✅ **术语一致性**：使用术语表中的标准翻译
4. ✅ **SEO 友好**：description 保持适当长度
