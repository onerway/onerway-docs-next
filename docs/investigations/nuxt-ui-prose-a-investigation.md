# ProseA 组件文档

## 概述

`ProseA` 是用于渲染 Markdown 文档中链接（`[text](url)`）的组件。在 Nuxt 生态系统中，它存在于两个主要位置：

1. **@nuxtjs/mdc** - Nuxt Content 的底层 MDC（Markdown Components）模块，提供基础实现
2. **@nuxt/ui** - Nuxt UI 库，提供增强版本，支持主题定制和样式配置

---

## 1. Nuxt MDC 基础版本

### 源码位置

  `@nuxtjs/mdc/src/runtime/components/prose/ProseA.vue`

  - GitHub: https://github.com/nuxt-content/mdc/blob/main/src/runtime/components/prose/ProseA.vue

### 完整源码

```vue
<template>
  <NuxtLink
    :href="props.href"
    :target="props.target"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String as PropType<'_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined>,
    default: undefined,
    required: false,
  },
})
</script>
```

### Props 定义

  | Prop | 类型 | 默认值 | 描述 |
  |------|------|--------|------|
  | `href` | `String` | `''` | 链接的目标 URL |
  | `target` | `'_blank' \| '_parent' \| '_self' \| '_top' \| string \| null` | `undefined` | 链接打开方式 |

### 设计特点

  - **简洁**：直接封装 `NuxtLink` 组件
  - **无样式**：不包含任何默认样式，样式由外部 CSS 或主题提供
  - **Vue 3 Composition API**：使用 `<script setup>` 语法

---

## 2. Nuxt UI 增强版本

### 源码位置

`@nuxt/ui/src/runtime/components/prose/A.vue`

- GitHub: https://github.com/nuxt/ui/blob/v4/src/runtime/components/prose/A.vue

### 完整源码

```vue
<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/prose/a'
import type { ComponentConfig } from '../../types/tv'

type ProseA = ComponentConfig<typeof theme, AppConfig, 'a', 'ui.prose'>

export interface ProseAProps {
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined
  class?: any
}

export interface ProseASlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../../utils/tv'
import ULink from '../Link.vue'

const appConfig = useAppConfig() as ProseA['AppConfig']

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.prose?.a || {}) }))

const props = defineProps<ProseAProps>()
defineSlots<ProseASlots>()
</script>

<template>
  <ULink :href="href" :target="target" :class="ui({ class: props.class })" raw>
    <slot />
  </ULink>
</template>
```

### TypeScript 接口

```typescript
export interface ProseAProps {
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined
  class?: any
}

export interface ProseASlots {
  default(props?: {}): any
}
```

### 设计特点

- **主题系统集成**：使用 Tailwind Variants (`tv`) 管理样式
- **可配置**：通过 `app.config.ts` 自定义样式
- **类型安全**：完整的 TypeScript 类型定义
- **继承 ULink**：使用 `ULink` 组件，支持 `raw` 模式

---

## 3. 主题配置

### 默认主题文件

  `@nuxt/ui/src/theme/prose/a.ts`

```typescript
import type { NuxtOptions } from '@nuxt/schema'

export default (options: Required<NuxtOptions['ui']>) => ({
  base: [
    'text-primary border-b border-transparent hover:border-primary font-medium focus-visible:outline-primary [&>code]:border-dashed hover:[&>code]:border-primary hover:[&>code]:text-primary',
    options.theme.transitions && 'transition-colors [&>code]:transition-colors'
  ]
})
```

### 样式分析

  | 样式类 | 作用 |
  |--------|------|
  | `text-primary` | 使用主题主色作为文字颜色 |
  | `border-b border-transparent` | 底部边框（透明，用于 hover 效果） |
  | `hover:border-primary` | 悬停时显示主色下划线 |
  | `font-medium` | 中等字体粗细 |
  | `focus-visible:outline-primary` | 键盘焦点时显示主色轮廓 |
  | `[&>code]:border-dashed` | 链接内的 code 元素使用虚线边框 |
  | `hover:[&>code]:border-primary` | 悬停时 code 边框变为主色 |
  | `hover:[&>code]:text-primary` | 悬停时 code 文字变为主色 |
  | `transition-colors` | 颜色变化过渡动画 |

### 自定义配置

  在 `app.config.ts` 中覆盖默认样式：

```typescript
export default defineAppConfig({
  ui: {
    prose: {
      a: {
        base: [
          // 自定义基础样式
          'text-primary underline underline-offset-4 hover:text-primary/80',
          // 保留过渡效果
          'transition-colors'
        ]
      }
    }
  }
})
```

  > **注意**：Nuxt UI v4 已经将原来的 Nuxt UI Pro 功能合并到统一的 `@nuxt/ui` 包中，不再需要单独的 `uiPro` 配置。所有 prose 组件的配置都在 `ui.prose` 下。

---

## 4. 在 Markdown 中使用

### 基本语法

```markdown
[链接文字](/docs/getting-started)
```

### 渲染结果

```html
<a href="/docs/getting-started" class="text-primary border-b border-transparent hover:border-primary font-medium ...">
  链接文字
</a>
```

### 外部链接

```markdown
[Nuxt 官网](https://nuxt.com){target="_blank"}
```

---

## 5. 组件配置映射

  Nuxt Content/MDC 使用组件映射将 Markdown 元素渲染为 Vue 组件：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  mdc: {
    components: {
      prose: true, // 启用所有 Prose 组件
      map: {
        // 可以覆盖默认映射
        a: 'CustomProseA'
      }
    }
  }
})
```

### 默认映射表

  | Markdown 元素 | 组件名 |
  |--------------|--------|
  | `[text](url)` | `ProseA` |
  | `**bold**` | `ProseStrong` |
  | `*italic*` | `ProseEm` |
  | `` `code` `` | `ProseCode` |
  | `# H1` | `ProseH1` |
  | `## H2` | `ProseH2` |
  | ... | ... |

---

## 6. 自定义 ProseA 组件

### 创建自定义组件

在 `app/components/content/ProseA.vue` 创建自定义实现：

```vue
<template>
  <NuxtLink
    :href="href"
    :target="target"
    :class="linkClass"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
  >
    <slot />
    <UIcon
      v-if="isExternal"
      name="i-lucide-external-link"
      class="ml-1 size-3 inline-block"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  href?: string
  target?: string
}>()

const isExternal = computed(() => {
  return props.href?.startsWith('http') || props.target === '_blank'
})

const linkClass = computed(() => [
  'text-primary font-medium',
  'border-b border-transparent hover:border-primary',
  'transition-colors duration-200',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
])
</script>
```

### 使用场景

- 添加外部链接图标
- 自定义 hover 效果
- 添加链接追踪/分析
- 实现特殊的链接样式

---

## 7. 参考链接

  | 资源 | 链接 |
  |------|------|
  | Nuxt UI Typography 文档 | https://ui.nuxt.com/docs/typography |
  | Nuxt UI Content 集成 | https://ui.nuxt.com/docs/getting-started/integrations/content |
  | Nuxt Content 文档 | https://content.nuxt.com/ |
  | MDC GitHub | https://github.com/nuxt-content/mdc |
  | Nuxt UI GitHub | https://github.com/nuxt/ui |
  | Tailwind Variants | https://www.tailwind-variants.org/ |

---

## 总结

`ProseA` 组件是 Nuxt Content 生态系统中渲染链接的核心组件：

1. **基础版本**（MDC）：简洁的 NuxtLink 封装，无默认样式
2. **增强版本**（Nuxt UI）：支持主题系统，可通过配置文件自定义
3. **样式设计**：主色文字 + 透明下划线 + hover 效果 + 过渡动画
4. **可扩展**：支持在项目中创建自定义实现覆盖默认组件

