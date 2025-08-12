# DocsNavigation 组件

该组件是对 `UContentNavigation` 的包装，用于根据内容层
`.navigation.yml` 中的 `module` 与 `ui`
元信息，为模块分组应用特定样式，同时保持数据层（`useContentNavigation`）纯粹。

## 使用

```vue
<template>
  <DocsNavigation :navigation="navigation" />
</template>
```

- `navigation` 来源于 `app.vue` 提供的
  `provide('navigation', filteredNavigation)`。

## 支持的内容元信息

在 `.navigation.yml` 中：

```yml
module: true
ui:
  itemWithChildren: border-t-1 border-default mt-3 py-2
  link: text-medium font-semibold
  linkTrailingIcon: hidden
```

- `module: true`：标记该分组为模块区块
- `ui.itemWithChildren`：分组容器额外类（有子项时生效）
- `ui.link`：链接文字的额外类
- `ui.linkTrailingIcon: hidden`：隐藏尾随图标

注意：若未提供 `ui`，组件会应用默认的模块样式。

## Props

- `navigation: ContentNavigationItem[]` 必填
- `inheritModuleStyling?: boolean` 默认
  `true`，子项继承模块样式（当前插槽能力限制下，仅在分组项生效）
- `color?: string` 默认 `primary`
- `variant?: string` 默认 `link`
- `highlight?: boolean` 默认 `true`
- `trailingIcon?: string` 默认 `i-lucide-chevron-right`

## 设计原则

- 不修改输入的导航数据；所有派生样式通过 `data-module`
  与类名注入
- 保持 a11y：焦点环与键盘导航不受影响
- 主题友好：不硬编码颜色，优先使用通用类与主题令牌

## 集成点

- 在 `layouts/docs.vue` 内，将原 `UContentNavigation` 替换为
  `DocsNavigation`。
- `app.vue` 中的 `queryCollectionNavigation` 字段列表需包含
  `ui`，以便消费内容层样式提示。

## 回退

- 移除 `DocsNavigation` 并恢复 `UContentNavigation`
  即可回退；数据层无变更。
