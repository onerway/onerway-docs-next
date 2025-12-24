# Nuxt UI Tabs 组件调查报告

## 1. 概述

Nuxt UI 提供了两种 Tabs 相关组件：

| 组件类型 | 组件名 | 用途 | 文件位置 |
|---------|-------|------|---------|
| 基础组件 | `UTabs` | 通用 Vue 组件 | `src/runtime/components/Tabs.vue` |
| Prose 组件 | `ProseTabs` + `ProseTabsItem` | MDC/Markdown 内容中使用 | `src/runtime/components/prose/Tabs.vue` |

**依赖关系**：ProseTabs 内部封装了 UTabs 组件，并添加了 MDC 特有功能。

**文档链接**：
- [Nuxt UI Tabs 文档](https://ui.nuxt.com/docs/components/tabs)
- [Nuxt UI Typography 文档](https://ui.nuxt.com/docs/getting-started/typography)
- [Reka UI Tabs](https://reka-ui.com/docs/components/tabs)
- [GitHub 源码](https://github.com/nuxt/ui/blob/v4/src/runtime/components/Tabs.vue)

---

## 2. UTabs 基础组件

### 2.1 源码位置

```
nuxt/ui (v4 分支)
├── src/runtime/components/Tabs.vue      # 组件实现
├── src/theme/tabs.ts                    # 主题配置
└── src/runtime/types/index.ts           # 类型定义
```

### 2.2 完整源码

#### Tabs.vue

```vue
<!-- eslint-disable vue/block-tag-newline -->
<script lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { TabsRootProps, TabsRootEmits } from 'reka-ui'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/tabs'
import type { AvatarProps, BadgeProps, IconProps } from '../types'
import type { DynamicSlots, GetItemKeys } from '../types/utils'
import type { ComponentConfig } from '../types/tv'

type Tabs = ComponentConfig<typeof theme, AppConfig, 'tabs'>

export interface TabsItem {
  label?: string
  /**
   * @IconifyIcon
   */
  icon?: IconProps['name']
  avatar?: AvatarProps
  /**
   * Display a badge on the item.
   * `{ size: 'sm', color: 'neutral', variant: 'outline' }`{lang="ts-type"}
   */
  badge?: string | number | BadgeProps
  slot?: string
  content?: string
  /** A unique value for the tab item. Defaults to the index. */
  value?: string | number
  disabled?: boolean
  class?: any
  ui?: Pick<Tabs['slots'], 'trigger' | 'leadingIcon' | 'leadingAvatar' | 'leadingAvatarSize' | 'label' | 'trailingBadge' | 'trailingBadgeSize' | 'content'>
  [key: string]: any
}

export interface TabsProps<T extends TabsItem = TabsItem> extends Pick<TabsRootProps<string | number>, 'defaultValue' | 'modelValue' | 'activationMode' | 'unmountOnHide'> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  items?: T[]
  /**
   * @defaultValue 'primary'
   */
  color?: Tabs['variants']['color']
  /**
   * @defaultValue 'pill'
   */
  variant?: Tabs['variants']['variant']
  /**
   * @defaultValue 'md'
   */
  size?: Tabs['variants']['size']
  /**
   * The orientation of the tabs.
   * @defaultValue 'horizontal'
   */
  orientation?: TabsRootProps['orientation']
  /**
   * The content of the tabs, can be disabled to prevent rendering the content.
   * @defaultValue true
   */
  content?: boolean
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: GetItemKeys<T>
  class?: any
  ui?: Tabs['slots']
}

export interface TabsEmits extends TabsRootEmits<string | number> {}

type SlotProps<T extends TabsItem> = (props: { item: T, index: number, ui: Tabs['ui'] }) => any

export type TabsSlots<T extends TabsItem = TabsItem> = {
  'leading': SlotProps<T>
  'default'(props: { item: T, index: number }): any
  'trailing': SlotProps<T>
  'content': SlotProps<T>
  'list-leading'(props?: {}): any
  'list-trailing'(props?: {}): any
} & DynamicSlots<T, undefined, { index: number, ui: Tabs['ui'] }>

</script>

<script setup lang="ts" generic="T extends TabsItem">
import { ref, computed } from 'vue'
import { TabsRoot, TabsList, TabsIndicator, TabsTrigger, TabsContent, useForwardPropsEmits } from 'reka-ui'
import { reactivePick } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { get } from '../utils'
import { tv } from '../utils/tv'
import UIcon from './Icon.vue'
import UAvatar from './Avatar.vue'
import UBadge from './Badge.vue'

const props = withDefaults(defineProps<TabsProps<T>>(), {
  content: true,
  defaultValue: '0',
  orientation: 'horizontal',
  unmountOnHide: true,
  labelKey: 'label'
})
const emits = defineEmits<TabsEmits>()
const slots = defineSlots<TabsSlots<T>>()

const appConfig = useAppConfig() as Tabs['AppConfig']

const rootProps = useForwardPropsEmits(reactivePick(props, 'as', 'unmountOnHide'), emits)

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.tabs || {}) })({
  color: props.color,
  variant: props.variant,
  size: props.size,
  orientation: props.orientation
}))

const triggersRef = ref<ComponentPublicInstance[]>([])

defineExpose({
  triggersRef
})
</script>

<template>
  <TabsRoot
    v-bind="rootProps"
    :model-value="modelValue"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation-mode="activationMode"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <TabsList data-slot="list" :class="ui.list({ class: props.ui?.list })">
      <TabsIndicator data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" />

      <slot name="list-leading" />

      <TabsTrigger
        v-for="(item, index) of items"
        :key="index"
        :ref="el => (triggersRef[index] = el as ComponentPublicInstance)"
        :value="item.value ?? String(index)"
        :disabled="item.disabled"
        data-slot="trigger"
        :class="ui.trigger({ class: [props.ui?.trigger, item.ui?.trigger] })"
      >
        <slot name="leading" :item="item" :index="index" :ui="ui">
          <UIcon v-if="item.icon" :name="item.icon" data-slot="leadingIcon" :class="ui.leadingIcon({ class: [props.ui?.leadingIcon, item.ui?.leadingIcon] })" />
          <UAvatar v-else-if="item.avatar" :size="((item.ui?.leadingAvatarSize || props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" data-slot="leadingAvatar" :class="ui.leadingAvatar({ class: [props.ui?.leadingAvatar, item.ui?.leadingAvatar] })" />
        </slot>

        <span v-if="get(item, props.labelKey as string) || !!slots.default" data-slot="label" :class="ui.label({ class: [props.ui?.label, item.ui?.label] })">
          <slot :item="item" :index="index">{{ get(item, props.labelKey as string) }}</slot>
        </span>

        <slot name="trailing" :item="item" :index="index" :ui="ui">
          <UBadge
            v-if="item.badge || item.badge === 0"
            color="neutral"
            variant="outline"
            :size="((item.ui?.trailingBadgeSize || props.ui?.trailingBadgeSize || ui.trailingBadgeSize()) as BadgeProps['size'])"
            v-bind="(typeof item.badge === 'string' || typeof item.badge === 'number') ? { label: item.badge } : item.badge"
            data-slot="trailingBadge"
            :class="ui.trailingBadge({ class: [props.ui?.trailingBadge, item.ui?.trailingBadge] })"
          />
        </slot>
      </TabsTrigger>

      <slot name="list-trailing" />
    </TabsList>

    <template v-if="!!content">
      <TabsContent v-for="(item, index) of items" :key="index" :value="item.value ?? String(index)" data-slot="content" :class="ui.content({ class: [props.ui?.content, item.ui?.content, item.class] })">
        <slot :name="((item.slot || 'content') as keyof TabsSlots<T>)" :item="(item as Extract<T, { slot: string; }>)" :index="index" :ui="ui">
          {{ item.content }}
        </slot>
      </TabsContent>
    </template>
  </TabsRoot>
</template>
```

### 2.3 Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `as` | `any` | `'div'` | 组件渲染的元素或组件 |
  | `items` | `TabsItem[]` | - | 标签项数组 |
  | `color` | `'primary' \| 'secondary' \| 'success' \| 'info' \| 'warning' \| 'error' \| 'neutral'` | `'primary'` | 颜色主题 |
  | `variant` | `'pill' \| 'link'` | `'pill'` | 变体样式 |
  | `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 尺寸 |
  | `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
  | `content` | `boolean` | `true` | 是否渲染内容面板 |
  | `labelKey` | `string` | `'label'` | 用于获取标签文本的键 |
  | `defaultValue` | `string \| number` | `'0'` | 默认激活的标签值 |
  | `modelValue` | `string \| number` | - | 受控模式的激活值 (v-model) |
  | `activationMode` | `'automatic' \| 'manual'` | `'automatic'` | 激活模式 |
  | `unmountOnHide` | `boolean` | `true` | 隐藏时是否卸载内容 |
  | `ui` | `object` | - | 自定义样式 slots |

### 2.4 TabsItem 接口

```typescript
interface TabsItem {
  label?: string              // 标签文本
  icon?: string               // 图标名称 (Iconify)
  avatar?: AvatarProps        // 头像配置
  badge?: string | number | BadgeProps  // 徽章
  slot?: string               // 自定义 slot 名称
  content?: string            // 内容文本
  value?: string | number     // 唯一值
  disabled?: boolean          // 是否禁用
  class?: any                 // 自定义类名
  ui?: object                 // 自定义样式
}
```

### 2.5 Slots

  | Slot | Props | Description |
  |------|-------|-------------|
  | `leading` | `{ item, index, ui }` | 标签前置内容 (图标/头像) |
  | `default` | `{ item, index }` | 标签文本内容 |
  | `trailing` | `{ item, index, ui }` | 标签后置内容 (徽章) |
  | `content` | `{ item, index, ui }` | 内容面板 |
  | `list-leading` | - | 标签列表前置内容 |
  | `list-trailing` | - | 标签列表后置内容 |
  | `#[item.slot]` | `{ item, index, ui }` | 自定义命名 slot |

### 2.6 Emits

  | Event | Payload | Description |
  |-------|---------|-------------|
  | `update:modelValue` | `string \| number` | 激活标签变化 |

### 2.7 Expose

  | Name | Type | Description |
  |------|------|-------------|
  | `triggersRef` | `Ref<ComponentPublicInstance[]>` | 标签触发器引用数组 |

---

## 3. 主题配置

### 3.1 tabs.ts (基础主题)

```typescript
import type { ModuleOptions } from '../module'

export default (options: Required<ModuleOptions>) => ({
  slots: {
    root: 'flex items-center gap-2',
    list: 'relative flex p-1 group',
    indicator: 'absolute transition-[translate,width] duration-200',
    trigger: [
      'group relative inline-flex items-center min-w-0',
      'data-[state=inactive]:text-muted',
      'hover:data-[state=inactive]:not-disabled:text-default',
      'font-medium rounded-md',
      'disabled:cursor-not-allowed disabled:opacity-75',
      options.theme.transitions && 'transition-colors'
    ],
    leadingIcon: 'shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    label: 'truncate',
    trailingBadge: 'shrink-0',
    trailingBadgeSize: 'sm',
    content: 'focus:outline-none w-full'
  },
  variants: {
    color: {
      primary: '',
      secondary: '',
      success: '',
      info: '',
      warning: '',
      error: '',
      neutral: ''
    },
    variant: {
      pill: {
        list: 'bg-elevated rounded-lg',
        trigger: 'grow',
        indicator: 'rounded-md shadow-xs'
      },
      link: {
        list: 'border-default',
        indicator: 'rounded-full',
        trigger: 'focus:outline-none'
      }
    },
    orientation: {
      horizontal: {
        root: 'flex-col',
        list: 'w-full',
        indicator: 'left-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position)',
        trigger: 'justify-center'
      },
      vertical: {
        list: 'flex-col',
        indicator: 'top-0 h-(--reka-tabs-indicator-size) translate-y-(--reka-tabs-indicator-position)'
      }
    },
    size: {
      xs: { trigger: 'px-2 py-1 text-xs gap-1', leadingIcon: 'size-4', leadingAvatarSize: '3xs' },
      sm: { trigger: 'px-2.5 py-1.5 text-xs gap-1.5', leadingIcon: 'size-4', leadingAvatarSize: '3xs' },
      md: { trigger: 'px-3 py-1.5 text-sm gap-1.5', leadingIcon: 'size-5', leadingAvatarSize: '2xs' },
      lg: { trigger: 'px-3 py-2 text-sm gap-2', leadingIcon: 'size-5', leadingAvatarSize: '2xs' },
      xl: { trigger: 'px-3 py-2 text-base gap-2', leadingIcon: 'size-6', leadingAvatarSize: 'xs' }
    }
  },
  compoundVariants: [
    // horizontal + pill
    { orientation: 'horizontal', variant: 'pill', class: { indicator: 'inset-y-1' } },
    // horizontal + link
    { orientation: 'horizontal', variant: 'link', class: { list: 'border-b -mb-px', indicator: '-bottom-px h-px' } },
    // vertical + pill
    { orientation: 'vertical', variant: 'pill', class: { indicator: 'inset-x-1', list: 'items-center' } },
    // vertical + link
    { orientation: 'vertical', variant: 'link', class: { list: 'border-s -ms-px', indicator: '-start-px w-px' } },
    // color + variant combinations (pill)
    { color: 'primary', variant: 'pill', class: {
      indicator: 'bg-primary',
      trigger: 'data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
    }},
    // color + variant combinations (link)
    { color: 'primary', variant: 'link', class: {
      indicator: 'bg-primary',
      trigger: 'data-[state=active]:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
    }},
    // neutral variants...
  ],
  defaultVariants: {
    color: 'primary',
    variant: 'pill',
    size: 'md'
  }
})
```

### 3.2 UI Slots 结构

```typescript
interface TabsSlots {
  root: string            // 根容器
  list: string            // 标签列表容器
  indicator: string       // 激活指示器
  trigger: string         // 标签触发器
  leadingIcon: string     // 前置图标
  leadingAvatar: string   // 前置头像
  leadingAvatarSize: string // 头像尺寸
  label: string           // 标签文本
  trailingBadge: string   // 后置徽章
  trailingBadgeSize: string // 徽章尺寸
  content: string         // 内容面板
}
```

---

## 4. ProseTabs 组件 (Typography)

### 4.1 源码位置

```
nuxt/ui (v4 分支)
├── src/runtime/components/prose/Tabs.vue       # 组件实现
├── src/runtime/components/prose/TabsItem.vue   # 子项组件
├── src/theme/prose/tabs.ts                     # 主题配置
└── src/theme/prose/tabs-item.ts                # 子项主题
```

### 4.2 ProseTabs.vue 源码

```vue
<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/prose/tabs'
import type { TabsProps } from '../../types'
import type { ComponentConfig } from '../../types/tv'

type ProseTabs = ComponentConfig<typeof theme, AppConfig, 'tabs', 'ui.prose'>

export interface ProseTabsProps {
  /**
   * The default tab to select.
   * @example '1'
   */
  defaultValue?: string
  /**
   * Sync the selected tab with a local storage key.
   */
  sync?: string
  /**
   * The hash to scroll to when the tab is selected.
   */
  hash?: string
  class?: any
  ui?: ProseTabs['slots'] & TabsProps['ui']
}

export interface ProseTabsSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed, watch, onMounted, ref, onBeforeUpdate } from 'vue'
import { useState, useAppConfig } from '#imports'
import { transformUI } from '../../utils'
import { tv } from '../../utils/tv'
import UTabs from '../Tabs.vue'

const props = withDefaults(defineProps<ProseTabsProps>(), {
  defaultValue: '0'
})
const slots = defineSlots<ProseTabsSlots>()

const model = defineModel<string>()

const appConfig = useAppConfig() as ProseTabs['AppConfig']

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.prose?.tabs || {}) }))

const rerenderCount = ref(1)

const items = computed<{
  index: number
  label: string
  icon: string
  component: any
}[]>(() => {
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

onMounted(() => {
  if (props.sync) {
    const syncKey = `tabs-${props.sync}`
    const syncValue = useState<string>(syncKey, () => localStorage.getItem(syncKey) as string)

    watch(syncValue, () => {
      if (!syncValue.value) return
      model.value = syncValue.value
    }, { immediate: true })

    watch(model, () => {
      if (!model.value) return
      syncValue.value = model.value
      localStorage.setItem(syncKey, model.value)
    })
  }
})

async function onUpdateModelValue() {
  if (props.hash) {
    const hash = props.hash.startsWith('#') ? props.hash : `#${props.hash}`
    setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView()
    }, 200)
  }
}

onBeforeUpdate(() => rerenderCount.value++)
</script>

<template>
  <UTabs
    v-model="model"
    color="primary"
    variant="link"
    :items="items"
    :class="props.class"
    :unmount-on-hide="false"
    :ui="transformUI(ui(), props.ui)"
    @update:model-value="onUpdateModelValue"
  >
    <template #content="{ item }">
      <component :is="item.component" />
    </template>
  </UTabs>
</template>
```

### 4.3 ProseTabsItem.vue 源码

```vue
<script lang="ts">
import type { AppConfig } from '@nuxt/schema'
import type { ComponentConfig } from '../../types/tv'
import theme from '#build/ui/prose/tabs-item'

type ProseTabsItem = ComponentConfig<typeof theme, AppConfig, 'tabsItem', 'ui.prose'>

export interface ProseTabsItemProps {
  label: string
  description?: string
  class?: any
}

export interface ProseTabsItemSlots {
  default(props?: {}): any
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig } from '#imports'
import { tv } from '../../utils/tv'

const props = defineProps<ProseTabsItemProps>()
defineSlots<ProseTabsItemSlots>()

const appConfig = useAppConfig() as ProseTabsItem['AppConfig']

const ui = computed(() => tv({ extend: tv(theme), ...(appConfig.ui?.prose?.tabsItem || {}) }))
</script>

<template>
  <div :class="ui({ class: props.class })">
    <slot>
      {{ description }}
    </slot>
  </div>
</template>
```

### 4.4 Prose Tabs Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `defaultValue` | `string` | `'0'` | 默认选中的标签 |
  | `sync` | `string` | - | 与 localStorage 同步的键名 |
  | `hash` | `string` | - | 切换时滚动到的锚点 |
  | `class` | `any` | - | 自定义类名 |
  | `ui` | `object` | - | 自定义样式 |

### 4.5 Prose TabsItem Props

  | Prop | Type | Required | Description |
  |------|------|----------|-------------|
  | `label` | `string` | ✓ | 标签文本 |
  | `description` | `string` | - | 描述文本 |
  | `class` | `any` | - | 自定义类名 |

### 4.6 主题配置

  **prose/tabs.ts**:
```typescript
export default {
  slots: {
    root: 'my-5 gap-4'
  }
}
```

  **prose/tabs-item.ts**:
```typescript
export default {
  base: '*:first:mt-0 *:last:mb-0 *:my-1.5'
}
```

---

## 5. MDC 使用语法

### 5.1 基础用法

```mdc
::tabs

:::tabs-item{label="Tab 1"}
Tab 1 的内容
:::

:::tabs-item{label="Tab 2"}
Tab 2 的内容
:::

::
```

### 5.2 带图标

```mdc
::tabs

:::tabs-item{label="安装" icon="i-lucide-download"}
使用 pnpm 安装：
```bash
pnpm add @nuxt/ui
```
:::

:::tabs-item{label="使用" icon="i-lucide-code"}
导入组件并在模板中使用
:::

::
```

### 5.3 同步功能

```mdc
::tabs{sync="package-manager"}

:::tabs-item{label="pnpm"}
```bash
pnpm add @nuxt/ui
```
:::

:::tabs-item{label="npm"}
```bash
npm install @nuxt/ui
```
:::

::
```

> **注意**：`sync` 属性会将选中状态保存到 localStorage，页面间共享

### 5.4 锚点滚动

```mdc
::tabs{hash="installation"}

:::tabs-item{label="Step 1"}
第一步内容
:::

:::tabs-item{label="Step 2"}
第二步内容
:::

::
```

---

## 6. Vue 组件使用示例

### 6.1 基础用法

```vue
<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const items = ref<TabsItem[]>([
  { label: 'Account', icon: 'i-lucide-user', content: '账户内容' },
  { label: 'Password', icon: 'i-lucide-lock', content: '密码内容' }
])
</script>

<template>
  <UTabs :items="items" />
</template>
```

### 6.2 自定义 Slot

```vue
<script setup lang="ts">
const items = [
  { label: 'Account', slot: 'account' },
  { label: 'Password', slot: 'password' }
]
</script>

<template>
  <UTabs :items="items">
    <template #account>
      <p>账户设置表单</p>
    </template>
    <template #password>
      <p>密码修改表单</p>
    </template>
  </UTabs>
</template>
```

### 6.3 受控模式 (v-model)

```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const active = computed({
  get: () => (route.query.tab as string) || 'account',
  set: (tab) => router.push({ query: { tab } })
})

const items = [
  { label: 'Account', value: 'account' },
  { label: 'Password', value: 'password' }
]
</script>

<template>
  <UTabs v-model="active" :items="items" />
</template>
```

### 6.4 不同变体

```vue
<template>
  <!-- Pill 变体 (默认) -->
  <UTabs :items="items" variant="pill" />

  <!-- Link 变体 -->
  <UTabs :items="items" variant="link" />

  <!-- 垂直方向 -->
  <UTabs :items="items" orientation="vertical" />
</template>
```

---

## 7. 自定义主题配置

### 7.1 app.config.ts

```typescript
export default defineAppConfig({
  ui: {
    // 基础 Tabs 组件
    tabs: {
      slots: {
        root: 'flex items-center gap-4',
        list: 'bg-gray-100 dark:bg-gray-800 rounded-xl p-2',
        trigger: 'px-4 py-2 text-sm font-medium'
      },
      variants: {
        color: {
          primary: ''
        }
      }
    },
    // Prose Tabs (Typography)
    prose: {
      tabs: {
        slots: {
          root: 'my-6 gap-6'
        }
      },
      tabsItem: {
        base: '*:first:mt-0 *:last:mb-0'
      }
    }
  }
})
```

---

## 8. 关键实现细节

### 8.1 Reka UI 集成

  UTabs 组件基于 [Reka UI](https://reka-ui.com/docs/components/tabs) 构建：

```typescript
import {
  TabsRoot,       // 根容器
  TabsList,       // 标签列表
  TabsIndicator,  // 激活指示器 (动画)
  TabsTrigger,    // 标签触发器
  TabsContent     // 内容面板
} from 'reka-ui'
```

### 8.2 动画指示器

  使用 CSS 变量实现平滑的指示器动画：

```css
/* Reka UI 自动设置这些变量 */
--reka-tabs-indicator-size: /* 当前标签宽度/高度 */
--reka-tabs-indicator-position: /* 当前标签位置 */
```

### 8.3 ProseTabs Slot 转换

  ProseTabs 通过 `transformSlot` 函数将子组件转换为 items：

```typescript
function transformSlot(slot: any, index: number) {
  if (typeof slot.type === 'symbol') {
    return slot.children?.map(transformSlot)
  }
  return {
    index,
    label: slot.props?.label || `${index}`,
    icon: slot.props?.icon,
    component: slot
  }
}
```

### 8.4 LocalStorage 同步

```typescript
onMounted(() => {
  if (props.sync) {
    const syncKey = `tabs-${props.sync}`
    const syncValue = useState<string>(syncKey, () =>
      localStorage.getItem(syncKey) as string
    )
    // 双向同步...
  }
})
```

---

## 9. 与项目现有组件对比

| 特性 | Nuxt UI Tabs | 项目 ProseLinkSwitch |
|------|-------------|---------------------|
| 用途 | 通用标签切换 | 链接切换 |
| 内容类型 | 面板内容 | 链接导航 |
| 变体 | pill/link | - |
| 尺寸 | xs~xl | - |
| LocalStorage 同步 | ✓ (sync prop) | ✓ (presets) |
| 键盘导航 | ✓ (Reka UI) | ✓ |

---

## 10. 参考链接

  - [Nuxt UI Tabs 文档](https://ui.nuxt.com/docs/components/tabs)
  - [Nuxt UI Typography 文档](https://ui.nuxt.com/docs/getting-started/typography)
  - [Reka UI Tabs](https://reka-ui.com/docs/components/tabs)
  - [GitHub - Tabs.vue](https://github.com/nuxt/ui/blob/v4/src/runtime/components/Tabs.vue)
  - [GitHub - prose/Tabs.vue](https://github.com/nuxt/ui/blob/v4/src/runtime/components/prose/Tabs.vue)
  - [Nuxt Content MDC Syntax](https://content.nuxt.com/docs/files/markdown#mdc-syntax)


