# 组件文档索引

组件相关的技术调研和设计文档。

---

## 目录结构

```
docs/
├── investigations/         # 技术调研（设计前）
├── designs/               # 设计文档（设计时）
├── technical-references/  # 技术参考文档
└── README.md
```

---

## 文档类型

### technical-references/ - 技术参考文档

**目的**：深度技术参考和架构解析

**内容**：底层架构、处理流程、插件系统、开发指南

**命名**：`{topic}-{subtopic}.md`

**现有文档**：

- `nuxt-content-architecture.md`

---

### investigations/ - 技术调研

  **目的**：深入理解上游组件实现

  **内容**：源码分析、完整 API、依赖关系、实现原理

  **命名**：`{upstream-component}-investigation.md`

  **现有文档**：

  - `nuxt-ui-tabs-investigation.md` - Nuxt UI Tabs 组件调研
  - `nuxt-ui-accordion-investigation.md` - Nuxt UI Accordion 组件调研
  - `nuxt-ui-carousel-investigation.md` - Nuxt UI Carousel 组件调研
  - `nuxt-ui-content-toc-investigation.md` - Nuxt UI Content TOC 组件调研
  - `nuxt-ui-prose-a-investigation.md` - Nuxt UI ProseA 组件调研
  - `nuxt-ui-steps-investigation.md` - Nuxt UI Steps 组件调研
  - `task-list-investigation.md` - Task List 可交互功能调研

---

### designs/ - 设计文档

**目的**：记录组件设计决策和 API

**内容**：方案摘要、API 设计、依赖清单、来源标注、实现建议

**命名**：`{ComponentName}.md`

**生成方式**：使用 `component-designer` skill 自动生成

**现有文档**：

- `ProseTaskItem.md` - 可交互任务列表项

**待补充**（现有组件缺设计文档）：

- [ ] ProseTabs.md
- [ ] ProseAccordion.md
- [ ] ProseCarousel.md
- [ ] ProseAnnotation.md
- [ ] ProseCodeCard.md
- [ ] DocsPageCard.md
- [ ] DocsToc.md

---

## 工作流程

```
1. 技术调研（可选，复杂组件推荐）
   → investigations/{component}-investigation.md

2. 组件设计（必需，使用 component-designer skill）
   → designs/{ComponentName}.md

3. 组件实现（参考设计文档）
   → app/components/content/{ComponentName}.vue

4. 更新索引
   → app/components/README.md
```

---

## 两类文档的关系

**调研文档**：

- 设计**之前**，了解技术细节
- 详细完整，包含源码
- 可选（简单组件可跳过）

**设计文档**：

- 设计**完成时**，记录决策
- 由 skill 生成，格式统一
- 必需（每个组件都应有）

**关系**：调研 → 设计 → 实现 → 索引

---

## 使用示例

### 创建调研文档（可选）

```bash
# 深入了解 Nuxt UI Tabs
docs/investigations/nuxt-ui-tabs-investigation.md
```

### 生成设计文档（必需）

```bash
# 使用 component-designer skill
输入：需求 + 参考 @docs/investigations/xxx（如有）
输出：保存到 docs/designs/{ComponentName}.md
```

### 补充现有组件设计文档

```bash
# 已实现但缺设计文档的组件
1. 阅读组件源码
2. 使用 component-designer skill 反向生成
3. 标注来源为 📖 现有实现
```

---

## 维护

**添加调研文档**：

1. 创建 `investigations/{component}-investigation.md`
2. 更新本 README 的"现有文档"列表

**添加设计文档**：

1. 使用 `component-designer` skill 生成
2. 保存到 `designs/{ComponentName}.md`
3. 更新本 README 的"待补充"列表（标记完成）

---

## 相关资源

  - 组件索引：`../app/components/README.md`
  - 设计 Skill：`../.claude/skills/component-designer/`
  - 项目规范：`../CLAUDE.md`
