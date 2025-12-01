# Nuxt UI ContentToc Component 底层实现调查报告

## 目录
1. [概述](#概述)
2. [组件文档](#组件文档)
3. [完整源码](#完整源码)
   - [ContentToc 组件](#contenttoc-组件)
   - [useScrollspy Composable](#usescrollspy-composable)
   - [TOC 解析器](#toc-解析器)
   - [useContentSearch Composable](#usecontentsearch-composable)
4. [技术架构](#技术架构)
5. [工作原理](#工作原理)

---

## 概述

**ContentToc** 是 Nuxt UI 提供的一个粘性目录组件，具有自动高亮当前激活锚点链接的功能。该组件只有在安装了 `@nuxt/content` 模块时才可用。

**关键特性：**
- 粘性定位 (Sticky positioning)
- 自动滚动监听 (Scroll spy)
- 激活状态高亮
- 响应式设计（移动端可折叠，桌面端始终显示）
- 支持嵌套标题层级
- 高度可定制化（slots、props、UI 配置）

**源码位置：**
- 组件：`nuxt/ui/src/runtime/components/content/ContentToc.vue`
- Composable：`nuxt/ui/src/runtime/composables/useScrollspy.ts`
- TOC 解析器：`nuxt-modules/mdc/src/runtime/parser/toc.ts`

---

## 组件文档

### Props

| 属性 | 默认值 | 类型 | 说明 |
|------|--------|------|------|
| `as` | `'nav'` | any | 渲染的元素或组件 |
| `links` | 必需 | `ContentTocLink[]` | 目录数据结构 |
| `title` | `t('contentToc.title')` | string | 可自定义的标题文本 |
| `color` | `'primary'` | Color enum | 链接颜色选项 |
| `highlight` | `false` | boolean | 是否为激活项显示边框 |
| `highlightColor` | `'primary'` | Color enum | 激活指示器颜色 |
| `trailingIcon` | `appConfig.ui.icons.chevronDown` | icon | 折叠切换图标 |
| `defaultOpen` / `open` | - | boolean | 可折叠状态控制 |

### Slots

- **leading/trailing**: 头部自定义，带 `{ open: boolean; ui: object }` 参数
- **content**: 访问 links 数据
- **link**: 单个链接自定义
- **top/bottom**: 额外内容区域

### 颜色选项

支持：`primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`

### Emits

- `update:open` — 可折叠状态变化
- `move` — 锚点导航事件

---

## 完整源码

### ContentToc 组件

**文件路径：** `src/runtime/components/content/ContentToc.vue`

```vue
<script lang="ts">
import type { CollapsibleRootProps, CollapsibleRootEmits } from 'reka-ui'
import type { TocLink } from '@nuxt/content'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/content/content-toc'
import type { IconProps } from '../../types'
import type { ComponentConfig } from '../../types/tv'

type ContentToc = ComponentConfig<typeof theme, AppConfig, 'contentToc'>

export type ContentTocLink = TocLink & {
  class?: any
  ui?: Pick<ContentToc['slots'], 'item' | 'itemWithChildren' | 'link' | 'linkText'>
}

export interface ContentTocProps<T extends ContentTocLink = ContentTocLink> extends Pick<CollapsibleRootProps, 'defaultOpen' | 'open'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'nav'
   */
  as?: any
  /**
   * The icon displayed to collapse the content.
   * @defaultValue appConfig.ui.icons.chevronDown
   * @IconifyIcon
   */
  trailingIcon?: IconProps['name']
  /**
   * The title of the table of contents.
   * @defaultValue t('contentToc.title')
   */
  title?: string
  /**
   * @defaultValue 'primary'
   */
  color?: ContentToc['variants']['color']
  /**
   * Display a line next to the active link.
   * @defaultValue false
   */
  highlight?: boolean
  /**
   * @defaultValue 'primary'
   */
  highlightColor?: ContentToc['variants']['highlightColor']
  links?: T[]
  class?: any
  ui?: ContentToc['slots']
}

export type ContentTocEmits = CollapsibleRootEmits & {
  move: [id: string]
}

type SlotProps<T> = (props: { link: T }) => any

export interface ContentTocSlots<T extends ContentTocLink = ContentTocLink> {
  leading(props: { open: boolean, ui: ContentToc['ui'] }): any
  default(props: { open: boolean }): any
  trailing(props: { open: boolean, ui: ContentToc['ui'] }): any
  content(props: { links: T[] }): any
  link: SlotProps<T>
  top(props: { links?: T[] }): any
  bottom(props: { links?: T[] }): any
}
</script>

<script setup lang="ts" generic="T extends ContentTocLink">
import { computed } from 'vue'
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent, useForwardPropsEmits } from 'reka-ui'
import { reactivePick, createReusableTemplate } from '@vueuse/core'
import { useRouter, useAppConfig, useNuxtApp } from '#imports'
import { useScrollspy } from '../../composables/useScrollspy'
import { useLocale } from '../../composables/useLocale'
import { tv } from '../../utils/tv'
import UIcon from '../Icon.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ContentTocProps<T>>(), {
  as: 'nav'
})
const emits = defineEmits<ContentTocEmits>()
const slots = defineSlots<ContentTocSlots<T>>()

const rootProps = useForwardPropsEmits(reactivePick(props, 'as', 'open', 'defaultOpen'), emits)

const { t } = useLocale()
const router = useRouter()
const appConfig = useAppConfig() as ContentToc['AppConfig']
const { activeHeadings, updateHeadings } = useScrollspy()

const [DefineListTemplate, ReuseListTemplate] = createReusableTemplate<{ links: T[], level: number }>({
  props: {
    links: Array,
    level: Number
  }
})
const [DefineTriggerTemplate, ReuseTriggerTemplate] = createReusableTemplate<{ open: boolean }>()

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.contentToc || {}) })({
  color: props.color,
  highlight: props.highlight,
  highlightColor: props.highlightColor || props.color
}))

function scrollToHeading(id: string) {
  const encodedId = encodeURIComponent(id)
  router.push(`#${encodedId}`)
  emits('move', id)
}

function flattenLinks(links: T[]): T[] {
  return links.flatMap(link => [link, ...(link.children ? flattenLinks(link.children as T[]) : [])])
}

const indicatorStyle = computed(() => {
  if (!activeHeadings.value?.length) {
    return
  }

  const flatLinks = flattenLinks(props.links || [])
  const activeIndex = flatLinks.findIndex(link => activeHeadings.value.includes(link.id))
  const linkHeight = 28
  const gapSize = 0

  return {
    '--indicator-size': `${(linkHeight * activeHeadings.value.length) + (gapSize * (activeHeadings.value.length - 1))}px`,
    '--indicator-position': activeIndex >= 0 ? `${activeIndex * (linkHeight + gapSize)}px` : '0px'
  }
})

const nuxtApp = useNuxtApp()

nuxtApp.hooks.hook('page:loading:end', () => {
  const headings = Array.from(document.querySelectorAll('h2, h3'))
  updateHeadings(headings)
})
nuxtApp.hooks.hook('page:transition:finish', () => {
  const headings = Array.from(document.querySelectorAll('h2, h3'))
  updateHeadings(headings)
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-template-shadow -->
  <DefineListTemplate v-slot="{ links, level }">
    <ul :class="level > 0 ? ui.listWithChildren({ class: props.ui?.listWithChildren }) : ui.list({ class: props.ui?.list })">
      <li v-for="(link, index) in links" :key="index" :class="link.children && link.children.length > 0 ? ui.itemWithChildren({ class: [props.ui?.itemWithChildren, link.ui?.itemWithChildren] }) : ui.item({ class: [props.ui?.item, link.ui?.item] })">
        <a :href="`#${link.id}`" data-slot="link" :class="ui.link({ class: [props.ui?.link, link.ui?.link, link.class], active: activeHeadings.includes(link.id) })" @click.prevent="scrollToHeading(link.id)">
          <slot name="link" :link="link">
            <span data-slot="linkText" :class="ui.linkText({ class: [props.ui?.linkText, link.ui?.linkText] })">
              {{ link.text }}
            </span>
          </slot>
        </a>

        <ReuseListTemplate v-if="link.children?.length" :links="(link.children as T[])" :level="level + 1" />
      </li>
    </ul>
  </DefineListTemplate>

  <DefineTriggerTemplate v-slot="{ open }">
    <slot name="leading" :open="open" :ui="ui" />

    <span data-slot="title" :class="ui.title({ class: props.ui?.title })">
      <slot :open="open">{{ title || t('contentToc.title') }}</slot>
    </span>

    <span data-slot="trailing" :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing" :open="open" :ui="ui">
        <UIcon :name="trailingIcon || appConfig.ui.icons.chevronDown" data-slot="trailingIcon" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
      </slot>
    </span>
  </DefineTriggerTemplate>

  <CollapsibleRoot v-slot="{ open }" v-bind="{ ...rootProps, ...$attrs }" :default-open="defaultOpen" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div data-slot="container" :class="ui.container({ class: props.ui?.container })">
      <div v-if="!!slots.top" data-slot="top" :class="ui.top({ class: props.ui?.top })">
        <slot name="top" :links="links" />
      </div>

      <template v-if="links?.length">
        <CollapsibleTrigger data-slot="trigger" :class="ui.trigger({ class: 'lg:hidden' })">
          <ReuseTriggerTemplate :open="open" />
        </CollapsibleTrigger>

        <CollapsibleContent data-slot="content" :class="ui.content({ class: [props.ui?.content, 'lg:hidden'] })">
          <div v-if="highlight" data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" :style="indicatorStyle" />

          <slot name="content" :links="links">
            <ReuseListTemplate :links="links" :level="0" />
          </slot>
        </CollapsibleContent>

        <p data-slot="trigger" :class="ui.trigger({ class: 'hidden lg:flex' })">
          <ReuseTriggerTemplate :open="open" />
        </p>

        <div data-slot="content" :class="ui.content({ class: [props.ui?.content, 'hidden lg:flex'] })">
          <div v-if="highlight" data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" :style="indicatorStyle" />

          <slot name="content" :links="links">
            <ReuseListTemplate :links="links" :level="0" />
          </slot>
        </div>
      </template>

      <div v-if="!!slots.bottom" data-slot="bottom" :class="ui.bottom({ class: props.ui?.bottom, body: !!slots.top || !!links?.length })">
        <slot name="bottom" :links="links" />
      </div>
    </div>
  </CollapsibleRoot>
</template>
```

---

### useScrollspy Composable

**文件路径：** `src/runtime/composables/useScrollspy.ts`

```typescript
import { ref, watch, onBeforeMount, onBeforeUnmount } from 'vue'

export function useScrollspy() {
  const observer = ref<IntersectionObserver>()
  const visibleHeadings = ref<string[]>([])
  const activeHeadings = ref<string[]>([])

  function observerCallback(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      const id = entry.target.id
      if (!id) {
        return
      }

      if (entry.isIntersecting) {
        visibleHeadings.value = [...visibleHeadings.value, id]
      } else {
        visibleHeadings.value = visibleHeadings.value.filter(h => h !== id)
      }
    })
  }

  function updateHeadings(headings: Element[]) {
    headings.forEach((heading) => {
      if (!observer.value) {
        return
      }

      observer.value.observe(heading)
    })
  }

  watch(visibleHeadings, (val, oldVal) => {
    if (val.length === 0) {
      activeHeadings.value = oldVal
    } else {
      activeHeadings.value = val
    }
  })

  onBeforeMount(() => (observer.value = new IntersectionObserver(observerCallback)))

  onBeforeUnmount(() => observer.value?.disconnect())

  return {
    visibleHeadings,
    activeHeadings,
    updateHeadings
  }
}
```

**核心功能：**
- 使用 `IntersectionObserver` API 监听标题元素的可见性
- 维护两个响应式数组：`visibleHeadings`（当前可见的标题）和 `activeHeadings`（激活的标题）
- 当没有可见标题时，保留上一次的激活状态
- 提供 `updateHeadings` 方法来动态更新需要观察的标题元素

---

### TOC 解析器

**文件路径：** `nuxt-modules/mdc/src/runtime/parser/toc.ts`

```typescript
import type { MDCNode, Toc, TocLink, MDCElement, MDCRoot } from '@nuxtjs/mdc'
import { flattenNode, flattenNodeText } from '../utils/ast'

const TOC_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6']

const TOC_TAGS_DEPTH = TOC_TAGS.reduce((tags: any, tag: string) => {
  tags[tag] = Number(tag.charAt(tag.length - 1))
  return tags
}, {})

const getHeaderDepth = (node: MDCElement): number => TOC_TAGS_DEPTH[node.tag as string]

const getTocTags = (depth: number): string[] => {
  if (depth < 1 || depth > 5) {
    console.log(`\`toc.depth\` is set to ${depth}. It should be a number between 1 and 5. `)
    depth = 1
  }

  return TOC_TAGS.slice(0, depth)
}

function nestHeaders(headers: TocLink[]): TocLink[] {
  if (headers.length <= 1) {
    return headers
  }
  const toc: TocLink[] = []
  let parent: TocLink
  headers.forEach((header) => {
    if (!parent || header.depth <= parent.depth) {
      header.children = []
      parent = header
      toc.push(header)
    }
    else {
      parent.children!.push(header)
    }
  })
  toc.forEach((header) => {
    if (header.children?.length) {
      header.children = nestHeaders(header.children)
    }
    else {
      delete header.children
    }
  })
  return toc
}

export function generateFlatToc(body: MDCNode, options: Toc): Toc {
  const { searchDepth, depth, title = '' } = options
  const tags = getTocTags(depth)

  const headers = flattenNode(body, searchDepth).filter((node: MDCNode) => tags.includes((node as MDCElement).tag || ''))

  const links: TocLink[] = headers.map(node => ({
    id: (node as MDCElement).props?.id,
    depth: getHeaderDepth(node as MDCElement),
    text: flattenNodeText(node),
  }))
  return {
    title,
    searchDepth,
    depth,
    links,
  }
}

export function generateToc(body: MDCElement | MDCRoot, options: Toc): Toc {
  const toc = generateFlatToc(body as MDCElement, options)
  toc.links = nestHeaders(toc.links)
  return toc
}
```

**核心功能：**
- **`generateFlatToc`**: 生成扁平的标题列表，从 Markdown AST 中提取指定深度的标题
- **`generateToc`**: 生成嵌套的标题结构，自动处理标题层级关系
- **`nestHeaders`**: 递归算法将扁平标题列表转换为嵌套结构
- **`getTocTags`**: 根据深度配置返回需要提取的标题标签（h2-h6）

---

### useContentSearch Composable

**文件路径：** `src/runtime/composables/useContentSearch.ts`

这个 composable 管理内容搜索功能，虽然不直接用于 ContentToc，但在文档站点中经常与目录功能配合使用。

**主要功能：**
- **`mapFile()`**: 将搜索文件对象转换为可显示的搜索项，处理图标选择和内容清理
- **`mapNavigationItems()`**: 递归处理导航层级结构，将其扁平化为可搜索项
- **`postFilter()`**: 过滤结果，无搜索查询时仅显示顶级项，有查询时返回所有结果
- 使用 `createSharedComposable()` 包装，确保整个应用中状态管理的一致性

---

## 技术架构

### 依赖关系

```
ContentToc.vue
├── Reka UI (CollapsibleRoot, CollapsibleTrigger, CollapsibleContent)
├── @nuxt/content (TocLink type)
├── VueUse (reactivePick, createReusableTemplate)
├── useScrollspy composable (自定义)
├── useLocale composable (自定义)
└── UIcon component (Nuxt UI)

useScrollspy.ts
└── IntersectionObserver API

TOC Parser (MDC)
├── @nuxtjs/mdc types
└── AST utilities (flattenNode, flattenNodeText)
```

### 数据流

```
Markdown 内容
    ↓
MDC Parser (解析 Markdown AST)
    ↓
TOC Parser (generateToc) → 生成嵌套的 TocLink[]
    ↓
ContentToc 组件 (接收 links prop)
    ↓
useScrollspy (监听标题可见性)
    ↓
activeHeadings (响应式更新)
    ↓
UI 高亮更新
```

---

## 工作原理

### 1. TOC 数据生成

在 Nuxt Content 中，当你查询页面数据时，可以访问 `page.body.toc.links` 来获取目录数据：

```typescript
const { data: page } = await useAsyncData('page', () => queryContent('/path').findOne())
// page.body.toc.links 包含了解析后的目录结构
```

### 2. 组件初始化

```vue
<template>
  <UContentToc :links="page?.body?.toc?.links" />
</template>
```

组件接收 `links` prop 后：
1. 初始化 `useScrollspy()` composable
2. 设置 IntersectionObserver 监听页面中的 h2, h3 标题
3. 注册 Nuxt 页面钩子（`page:loading:end`, `page:transition:finish`）

### 3. 滚动监听

当用户滚动页面时：

```typescript
// IntersectionObserver 回调
function observerCallback(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 标题进入视口
      visibleHeadings.value.push(entry.target.id)
    } else {
      // 标题离开视口
      visibleHeadings.value = visibleHeadings.value.filter(h => h !== entry.target.id)
    }
  })
}

// Watch 更新激活状态
watch(visibleHeadings, (val, oldVal) => {
  if (val.length === 0) {
    activeHeadings.value = oldVal  // 保留上一次状态
  } else {
    activeHeadings.value = val     // 更新为当前可见
  }
})
```

### 4. 高亮指示器

组件通过计算属性 `indicatorStyle` 动态计算指示器的位置和大小：

```typescript
const indicatorStyle = computed(() => {
  const flatLinks = flattenLinks(props.links || [])
  const activeIndex = flatLinks.findIndex(link => activeHeadings.value.includes(link.id))
  const linkHeight = 28

  return {
    '--indicator-size': `${linkHeight * activeHeadings.value.length}px`,
    '--indicator-position': `${activeIndex * linkHeight}px`
  }
})
```

### 5. 点击导航

点击目录链接时：

```typescript
function scrollToHeading(id: string) {
  const encodedId = encodeURIComponent(id)
  router.push(`#${encodedId}`)      // 更新 URL hash
  emits('move', id)                 // 触发 move 事件
}
```

### 6. 响应式设计

组件在模板中使用两套相同的结构：
- 移动端（`lg:hidden`）：使用 `CollapsibleTrigger` 和 `CollapsibleContent`，可折叠
- 桌面端（`hidden lg:flex`）：始终显示，不使用折叠功能

### 7. 可重用模板

使用 VueUse 的 `createReusableTemplate` 来避免代码重复：

```vue
<DefineListTemplate v-slot="{ links, level }">
  <!-- 递归渲染列表的模板定义 -->
</DefineListTemplate>

<!-- 在多处重用 -->
<ReuseListTemplate :links="links" :level="0" />
```

---

## 关键技术要点

### 1. IntersectionObserver API
- 高性能的元素可见性检测
- 避免了传统的 scroll 事件监听
- 自动处理视口交叉判断

### 2. Reka UI CollapsibleRoot
- 提供无障碍的可折叠功能
- 自动管理 ARIA 属性
- 支持键盘导航

### 3. VueUse 工具函数
- `createReusableTemplate`: 模板复用，减少代码重复
- `reactivePick`: 响应式地选择对象属性
- `createSharedComposable`: 创建共享的 composable 实例

### 4. Tailwind Variants (tv)
- 动态样式系统
- 支持主题扩展
- 类型安全的样式配置

### 5. 递归组件模式
- 自引用模板实现嵌套列表渲染
- 支持无限层级的标题结构

---

## 使用示例

### 基础用法

```vue
<script setup>
const { data: page } = await useAsyncData('page', () =>
  queryContent('/path').findOne()
)
</script>

<template>
  <UContentToc :links="page?.body?.toc?.links" />
</template>
```

### 高级配置

```vue
<template>
  <UContentToc
    :links="page?.body?.toc?.links"
    title="目录"
    color="primary"
    :highlight="true"
    highlight-color="success"
  >
    <template #leading="{ open }">
      <UIcon :name="open ? 'i-heroicons-book-open' : 'i-heroicons-book-open-solid'" />
    </template>

    <template #link="{ link }">
      <span class="custom-link">{{ link.text }}</span>
    </template>
  </UContentToc>
</template>
```

### 监听事件

```vue
<template>
  <UContentToc
    :links="page?.body?.toc?.links"
    @move="handleMove"
    @update:open="handleToggle"
  />
</template>

<script setup>
function handleMove(id) {
  console.log('Navigated to:', id)
}

function handleToggle(isOpen) {
  console.log('TOC toggled:', isOpen)
}
</script>
```

---

## 总结

Nuxt UI 的 ContentToc 组件是一个设计精良、功能完备的目录导航解决方案：

**优势：**
1. ✅ **高性能**: 使用 IntersectionObserver API，避免频繁的滚动事件
2. ✅ **类型安全**: 完整的 TypeScript 类型定义
3. ✅ **高度可定制**: 丰富的 props、slots 和 UI 配置选项
4. ✅ **响应式设计**: 移动端和桌面端的差异化体验
5. ✅ **无障碍访问**: 基于 Reka UI，遵循 ARIA 规范
6. ✅ **模块化**: 清晰的职责分离（组件、composable、解析器）

**核心实现：**
- **TOC 数据生成**: MDC 解析器从 Markdown AST 提取标题结构
- **滚动监听**: useScrollspy composable 使用 IntersectionObserver 跟踪可见性
- **UI 渲染**: Vue 3 组件结合 Reka UI 提供交互功能
- **样式系统**: Tailwind Variants 提供灵活的主题配置

这个组件非常适合用于文档站点、博客系统等需要目录导航的场景。

---

**参考链接：**
- [ContentToc 官方文档](https://ui.nuxt.com/docs/components/content-toc)
- [Nuxt UI GitHub 仓库](https://github.com/nuxt/ui)
- [Nuxt Content 文档](https://content.nuxt.com/)
- [MDC 解析器仓库](https://github.com/nuxt-modules/mdc)
