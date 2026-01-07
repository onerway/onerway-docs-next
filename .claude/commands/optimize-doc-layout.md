---
name: optimize-doc-layout
description: 优化文档内容布局，提升逻辑流畅性、内容密度和交互体验
argument-hint: [文档路径]
allowed-tools: Read, Task, Glob, Grep
---

# 文档布局优化

使用 doc-layout-optimizer agent 分析文档内容结构，推荐合适的组件和布局方案，优化文档的逻辑流畅性、内容密度和交互体验。

**参数说明**:
- **必需**: 文档路径（markdown 文件）

**使用示例**:
```bash
/optimize-doc-layout content/en/1.get-started/1.introduction.md
```

---

## 📋 工作流程

### 1. **读取文档**
- 使用 Read 工具读取指定的文档文件
- 分析文档的 frontmatter 和主体内容
- 理解文档的目标受众和主题

### 2. **启动布局优化 Agent**
- 调用 doc-layout-optimizer agent
- Agent 将：
  - 分析文档内容结构和组织方式
  - 查看项目可用组件（app/components/）
  - 使用 Nuxt UI MCP 查找额外的 UI 组件
  - 识别布局改进机会
  - 提供具体的优化建议

### 3. **获得优化建议**
- Agent 会从多个维度提供优化建议
- 每个建议包含：
  - 问题描述
  - 推荐的组件
  - 具体的实现代码
  - 预期效果说明
- 所有修改需要用户确认后才应用

---

## 🎯 优化维度

此 Agent 将从以下维度分析和优化文档布局：

### 内容组织
- **长内容折叠**：使用 `ProseAccordion` 优化长篇内容、FAQ、步骤说明
- **分组展示**：使用 `ProseTabs` 组织多种方案、平台差异、版本对比
- **卡片布局**：使用 `DocsPageCard` + `DocsPageGrid` 展示相关资源
- **逐步披露**：使用 `ProseCarousel` 展示多步骤流程

### 视觉增强
- **层次结构**：改善标题层级，优化信息密度
- **空白利用**：合理使用网格布局和间距
- **视觉引导**：添加图标、徽章、颜色标记

### 交互优化
- **术语解释**：使用 `ProseAnnotation` 提供悬停提示
- **链接优化**：使用 `ProseLinkSwitch` 处理多环境链接
- **代码展示**：使用 `ProseCodeCard` 优化代码示例呈现
- **图表可视化**：使用 `ProseMermaid` 替代文字描述的流程

### 导航体验
- **资源链接**：使用 `DocsResources` 在文档末尾添加相关资源
- **内部跳转**：优化锚点链接和段落引用
- **TOC 优化**：确保标题层级适合自动生成目录

---

## ⚠️ 注意事项

1. **内容优先**：布局优化服务于内容，不应干扰阅读主线

2. **渐进增强**：从最关键的布局问题开始，避免过度优化

3. **性能考虑**：合理使用交互组件，避免影响页面加载

4. **移动优先**：确保推荐的布局在移动端也有良好体验

5. **品牌一致性**：遵循 Onerway 文档的设计规范和组件使用惯例

6. **确认机制**：Agent 不会直接修改文档，所有建议都需要确认

---

## 🚀 执行步骤

请按以下步骤执行：

### 1. **解析参数**

从 `$ARGUMENTS` 中提取文档路径。

如果 `$ARGUMENTS` 为空，提示用户：
```
请提供文档路径，格式：
/optimize-doc-layout <文档路径>

示例：
/optimize-doc-layout content/en/1.get-started/1.introduction.md
```

### 2. **读取文档**

- 使用 Read 工具读取指定的文档文件
- 验证文件存在且为 markdown 格式
- 提取文档元信息（frontmatter）和内容

### 3. **读取组件信息**

- 使用 Read 工具读取 `app/components/README.md`
- 获取项目可用组件的完整列表
- 了解每个组件的用途和使用场景

### 4. **启动 Agent**

使用 Task 工具调用 doc-layout-optimizer agent。

**Prompt 格式**:
```
请分析以下文档并提供布局优化建议：

文档路径: [路径]

Frontmatter:
[frontmatter 内容]

文档内容:
[完整内容]

---

项目可用组件（来自 app/components/README.md）:
[组件列表和说明]

---

请从以下维度分析文档并提供优化建议：
1. 内容组织：是否有冗长段落、重复内容、可折叠的内容
2. 视觉增强：层次结构、空白利用、视觉引导
3. 交互优化：术语解释、代码展示、图表可视化
4. 导航体验：资源链接、内部跳转、TOC 适配

对于每个建议，请提供：
- 问题描述和位置
- 推荐的组件（优先使用项目组件，必要时使用 Nuxt UI MCP 查找）
- 具体的 MDC 代码实现
- 预期改进效果

注意：
- 优先使用项目已有组件
- 如需要项目中没有的组件，使用 Nuxt UI MCP 查找合适的 Nuxt UI 组件
- 确保所有建议在移动端也有良好体验
- 遵循项目的设计规范
```

### 5. **传递结果**

- Agent 的优化建议会直接返回给用户
- 用户可以根据建议决定是否修改文档
- 建议会按优先级排序，从影响最大的开始

---

## 💡 常见优化场景

### 场景 1: 长列表或 FAQ
**问题**：长列表占用大量空间，降低内容密度
**解决方案**：使用 `ProseAccordion` 折叠不常用信息
```markdown
:::prose-accordion
::::prose-accordion-item{label="问题 1"}
答案内容
::::
::::prose-accordion-item{label="问题 2"}
答案内容
::::
:::
```

### 场景 2: 多平台代码示例
**问题**：同时展示多个平台的代码，页面过长
**解决方案**：使用 `ProseTabs` 组织不同平台
```markdown
:::prose-tabs
::::prose-tabs-item{label="iOS" icon="i-lucide-apple"}
iOS 代码
::::
::::prose-tabs-item{label="Android" icon="i-lucide-android"}
Android 代码
::::
:::
```

### 场景 3: 相关文档链接
**问题**：文档中散落大量链接，影响阅读连贯性
**解决方案**：使用 `DocsResources` 在末尾统一展示
```markdown
::docs-resources
:::docs-resource-item{to="/guide/setup" icon="i-lucide-rocket" tags="快速入门"}
设置指南
:::
:::docs-resource-item{to="/api/reference" icon="i-lucide-book" tags="API"}
API 参考
:::
::
```

### 场景 4: 复杂流程说明
**问题**：纯文字描述复杂流程，难以理解
**解决方案**：使用 `ProseMermaid` 可视化流程
```markdown
```mermaid
graph LR
  A[开始] --> B[步骤1]
  B --> C[步骤2]
  C --> D[结束]
```
```

---

现在开始执行优化流程...
