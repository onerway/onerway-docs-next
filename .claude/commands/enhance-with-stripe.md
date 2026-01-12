---
name: enhance-with-stripe
description: 基于 Stripe 官方文档风格优化文档草稿（支持直接提供 Stripe 原文）
argument-hint: [文档草稿路径]
allowed-tools: Read, Task, Glob, Grep
---

# 基于 Stripe 文档风格的文档优化

使用 stripe-docs-enhancer agent 分析你的文档草稿,通过 Stripe MCP 研究引用的 Stripe 官方文档链接,学习其写作风格、术语用法和内容结构,提供专业的优化建议。

**参数说明**:
- **必需**: 文档草稿路径
- **可选**: 在对话中直接提供 Stripe 原文 markdown 内容（用于补充 MCP 可能遗漏的信息）

**使用示例**:

```bash
# 方式 1: 仅使用 Stripe MCP
/enhance-with-stripe content/en/payments/payment-methods.md

# 方式 2: 提供 Stripe 原文作为补充
/enhance-with-stripe content/en/payments/payment-methods.md

然后在同一消息或后续消息中提供原文：

这是 Payment Intents 的 Stripe 原文:
```markdown
# Payment Intents
A PaymentIntent guides you through the process...
[完整的 Stripe 文档内容]
```

这是 Payment Methods 的 Stripe 原文:
```markdown
# Payment Methods
Payment Methods represent your customer's payment instruments...
[完整的 Stripe 文档内容]
```
```

---

## 📋 工作流程

### 1. **读取草稿文档**
- 使用 Read 工具读取用户指定的文档草稿
- 识别文档中引用的 Stripe 文档链接
- 了解文档的主题和结构

### 2. **识别 Stripe 原文（可选）**
- 检查用户消息中是否包含 Stripe 原文内容
- 识别模式：
  - 代码块标记的 markdown 内容
  - 明确标注"Stripe 原文"、"原文"等字样
  - 包含 Stripe 文档特征的内容（如标题、术语等）
- 提取所有提供的原文内容

### 3. **启动专业 Agent**
- 调用 stripe-docs-enhancer agent
- 传递文档内容、Stripe 原文（如有）和上下文信息
- Agent 将：
  - 通过 Stripe MCP 深入研究引用的文档
  - 使用提供的原文进行交叉验证和补充
  - 确保不遗漏重要信息

### 4. **获得优化建议**
- Agent 会分析 Stripe 文档的写作模式
- 提供基于 Stripe 标准的优化建议
- 所有修改需要用户确认后才应用

---

## 📚 如何提供 Stripe 原文（可选但推荐）

如果你发现 Stripe MCP 返回信息不够完整，可以直接在对话中提供 Stripe 原文 markdown。

### 提供方式

**推荐格式**（使用代码块）:
````markdown
这是 Payment Intents 的 Stripe 原文:
```markdown
# Payment Intents

A PaymentIntent guides you through the process of collecting a payment from your customer...

## Create a PaymentIntent
...
```
````

**或者直接粘贴**:
```
以下是 Stripe Webhooks 文档原文:

# Webhooks

Use webhooks to be notified about events that happen in a Stripe account...
```

### 提供技巧

1. **多个原文**: 可以提供多个 Stripe 文档的原文，用标题或注释区分：
   ```
   --- Payment Intents 原文 ---
   [内容]

   --- Webhooks 原文 ---
   [内容]
   ```

2. **标注来源**（推荐）:
   ```markdown
   这是从 https://docs.stripe.com/payments/payment-intents 获取的原文:
   [内容]
   ```

3. **保持完整性**:
   - ✅ 包含完整的标题、段落、代码示例
   - ✅ 保留 markdown 格式（标题、列表、链接等）
   - ❌ 不需要包含页面导航、侧边栏等无关内容

4. **时机灵活**:
   - 可以在调用 command 的同一消息中提供
   - 也可以在 Agent 开始工作后再提供
   - Agent 会从整个对话历史中查找原文

---

## 🎯 优化维度

此 Agent 将从以下维度分析和优化你的文档:

### 写作风格
- 句子结构和段落长度
- 主动语态 vs 被动语态的使用
- 语言的简洁性和清晰度

### 术语一致性
- 技术术语的使用是否与 Stripe 一致
- 术语解释方法
- 专业名词的统一性

### 内容组织
- 标题层级和章节结构
- 信息的渐进式披露
- 逻辑流程和导航体验

### 格式规范
- 代码示例的呈现方式
- 代码与文本的比例
- 标注框、警告、提示的使用

### 布局优化
- 间距和视觉层级
- 格式化约定
- 整体可读性

### 链接处理（重要 ⚠️）
- **移除 Stripe 链接**：删除所有 docs.stripe.com、stripe.com 等官方链接
- **添加 TODO 占位符**：对应位置需要链接但 Onerway 文档尚未创建时
  - 格式：`[链接文本](#){badge="TODO"}`
  - 示例：`[API 参考](#){badge="TODO"}`、`[Webhook 指南](#){badge="TODO"}`
- **保留语义**：确保删除链接后文本仍然完整可读
- **便于后期替换**：可全局搜索 `{badge="TODO"}` 批量替换真实链接

---

## ⚠️ 注意事项

1. **🔴 优化边界（重要）**: Agent **只优化写作风格和表达方式**，**不会添加 Onerway 不支持的功能**
   - ✅ 会优化：句子结构、段落组织、术语使用、代码示例呈现
   - ❌ 不会做：根据 Stripe 文档添加 Onerway 没有的功能描述
   - 示例：如果 Stripe 支持在 Dashboard 查看日志，但你的草稿没提到，Agent 不会添加这个功能

2. **确认机制**: Agent 不会直接修改你的文档,所有建议都需要你确认

3. **参考链接**: 请确保草稿中包含 Stripe 文档链接,以便 Agent 学习参考

4. **保持意图**: Agent 会尊重你的原始意图和表达方式,只提供风格优化建议

5. **项目标准**: 优化建议会平衡 Stripe 风格与 Onerway 项目标准

6. **链接替换**: Agent 会自动移除 Stripe 链接并用 `{badge="TODO"}` 占位符标记,方便后期批量替换

7. **原文补充**: 提供 Stripe 原文可以提高准确性，但不是必需的。Agent 会智能结合 MCP 和原文

8. **清理 stripeDocUrl**: 增强完成后，需要从 frontmatter 中移除 `stripeDocUrl` 字段
   - `stripeDocUrl` 仅用于增强过程中参考 Stripe 原文
   - 完成增强后该字段不再需要，应该删除以保持 frontmatter 整洁
   - Agent 会在完成增强后提醒你移除此字段

---

## 🚀 执行步骤

请按以下步骤执行:

### 1. **解析参数**

从 `$ARGUMENTS` 中提取文档草稿路径。

如果 `$ARGUMENTS` 为空，提示用户：
```
请提供文档草稿路径，格式：
/enhance-with-stripe <草稿路径>

示例：
/enhance-with-stripe content/en/payments/methods.md

可选：在同一消息或后续对话中提供 Stripe 原文 markdown
```

### 2. **读取草稿**

- 使用 Read 工具读取指定的文档草稿文件
- 检查文档中是否包含 Stripe 文档链接
- 提取所有 Stripe 链接 URL
- 如果没有 Stripe 链接，询问用户是否仍要继续

### 3. **识别 Stripe 原文**

从用户消息和对话历史中查找 Stripe 原文：

**识别模式**:
1. **代码块标记**:
   - ````markdown ... ``` 或 ```...```
   - 特别是标注了 "markdown" 语言的代码块

2. **明确标注**:
   - 包含"Stripe 原文"、"原文"、"Stripe 文档"等关键词
   - 包含 Stripe 文档 URL 的注释

3. **内容特征**:
   - 以 Stripe 特有的标题开头（如 "# Payment Intents"）
   - 包含 Stripe API 术语和代码示例
   - 段落风格符合 Stripe 文档特征

**提取逻辑**:
```typescript
const stripeOriginals = []

// 在用户消息中查找
if (消息包含代码块 && 代码块内容看起来像 Stripe 文档) {
  stripeOriginals.push({
    source: '用户提供的原文',
    content: 代码块内容
  })
}

// 查找明确标注的原文
if (消息包含 "Stripe 原文:" 或类似标记) {
  stripeOriginals.push({
    source: '用户标注的原文',
    content: 提取的内容
  })
}

// 向用户确认
if (stripeOriginals.length > 0) {
  console.log(`✓ 识别到 ${stripeOriginals.length} 段 Stripe 原文，将用于补充验证`)
} else {
  console.log(`未检测到 Stripe 原文，将仅使用 Stripe MCP`)
  console.log(`💡 提示：你可以在对话中提供 Stripe 原文 markdown 以提高准确性`)
}
```

### 4. **启动 Agent**

使用 Task 工具调用 stripe-docs-enhancer agent。

**Prompt 格式（无原文）**:
```
请分析以下文档草稿并提供基于 Stripe 官方文档风格的优化建议:

文档路径: [路径]

文档内容:
[完整内容]

请通过 Stripe MCP 研究文档中引用的 Stripe 链接,分析其写作风格并提供优化建议。
```

**Prompt 格式（有原文）**:
```
请分析以下文档草稿并提供基于 Stripe 官方文档风格的优化建议:

文档路径: [路径]

文档内容:
[完整内容]

---

用户提供了以下 Stripe 原文 markdown 作为补充参考:

## Stripe 原文 #1
[原文1完整内容]

## Stripe 原文 #2
[原文2完整内容]

---

请优先使用 Stripe MCP 获取文档信息，但在以下情况使用用户提供的原文:
1. MCP 返回信息不完整或缺失时
2. 需要验证 MCP 信息准确性时
3. 需要获取更详细的上下文时

请交叉验证 MCP 和原文的内容，确保优化建议基于最完整准确的信息。
```

### 5. **传递结果**

- Agent 的分析结果会直接返回给用户
- 如果使用了原文，说明哪些信息来自原文
- 用户可以根据建议决定是否修改文档

### 6. **清理提醒**

增强完成后，向用户确认移除 frontmatter 中的 `stripeDocUrl` 字段：

```
✅ 文档增强完成！

📋 后续清理步骤：
1. 应用上述优化建议
2. 移除 frontmatter 中的 stripeDocUrl 字段

当前 frontmatter:
---
title: [标题]
description: [描述]
stripeDocUrl: https://stripe.com/...  ← 请删除此行
---

修改后:
---
title: [标题]
description: [描述]
---

原因：stripeDocUrl 仅用于增强参考，完成后不再需要。

是否需要我帮你移除这个字段？
```

---

现在开始执行优化流程...
