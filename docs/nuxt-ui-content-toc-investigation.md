# Nuxt UI ContentToc 组件深度调查报告

> 调查日期：2025-12-01
> 组件版本：Nuxt UI v4
> 官方文档：https://ui.nuxt.com/docs/components/content-toc

## 目录

1. [组件概述](#1-组件概述)
2. [核心功能](#2-核心功能)
3. [源码分析](#3-源码分析)
4. [核心 Composables](#4-核心-composables)
5. [主题配置](#5-主题配置)
6. [API 参考](#6-api-参考)
7. [实现要点](#7-实现要点)

---

## 1. 组件概述

  `ContentToc` 是一个粘性目录（Table of Contents）组件，具有**自动活动锚点链接高亮**功能。

### 主要特性

  - ✅ **自动滚动监听**：使用 `IntersectionObserver` 检测当前可见标题
  - ✅ **活动高亮指示器**：动态显示当前活动标题的位置
  - ✅ **响应式折叠**：移动端使用 Reka UI 的 Collapsible 组件
  - ✅ **嵌套链接支持**：支持多级目录结构
  - ✅ **主题化**：支持颜色和高亮样式自定义
  - ✅ **粘性定位**：自动固定在页面顶部

### 依赖项

  - **Reka UI**：`CollapsibleRoot`, `CollapsibleTrigger`, `CollapsibleContent`
  - **VueUse**：`reactivePick`, `createReusableTemplate`
  - **@nuxt/content**：`TocLink` 类型

---

## 2. 核心功能

### 2.1 滚动监听机制

组件使用 `useScrollspy` composable 实现滚动监听：

```typescript
const { activeHeadings, updateHeadings } = useScrollspy()

// 在页面加载完成后更新标题
nuxtApp.hooks.hook('page:loading:end', () => {
  const headings = Array.from(document.querySelectorAll('h2, h3'))
  updateHeadings(headings)
})
```

### 2.2 活动指示器计算

动态计算指示器的位置和大小：

```typescript
const indicatorStyle = computed(() => {
  if (!activeHeadings.value?.length) return

  const flatLinks = flattenLinks(props.links || [])
  const activeIndex = flatLinks.findIndex(link => activeHeadings.value.includes(link.id))
  const linkHeight = 28
  const gapSize = 0

  return {
    '--indicator-size': `${(linkHeight * activeHeadings.value.length) + ...}px`,
    '--indicator-position': activeIndex >= 0 ? `${activeIndex * (linkHeight + gapSize)}px` : '0px'
  }
})
```

### 2.3 响应式设计

- **移动端**：使用 Collapsible 组件，点击可展开/折叠
- **桌面端**：始终展开显示

---

## 3. 源码分析

### 3.1 ContentToc.vue 完整源码

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

## 4. 核心 Composables

### 4.1 useScrollspy

这是实现滚动监听和活动标题跟踪的核心 composable：

```typescript
// src/runtime/composables/useScrollspy.ts
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

  // Create intersection observer
  onBeforeMount(() => (observer.value = new IntersectionObserver(observerCallback)))

  // Destroy it
  onBeforeUnmount(() => observer.value?.disconnect())

  return {
    visibleHeadings,
    activeHeadings,
    updateHeadings
  }
}
```

#### 工作原理

1. **IntersectionObserver**：在 `onBeforeMount` 创建，监听标题元素的可见性
2. **visibleHeadings**：存储当前可见的标题 ID 列表
3. **activeHeadings**：用于渲染的活动标题列表（即使没有可见标题也保持上一个状态）
4. **updateHeadings**：用于注册需要观察的标题元素

### 4.2 useLocale

提供国际化支持：

```typescript
// src/runtime/composables/useLocale.ts
import { computed, inject, toRef } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import type { Locale, Messages } from '../types/locale'
import { buildLocaleContext } from '../utils/locale'
import en from '../locale/en'

export const localeContextInjectionKey: InjectionKey<Ref<Locale<unknown> | undefined>> = Symbol.for('nuxt-ui.locale-context')

const _useLocale = (localeOverrides?: Ref<Locale<Messages> | undefined>) => {
  const locale = localeOverrides || toRef(inject<Locale<Messages>>(localeContextInjectionKey, en))

  return buildLocaleContext<Messages>(computed(() => locale.value || en))
}

export const useLocale = /* @__PURE__ */ import.meta.client ? createSharedComposable(_useLocale) : _useLocale
```

---

## 5. 主题配置

### 5.1 完整主题定义

```typescript
// src/theme/content/content-toc.ts
import type { NuxtOptions } from '@nuxt/schema'

export default (options: Required<NuxtOptions['ui']>) => ({
  slots: {
    root: 'sticky top-(--ui-header-height) z-10 bg-default/75 lg:bg-[initial] backdrop-blur -mx-4 px-4 sm:px-6 sm:-mx-6 overflow-y-auto max-h-[calc(100vh-var(--ui-header-height))]',
    container: 'pt-4 sm:pt-6 pb-2.5 sm:pb-4.5 lg:py-8 border-b border-dashed border-default lg:border-0 flex flex-col',
    top: '',
    bottom: 'hidden lg:flex lg:flex-col gap-6',
    trigger: 'group text-sm font-semibold flex-1 flex items-center gap-1.5 py-1.5 -mt-1.5 focus-visible:outline-primary',
    title: 'truncate',
    trailing: 'ms-auto inline-flex gap-1.5 items-center',
    trailingIcon: 'size-5 transform transition-transform duration-200 shrink-0 group-data-[state=open]:rotate-180 lg:hidden',
    content: 'data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden focus:outline-none',
    list: 'min-w-0',
    listWithChildren: 'ms-3',
    item: 'min-w-0',
    itemWithChildren: '',
    link: 'group relative text-sm flex items-center focus-visible:outline-primary py-1',
    linkText: 'truncate',
    indicator: 'absolute ms-2.5 transition-[translate,height] duration-200 h-(--indicator-size) translate-y-(--indicator-position) w-px rounded-full'
  },
  variants: {
    color: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, ''])),
      neutral: ''
    },
    highlightColor: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, {
        indicator: `bg-${color}`
      }])),
      neutral: {
        indicator: 'bg-inverted'
      }
    },
    active: {
      false: {
        link: ['text-muted hover:text-default', options.theme.transitions && 'transition-colors']
      }
    },
    highlight: {
      true: {
        list: 'ms-2.5 ps-4 border-s border-default',
        item: '-ms-px'
      }
    },
    body: {
      true: {
        bottom: 'mt-6'
      }
    }
  },
  compoundVariants: [...(options.theme.colors || []).map((color: string) => ({
    color,
    active: true,
    class: {
      link: `text-${color}`,
      linkLeadingIcon: `text-${color}`
    }
  })), {
    color: 'neutral',
    active: true,
    class: {
      link: 'text-highlighted',
      linkLeadingIcon: 'text-highlighted'
    }
  }],
  defaultVariants: {
    color: 'primary',
    highlightColor: 'primary'
  }
})
```

### 5.2 主题 Slots 说明

  | Slot | 描述 | 默认样式 |
  |------|------|----------|
  | `root` | 根容器 | 粘性定位、背景模糊、最大高度限制 |
  | `container` | 内容容器 | 内边距、底部边框（仅移动端） |
  | `trigger` | 触发器/标题区域 | flex 布局、字体样式 |
  | `content` | 内容区域 | 展开/折叠动画 |
  | `list` | 链接列表 | 最小宽度 |
  | `listWithChildren` | 有子项的列表 | 左边距缩进 |
  | `link` | 链接元素 | flex 布局、相对定位 |
  | `indicator` | 活动指示器 | 绝对定位、过渡动画 |

---

## 6. API 参考

### 6.1 Props

| Prop | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `as` | `any` | `'nav'` | 渲染的根元素类型 |
| `title` | `string` | `t('contentToc.title')` | 目录标题 |
| `links` | `ContentTocLink[]` | - | 目录链接数组 |
| `color` | `string` | `'primary'` | 链接颜色 |
| `highlight` | `boolean` | `false` | 是否显示活动指示器 |
| `highlightColor` | `string` | 同 `color` | 指示器颜色 |
| `trailingIcon` | `string` | `chevronDown` | 折叠图标 |
| `open` | `boolean` | - | 控制折叠状态 |
| `defaultOpen` | `boolean` | - | 初始折叠状态 |
| `ui` | `object` | - | UI 样式覆盖 |

### 6.2 ContentTocLink 类型

```typescript
interface ContentTocLink {
  id: string      // 标题的 ID（用于锚点）
  text: string    // 显示文本
  depth: number   // 层级深度
  children?: ContentTocLink[]  // 子链接
  class?: any     // 自定义 class
  ui?: {          // 单个链接的 UI 覆盖
    item?: ClassNameValue
    itemWithChildren?: ClassNameValue
    link?: ClassNameValue
    linkText?: ClassNameValue
  }
}
```

### 6.3 Slots

| Slot | 参数 | 描述 |
|------|------|------|
| `leading` | `{ open, ui }` | 标题前方内容 |
| `default` | `{ open }` | 标题内容 |
| `trailing` | `{ open, ui }` | 标题后方内容（默认显示图标） |
| `content` | `{ links }` | 自定义链接列表渲染 |
| `link` | `{ link }` | 自定义单个链接渲染 |
| `top` | `{ links }` | 顶部额外内容 |
| `bottom` | `{ links }` | 底部额外内容 |

### 6.4 Emits

| 事件 | 参数 | 描述 |
|------|------|------|
| `update:open` | `boolean` | 折叠状态变化 |
| `move` | `string` | 点击链接时触发，返回目标 ID |

---

## 7. 实现要点

### 7.1 关键技术

  1. **IntersectionObserver**：
      - 用于检测标题元素是否在视口中
      - 自动跟踪当前阅读位置

  2. **createReusableTemplate (VueUse)**：
      - 用于定义可复用的模板片段
      - 避免模板代码重复

  3. **CSS 变量驱动的动画**：
      - `--indicator-size`：指示器高度
      - `--indicator-position`：指示器位置
      - 通过 CSS transition 实现平滑动画

  4. **Nuxt Hooks**：
      - `page:loading:end`：页面加载完成后更新标题
      - `page:transition:finish`：页面过渡完成后更新标题

### 7.2 响应式设计策略

```
移动端 (< lg):
├── CollapsibleTrigger (可点击展开/折叠)
└── CollapsibleContent (动画展开)

桌面端 (>= lg):
├── <p> 元素作为标题 (无交互)
└── <div> 始终显示内容
```

### 7.3 活动状态保持策略

```typescript
watch(visibleHeadings, (val, oldVal) => {
  if (val.length === 0) {
    activeHeadings.value = oldVal  // 保持上一个活动状态
  } else {
    activeHeadings.value = val
  }
})
```

  这确保了当用户滚动到没有标题的区域时，仍然保持上一个活动标题的高亮状态。

### 7.4 使用示例

```vue
<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('docs').path(route.path).first()
)
</script>

<template>
  <UContentToc
    :links="page?.body?.toc?.links"
    title="On this page"
    highlight
    color="primary"
  />
</template>
```

---

## 附录：文件结构

```
nuxt/ui/src/runtime/
├── components/
│   └── content/
│       └── ContentToc.vue          # 主组件
├── composables/
│   ├── useScrollspy.ts             # 滚动监听
│   └── useLocale.ts                # 国际化
└── theme/
    └── content/
        └── content-toc.ts          # 主题配置
```

---

## 参考链接

  - [Nuxt UI ContentToc 官方文档](https://ui.nuxt.com/docs/components/content-toc)
  - [GitHub 源码](https://github.com/nuxt/ui/tree/v4/src/runtime/components/content/ContentToc.vue)
  - [Reka UI Collapsible](https://reka-ui.com/docs/components/collapsible)
  - [VueUse createReusableTemplate](https://vueuse.org/core/createReusableTemplate/)

