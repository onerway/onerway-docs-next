# 英文 → 中文翻译规则

针对 Onerway 文档的英译中规则，强调意译和重写而非直译。

---

## 使用方式
- 按方向选择本文件；术语统一依赖 `../terminology.md`。
- 仅覆盖英 → 中特有要点，通用流程在 `SKILL.md`。
- 先通读源文档，再整体翻译，避免逐段直译。

## 一、核心原则

### 1. 简洁性优先

中文技术文档应简洁、直接，删除英文中的冗余表达。

**删除冗余词汇**：
- ❌ "you can" / "you need to" → ✅ 直接祈使句
- ❌ "a new order" → ✅ "新订单"（通常"新"也可省略）
- ❌ "in order to" → ✅ "以"或省略

**示例对比**：

| 英文 | ❌ 直译 | ✅ 重写 |
|------|--------|---------|
| You can click the button to proceed | 你可以点击按钮来继续 | 点击按钮继续 |
| You need to create a new payment | 你需要创建一个新的支付 | 创建支付 |
| In order to authenticate, send your API key | 为了进行身份验证，发送你的 API 密钥 | 发送 API 密钥进行身份验证 |
| This allows you to receive notifications | 这允许你接收通知 | 可以接收通知 |

### 2. 祈使句优先

技术文档多用祈使句，指导用户操作。

**转换规则**：
- "You should..." → 直接动词开头
- "You can..." → 直接动词开头
- "You need to..." → 直接动词开头
- "To do X, you..." → "做 X 时，..."

**示例**：
```markdown
<!-- 英文 -->
To create a payment, you need to call the API endpoint.

<!-- ✅ 中文 -->
创建支付时，调用 API 端点。
```

### 3. 保持专业性

使用专业术语，避免过于口语化。

**专业表达**：
- ✅ "配置" 而非 "设置一下"
- ✅ "调用 API" 而非 "使用 API"
- ✅ "返回响应" 而非 "给你返回"
- ✅ "参数" 而非 "选项"

---

## 二、语言习惯调整

### 1. 标点符号

**规则**：
- 使用中文标点：，。！？
- 保持英文标点：代码、URL、数字范围中
- 括号：中文括号（），英文内容可用英文括号 ()

**示例**：
```markdown
<!-- ✅ 正确 -->
支付金额必须是正整数，单位为分。

API 密钥格式为 sk_test_xxxx（测试环境）或 sk_live_xxxx（生产环境）。

<!-- ❌ 错误 -->
支付金额必须是正整数,单位为分.

API 密钥格式为 sk_test_xxxx (测试环境) 或 sk_live_xxxx (生产环境).
```

### 2. 避免"你"、"您"

技术文档避免过多使用人称代词。

**转换规则**：
- "You can..." → 直接说明功能
- "Your account" → "账户"（上下文明确时）
- "You will receive" → "将收到" 或 "会收到"

**示例**：
```markdown
<!-- 英文 -->
You can view your transaction history in the Dashboard.

<!-- ❌ 直译 -->
你可以在控制台中查看你的交易历史。

<!-- ✅ 重写 -->
在控制台中查看交易历史。
```

### 3. 冠词处理

中文无需冠词，删除 "the"、"a"、"an" 的翻译痕迹。

**示例**：
```markdown
<!-- 英文 -->
Click the button to create a new order.

<!-- ❌ 直译 -->
点击这个按钮以创建一个新订单。

<!-- ✅ 重写 -->
点击按钮创建订单。
```

---

## 三、专业术语处理

### 1. 保持英文的术语

参考 [terminology.md](../terminology.md) 中的"保持英文"列表：

**技术通用术语**：
- API, REST API, GraphQL
- webhook, callback
- OAuth, JWT, token
- JSON, XML, YAML
- HTTP, HTTPS, URL
- SDK, CLI
- Git, npm, pnpm

**处理方式**：
```markdown
<!-- ✅ 正确 -->
使用 API 密钥进行身份验证。
通过 webhook 接收实时通知。
配置 OAuth 授权流程。

<!-- ❌ 错误 -->
使用应用程序接口密钥进行身份验证。
通过网络钩子接收实时通知。
```

### 2. 需要翻译的术语

参考 [terminology.md](../terminology.md) 中的翻译对照表。

**常用翻译**：
- Authentication → 身份验证
- Payment → 支付
- Order → 订单
- Request → 请求
- Response → 响应
- Merchant → 商户
- Customer → 客户

### 3. 首次出现加注释

对于保持英文但读者可能不熟悉的术语，首次出现时加注释。

**格式**：
```markdown
<!-- 首次出现 -->
使用 API（Application Programming Interface，应用程序接口）调用服务。
启用 2FA（Two-Factor Authentication，双因素认证）提高安全性。

<!-- 后续出现 -->
调用 API 时需要...
配置 2FA 后...
```

### 4. 上下文相关翻译

某些术语根据上下文有不同翻译：

**Dashboard**：
- 商户后台界面 → "控制台" 或 "商户后台"
- 数据展示面板 → "仪表板"

**List**：
- 动词 → "列出"、"获取列表"
- 名词 → "列表"

**Active**：
- 用户状态 → "活跃"
- 开关状态 → "激活"

---

## 四、结构元素处理

### 1. Frontmatter

**翻译字段**：
```yaml
---
title: Getting Started    # → 入门指南
description: Learn...     # → 了解如何...
---
```

**注意**：
- `title`：简洁翻译
- `description`：保持 50-160 字符（SEO）
- 其他字段根据需要保留或翻译

### 2. 标题

**规则**：
- 使用完整的中文表达
- 避免直接音译
- 保持层级一致

**示例**：
```markdown
<!-- 英文 -->
## Getting Started
### Installation
### Quick Start

<!-- ✅ 中文 -->
## 入门指南
### 安装
### 快速开始
```

### 3. 代码块

**规则**：
- 代码内容**完全保留**
- 代码注释**可选翻译**（如有助于理解）
- 代码块前后的说明文字**翻译**

**示例**：
````markdown
<!-- 英文 -->
Here's how to create a payment:

```javascript
// Create a payment
const payment = await onerway.payments.create({
  amount: 1000,
  currency: 'usd'
});
```

<!-- ✅ 中文 -->
创建支付的方法：

```javascript
// 创建支付
const payment = await onerway.payments.create({
  amount: 1000,
  currency: 'usd'
});
```
````

**注意**：
- 变量名（`payment`、`amount`）不翻译
- 字符串值（`'usd'`）不翻译
- 注释可翻译

### 4. MDC 组件

**规则**：
- 组件标签**保持不变**
- 组件属性根据需要**保留或翻译**
- 组件内容**翻译**

**示例**：
```markdown
<!-- 英文 -->
::note
Make sure to use test API keys during development.
::

<!-- ✅ 中文 -->
::note
开发期间请使用测试 API 密钥。
::
```

**复杂组件**：
```markdown
<!-- 英文 -->
::tabs
  ::tab-item{label="Node.js"}
  Installation for Node.js
  ::
  ::tab-item{label="Python"}
  Installation for Python
  ::
::

<!-- ✅ 中文 -->
::tabs
  ::tab-item{label="Node.js"}
  Node.js 安装
  ::
  ::tab-item{label="Python"}
  Python 安装
  ::
::
```

**注意**：
- `label` 中的语言名称保持不变
- 组件内容翻译

### 5. 列表和表格

**列表翻译**：
```markdown
<!-- 英文 -->
To get started:
- Create an account
- Get your API keys
- Install the SDK

<!-- ✅ 中文 -->
开始使用：
- 创建账户
- 获取 API 密钥
- 安装 SDK
```

**表格翻译**：
```markdown
<!-- 英文 -->
| Parameter | Type | Required |
|-----------|------|----------|
| amount | integer | Yes |

<!-- ✅ 中文 -->
| 参数 | 类型 | 必需 |
|------|------|------|
| amount | integer | 是 |
```

**注意**：
- 表头翻译
- 参数名保持英文
- 类型保持英文
- Yes/No → 是/否

### 6. 链接

**内部链接**：
```markdown
<!-- 英文 -->
See the [API Reference](/docs/api) for details.

<!-- ✅ 中文 -->
详见 [API 参考文档](/docs/api)。
```

**外部链接**：
```markdown
<!-- 英文 -->
Visit our [GitHub repository](https://github.com/onerway/sdk).

<!-- ✅ 中文 -->
访问 [GitHub 仓库](https://github.com/onerway/sdk)。
```

**注意**：
- 翻译链接文本
- 保持 URL 不变
- 内部链接路径不改变（系统自动处理语言）

---

## 五、常见句式转换

### 1. 条件句

```markdown
<!-- 英文 -->
If you want to test in sandbox mode, use test API keys.

<!-- ✅ 中文 -->
在沙盒环境测试时，使用测试 API 密钥。
```

### 2. 时间表达

```markdown
<!-- 英文 -->
After you create an order, you will receive a confirmation.

<!-- ✅ 中文 -->
创建订单后，将收到确认信息。
```

### 3. 目的表达

```markdown
<!-- 英文 -->
To ensure security, always use HTTPS.

<!-- ✅ 中文 -->
为确保安全，始终使用 HTTPS。
```

### 4. 被动语态转主动

```markdown
<!-- 英文 -->
The payment is processed by our system.

<!-- ✅ 中文 -->
系统处理支付。
```

---

## 六、质量检查清单

翻译完成后，检查以下项目：

### 格式检查
- [ ] Frontmatter 格式正确
- [ ] 标题层级未改变（H1、H2、H3、H4）
- [ ] 代码块完整且语法标记正确
- [ ] MDC 组件语法正确

### 内容检查
- [ ] 专有名词保持一致（参考 terminology.md）
- [ ] 代码块内容完全保留
- [ ] 链接有效且正确
- [ ] 列表和表格结构保持

### 语言检查
- [ ] 删除了冗余表达
- [ ] 使用了祈使句
- [ ] 使用了中文标点符号
- [ ] 术语翻译一致（参考 terminology.md）
- [ ] 表达自然流畅

### SEO 检查
- [ ] description 长度 50-160 字符
- [ ] 标题简洁有力
- [ ] 关键词自然分布

---

## 七、特殊情况处理

### 1. 品牌和产品名

**保持原文**：
- Onerway
- Stripe
- Apple Pay
- Google Pay
- GitHub

### 2. 混合使用中英文

**规则**：
- 中文为主，英文术语为辅
- 英文术语前后加空格（可选，根据项目规范）

**示例**：
```markdown
<!-- 推荐 -->
使用 API 调用服务。
配置 webhook 接收通知。

<!-- 也可接受 -->
使用API调用服务。
配置webhook接收通知。
```

### 3. 数字和单位

**规则**：
- 阿拉伯数字保持
- 单位根据情况翻译或保留

**示例**：
```markdown
<!-- ✅ 正确 -->
最大文件大小为 10 MB。
超时时间为 30 秒。
支持 100+ 种货币。

<!-- ❌ 错误 -->
最大文件大小为 10MB。（缺少空格）
超时时间为三十秒。（不使用中文数字）
```

---

## 八、避免的常见错误

### 1. 过度直译

❌ **错误**：
```markdown
你可以点击这个按钮来创建一个新的支付订单。
```

✅ **正确**：
```markdown
点击按钮创建支付订单。
```

### 2. 翻译代码

❌ **错误**：
```javascript
常量 支付 = 等待 onerway.payments.创建({
  金额: 1000
});
```

✅ **正确**：
```javascript
const payment = await onerway.payments.create({
  amount: 1000
});
```

### 3. 术语不一致

❌ **错误**：
```markdown
使用 API 密钥...
使用 API Key...
使用密钥...
```

✅ **正确**（选一种并保持一致）：
```markdown
使用 API 密钥...
使用 API 密钥...
使用 API 密钥...
```

---

## 总结

英译中的核心是**简洁、专业、自然**：

1. ✅ 删除冗余，使用祈使句
2. ✅ 参考术语表，保持一致性
3. ✅ 保留代码和专有名词
4. ✅ 适应中文表达习惯
5. ✅ 保持文档结构不变

**记住**：翻译是为了让中文读者更容易理解，而不是逐字转换英文。
