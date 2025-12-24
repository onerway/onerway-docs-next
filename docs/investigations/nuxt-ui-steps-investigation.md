# Nuxt UI Steps 组件调研报告

> 调研日期：2025-11-28
>
> 目标：分析 Nuxt UI Steps 组件如何支持 Markdown 标题，为 ProseAccordion 组件提供参考

## 1. 组件概述

| 属性         | 值                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **组件名称** | Steps (ProseSteps)                                                                                                                           |
| **位置**     | `src/runtime/components/prose/Steps.vue`                                                                                                     |
| **分类**     | Typography / Prose 组件（专为 Markdown 内容设计）                                                                                            |
| **官方文档** | https://ui.nuxt.com/components/steps                                                                                                         |
| **源码链接** | [GitHub - Steps.vue](https://github.com/nuxt/ui/blob/v4/src/runtime/components/prose/Steps.vue)                                              |
| **主题配置** | [GitHub - steps.ts](https://github.com/nuxt/ui/blob/9002f27d439f81c48e5882a3729eaeb1b66e1b18/src/theme/prose/steps.ts)                       |
| **功能描述** | 将 Markdown 标题转换为带有自动编号的步骤列表，适用于教程和指南                                                                               |

---

## 2. 核心源码分析

### 2.1 组件实现 (`Steps.vue`)

  组件本身非常简洁，约 36 行代码：

```vue
<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { ComponentConfig } from '../../types/tv'
import theme from '#build/ui/prose/steps'

type ProseSteps = ComponentConfig<typeof theme, AppConfig, 'steps', 'ui.prose'>

export interface ProseStepsProps {
  /**
   * The heading level to apply to the steps.
   * @defaultValue '3'
   */
  level?: ProseSteps['variants']['level']
  class?: any
}

export interface ProseStepsSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../../utils/tv'

const props = defineProps<ProseStepsProps>()
defineSlots<ProseStepsSlots>()

const appConfig = useAppConfig() as ProseSteps['AppConfig']

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.prose?.steps || {}) }))
</script>

<template>
  <div :class="ui({ class: props.class, level: props.level })">
    <slot />
  </div>
</template>
```

  **关键点**：

  - 组件仅渲染一个 `<div>` 包裹 slot 内容
  - 通过 `level` prop 控制目标标题级别（2/3/4 对应 h2/h3/h4）
  - 使用 Tailwind Variants (`tv`) 管理样式变体
  - 支持通过 `app.config.ts` 覆盖主题

### 2.2 主题配置 (`src/theme/prose/steps.ts`)

  样式配置是实现的核心：

```typescript
export default {
  base: 'ms-4 border-s border-default ps-8 [counter-reset:step]',
  variants: {
    level: {
      2: '[&>h2]:[counter-increment:step] [&>h2]:relative [&>h2]:before:absolute [&>h2]:before:size-8 [&>h2]:before:bg-elevated [&>h2]:before:rounded-full [&>h2]:before:font-semibold [&>h2]:before:text-sm [&>h2]:before:tabular-nums [&>h2]:before:inline-flex [&>h2]:before:items-center [&>h2]:before:justify-center [&>h2]:before:ring-4 [&>h2]:before:ring-bg [&>h2]:before:-ms-[48.5px] [&>h2]:before:-mt-0 [&>h2]:before:content-[counter(step)] [&>h2>a>span.absolute]:hidden',
      3: '[&>h3]:[counter-increment:step] [&>h3]:relative [&>h3]:before:absolute [&>h3]:before:size-7 [&>h3]:before:inset-x-0.5 [&>h3]:before:bg-elevated [&>h3]:before:rounded-full [&>h3]:before:font-semibold [&>h3]:before:text-sm [&>h3]:before:tabular-nums [&>h3]:before:inline-flex [&>h3]:before:items-center [&>h3]:before:justify-center [&>h3]:before:ring-4 [&>h3]:before:ring-bg [&>h3]:before:-ms-[48.5px] [&>h3]:before:content-[counter(step)] [&>h3>a>span.absolute]:hidden',
      4: '[&>h4]:[counter-increment:step] [&>h4]:relative [&>h4]:before:absolute [&>h4]:before:size-7 [&>h4]:before:inset-x-0.5 [&>h4]:before:bg-elevated [&>h4]:before:rounded-full [&>h4]:before:font-semibold [&>h4]:before:text-sm [&>h4]:before:tabular-nums [&>h4]:before:inline-flex [&>h4]:before:items-center [&>h4]:before:justify-center [&>h4]:before:ring-4 [&>h4]:before:ring-bg [&>h4]:before:-ms-[48.5px] [&>h4]:before:content-[counter(step)] [&>h4>a>span.absolute]:hidden'
    }
  },
  defaultVariants: {
    level: '3'
  }
}
```

---

## 3. 实现原理解析

### 3.1 Markdown 支持机制

Steps 组件的 Markdown 支持**不依赖 JavaScript 解析**，而是利用以下技术栈协作：

```
┌─────────────────────────────────────────────────────────────┐
│  Markdown 内容                                               │
│  #### 第一步                                                 │
│  #### 第二步                                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │ Nuxt Content / MDC 解析
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  HTML 结构                                                   │
│  <div class="steps">                                        │
│    <h4>第一步</h4>                                          │
│    <h4>第二步</h4>                                          │
│  </div>                                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ CSS 选择器 + Counter
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  渲染结果                                                    │
│  ① 第一步                                                   │
│  ② 第二步                                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 CSS Counter 机制详解

这是实现自动编号的核心技术：

| CSS 属性                     | 作用                                    | Tailwind 写法                          |
| ---------------------------- | --------------------------------------- | -------------------------------------- |
| `counter-reset: step`        | 在容器上初始化计数器，值为 0            | `[counter-reset:step]`                 |
| `counter-increment: step`    | 每个标题递增计数器 +1                   | `[&>h3]:[counter-increment:step]`      |
| `content: counter(step)`     | 在伪元素中显示当前计数值                | `[&>h3]:before:content-[counter(step)]` |

**工作流程**：

```css
/* 1. 容器初始化计数器 */
.steps {
  counter-reset: step; /* step = 0 */
}

/* 2. 每个 h3 递增计数器并显示 */
.steps > h3 {
  counter-increment: step; /* step = step + 1 */
}

.steps > h3::before {
  content: counter(step); /* 显示 "1", "2", "3"... */
}
```

### 3.3 样式结构解析

将主题配置拆解为可读的样式规则：

```css
/* 基础样式 - 左侧边框线 */
.steps {
  margin-inline-start: 1rem;      /* ms-4 */
  border-inline-start: 1px solid; /* border-s border-default */
  padding-inline-start: 2rem;     /* ps-8 */
  counter-reset: step;            /* [counter-reset:step] */
}

/* 标题样式 (以 h3 为例) */
.steps > h3 {
  counter-increment: step;        /* 递增计数器 */
  position: relative;             /* 为伪元素定位 */
}

/* 数字圆圈 */
.steps > h3::before {
  content: counter(step);         /* 显示步骤数字 */
  position: absolute;
  width: 1.75rem;                 /* size-7 */
  height: 1.75rem;
  background: var(--ui-elevated); /* bg-elevated */
  border-radius: 9999px;          /* rounded-full */
  font-weight: 600;               /* font-semibold */
  font-size: 0.875rem;            /* text-sm */
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 4px var(--ui-bg); /* ring-4 ring-bg */
  margin-inline-start: -48.5px;   /* 定位到边框线上 */
}
```

### 3.4 视觉效果示意

```
    ┌─────────────────────────────────────────
    │
  ①─┤  Add the Nuxt UI module in your nuxt.config.ts
    │
    │  ```ts
    │  export default defineNuxtConfig({
    │    modules: ['@nuxt/ui']
    │  })
    │  ```
    │
  ②─┤  Import Tailwind CSS in your CSS
    │
    │  ```css
    │  @import "tailwindcss";
    │  ```
    │
  ③─┤  Start your development server
    │
    │  ```bash
    │  npm run dev
    │  ```
    │
```

---

## 4. MDC 使用示例

### 4.1 基本用法

```mdc
::steps{level="4"}

#### 第一步：安装依赖

```bash
  npm install @nuxt/ui
```

#### 第二步：配置模块

```ts [nuxt.config.ts]
  export default defineNuxtConfig({
    modules: ['@nuxt/ui']
  })
```

#### 第三步：开始使用

组件已自动全局注册，可以直接在模板中使用。

::
```

### 4.2 不同标题级别

```mdc
<!-- 使用 h2 (##) -->
::steps{level="2"}
## 步骤一
## 步骤二
::

<!-- 使用 h3 (###) - 默认 -->
::steps
### 步骤一
### 步骤二
::

<!-- 使用 h4 (####) -->
::steps{level="4"}
#### 步骤一
#### 步骤二
::
```

---

## 5. 架构特点总结

| 特点               | 说明                                                       |
| ------------------ | ---------------------------------------------------------- |
| **极简实现**       | 组件仅约 36 行代码，核心就是一个 `<div>` + slot            |
| **纯 CSS 驱动**    | 不使用 JavaScript 计算步骤编号，完全依赖 CSS counter       |
| **声明式配置**     | 通过 `level` prop 选择目标标题级别                         |
| **主题可定制**     | 通过 `app.config.ts` 可覆盖样式                            |
| **MDC 原生集成**   | 与 Nuxt Content 的 Markdown 解析完美配合                   |
| **零运行时开销**   | 编号逻辑在 CSS 中处理，不增加 JavaScript 执行负担          |
| **自动响应内容**   | 添加/删除标题时编号自动更新，无需手动维护                  |

---

## 6. 对 ProseAccordion 的借鉴建议

### 6.1 可借鉴的设计理念

  1. **CSS Counter 方案**
      - 如果 Accordion 需要自动编号，可以使用 CSS counter 而非 JavaScript
      - 示例：`[counter-reset:item]` + `[&>details]:[counter-increment:item]`

  2. **子选择器模式**
      - 使用 `[&>element]` 选择器定位 slot 中渲染的 Markdown 元素
      - 可以用于定位 `<details>` 或自定义的 accordion-item

  3. **level variant**
      - 如果 Accordion 也要支持不同标题级别作为 trigger
      - 可以提供类似的 `level` prop 配置

  4. **主题分离**
      - 将样式配置与组件逻辑分离
      - 支持 `app.config.ts` 覆盖，提高可定制性

### 6.2 差异对比

  | 维度           | Steps                  | ProseAccordion                |
  | -------------- | ---------------------- | ----------------------------- |
  | **复杂度**     | 极简（纯 CSS）         | 中等（需要状态管理）          |
  | **Markdown 支持** | 自动匹配标题        | 需要解析 children 或用 `<details>` |
  | **交互性**     | 无（纯展示）           | 有（展开/折叠）               |
  | **slot 处理**  | 直接透传               | 需要分组处理 trigger + content |
  | **状态管理**   | 无                     | 需要维护展开状态              |

### 6.3 可能的 Markdown Accordion 方案

  **方案 A：利用原生 `<details>` 标签**

```mdc
::accordion

<details>
<summary>第一项标题</summary>

这是第一项的内容...

</details>

<details>
<summary>第二项标题</summary>

这是第二项的内容...

</details>

::
```

  **方案 B：使用标题分割（类似 Steps 的思路）**

```mdc
::accordion{level="4"}

#### 第一项标题

这是第一项的内容...

#### 第二项标题

这是第二项的内容...

::
```

  组件需要：
  1. 解析 slot 内容，按标题分割为多个 item
  2. 将标题作为 trigger，后续内容作为 body
  3. 维护展开/折叠状态

---

## 7. 相关资源

- [Nuxt UI Steps 官方文档](https://ui.nuxt.com/components/steps)
- [CSS Counter 规范 - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_counter_styles/Using_CSS_counters)
- [Tailwind CSS Arbitrary Values](https://tailwindcss.com/docs/adding-custom-styles#arbitrary-values)
- [Nuxt Content MDC 语法](https://content.nuxt.com/usage/markdown)

---

## 8. 结论

  Nuxt UI Steps 组件展示了一种优雅的 MDC 组件设计模式：

  > **让 Markdown 做内容，让 CSS 做样式**

  这种设计的优势：

  1. **简洁性** - 组件代码极少，易于理解和维护
  2. **性能** - 纯 CSS 实现，零运行时开销
  3. **可靠性** - 利用浏览器原生能力，兼容性好
  4. **灵活性** - 通过主题配置支持定制

  对于需要交互的组件（如 Accordion），虽然无法完全采用纯 CSS 方案，但可以借鉴其：
  - 主题配置分离的架构
  - 子选择器定位的技巧
  - 与 MDC 内容的集成方式

  这些理念可以帮助保持组件的简洁性和可维护性。



