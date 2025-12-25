# Nuxt Content & MDC 技术架构深度解析手册

本手册旨在理清 Nuxt Content、Nuxt MDC 以及底层 Remark/Rehype 插件系统的关系与运作机制，方便开发查阅。

---

## 一、技术栈分层架构

  在 Nuxt 3 内容生态中，数据从原始文件到网页呈现经历了四个核心层级：

  | 层级 | 模块名称 | 角色 | 核心任务 |
  | --- | --- | --- | --- |
  | **应用层** | **Nuxt Content** | 总指挥部 | 负责文件扫描、数据库索引、API 查询（`queryContent`）及自动路由。 |
  | **转换层** | **Nuxt MDC** | 核心转换引擎 | 识别 Markdown 中的 Vue 组件语法（`::component`），并将其桥接到渲染器。 |
  | **底层引擎** | **Unified.js** | 基础设施 | 定义了内容处理的标准化流程（插件协议）。 |
  | **处理站** | **Remark & Rehype** | 语法与 HTML 处理器 | 分别负责 Markdown 逻辑解析与最终 HTML 结构的精修。 |

---

## 二、内容处理流水线 (The Pipeline)

Markdown 的转换过程是一个**"从蓝图到施工"**的过程。

1. **输入**：读取 `content/*.md` 文件。
2. **解析 (Remark 阶段)**：将字符串转为 **MDAST (Markdown 抽象语法树)**。此时只记录逻辑（如：这是一个标题）。
3. **桥接 (MDC 介入)**：MDC 识别 `::` 语法，并确保在 MDAST 中这些节点被标记为"可渲染的组件"。
4. **转换 (Transform)**：将 **MDAST** 映射为 **HAST (HTML 抽象语法树)**。
5. **加工 (Rehype 阶段)**：在 HAST 基础上添加属性（如 ID、类名、高亮）。
6. **输出**：`<ContentRenderer />` 接收最终数据，在 Vue 中渲染为真实的 DOM。

---

## 三、常用插件手册

### 1. Remark 插件：作用于"语法识别"

  如果你想让系统**"认出"**某种新的书写格式，应使用 Remark 插件。

  | 插件名称 | 功能描述 | 示例语法 |
  | --- | --- | --- |
  | `remark-gfm` | **GitHub 风格支持** | 表格、任务列表 `[x]`、删除线 `~~` |
  | `remark-math` | **数学公式识别** | 识别 `$E=mc^2$` 为数学节点 |
  | `remark-emoji` | **表情代码支持** | 将 `:dog:` 转换为 🐶 |
  | `remark-reading-time` | **计算阅读时长** | 在 Frontmatter 中注入 `readingTime` |

### 2. Rehype 插件：作用于"HTML 输出"

  如果你想修改生成后的 **HTML 标签属性** 或 **视觉呈现**，应使用 Rehype 插件。

  | 插件名称 | 功能描述 | 效果说明 |
  | --- | --- | --- |
  | `rehype-katex` | **数学公式渲染** | 将数学节点转为带样式的 HTML（配合 CSS 使用） |
  | `rehype-slug` | **自动标题 ID** | 给 `<h2>` 自动加上 `id="my-title"` |
  | `rehype-external-links` | **外链处理** | 自动给 `<a>` 加 `target="_blank"` |
  | `rehype-autolink-headings` | **标题锚点** | 在标题旁自动加一个可点击的 🔗 图标 |

---

## 四、在 Nuxt 3 中的配置示例

在 `nuxt.config.ts` 中进行集成配置：

```typescript
export default defineNuxtConfig({
  content: {
    markdown: {
      // 1. Remark 插件：改变对 Markdown 语法的理解
      remarkPlugins: [
        'remark-gfm',
        'remark-emoji',
        'remark-math'
      ],
      // 2. Rehype 插件：改变生成的 HTML 结构
      rehypePlugins: [
        'rehype-slug',
        ['rehype-katex', { output: 'html' }],
        ['rehype-external-links', { target: '_blank', rel: 'nofollow' }]
      ]
    },
    // Nuxt Content 内置的高亮引擎 (基于 Shiki)
    highlight: {
      theme: 'github-dark',
      langs: ['js', 'ts', 'vue', 'python']
    }
  },
  // 如果使用了 KaTeX，需引入其样式
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css' }
      ]
    }
  }
})
```

---

## 五、核心术语总结

  * **MDAST (Markdown AST)**：逻辑蓝图。只知道这是一段 Markdown 文本，不知道它在 HTML 里叫什么。
  * **HAST (Hypertext AST)**：施工清单。记录了所有的 HTML 标签、类名和属性。
  * **minimark**：Nuxt Content 3 内部使用的紧凑 AST 格式，是 HAST 的数组表示形式（见下文）。
  * **Nuxt MDC (Markdown Components)**：它是 Nuxt Content 的灵魂，打破了"静态文本"和"动态组件"的界限，允许在文档中通过 `::` 直接调用 Vue 组件。

### ⚠️ 重要：Nuxt Content 3 的 minimark 格式

  **Nuxt Content 3 在 `file.body` 中存储的不是标准 HAST，而是 `minimark` 格式**。

  这是一个重要的技术细节，影响自定义插件的开发方式。

  **HAST 格式（标准）**：
```javascript
{
  type: 'element',
  tagName: 'input',
  properties: { type: 'checkbox', disabled: true },
  children: []
}
```

  **minimark 格式（Nuxt Content 3 实际使用）**：
```javascript
["input", { type: "checkbox", disabled: true }]
// 格式: ["tagName", {props}, ...children]
```

  **完整的 body 结构**：
```javascript
{
  type: "minimark",
  value: [
    ["div", { class: "container" },
      ["p", {}, "Hello World"],
      ["ul", {},
        ["li", {}, "Item 1"],
        ["li", {}, "Item 2"]
      ]
    ]
  ]
}
```

  **这意味着**：
  - ❌ 标准的 rehype 插件（期望 HAST）可能无法直接工作
  - ✅ 应使用 **Nuxt Content Transformer** 来操作 minimark AST

---

## 六、自定义插件开发指南

### 6.0 选择正确的开发方式

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 修改解析后的 AST（如替换元素为 Vue 组件） | **Nuxt Content Transformer** | 可直接操作 minimark 格式 |
| 使用现有的 npm rehype 插件 | **rehypePlugins 配置** | 大部分插件在 Markdown→HAST 阶段工作 |
| 修改 Markdown 解析逻辑 | **remarkPlugins 配置** | 作用于 MDAST 阶段 |

### 6.1 Nuxt Content Transformer 开发模板（推荐）

**适用场景**：需要操作解析后的内容，如将 HTML 元素替换为 Vue 组件。

```typescript
// modules/my-plugin/transformer.ts
import { defineTransformer } from "@nuxt/content";

// minimark 节点类型: ["tagName", {props}, ...children]
type MinimarkNode = [
  string,
  Record<string, unknown>,
  ...(string | MinimarkNode)[],
];

interface MinimarkBody {
  type: string;
  value: (string | MinimarkNode)[];
}

/**
 * 递归遍历 minimark AST
 */
const visitNodes = (
  nodes: (string | MinimarkNode)[],
  visitor: (node: MinimarkNode) => void
): void => {
  for (const node of nodes) {
    if (typeof node === "string") continue;
    if (!Array.isArray(node) || node.length < 2) continue;

    visitor(node);

    // 递归处理子节点（索引 2 及之后的元素）
    if (node.length > 2) {
      const children = node.slice(2) as (string | MinimarkNode)[];
      visitNodes(children, visitor);
    }
  }
};

export default defineTransformer({
  name: "my-custom-transformer",
  extensions: [".md"],
  transform(file) {
    const body = file.body as MinimarkBody | undefined;

    // 只处理 minimark 格式
    if (!body || body.type !== "minimark" || !Array.isArray(body.value)) {
      return file;
    }

    // 遍历并修改 AST
    visitNodes(body.value, (node) => {
      const [tag, props] = node;

      // 示例：将所有 <img> 替换为 <ProseImage>
      if (tag === "img") {
        node[0] = "ProseImage"; // 修改 tagName
        node[1] = { ...props, loading: "lazy" }; // 修改 props
      }
    });

    return file;
  },
});
```

**Nuxt 模块注册**：

```typescript
// modules/my-plugin/index.ts
import { defineNuxtModule, createResolver } from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "my-custom-plugin",
    configKey: "myPlugin",
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) return;

    const { resolve } = createResolver(import.meta.url);

    // 注册 transformer
    nuxt.options.content = nuxt.options.content || {};
    nuxt.options.content.build = nuxt.options.content.build || {};
    nuxt.options.content.build.transformers =
      nuxt.options.content.build.transformers || [];

    const transformerPath = resolve("./transformer");
    if (!nuxt.options.content.build.transformers.includes(transformerPath)) {
      nuxt.options.content.build.transformers.push(transformerPath);
    }

    console.log("[my-plugin] Transformer registered");
  },
});
```

### 6.2 Rehype 插件开发模板

```typescript
// modules/my-custom-plugin/rehype-plugin.ts
import type { Plugin } from 'unified'
import type { Root, Element } from 'hast'
import { visit } from 'unist-util-visit'

export interface RehypeCustomOptions {
  // 插件配置选项
  customOption?: string
}

export const rehypeCustomPlugin: Plugin<[RehypeCustomOptions?], Root> = (
  options = {}
) => {
  return (tree, file) => {
    // 遍历 HAST 树
    visit(tree, 'element', (node: Element) => {
      // 检查节点类型
      if (node.tagName === 'target-tag') {
        // 修改节点属性
        node.properties = {
          ...node.properties,
          className: ['custom-class'],
          'data-custom': 'value'
        }
      }
    })
  }
}
```

### 6.2 Nuxt 模块注册

```typescript
// modules/my-custom-plugin/index.ts
import { defineNuxtModule } from '@nuxt/kit'
import { rehypeCustomPlugin } from './rehype-plugin'

export default defineNuxtModule({
  meta: {
    name: 'my-custom-plugin',
    configKey: 'customPlugin',
  },
  setup(options, nuxt) {
    // 注入 rehype 插件
    nuxt.options.content = nuxt.options.content || {}
    nuxt.options.content.build = nuxt.options.content.build || {}
    nuxt.options.content.build.markdown = nuxt.options.content.build.markdown || {}
    nuxt.options.content.build.markdown.rehypePlugins = {
      ...nuxt.options.content.build.markdown.rehypePlugins,
      [require.resolve('./rehype-plugin')]: options,
    }
  },
})
```

---

## 七、常见应用场景

### 场景 1：自动给所有图片添加懒加载

```typescript
// rehype-lazy-images.ts
export const rehypeLazyImages: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img') {
        node.properties = {
          ...node.properties,
          loading: 'lazy',
          decoding: 'async'
        }
      }
    })
  }
}
```

### 场景 2：外部链接自动添加图标

```typescript
// rehype-external-link-icon.ts
export const rehypeExternalLinkIcon: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a') {
        const href = node.properties?.href as string
        if (href && /^https?:\/\//.test(href)) {
          // 添加外部链接类名
          node.properties.className = [
            ...(node.properties.className || []),
            'external-link'
          ]
          // 添加图标节点
          node.children.push({
            type: 'element',
            tagName: 'span',
            properties: { className: ['external-icon'] },
            children: [{ type: 'text', value: '↗' }]
          })
        }
      }
    })
  }
}
```

### 场景 3：代码块自动添加复制按钮

```typescript
// rehype-code-copy-button.ts
export const rehypeCodeCopyButton: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'pre') {
        // 包装 pre 标签
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-wrapper'] },
          children: [
            node,
            {
              type: 'element',
              tagName: 'button',
              properties: {
                className: ['copy-button'],
                'aria-label': 'Copy code'
              },
              children: [{ type: 'text', value: 'Copy' }]
            }
          ]
        }
        // 替换原节点
        Object.assign(node, wrapper)
      }
    })
  }
}
```

---

## 八、调试技巧

### 8.1 查看 minimark AST 结构（Transformer）

```typescript
// 在 transformer 中打印 AST
export default defineTransformer({
  name: "debug-transformer",
  extensions: [".md"],
  transform(file) {
    console.log("File ID:", file.id);
    console.log("Body type:", file.body?.type);
    console.log("Body sample:", JSON.stringify(file.body, null, 2).substring(0, 500));
    return file;
  },
});
```

### 8.2 查看 HAST 结构（Rehype 插件）

```typescript
// 在 rehype 插件中打印 AST
export const rehypeDebug: Plugin<[], Root> = () => {
  return (tree) => {
    console.log('HAST Tree:', JSON.stringify(tree, null, 2))
  }
}
```

### 8.3 检查特定节点

**minimark 格式**：
```typescript
visitNodes(body.value, (node) => {
  const [tag, props] = node;
  if (tag === "your-target") {
    console.log("Found target node:", {
      tag,
      props,
      children: node.slice(2),
    });
  }
});
```

**HAST 格式**：
```typescript
visit(tree, 'element', (node: Element) => {
  if (node.tagName === 'your-target') {
    console.log('Found target node:', {
      tag: node.tagName,
      props: node.properties,
      children: node.children
    })
  }
})
```

---

## 九、性能优化建议

  1. **避免深度遍历**：只访问必要的节点类型
  2. **使用条件判断**：提前过滤不需要处理的节点
  3. **批量操作**：一次遍历完成多个任务
  4. **缓存计算结果**：避免重复计算

```typescript
// 不推荐：多次遍历
visit(tree, 'element', handleImages)
visit(tree, 'element', handleLinks)

// 推荐：单次遍历
visit(tree, 'element', (node: Element) => {
  if (node.tagName === 'img') handleImages(node)
  if (node.tagName === 'a') handleLinks(node)
})
```

---

## 十、参考资源

### 官方文档
- [Unified.js](https://unifiedjs.com/) - 统一内容处理框架
- [Remark](https://github.com/remarkjs/remark) - Markdown 处理器
- [Rehype](https://github.com/rehypejs/rehype) - HTML 处理器
- [Nuxt Content](https://content.nuxt.com/) - Nuxt 内容模块
- [MDC Syntax](https://content.nuxt.com/usage/markdown#mdc-syntax) - MDC 语法指南

### 工具库
- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) - AST 遍历（用于 HAST）
- [hast-util-select](https://github.com/syntax-tree/hast-util-select) - CSS 选择器查询
- [hast-util-to-string](https://github.com/syntax-tree/hast-util-to-string) - 提取文本内容

### 插件列表
- [Remark Plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- [Rehype Plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md)

### 项目实现参考
- `modules/task-list/` - Nuxt Content Transformer 实现示例（可交互 Task List）
- `modules/include/` - 自定义 Nuxt 模块示例

---

## 十一、总结：选择正确的方式

  | 需求 | 推荐方式 | 示例 |
  |------|----------|------|
  | 将 HTML 元素替换为 Vue 组件 | **Transformer** | task-list（将 checkbox 替换为 ProseTaskItem） |
  | 添加/修改元素属性 | **Rehype 插件** | rehype-slug（给标题添加 id） |
  | 识别新的 Markdown 语法 | **Remark 插件** | remark-math（识别数学公式） |
  | 使用现有 npm 插件 | **配置 remarkPlugins/rehypePlugins** | remark-gfm、rehype-katex |

  **关键原则**：
  - 如果需要操作 `file.body`（解析后的 AST），使用 **Transformer**
  - 如果使用现有 npm 插件或标准 HAST 操作，使用 **rehypePlugins 配置**

---

## 下一步建议

如果您需要对内容进行更高级的定制：

1. **替换元素为 Vue 组件** → 参考 `modules/task-list/transformer.ts`
2. **使用现有 rehype 插件** → 参考第四节配置示例
3. **调试 AST 结构** → 参考第八节调试技巧
4. **可视化调试** → 使用 [AST Explorer](https://astexplorer.net/)

---

  *最后更新：2025-12-25*
  *基于项目版本：Nuxt 4.2.1 + @nuxt/content 3.8.0*
  *重要更新：添加 minimark 格式说明和 Transformer 开发指南*
