# 中文 → 英文翻译规则

针对 Onerway 文档的中译英规则，确保翻译后的英文自然、专业、符合技术写作规范。

---

## 使用方式
- 按方向选择本文件；术语统一依赖 `../terminology.md`。
- 本文件补充中 → 英特有要点，通用流程见 `SKILL.md`。
- 先通读原文，整体输出流畅英文，再按检查表验证。

## 一、核心原则

### 1. 自然表达

英文技术文档需要完整的句子结构，避免中式英语。

**使用完整句子**：
- ❌ "Click button create payment"
- ✅ "Click the button to create a payment"

**适当使用冠词**：
- ❌ "Send request to endpoint"
- ✅ "Send a request to the endpoint"

**示例对比**：

| 中文 | ❌ 中式英语 | ✅ 自然英文 |
|------|------------|-----------|
| 点击按钮继续 | Click button continue | Click the button to continue |
| 创建支付 | Create payment | Create a payment |
| 调用 API | Call API | Call the API |
| 配置完成后 | After configure complete | After the configuration is complete |

### 2. 使用主动语态

技术文档优先使用主动语态，更直接清晰。

**主动优于被动**：
- ❌ "The payment is processed by the system"
- ✅ "The system processes the payment"

**示例**：
```markdown
<!-- 中文 -->
系统会自动处理支付。

<!-- ❌ 被动 -->
The payment will be automatically processed by the system.

<!-- ✅ 主动 -->
The system automatically processes the payment.
```

### 3. 保持专业性

使用行业标准术语，遵循英文技术写作规范。

**专业术语**：
- ✅ "authenticate" 而非 "verify identity"
- ✅ "endpoint" 而非 "API address"
- ✅ "parameter" 而非 "option"
- ✅ "credentials" 而非 "login information"

---

## 二、语法和句式

### 1. 冠词使用

**不定冠词 a/an**：
- 首次提到的单数可数名词
- "Create a payment", "Send an email"

**定冠词 the**：
- 特指的名词
- "Click the button", "In the Dashboard"
- 上文提到过的名词

**零冠词**：
- 复数或不可数名词的泛指
- "Payments are processed automatically"
- "Use test API keys"

**示例**：
```markdown
<!-- 中文 -->
在控制台创建账户。获取 API 密钥后，配置 webhook。

<!-- ✅ 英文 -->
Create an account in the Dashboard. After you get the API keys, configure webhooks.
```

### 2. 时态使用

**一般现在时**（最常用）：
- 描述功能："The API returns a response"
- 说明事实："Payments require authentication"

**一般将来时**：
- 描述结果："You will receive a confirmation"
- 说明后果："The system will process the payment"

**现在完成时**：
- 描述已完成的动作的影响："After you have configured the webhook..."

**示例**：
```markdown
<!-- 中文 -->
配置完成后，系统会发送确认邮件。

<!-- ✅ 英文 -->
After you complete the configuration, the system will send a confirmation email.
或
After you have configured the settings, the system sends a confirmation email.
```

### 3. 句子结构

**避免过长的句子**：
```markdown
<!-- ❌ 过长 -->
To create a payment you need to send a POST request to the /payments endpoint with the required parameters including amount, currency, and customer ID which must be valid.

<!-- ✅ 拆分 -->
To create a payment, send a POST request to the `/payments` endpoint. Include the required parameters: amount, currency, and customer ID. All parameters must be valid.
```

**使用并列结构**：
```markdown
<!-- 中文 -->
支付流程包括：创建订单、验证支付、处理交易。

<!-- ✅ 英文 -->
The payment flow includes creating an order, verifying the payment, and processing the transaction.
```

---

## 三、专业术语翻译

### 1. 保持中文中的英文术语

如果中文文档中使用英文术语，英文版本保持不变：

**直接保留**：
- API → API
- webhook → webhook
- OAuth → OAuth
- token → token
- JSON → JSON

### 2. 翻译中文术语

参考 [terminology.md](../terminology.md) 中的对照表。

**常用翻译**：
- 身份验证 → Authentication
- 授权 → Authorization
- 支付 → Payment
- 订单 → Order
- 请求 → Request
- 响应 → Response
- 商户 → Merchant
- 客户 → Customer
- 端点 → Endpoint
- 参数 → Parameter

### 3. 上下文相关翻译

**控制台/仪表板**：
- 商户后台 → Dashboard
- 数据面板 → Dashboard

**列表/列出**：
- 名词：列表 → List
- 动词：列出 → List, Retrieve

**密钥**：
- API 密钥 → API key
- 密钥 → Secret key（根据上下文）

---

## 四、结构元素处理

### 1. Frontmatter

**翻译字段**：
```yaml
---
title: 支付入门          # → Getting Started with Payments
description: 了解如何... # → Learn how to...
---
```

**注意**：
- 标题应简洁、信息丰富
- Description 保持 50-160 字符

### 2. 标题

**规则**：
- 使用标题大小写（Title Case）或句子大小写（Sentence case）
- 保持简洁

**示例**：
```markdown
<!-- 中文 -->
## 快速开始
### 创建账户
### 获取 API 密钥

<!-- ✅ 英文（Title Case）-->
## Quick Start
### Create an Account
### Get Your API Keys

<!-- 或 Sentence case -->
## Quick start
### Create an account
### Get your API keys
```

**注意**：Onerway 项目使用 **Sentence case**（首字母大写，其余小写）。

### 3. 代码块

**规则**：
- 代码内容**完全保留**
- 注释**翻译**
- 说明文字**翻译**

**示例**：
````markdown
<!-- 中文 -->
创建支付的示例：

```javascript
// 创建支付
const payment = await onerway.payments.create({
  amount: 1000
});
```

<!-- ✅ 英文 -->
Here's an example of creating a payment:

```javascript
// Create a payment
const payment = await onerway.payments.create({
  amount: 1000
});
```
````

### 4. MDC 组件

**规则**：
- 组件标签保持不变
- 内容翻译

**示例**：
```markdown
<!-- 中文 -->
::note
开发期间请使用测试 API 密钥。
::

<!-- ✅ 英文 -->
::note
Use test API keys during development.
::
```

### 5. 列表

**规则**：
- 保持列表格式
- 使用完整句子或统一的短语

**示例**：
```markdown
<!-- 中文 -->
开始使用：
- 创建账户
- 获取 API 密钥
- 安装 SDK

<!-- ✅ 英文 -->
To get started:
- Create an account
- Get your API keys
- Install the SDK
```

### 6. 表格

**示例**：
```markdown
<!-- 中文 -->
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| amount | integer | 是 | 支付金额（分）|

<!-- ✅ 英文 -->
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | integer | Yes | Payment amount in cents |
```

**注意**：
- 表头翻译
- 参数名保持原样
- 是/否 → Yes/No

---

## 五、常见句式翻译

### 1. 祈使句

```markdown
<!-- 中文 -->
点击按钮创建支付。

<!-- ✅ 英文 -->
Click the button to create a payment.
```

### 2. 条件句

```markdown
<!-- 中文 -->
使用沙盒环境时，使用测试密钥。

<!-- ✅ 英文 -->
When using the sandbox environment, use test keys.
或
If you're using the sandbox environment, use test keys.
```

### 3. 时间表达

```markdown
<!-- 中文 -->
创建订单后，系统会发送确认。

<!-- ✅ 英文 -->
After you create an order, the system sends a confirmation.
或
After creating an order, you receive a confirmation.
```

### 4. 目的表达

```markdown
<!-- 中文 -->
为确保安全，使用 HTTPS。

<!-- ✅ 英文 -->
To ensure security, use HTTPS.
或
Use HTTPS to ensure security.
```

### 5. 并列结构

```markdown
<!-- 中文 -->
API 支持创建、更新和删除订单。

<!-- ✅ 英文 -->
The API supports creating, updating, and deleting orders.
```

---

## 六、语言风格

### 1. 直接简洁

**避免冗余**：
- ❌ "In order to create a payment"
- ✅ "To create a payment"

- ❌ "It is important to note that"
- ✅ "Note that" 或直接陈述

**示例**：
```markdown
<!-- 中文 -->
注意：测试密钥不能用于生产环境。

<!-- ❌ 冗余 -->
It is important to note that test keys cannot be used in the production environment.

<!-- ✅ 简洁 -->
Note: Test keys cannot be used in production.
或
Test keys cannot be used in production.
```

### 2. 一致性

**保持术语一致**：
- 选择一个术语后保持使用
- 如："API key" 不要混用 "API token"
- "Dashboard" 不要混用 "Control Panel"

### 3. 使用第二人称

技术文档通常使用第二人称（you）直接指导读者。

**推荐**：
```markdown
<!-- ✅ 推荐 -->
You can view your transactions in the Dashboard.
To create a payment, you send a POST request.

<!-- 也可接受（更客观）-->
Transactions can be viewed in the Dashboard.
To create a payment, send a POST request.
```

---

## 七、常见翻译模式

### 1. "通过...方式"

```markdown
<!-- 中文 -->
通过 API 调用服务

<!-- ✅ 英文 -->
Call the service through the API
或
Call the service using the API
```

### 2. "...时"

```markdown
<!-- 中文 -->
创建支付时

<!-- ✅ 英文 -->
When creating a payment
或
To create a payment
或
While creating a payment
```

### 3. "可以..."

```markdown
<!-- 中文 -->
可以配置多个 webhook

<!-- ✅ 英文 -->
You can configure multiple webhooks
或
Configure multiple webhooks
或
Multiple webhooks can be configured
```

### 4. "需要..."

```markdown
<!-- 中文 -->
需要提供 API 密钥

<!-- ✅ 英文 -->
You need to provide an API key
或
Provide an API key
或
An API key is required
```

---

## 八、质量检查清单

翻译完成后，检查以下项目：

### 语法检查
- [ ] 冠词使用正确（a/an/the）
- [ ] 时态一致且正确
- [ ] 主谓一致
- [ ] 单复数正确

### 内容检查
- [ ] 代码块完全保留
- [ ] 术语翻译一致（参考 terminology.md）
- [ ] 链接有效
- [ ] 结构保持（标题层级、列表、表格）

### 风格检查
- [ ] 使用完整句子
- [ ] 表达自然流畅
- [ ] 避免中式英语
- [ ] 保持专业性

### SEO 检查
- [ ] description 长度 50-160 字符
- [ ] 标题清晰有力

---

## 九、避免的常见错误

### 1. 缺少冠词

❌ **错误**：
```markdown
Click button to create payment.
```

✅ **正确**：
```markdown
Click the button to create a payment.
```

### 2. 中式英语

❌ **错误**：
```markdown
After configure finish, system will send email.
```

✅ **正确**：
```markdown
After the configuration is complete, the system will send an email.
或
After you complete the configuration, the system sends an email.
```

### 3. 时态错误

❌ **错误**：
```markdown
Yesterday, the system process 100 payments.
```

✅ **正确**：
```markdown
Yesterday, the system processed 100 payments.
```

### 4. 过度被动

❌ **错误**：
```markdown
The payment is created by calling the API.
```

✅ **正确**：
```markdown
Call the API to create a payment.
或
Create a payment by calling the API.
```

---

## 十、特殊情况处理

### 1. 专有名词和品牌

保持原文：
- Onerway
- Apple Pay
- GitHub
- Node.js

### 2. 技术缩写

首次出现时可选提供全称：

```markdown
<!-- 首次 -->
Use an API (Application Programming Interface) to...

<!-- 后续 -->
Call the API to...
```

**注意**：对于技术读者，API、HTTP、JSON 等常见缩写通常无需展开。

### 3. 混合内容

```markdown
<!-- 中文中的英文 -->
使用 webhook 接收通知

<!-- ✅ 英文 -->
Use webhooks to receive notifications
```

---

## 总结

中译英的核心是**自然、专业、准确**：

1. ✅ 使用完整句子和适当冠词
2. ✅ 主动语态优先
3. ✅ 参考术语表保持一致
4. ✅ 避免中式英语
5. ✅ 保持结构和代码不变

**记住**：翻译要让英文读者觉得自然，就像原本就是用英文写的一样。
