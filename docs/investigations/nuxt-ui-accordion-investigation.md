# Nuxt UI Accordion 组件调查报告

## 概述

本文档详细记录了 Nuxt UI 中 Accordion Component 与 Accordion Typography (Prose) 的关系及其底层实现。

## 组件层级关系

```
┌─────────────────────────────────────────────────────────────┐
│                     MDC / Markdown 内容                      │
│                  ::accordion / ::accordion-item             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   ProseAccordion.vue                        │
│          src/runtime/components/prose/Accordion.vue         │
│                                                             │
│  • 用于 MDC (Markdown) 文档中                                │
│  • 包装 UAccordion，提供内容插槽转换                          │
│  • 默认 type="multiple"                                     │
└─────────────────────────────┬───────────────────────────────┘
                              │ 内部使用
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     UAccordion.vue                          │
│          src/runtime/components/Accordion.vue               │
│                                                             │
│  • 核心 Accordion 组件                                       │
│  • 基于 Reka UI (AccordionRoot, AccordionItem, etc.)       │
│  • 支持 items 数组配置                                       │
│  • 支持 single/multiple 模式                                 │
└─────────────────────────────┬───────────────────────────────┘
                              │ 依赖
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Reka UI                               │
│  AccordionRoot, AccordionItem, AccordionHeader,            │
│  AccordionTrigger, AccordionContent                        │
│                                                             │
│  • 底层无头 UI 库                                            │
│  • 提供可访问性和交互逻辑                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. UAccordion - 核心组件

  **文件位置**: `src/runtime/components/Accordion.vue`

  **描述**: 这是 Nuxt UI 的核心 Accordion 组件，基于 Reka UI 构建。

### 源代码

```vue
<!-- eslint-disable vue/block-tag-newline -->
<script lang="ts">
import type { AccordionRootProps, AccordionRootEmits } from 'reka-ui'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/accordion'
import type { IconProps } from '../types'
import type { DynamicSlots, GetItemKeys } from '../types/utils'
import type { ComponentConfig } from '../types/tv'

type Accordion = ComponentConfig<typeof theme, AppConfig, 'accordion'>

export interface AccordionItem {
  label?: string
  /**
   * @IconifyIcon
   */
  icon?: IconProps['name']
  /**
   * @IconifyIcon
   */
  trailingIcon?: IconProps['name']
  slot?: string
  content?: string
  /** A unique value for the accordion item. Defaults to the index. */
  value?: string
  disabled?: boolean
  class?: any
  ui?: Pick<Accordion['slots'], 'item' | 'header' | 'trigger' | 'leadingIcon' | 'label' | 'trailingIcon' | 'content' | 'body'>
  [key: string]: any
}

export interface AccordionProps<T extends AccordionItem = AccordionItem> extends Pick<AccordionRootProps, 'collapsible' | 'defaultValue' | 'modelValue' | 'type' | 'disabled' | 'unmountOnHide'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  items?: T[]
  /**
   * The icon displayed on the right side of the trigger.
   * @defaultValue appConfig.ui.icons.chevronDown
   * @IconifyIcon
   */
  trailingIcon?: IconProps['name']
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: GetItemKeys<T>
  class?: any
  ui?: Accordion['slots']
}

export interface AccordionEmits extends AccordionRootEmits {}

type SlotProps<T extends AccordionItem> = (props: { item: T, index: number, open: boolean, ui: Accordion['ui'] }) => any

export type AccordionSlots<T extends AccordionItem = AccordionItem> = {
  leading: SlotProps<T>
  default(props: { item: T, index: number, open: boolean }): any
  trailing: SlotProps<T>
  content: SlotProps<T>
  body: SlotProps<T>
} & DynamicSlots<T, 'body', { index: number, open: boolean, ui: Accordion['ui'] }>

</script>

<script setup lang="ts" generic="T extends AccordionItem">
import { computed } from 'vue'
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent, useForwardPropsEmits } from 'reka-ui'
import { reactivePick } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { get } from '../utils'
import { tv } from '../utils/tv'
import UIcon from './Icon.vue'

const props = withDefaults(defineProps<AccordionProps<T>>(), {
  type: 'single',
  collapsible: true,
  unmountOnHide: true,
  labelKey: 'label'
})
const emits = defineEmits<AccordionEmits>()
const slots = defineSlots<AccordionSlots<T>>()

const appConfig = useAppConfig() as Accordion['AppConfig']

const rootProps = useForwardPropsEmits(reactivePick(props, 'as', 'collapsible', 'defaultValue', 'disabled', 'modelValue', 'unmountOnHide'), emits)

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.accordion || {}) })({
  disabled: props.disabled
}))
</script>

<template>
  <AccordionRoot v-bind="rootProps" :type="type" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <AccordionItem
      v-for="(item, index) in props.items"
      v-slot="{ open }"
      :key="index"
      :value="item.value || String(index)"
      :disabled="item.disabled"
      data-slot="item"
      :class="ui.item({ class: [props.ui?.item, item.ui?.item, item.class] })"
    >
      <AccordionHeader as="div" data-slot="header" :class="ui.header({ class: [props.ui?.header, item.ui?.header] })">
        <AccordionTrigger data-slot="trigger" :class="ui.trigger({ class: [props.ui?.trigger, item.ui?.trigger], disabled: item.disabled })">
          <slot name="leading" :item="item" :index="index" :open="open" :ui="ui">
            <UIcon v-if="item.icon" :name="item.icon" data-slot="leadingIcon" :class="ui.leadingIcon({ class: [props.ui?.leadingIcon, item?.ui?.leadingIcon] })" />
          </slot>

          <span v-if="get(item, props.labelKey as string) || !!slots.default" data-slot="label" :class="ui.label({ class: [props.ui?.label, item.ui?.label] })">
            <slot :item="item" :index="index" :open="open">{{ get(item, props.labelKey as string) }}</slot>
          </span>

          <slot name="trailing" :item="item" :index="index" :open="open" :ui="ui">
            <UIcon :name="item.trailingIcon || trailingIcon || appConfig.ui.icons.chevronDown" data-slot="trailingIcon" :class="ui.trailingIcon({ class: [props.ui?.trailingIcon, item.ui?.trailingIcon] })" />
          </slot>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent v-if="item.content || !!slots.content || (item.slot && !!slots[item.slot as keyof AccordionSlots<T>]) || !!slots.body || (item.slot && !!slots[`${item.slot}-body` as keyof AccordionSlots<T>])" data-slot="content" :class="ui.content({ class: [props.ui?.content, item.ui?.content] })">
        <slot :name="((item.slot || 'content') as keyof AccordionSlots<T>)" :item="(item as Extract<T, { slot: string; }>)" :index="index" :open="open" :ui="ui">
          <div data-slot="body" :class="ui.body({ class: [props.ui?.body, item.ui?.body] })">
            <slot :name="((item.slot ? `${item.slot}-body`: 'body') as keyof AccordionSlots<T>)" :item="(item as Extract<T, { slot: string; }>)" :index="index" :open="open" :ui="ui">
              {{ item.content }}
            </slot>
          </div>
        </slot>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
```

### 主题配置

  **文件位置**: `src/theme/accordion.ts`

```typescript
export default {
  slots: {
    root: 'w-full',
    item: 'border-b border-default last:border-b-0',
    header: 'flex',
    trigger: 'group flex-1 flex items-center gap-1.5 font-medium text-sm py-3.5 focus-visible:outline-primary min-w-0',
    content: 'data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out] overflow-hidden focus:outline-none',
    body: 'text-sm pb-3.5',
    leadingIcon: 'shrink-0 size-5',
    trailingIcon: 'shrink-0 size-5 ms-auto group-data-[state=open]:rotate-180 transition-transform duration-200',
    label: 'text-start break-words'
  },
  variants: {
    disabled: {
      true: {
        trigger: 'cursor-not-allowed opacity-75'
      }
    }
  }
}
```

---

## 2. ProseAccordion - Typography 文档组件

**文件位置**: `src/runtime/components/prose/Accordion.vue`

**描述**: 用于 MDC (Markdown) 内容中的 Accordion 组件，是 UAccordion 的包装器。

### 源代码

```vue
<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/prose/accordion'
import type { AccordionProps } from '../../types'
import type { ComponentConfig } from '../../types/tv'

type ProseAccordion = ComponentConfig<typeof theme, AppConfig, 'accordion', 'ui.prose'>

export interface ProseAccordionProps {
  type?: 'single' | 'multiple'
  class?: any
  ui?: ProseAccordion['slots'] & AccordionProps['ui']
}

export interface ProseAccordionSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed, ref, onBeforeUpdate } from 'vue'
import { useAppConfig } from '#imports'
import { transformUI } from '../../utils'
import { tv } from '../../utils/tv'
import UAccordion from '../Accordion.vue'

const props = withDefaults(defineProps<ProseAccordionProps>(), {
  type: 'multiple'
})
const slots = defineSlots<ProseAccordionSlots>()

const appConfig = useAppConfig() as ProseAccordion['AppConfig']

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.prose?.accordion || {}) }))

const rerenderCount = ref(1)

const items = computed<{
  index: number
  label: string
  icon: string
  component: any
}[]>(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  rerenderCount.value
  return slots.default?.()?.flatMap(transformSlot).filter(Boolean) || []
})

function transformSlot(slot: any, index: number) {
  if (typeof slot.type === 'symbol') {
    return slot.children?.map(transformSlot)
  }

  return {
    index,
    label: slot.props?.label || `${index}`,
    description: slot.props?.description,
    icon: slot.props?.icon,
    component: slot
  }
}

onBeforeUpdate(() => rerenderCount.value++)
</script>

<template>
  <UAccordion :type="type" :items="items" :unmount-on-hide="false" :class="props.class" :ui="transformUI(ui(), props.ui)">
    <template #content="{ item }">
      <component :is="item.component" />
    </template>
  </UAccordion>
</template>
```

### 主题配置

**文件位置**: `src/theme/prose/accordion.ts`

```typescript
export default {
  slots: {
    root: 'my-5',
    trigger: 'text-base'
  }
}
```

**关键特性**:
- 继承 UAccordion 的所有样式
- 覆盖 `root` 添加 `my-5` 垂直间距
- 覆盖 `trigger` 使用 `text-base` 字体大小

---

## 3. ProseAccordionItem - 单个折叠项

  **文件位置**: `src/runtime/components/prose/AccordionItem.vue`

  **描述**: 用于 MDC 内容中表示单个 accordion 项的内容区域。

### 源代码

```vue
<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { ComponentConfig } from '../../types/tv'
import theme from '#build/ui/prose/accordion-item'

type ProseAccordionItem = ComponentConfig<typeof theme, AppConfig, 'accordionItem', 'ui.prose'>

export interface ProseAccordionItemProps {
  label: string
  description?: string
  class?: any
}

export interface ProseAccordionItemSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../../utils/tv'

const props = defineProps<ProseAccordionItemProps>()
defineSlots<ProseAccordionItemSlots>()

const appConfig = useAppConfig() as ProseAccordionItem['AppConfig']

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.prose?.accordionItem || {}) }))
</script>

<template>
  <div :class="ui({ class: props.class })">
    <slot>
      {{ description }}
    </slot>
  </div>
</template>
```

### 主题配置

  **文件位置**: `src/theme/prose/accordion-item.ts`

```typescript
export default {
  base: 'pb-4 text-muted *:first:mt-0 *:last:mb-0 *:my-1.5'
}
```

---

## 组件关系总结

| 组件 | 用途 | 基于 |
|------|------|------|
| `UAccordion` | Vue 应用中的通用 Accordion | Reka UI |
| `ProseAccordion` | MDC 文档中的 Accordion 包装器 | UAccordion |
| `ProseAccordionItem` | MDC 中单个 item 的内容容器 | 无依赖 |

## MDC 使用示例

```mdc
::accordion
---
defaultValue:
  - '1'
---

::accordion-item{label="Is Nuxt UI free to use?" icon="i-lucide-circle-help"}
Yes! Nuxt UI is completely free and open source under the MIT license.
::

::accordion-item{label="Can I use Nuxt UI with Vue without Nuxt?" icon="i-lucide-circle-help"}
Yes! While optimized for Nuxt, Nuxt UI works perfectly with standalone Vue projects.
::

::
```

## Props API 对比

### UAccordion Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `AccordionItem[]` | - | 折叠项数组 |
| `type` | `'single' \| 'multiple'` | `'single'` | 展开模式 |
| `collapsible` | `boolean` | `true` | 是否可收起 |
| `defaultValue` | `string \| string[]` | - | 默认展开项 |
| `modelValue` | `string \| string[]` | - | 受控展开项 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `unmountOnHide` | `boolean` | `true` | 隐藏时卸载 |
| `trailingIcon` | `string` | `chevronDown` | 右侧图标 |
| `labelKey` | `string` | `'label'` | 标签字段名 |
| `ui` | `object` | - | 自定义样式 |

### ProseAccordion Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'single' \| 'multiple'` | `'multiple'` | 展开模式 (默认多选) |
| `class` | `any` | - | 自定义类名 |
| `ui` | `object` | - | 自定义样式 |

### ProseAccordionItem Props

| Prop | 类型 | 说明 |
|------|------|------|
| `label` | `string` (required) | 标题文本 |
| `description` | `string` | 描述文本 |
| `icon` | `string` | 左侧图标 |
| `class` | `any` | 自定义类名 |

## 主题自定义

### 通过 app.config.ts 配置

```typescript
export default defineAppConfig({
  ui: {
    // 自定义 UAccordion
    accordion: {
      slots: {
        root: 'w-full',
        item: 'border-b border-default last:border-b-0',
        header: 'flex',
        trigger: 'group flex-1 flex items-center gap-1.5 font-medium text-sm py-3.5 focus-visible:outline-primary min-w-0',
        content: 'data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out] overflow-hidden focus:outline-none',
        body: 'text-sm pb-3.5',
        leadingIcon: 'shrink-0 size-5',
        trailingIcon: 'shrink-0 size-5 ms-auto group-data-[state=open]:rotate-180 transition-transform duration-200',
        label: 'text-start break-words'
      },
      variants: {
        disabled: {
          true: {
            trigger: 'cursor-not-allowed opacity-75'
          }
        }
      }
    },
    // 自定义 ProseAccordion
    prose: {
      accordion: {
        slots: {
          root: 'my-5',
          trigger: 'text-base'
        }
      }
    }
  }
})
```

## 动画实现

Accordion 的展开/收起动画通过 CSS 动画实现：

```css
/* 展开动画 */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--reka-accordion-content-height); }
}

/* 收起动画 */
@keyframes accordion-up {
  from { height: var(--reka-accordion-content-height); }
  to { height: 0; }
}
```

动画在 `content` slot 上应用：
```
data-[state=open]:animate-[accordion-down_200ms_ease-out]
data-[state=closed]:animate-[accordion-up_200ms_ease-out]
```

---

## 参考链接

  - [Nuxt UI Accordion 文档](https://ui.nuxt.com/docs/components/accordion)
  - [Nuxt UI Typography Accordion 文档](https://ui.nuxt.com/docs/typography/accordion)
  - [Reka UI Accordion](https://reka-ui.com/docs/components/accordion)
  - [nuxt/ui GitHub 仓库](https://github.com/nuxt/ui)

