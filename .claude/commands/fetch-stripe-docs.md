---
name: fetch-stripe-docs
description: 从 Stripe 官方文档抓取内容并转换为项目规范的 Markdown 文件
argument-hint: <URL1> [URL2] [URL3] ...
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(ls:*), WebFetch, AskUserQuestion, mcp__playwright__*, mcp__stripe__search_stripe_documentation, mcp__nuxt-ui-remote__*
---

# 用途

从 Stripe 官方文档抓取页面内容，转换为符合 Onerway 项目规范的 Markdown 文件，并更新导航配置。

**参数**：`$ARGUMENTS` - 一个或多个 Stripe 文档 URL（空格分隔）

---

## 快速使用

```bash
# 抓取单个页面
/fetch-stripe-docs https://docs.stripe.com/payments/online-payments

# 抓取多个页面
/fetch-stripe-docs https://docs.stripe.com/payments/online-payments https://docs.stripe.com/payments/use-cases

# 使用后可配合其他命令
/enhance-with-stripe content/en/2.payments/5.stripe/1.online-payments.md
```

---

## 工作流程

### 1. **解析参数与验证**

从 `$ARGUMENTS` 中提取 URL 列表。

**验证规则**：
- ✅ `https://docs.stripe.com/...` - 正确格式
- ❌ `https://stripe.com/docs/...` - 旧格式，需转换

若未提供 URL：
```
请提供 Stripe 文档 URL，格式：
/fetch-stripe-docs <URL1> [URL2] [URL3] ...

示例：
/fetch-stripe-docs https://docs.stripe.com/payments/online-payments
```

若 URL 格式错误，提示正确格式并询问是否继续。

### 2. **确认目标目录**

默认目录：`content/en/2.payments/5.stripe/`

使用 Glob 检查目录现有文件，计算下一个序号：
- 读取 `content/en/2.payments/5.stripe/*.md` 文件列表
- 提取最大序号，新文件从 `序号+1` 开始
- 若目录不存在，从 `1` 开始

询问用户是否使用默认目录，或指定其他目录。

### 3. **获取内容（三工具协作）**

对每个 URL，使用三种工具协作获取完整内容：

#### 3.1 Playwright 获取页面结构（首选）

**用途**：获取页面的真实 DOM 结构，识别页面类型

```
mcp__playwright__browser_navigate
  - url: <完整 URL>

mcp__playwright__browser_snapshot
  - 获取页面的 accessibility tree
```

**从 snapshot 中提取**：
- 页面标题（H1）
- 章节结构（H2-H4）
- 页面类型判断（见下方）
- 链接列表和卡片组件
- 表格数据

**完成后关闭浏览器**：
```
mcp__playwright__browser_close
```

#### 3.2 页面类型识别

根据 Playwright snapshot 判断页面类型：

| 页面类型 | 特征 | 处理策略 |
|----------|------|----------|
| **概览页** | 大量卡片链接、少量正文、多个功能分类 | 保留卡片结构，使用 `docs-page-grid` 组件 |
| **教程页** | 步骤说明、代码示例、详细正文 | 提取完整内容，保留代码块 |
| **API 参考页** | 参数表格、请求/响应示例 | 保留表格和代码结构 |
| **指南页** | 概念解释、最佳实践 | 提取正文，保留列表和提示框 |

#### 3.3 Stripe MCP 获取技术内容（补充）

**用途**：获取代码示例和 API 详情

```
mcp__stripe__search_stripe_documentation
  - question: "<基于页面主题的问题>"
  - language: "node" (或其他语言)
```

**适用场景**：
- 教程页需要完整代码示例
- API 参考页需要参数说明
- 需要多语言代码示例

#### 3.4 WebFetch 获取正文内容（辅助）

**用途**：获取经过处理的 Markdown 正文

```
WebFetch
  - url: <完整 URL>
  - prompt: "提取此 Stripe 文档的主要内容..."
```

**注意**：WebFetch 返回的是 AI 摘要，可能丢失页面结构。仅作为补充验证。

#### 3.5 交叉验证

对比三种工具的输出：
- **结构以 Playwright 为准**：章节标题、页面布局
- **代码以 Stripe MCP 为准**：完整代码示例
- **正文以 WebFetch 为参考**：补充缺失的描述文本

**冲突处理**：
- 若 WebFetch 内容与 Playwright 结构不符 → 以 Playwright 为准
- 若 Stripe MCP 代码更完整 → 使用 MCP 版本
- 若发现明显差异 → 提示用户确认

### 4. **生成文件**

#### 4.1 文件命名
```
{序号}.{slug}.md

slug 规则：
- 从 URL 路径提取
- 转换为 kebab-case
- 示例：/payments/online-payments → online-payments
```

#### 4.2 内容转组件规则

**必读**：先读取 `app/components/README.md` 了解可用组件。

根据 Stripe 原始内容结构，应用以下转换规则：

##### 4.2.1 功能卡片列表 → DocsPageCard + DocsPageGrid

**识别特征**：
- Stripe 页面中的功能导航卡片
- 带标题+描述的并列条目
- 选项/产品/功能列表

**Stripe 原始结构**：
```markdown
### Option A
Description for option A.

### Option B
Description for option B.
```

**转换为**：
```markdown
:::docs-page-grid
::::docs-page-card
---
to: /path/to/option-a
icon: i-lucide-box
title: Option A
description: Description for option A.
---
::::

::::docs-page-card
---
to: /path/to/option-b
icon: i-lucide-circle
title: Option B
description: Description for option B.
---
::::
:::
```

**可选属性**：
- `badge`: 标签（如 "Recommended", "Low code", "NEW"）
- `variant`: solid | outline | soft | subtle | ghost | naked
- `spotlight`: 聚光灯效果

##### 4.2.2 大型对比表格 → ProseAccordion

**识别特征**：
- 超过 10 行的对比表格
- 按主题分组的特性对比
- 需要折叠以减少页面长度

**转换为**：
```markdown
::prose-accordion{multiple}
:::prose-accordion-item{icon="i-lucide-layout-grid" defaultOpen}
#label
### Feature Overview

#content
| Feature | A | B | C |
| --- | --- | --- | --- |
| ... |
:::

:::prose-accordion-item{icon="i-lucide-settings"}
#label
### Advanced Features

#content
| Feature | A | B | C |
| --- | --- | --- | --- |
| ... |
:::
::
```

**注意**：必须使用 `#label` 和 `#content` slot，不支持 `label` 属性。

##### 4.2.3 多语言代码示例 → ProseTabs

**识别特征**：
- Stripe 的多语言代码块（Node.js、Python、PHP 等）
- 同一功能的不同实现方式

**转换为**：
```markdown
::prose-tabs{variant="underline" sync="language"}
:::prose-tabs-item{label="Node.js" icon="i-simple-icons-nodedotjs"}
```javascript
// Node.js code
```
:::

:::prose-tabs-item{label="Python" icon="i-simple-icons-python"}
```python
# Python code
```
:::
::
```

##### 4.2.4 术语解释 → ProseAnnotation

**识别特征**：
- Stripe 文档中的专业术语
- 首次出现的缩写词
- 需要额外解释的概念

**转换为**：
```markdown
Use :prose-annotation[DPM]{annotation="Dynamic Payment Methods - 动态支付方式"} to simplify your integration.
```

##### 4.2.5 环境切换链接 → ProseLinkSwitch

**识别特征**：
- Dashboard 链接（沙盒/生产）
- 需要切换的多个目标 URL

**转换为**：
```markdown
Go to :prose-link-switch{preset="merchant-dashboard"}[Dashboard] to configure.
```

#### 4.3 图标选择指南

| 场景 | 图标 |
|------|------|
| 链接/外链 | `i-lucide-link` |
| 代码/开发 | `i-lucide-code` |
| 设置/配置 | `i-lucide-settings` |
| 支付/卡片 | `i-lucide-credit-card` |
| 手机/移动端 | `i-lucide-smartphone` |
| 布局/模板 | `i-lucide-layout-template` |
| 组件/模块 | `i-lucide-puzzle` |
| 实验/测试 | `i-lucide-flask-conical` |
| Node.js | `i-simple-icons-nodedotjs` |
| Python | `i-simple-icons-python` |
| PHP | `i-simple-icons-php` |

#### 4.4 文件模板

**概览页模板**：
```markdown
---
title: <页面标题>
description: <页面描述>
stripeDocUrl: <原始URL>
---

::note
**Source**: [Stripe Docs - <页面标题>](<原始URL>)
::

<简介段落>

## <章节标题>

:::docs-page-grid
::::docs-page-card
---
to: <链接>
icon: <图标>
title: <卡片标题>
description: <卡片描述>
---
::::
:::
```

**教程页模板**：
```markdown
---
title: <页面标题>
description: <页面描述>
stripeDocUrl: <原始URL>
---

::note
**Source**: [Stripe Docs - <页面标题>](<原始URL>)
::

<正文内容>

## <步骤标题>

<步骤说明>

::prose-tabs{variant="underline" sync="language"}
:::prose-tabs-item{label="Node.js" icon="i-simple-icons-nodedotjs"}
```javascript
// 代码示例
```
:::
::
```

#### 4.5 写入文件
使用 Write 工具创建文件。

### 5. **更新导航配置**

检查目标目录是否存在 `.navigation.yml`：
- 若不存在，创建：
  ```yaml
  navigation: false
  ```
- 若存在且需要更新，编辑添加新条目

### 6. **输出报告**

```
✅ Stripe 文档抓取完成！

📁 创建的文件：
- content/en/2.payments/5.stripe/1.online-payments.md

📊 页面类型：概览页 / 教程页 / API 参考页

🔧 使用的工具：
- Playwright: 页面结构 ✓
- Stripe MCP: 代码示例 ✓
- WebFetch: 正文补充 ✓

🎨 应用的组件转换：
- DocsPageCard: 3 个卡片
- ProseTabs: 2 个代码块
- ProseAnnotation: 5 个术语

📋 后续步骤：
1. 审查生成的内容是否完整
2. 使用 /enhance-with-stripe 优化文档风格
3. 移除 stripeDocUrl 字段（优化完成后）
4. 更新内部链接（替换 Stripe 链接）

⚠️ 待处理的 Stripe 内部链接：
- [Payment Intents](https://docs.stripe.com/payments/payment-intents)
- [Webhooks](https://docs.stripe.com/webhooks)
```

---

## 工具选择指南

| 场景 | 首选工具 | 原因 |
|------|----------|------|
| 获取页面结构 | Playwright | 真实 DOM，准确的层级关系 |
| 获取代码示例 | Stripe MCP | 完整代码，多语言支持 |
| 获取正文描述 | WebFetch | 已处理的 Markdown |
| 验证内容完整性 | Playwright + WebFetch | 交叉对比 |
| 查询组件用法 | Nuxt UI MCP | 组件文档和元数据 |

**工具特点对比**：

| 工具 | 优点 | 缺点 |
|------|------|------|
| **Playwright** | 真实页面结构、准确的层级 | 需要解析 snapshot |
| **Stripe MCP** | 完整代码、API 详情 | 仅限技术内容 |
| **WebFetch** | 已处理的 Markdown | 可能丢失结构、返回摘要 |
| **Nuxt UI MCP** | 组件详情、props/slots | 仅限 Nuxt UI 组件 |

---

## 输出文件规范

### Frontmatter

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | ✅ | 页面标题 |
| `description` | ✅ | 50-160 字符的描述 |
| `stripeDocUrl` | ⚠️ | 原始 Stripe URL（优化后移除） |

### 来源标注

在 frontmatter 后立即添加：
```markdown
::note
**Source**: [Stripe Docs - <标题>](<URL>)
::
```

### 内容结构

- 保留原始标题层级
- 代码块保留语言标识
- 表格保持格式
- 列表保持缩进
- 概览页使用 `docs-page-grid` + `docs-page-card` 组件
- 多语言代码使用 `prose-tabs` 组件
- 大型表格使用 `prose-accordion` 折叠

---

## 组件转换检查清单

### 组件使用

- [ ] 组件嵌套层级正确（`::` → `:::` → `::::`）
- [ ] Frontmatter 属性格式正确（YAML）
- [ ] Slot 使用正确（`#label`, `#content`）
- [ ] 图标命名正确（`i-lucide-*`, `i-simple-icons-*`）

### 内容保持

- [ ] 原始信息未丢失
- [ ] 链接目标正确
- [ ] 表格数据完整
- [ ] 代码块语法高亮正确

### 常见错误

**❌ 错误：使用 `label` 属性**
```markdown
:::prose-accordion-item{label="Title"}  <!-- 不支持 -->
```

**✅ 正确：使用 `#label` slot**
```markdown
:::prose-accordion-item
#label
### Title

#content
...
:::
```

**❌ 错误：嵌套层级不匹配**
```markdown
::docs-page-grid
::docs-page-card  <!-- 应该是 ::: -->
```

**✅ 正确：递增冒号**
```markdown
::docs-page-grid
  :::docs-page-card
  :::
::
```

---

## 常见问题处理

### WebFetch 内容与实际页面不符
- **原因**：WebFetch 返回 AI 摘要，可能丢失页面结构
- **解决**：以 Playwright snapshot 为准，重新组织内容

### 代码示例不完整
- **原因**：WebFetch 可能截断长代码
- **解决**：使用 Stripe MCP 获取完整代码

### 页面类型识别错误
- **解决**：根据 Playwright snapshot 手动判断
- **特征**：概览页有大量 `link` 元素和卡片结构

### 链接处理
- **Stripe 内部链接**：记录到报告中，后续手动处理
- **外部链接**：保留原样

### 格式问题
- HTML 标签残留 → 手动清理或使用 Edit 工具
- 图片链接 → 记录到报告中待处理

---

## 注意事项

1. **工具优先级**：Playwright（结构）> Stripe MCP（代码）> WebFetch（正文）
2. **组件优先**：优先使用项目组件，而非原始 Markdown
3. **交叉验证**：对比多工具输出，确保内容完整
4. **浏览器清理**：每次使用 Playwright 后记得关闭浏览器
5. **内容版权**：抓取内容仅用于参考，需要重写以符合 Onerway 风格
6. **stripeDocUrl 字段**：仅用于追踪原始来源，优化完成后应移除
7. **Stripe 链接**：不得在最终发布的文档中保留 docs.stripe.com 链接
8. **i18n**：此命令仅处理英文版本，中文版需另行翻译

---

## 深入资料

- 项目规范：`CLAUDE.MD` 中的内容组织规范
- 内容规范：`content/CLAUDE.md` 中的 MDC 语法指南
- 组件文档：`app/components/README.md`
- 文档优化：`/enhance-with-stripe` 命令
- 双语翻译：`/translate` 命令

---

现在开始执行抓取流程...
