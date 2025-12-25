# Task List 可交互功能调研

GFM Task List 可交互化的技术调研报告。

---

## 调研结论

  **推荐方案**：Nuxt Content Transformer + ProseTaskItem 组件

  **已完成**：MVP 实现 ✅（2025-12-25）

  **设计文档**：`designs/ProseTaskItem.md`

---

## 1. 背景与目标

### 1.1 现状

- **技术栈**：Nuxt 4.2.1 + @nuxt/content 3.8.0 + Nuxt UI 4.1.0
- **现有行为**：`- [x]` / `- [ ]` 被解析为 `<input type="checkbox" disabled>`
- **问题**：仅作视觉展示，用户**无法交互**
- **使用规模**：已有 16 个文档文件使用了 task list 语法

### 1.2 目标

1. ✅ 用户可勾选/取消勾选
2. ✅ 勾选状态持久化保存
3. ✅ 保持原生 Markdown 语法不变
4. ✅ SSR 友好（无 hydration mismatch）
5. ✅ 良好的用户体验
6. ✅ 与现有 Prose 组件生态一致

---

## 2. 项目现状分析

### 2.1 Markdown 处理管道

  当前处理链：

```
remark-parse → remark-gfm → remark-mdc
  → remark-rehype → rehype-slug
  → rehype-raw → rehype-external-links
  → rehype-sort-attributes → rehype-minify-whitespace
```

  **关键依赖**：
  - `@nuxt/content` v3.8.0
  - `remark-gfm`（内置于 Nuxt Content）
  - `micromark-extension-gfm-task-list-item`

### 2.2 现有 Prose 组件生态

  **位置**：`app/components/content/`

  已有 26 个自定义组件，按前缀分类：
  - **Prose**：内容表达增强（Tabs、Accordion、Annotation 等）
  - **Docs**：页面结构（Toc、PageCard、Resources 等）

  **无现有 Task List 组件**。

### 2.3 持久化模式参考

  项目中已有两种模式：

  | 模式 | 组件 | 特点 |
  |------|------|------|
  | localStorage | ProseTabs | 简单、SSR 友好 |
  | useCookie | PaymentDemo | SSR 兼容、跨会话 |

  **选择**：采用 localStorage 模式（参考 ProseTabs）。

---

## 3. 技术方案对比

### 3.1 三种方案

| 方案 | 架构 | 优点 | 缺点 |
|------|------|------|------|
| **A: ProseTaskItem** | 独立组件，自带持久化 | 简单、SSR 友好 | 无批量操作 |
| B: TaskList + TaskItem | 父组件集中管理状态 | 支持进度统计 | 实现复杂 |
| C: Hybrid | 可选容器 + Composable | 灵活性最高 | 维护成本高 |

### 3.2 方案对比表

| 维度 | 方案 A | 方案 B | 方案 C |
|------|--------|--------|--------|
| 实现复杂度 | **低** | 中 | 高 |
| 性能 | 一般 | 好 | 最佳 |
| 批量操作 | ❌ | ✅ | ✅ |
| 进度统计 | ❌ | ✅ | ✅ |
| SSR 友好度 | **好** | 需注意 | 需注意 |
| MDC 语法友好度 | **最好** | 需手动 | 两者兼备 |

### 3.3 推荐方案

**方案 A（ProseTaskItem）作为 MVP**

理由：
1. 符合 KISS 原则
2. 与现有组件模式一致
3. SSR 友好
4. 可快速交付（1-2 天）
5. 可后续扩展为方案 C

---

## 4. 关键技术发现

### 4.1 minimark vs HAST

  **发现**：Nuxt Content 3 使用 `minimark` 格式存储解析后的 Markdown，而非标准的 HAST。

  **minimark 格式**：

```javascript
// 数组结构: ["tagName", {props}, ...children]
["li", {},
  ["input", { type: "checkbox", disabled: true, checked: true }],
  " Task description"
]
```

  **影响**：

  - ❌ 无法使用标准 rehype 插件（如 `unist-util-visit`）
  - ✅ 需要使用 Nuxt Content Transformer

### 4.2 Transformer vs Rehype 插件

  | 维度 | Rehype 插件 | Nuxt Content Transformer |
  |------|-------------|-------------------------|
  | AST 格式 | HAST（对象结构） | minimark（数组结构） |
  | 工具链 | unified 生态 | Nuxt Content 原生 |
  | 适用性 | ❌ Nuxt Content 3 不适用 | ✅ 推荐 |

### 4.3 转换策略

```
Markdown 源文件
    ↓
remark-gfm 解析 (生成 disabled checkbox)
    ↓
Nuxt Content Transformer (替换为 Vue 组件)
    ↓
Vue 组件渲染 (交互 + 持久化)
```

---

## 5. 持久化方案分析

### 5.1 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **localStorage** | 简单、无后端 | 单设备 | MVP ✅ |
| IndexedDB | 大容量、离线 | 复杂 | 大量任务 |
| 云端同步 | 多设备 | 需后端 | 协作场景 |

### 5.2 localStorage 实现要点

- Key 格式：`task-${id}`
- SSR 安全：`import.meta.client` + `onMounted`
- 优先级：localStorage > Markdown 初始值

---

## 6. 潜在问题与风险

### 6.1 已解决

  | 问题 | 解决方案 |
  |------|----------|
  | SSR/CSR 不一致 | `onMounted` 客户端初始化 |
  | localStorage 不可用 | 内存降级（可选） |

### 6.2 待观察

  | 问题 | 影响 | 缓解措施 |
  |------|------|----------|
  | 文档重命名导致 ID 变化 | 丢失历史状态 | 可提供迁移工具 |
  | 大量任务性能 | 多次 localStorage 操作 | 可升级为集中管理 |

---

## 7. 参考资源

### 7.1 技术文档

- [Nuxt Content Configuration](https://content.nuxt.com/docs/getting-started/configuration)
- [Nuxt Content Transformers](https://content.nuxt.com/docs/advanced/transformers)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)

### 7.2 项目参考文件

| 文件 | 参考内容 |
|------|----------|
| `ProseTabs.vue` | localStorage 持久化模式 |
| `ProseAccordion.vue` | Nuxt UI 组件封装模式 |
| `modules/include/` | 自定义 Nuxt 模块示例 |

### 7.3 相关文档

- `technical-references/nuxt-content-architecture.md` - minimark 格式详解
- `designs/ProseTaskItem.md` - 组件设计文档

---

  *调研完成时间：2025-12-25*
  *基于项目版本：Nuxt 4.2.1 + @nuxt/content 3.8.0*

