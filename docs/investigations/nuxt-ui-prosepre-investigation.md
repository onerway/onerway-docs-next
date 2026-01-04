# ProsePre 组件调研报告

## 概述

**ProsePre** 是 Nuxt Content 中用于渲染代码块（fenced code blocks）的核心组件，由 `@nuxtjs/mdc` 模块提供。它是 Prose 组件系统的一部分，负责将 Markdown 中的代码块转换为美化的、功能丰富的代码展示区域。

在 Nuxt 生态系统中，它存在于两个主要位置：

1. **@nuxtjs/mdc** - Nuxt Content 的底层 MDC（Markdown Components）模块，提供基础实现
2. **@nuxt/ui** - Nuxt UI 库，提供增强版本，支持主题定制和高级功能

---

## 1. Nuxt MDC 基础版本

### 源码位置

`@nuxtjs/mdc/src/runtime/components/prose/ProsePre.vue`

- GitHub: https://github.com/nuxt-content/mdc/blob/main/src/runtime/components/prose/ProsePre.vue

### 完整源码

```vue
<template>
  <pre :class="$props.class"><slot /></pre>
</template>

<script setup>
defineProps({
  code: { type: String, default: "" },
  language: { type: String, default: null },
  filename: { type: String, default: null },
  highlights: { type: Array, default: () => [] },
  meta: { type: String, default: null },
  class: { type: String, default: null }
});
</script>

<style>
pre code .line {
  display: block;
}
</style>
```

### Props 定义

| Prop | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `code` | `String` | `""` | 代码内容（原始代码文本） |
| `language` | `String` | `null` | 编程语言标识（用于语法高亮） |
| `filename` | `String` | `null` | 可选的文件名显示 |
| `highlights` | `Array` | `[]` | 需要高亮的行号数组 |
| `meta` | `String` | `null` | 额外的元数据字符串 |
| `class` | `String` | `null` | 自定义 CSS 类名 |

### 设计特点

- **简洁**：基础的 `<pre>` 元素封装
- **无默认样式**：样式由外部 CSS 或主题提供
- **支持插槽**：通过默认插槽渲染代码内容
- **行级显示**：确保每行代码独立显示（`display: block`）

---

## 2. Nuxt UI 增强版本

### 核心功能特性

#### 2.1 代码高亮（Code Highlighting）

- **引擎**：Shiki - 基于 TextMate 语法的高亮库
- **支持语言**：20+ 种编程语言
  - JavaScript, TypeScript, Vue, JSX, TSX
  - JSON, YAML, Bash, Shell
  - Python, Java, Go, Rust
  - Diff, Markdown 等
- **主题支持**：
  - 默认主题：`material-theme-lighter`（浅色）和 `material-theme-palenight`（深色）
  - 可自定义：`github-light`, `dracula`, `catppuccin-latte`, `nord` 等

#### 2.2 复制代码功能

每个代码块自动配备复制按钮：
- 点击复制图标将代码复制到剪贴板
- 状态反馈：按钮变为勾号（✓）表示复制成功
- 可自定义图标：通过 `app.config.ts` 中的 `ui.icons.copy` 和 `ui.icons.copyCheck`

**默认图标**：
```typescript
{
  copy: 'i-lucide-copy',
  copyCheck: 'i-lucide-copy-check'
}
```

#### 2.3 文件名显示

Markdown 语法：
```markdown
```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui']
})
```
```

特性：
- 自动检测文件类型并显示对应图标
- 支持 50+ 种文件类型的图标
- 可在 `app.config.ts` 中配置自定义图标

#### 2.4 行高亮

Markdown 语法：
```markdown
```ts [nuxt.config.ts] {2,4-6}
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],  // 第 2 行高亮
  css: ['~/assets/css/main.css'],
  ui: {  // 第 4-6 行高亮
    theme: {}
  }
})
```
```

- 突出显示特定行号
- 使用大括号 `{2,4,6}` 语法指定单行
- 使用范围 `{2-5}` 指定多行

#### 2.5 代码 Diff

Markdown 语法：
```markdown
```diff [nuxt.config.ts]
export default defineNuxtConfig({
  modules: [
-   '@nuxt/ui-pro'
+   '@nuxt/ui'
  ]
})
```
```

- 使用 `diff` 语言显示代码变更
- 自动标记添加行（`+`）和删除行（`-`）
- 适合展示代码迁移和升级指南

---

## 3. 配置方式

### 3.1 nuxt.config.ts - 代码高亮配置

```typescript
export default defineNuxtConfig({
  content: {
    build: {
      markdown: {
        highlight: {
          // 支持的编程语言
          langs: [
            'bash', 'shell', 'sh',
            'yaml', 'yml',
            'ts', 'typescript',
            'js', 'javascript',
            'jsx', 'tsx',
            'diff',
            'vue', 'vue-html',
            'json',
            'python', 'py',
            'java',
            'go',
            'rust',
            'markdown', 'md'
          ],

          // 主题配置（支持浅色/深色模式）
          theme: {
            default: 'catppuccin-latte',  // 默认主题
            dark: 'dracula',              // 深色模式主题
            light: 'catppuccin-latte'     // 浅色模式主题
          }
        },

        // 目录配置
        toc: {
          depth: 4,        // 目录深度
          searchDepth: 6   // 搜索深度
        }
      }
    }
  }
})
```

**可用主题列表**：
- `material-theme-lighter` / `material-theme-palenight`
- `github-light` / `github-dark`
- `dracula`
- `catppuccin-latte` / `catppuccin-mocha`
- `nord`
- `one-dark-pro`
- `tokyo-night`

完整主题列表：https://shiki.style/themes

### 3.2 app.config.ts - UI 样式配置

```typescript
export default defineAppConfig({
  ui: {
    // 复制按钮图标
    icons: {
      copy: 'i-lucide-copy',
      copyCheck: 'i-lucide-copy-check'
    },

    // Prose 代码块样式
    prose: {
      pre: {
        slots: {
          // 容器样式
          root: 'relative my-5 group',

          // 头部样式（包含文件名和复制按钮）
          header: [
            'flex items-center gap-1.5',
            'border border-b-0 rounded-t-md',
            'bg-secondary/50 px-4 py-2.5'
          ].join(' '),

          // 文件名样式
          filename: 'text-default text-sm/6',

          // 文件图标样式
          icon: 'size-4 shrink-0',

          // 复制按钮样式
          copy: [
            'absolute top-[11px] right-[11px]',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity'
          ].join(' '),

          // 代码块基础样式
          base: [
            'group font-mono text-sm/6',
            'border rounded-md',
            'bg-secondary/50',
            'overflow-x-auto'
          ].join(' ')
        },

        // 变体配置
        variants: {
          filename: {
            true: {
              root: '[&>pre]:rounded-t-none [&>pre]:my-0 my-5'
            }
          }
        }
      },

      // 代码文件类型图标
      codeIcon: {
        // JavaScript 生态
        ts: 'i-vscode-icons-file-type-typescript',
        typescript: 'i-vscode-icons-file-type-typescript',
        js: 'i-vscode-icons-file-type-js',
        javascript: 'i-vscode-icons-file-type-js',
        jsx: 'i-vscode-icons-file-type-reactjs',
        tsx: 'i-vscode-icons-file-type-reactts',

        // Vue
        vue: 'i-vscode-icons-file-type-vue',
        'vue-html': 'i-vscode-icons-file-type-vue',

        // 配置文件
        json: 'catppuccin:json',
        yaml: 'i-vscode-icons-file-type-yaml',
        yml: 'i-vscode-icons-file-type-yaml',

        // Shell
        bash: 'i-vscode-icons-file-type-shell',
        sh: 'i-vscode-icons-file-type-shell',
        shell: 'i-vscode-icons-file-type-shell',

        // 其他语言
        python: 'i-vscode-icons-file-type-python',
        py: 'i-vscode-icons-file-type-python',
        java: 'i-vscode-icons-file-type-java',
        go: 'i-vscode-icons-file-type-go',
        rust: 'i-vscode-icons-file-type-rust',

        // 标记语言
        markdown: 'i-vscode-icons-file-type-markdown',
        md: 'i-vscode-icons-file-type-markdown',

        // 版本控制
        diff: 'i-lucide-git-compare'

        // ... 更多类型
      }
    }
  }
})
```

**本项目配置位置**：
- nuxt.config.ts: 第 92-122 行
- app.config.ts: 第 116-215 行

---

## 4. 与 Nuxt Content 的集成

### 4.1 集成流程

```
Markdown 文件（.md）
    ↓
Nuxt Content（基于文件的 CMS）
    ↓
@nuxtjs/mdc（Markdown Components 解析器）
    ↓
Remark/Rehype 插件（AST 转换）
    ↓
ProsePre 组件（代码块渲染）
    ↓
Shiki（语法高亮处理）
    ↓
最终 HTML 输出
```

### 4.2 模块配置要求

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',      // 必须在前
    '@nuxt/content'  // 必须在后
  ]
})
```

**重要**：`@nuxt/content` 必须在 `@nuxt/ui` 之后才能正确加载 Prose 组件的增强版本。

### 4.3 Tailwind CSS 配置

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

/* 让 Tailwind 扫描 markdown 文件中的类名 */
@source "../../../content/**/*";
```

这确保 Markdown 文件中的自定义类名会被 Tailwind 正确处理。

---

## 5. Markdown 使用示例

### 5.1 基础代码块

```markdown
```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui']
})
```
```

渲染效果：
- 语法高亮
- 自动复制按钮
- 响应式布局

### 5.2 带文件名的代码块

```markdown
```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content']
})
```
```

渲染效果：
- 文件名头部显示
- 文件类型图标（TypeScript 图标）
- 复制按钮右上角显示

### 5.3 行高亮

```markdown
```ts [server/api/hello.ts] {2-4}
export default defineEventHandler((event) => {
  return {
    hello: 'world'
  }
})
```
```

渲染效果：
- 第 2-4 行背景高亮
- 更容易聚焦关键代码

### 5.4 代码 Diff

```markdown
```diff [package.json]
{
  "dependencies": {
-   "@nuxt/ui-pro": "^1.0.0"
+   "@nuxt/ui": "^4.0.0"
  }
}
```
```

渲染效果：
- 红色背景显示删除行（`-`）
- 绿色背景显示添加行（`+`）

### 5.5 多语言支持

```markdown
```python [app.py]
def hello():
    return "Hello, World!"
```

```java [App.java]
public class App {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```
```

每种语言都有对应的语法高亮和文件图标。

---

## 6. 项目中的自定义实现

### 6.1 ProseCodeCard 组件

项目路径：`/app/components/content/ProseCodeCard.vue`

**功能特点**：
- 终端风格的 header（带窗口控制按钮）
- 自定义标题和复制按钮
- 支持固定高度或动态高度
- 底部 CTA actions 按钮
- 集成 ProsePre 进行代码渲染

**使用示例**：

```vue
<ProseCodeCard
  title="安装依赖"
  language="bash"
  :code="code"
  :actions="[{
    label: '查看文档',
    to: '/docs/installation'
  }]"
/>
```

**核心实现**：

```vue
<ProsePre
  :language="language"
  :code="code || ''"
  :ui="{
    root: 'my-0',
    base: 'border-none bg-inherit',
    copy: 'hidden'  // 隐藏默认复制按钮，使用自定义
  }">
  {{ code || "" }}
</ProsePre>
```

### 6.2 ProseCode 组件

项目路径：`/app/components/content/ProseCode.vue`

**高级功能**：
- 行内代码增强
- 图标显示
- 复制功能（带状态反馈）
- 链接跳转
- 徽章模式
- 鼠标悬停提示
- 格式化显示（银行卡、手机号、IBAN）

---

## 7. 自定义 ProsePre 组件

### 7.1 创建自定义组件

在 `app/components/content/ProsePre.vue` 创建自定义实现：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  meta?: string
  class?: string
}>()

const copied = ref(false)

const copyCode = async () => {
  if (props.code) {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}
</script>

<template>
  <div class="custom-code-block relative group">
    <!-- 自定义头部 -->
    <div v-if="filename" class="flex items-center justify-between px-4 py-2 bg-secondary/50 border border-b-0 rounded-t-md">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-file-code" class="size-4" />
        <span class="text-sm font-medium">{{ filename }}</span>
      </div>

      <UButton
        variant="ghost"
        size="xs"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        @click="copyCode"
      />
    </div>

    <!-- 代码渲染 -->
    <pre :class="$props.class"><slot /></pre>

    <!-- 悬浮复制按钮（无文件名时） -->
    <UButton
      v-if="!filename"
      variant="ghost"
      size="xs"
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      @click="copyCode"
    />
  </div>
</template>

<style scoped>
pre code .line {
  display: block;
}
</style>
```

### 7.2 使用场景

**何时自定义 ProsePre**：
1. 需要完全不同的视觉设计
2. 添加特殊交互功能（如运行代码、编辑代码）
3. 集成第三方代码编辑器（如 CodeMirror、Monaco Editor）
4. 实现代码折叠、行号显示等高级功能

**何时使用默认 ProsePre**：
1. 标准文档展示
2. 简单的代码示例
3. 不需要特殊交互
4. 快速原型开发

---

## 8. 最佳实践

### 8.1 使用场景对照表

| 场景 | 推荐方案 | Markdown 语法 |
|------|---------|--------------|
| 基础代码块 | 直接使用 Markdown | ` ```js ... ``` ` |
| 显示文件名 | 使用 `[filename]` 语法 | ` ```ts [file.ts] ... ``` ` |
| 强调特定行 | 使用 `{2,4}` 语法 | ` ```js {2,4-6} ... ``` ` |
| 展示代码变更 | 使用 Diff 模式 | ` ```diff ... ``` ` |
| 复杂交互展示 | 自定义 ProseCodeCard | `<ProseCodeCard />` |
| 终端命令 | 使用 bash/shell | ` ```bash ... ``` ` |

### 8.2 性能优化建议

1. **只加载必要的语言**
   ```typescript
   // 只包含项目中实际使用的语言
   langs: ['ts', 'vue', 'bash', 'json']
   ```

2. **主题预加载**
   ```typescript
   // 配置明确的主题，避免 runtime 开销
   theme: {
     default: 'catppuccin-latte',
     dark: 'dracula'
   }
   ```

3. **代码块大小控制**
   - 避免超大代码块（>500 行）
   - 考虑使用折叠或分段展示
   - 使用代码片段替代完整文件

4. **图标优化**
   ```typescript
   // 只配置实际使用的文件类型图标
   codeIcon: {
     ts: 'i-vscode-icons-file-type-typescript',
     vue: 'i-vscode-icons-file-type-vue',
     // 移除不需要的图标配置
   }
   ```

### 8.3 可访问性（A11y）

1. **键盘导航**
   - 复制按钮支持键盘操作
   - 确保 focus 状态清晰可见

2. **屏幕阅读器**
   - 添加 `aria-label` 到复制按钮
   - 提供代码语言信息

3. **颜色对比度**
   - 选择高对比度主题
   - 确保高亮行可读性

示例代码：
```vue
<UButton
  :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
  :aria-label="copied ? '已复制' : '复制代码'"
  @click="copyCode"
/>
```

### 8.4 内容编写规范

1. **文件名使用**
   ```markdown
   ✅ 推荐：明确的文件名
   ```ts [nuxt.config.ts]

   ❌ 不推荐：无文件名或不清晰
   ```ts [config]
   ```

2. **行高亮使用**
   ```markdown
   ✅ 推荐：高亮关键代码
   ```ts {2-3}
   export default {
     // 重点关注这里
     modules: ['@nuxt/ui']
   }
   ```

   ❌ 不推荐：高亮所有行
   ```ts {1-10}
   ```

3. **代码长度**
   ```markdown
   ✅ 推荐：15-30 行代码片段
   ❌ 不推荐：超过 100 行的完整文件
   ```

---

## 9. 故障排查

### 9.1 常见问题

#### 问题 1：代码高亮不显示

**原因**：
- 语言未在 `langs` 配置中
- 主题配置错误
- Shiki 未正确加载

**解决方案**：
```typescript
// nuxt.config.ts
content: {
  build: {
    markdown: {
      highlight: {
        langs: ['ts', 'js', 'vue'],  // 确保包含所需语言
        theme: 'material-theme-lighter'  // 使用有效主题
      }
    }
  }
}
```

#### 问题 2：复制按钮不工作

**原因**：
- 缺少 `code` prop
- 浏览器不支持 Clipboard API
- 按钮被 CSS 隐藏

**解决方案**：
```vue
<!-- 确保传递 code prop -->
<ProsePre :code="actualCode" :language="lang">
  {{ actualCode }}
</ProsePre>
```

#### 问题 3：文件图标不显示

**原因**：
- 图标未配置
- 图标库未安装
- 文件类型映射缺失

**解决方案**：
```typescript
// app.config.ts
ui: {
  prose: {
    codeIcon: {
      ts: 'i-vscode-icons-file-type-typescript',
      // 确保图标已安装
    }
  }
}
```

```bash
# 安装所需图标集合
pnpm add -D @iconify-json/vscode-icons
```

#### 问题 4：样式不正确

**原因**：
- CSS 导入顺序错误
- Tailwind 未扫描 content 目录
- 主题冲突

**解决方案**：
```css
/* app/assets/css/main.css */
/* 正确的导入顺序 */
@import "tailwindcss";
@import "@nuxt/ui";

@source "../../../content/**/*";
```

### 9.2 调试技巧

1. **查看生成的 HTML**
   ```vue
   <template>
     <ProsePre v-bind="$props">
       <pre>{{ JSON.stringify($props, null, 2) }}</pre>
     </ProsePre>
   </template>
   ```

2. **检查 Shiki 配置**
   ```bash
   # 开发模式下查看控制台
   pnpm dev
   # 查找 "[nuxt:content]" 相关日志
   ```

3. **测试主题**
   ```typescript
   // 临时切换主题测试
   theme: 'github-light'  // 使用简单主题排查问题
   ```

---

## 10. 参考资源

### 10.1 官方文档

| 资源 | 链接 |
|------|------|
| Nuxt UI - Code 组件文档 | https://ui.nuxt.com/docs/typography/code |
| Nuxt Content - Prose 组件 | https://content.nuxt.com/docs/components/prose |
| Nuxt UI - Content 集成指南 | https://ui.nuxt.com/docs/getting-started/integrations/content |
| Nuxt Content 完整配置 | https://content.nuxt.com/docs/getting-started/configuration |
| MDC 组件系统 | https://content.nuxt.com/docs/components/prose |

### 10.2 语法高亮引擎

| 资源 | 链接 |
|------|------|
| Shiki 官方网站 | https://shiki.style/ |
| Shiki 主题列表 | https://shiki.style/themes |
| Shiki GitHub | https://github.com/shikijs/shiki |
| TextMate 语法 | https://macromates.com/manual/en/language_grammars |

### 10.3 社区资源

| 资源 | 链接 |
|------|------|
| 如何使用 Nuxt MDC 和 ProsePre 构建自定义代码块 | https://www.docs4.dev/posts/how-to-build-a-custom-code-block-with-nuxt-mdc-and-prose-pre |
| 为 Nuxt Content 创建专业代码块 | https://www.vittoriogioda.it/blog/how-to-create-a-beautiful-code-block-with-nuxt-content |
| Nuxt UI GitHub Issues | https://github.com/nuxt/ui/issues |
| Nuxt Content GitHub | https://github.com/nuxt/content |

### 10.4 相关 GitHub Issues

| Issue | 描述 |
|-------|------|
| #3545 | ProsePre Copy Button 功能讨论 |
| #2891 | 代码块主题自定义 |
| #3123 | 文件图标配置问题 |

---

## 11. 总结

### 11.1 核心要点

1. **ProsePre 是自动化的**
   - 在 Markdown 中写代码块（` ``` ... ``` `）
   - Nuxt Content 自动通过 ProsePre 渲染
   - 无需手动调用组件

2. **语法高亮由 Shiki 提供**
   - 支持 20+ 种编程语言
   - 多种主题可选（浅色/深色模式）
   - 高质量的 TextMate 语法引擎

3. **内置丰富功能**
   - 复制到剪贴板
   - 文件名显示
   - 行高亮
   - Diff 模式
   - 文件类型图标

4. **高度可定制**
   - `nuxt.config.ts` 配置语言和主题
   - `app.config.ts` 配置样式和图标
   - 可在 `app/components/content/` 覆盖默认组件

5. **项目已优化配置**
   - 使用 `catppuccin-latte` 和 `dracula` 主题
   - 支持 20+ 种编程语言
   - 配置了 50+ 种文件类型的图标
   - 自定义 ProseCodeCard 提供增强功能

6. **可扩展性强**
   - 可完全自定义 ProsePre 组件
   - 可集成第三方编辑器
   - 可添加高级交互功能

### 11.2 技术架构

```
┌─────────────────────────────────────────────────┐
│              Markdown 文件 (.md)                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           @nuxt/content (CMS)                   │
│  - 文件系统路由                                  │
│  - Frontmatter 解析                             │
│  - 查询 API                                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      @nuxtjs/mdc (MDC Parser)                   │
│  - Remark/Rehype 插件                           │
│  - AST 转换                                     │
│  - 组件映射                                     │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐  ┌────────▼─────────┐
│  ProsePre      │  │  其他 Prose      │
│  (代码块)       │  │  组件            │
└───────┬────────┘  └──────────────────┘
        │
┌───────▼────────┐
│  Shiki         │
│  (语法高亮)     │
└───────┬────────┘
        │
┌───────▼────────┐
│  HTML 输出     │
│  + CSS 样式    │
└────────────────┘
```

### 11.3 推荐工作流

1. **规划**：确定需要支持的编程语言
2. **配置**：在 `nuxt.config.ts` 中配置语言和主题
3. **样式**：在 `app.config.ts` 中自定义样式和图标
4. **编写**：在 Markdown 中使用标准语法
5. **测试**：验证高亮、复制、文件名等功能
6. **优化**：根据需要自定义 ProsePre 组件

---

**文档版本**：1.0.0
**更新日期**：2025-12-30
**适用版本**：
- @nuxt/ui: ^4.1.0
- @nuxt/content: ^3.8.0
- @nuxtjs/mdc: 最新版本
