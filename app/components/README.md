# Components Registry

本文件仅作概览和索引：快速确认组件是否存在、作用是什么、示例去哪看。权威用法请参考组件自带的 MDC 示例或组件内的
`@example`，命令/技能也会优先读取示例，其次才是此处表格。

- 前缀：`App`（全局布局）、`Prose`（内容表达增强，MDC 组件）、`Docs`（文档页面结构）
- 维护：新增组件时同步更新表格，并补充/链接 MDC 示例；缺示例时以
`TODO` 标注

## App - 全局布局组件

| 组件               | 用途                                     | 变体/状态         | 依赖                                     | 示例 |
| ------------------ | ---------------------------------------- | ----------------- | ---------------------------------------- | ---- |
| AppLogo            | 品牌 Logo，支持明暗主题自动切换          | -                 | -                                        | TODO |
| AppHeader          | 顶部导航栏，集成搜索/语言/主题切换       | -                 | UHeader, UDropdownMenu, UColorModeButton | TODO |
| AppHeaderMobileNav | 移动端双层导航菜单，支持左右滑动过渡动画 | modules · submenu | UNavigationMenu, UCard, UPageLinks       | TODO |

## Prose - 内容表达增强组件

| 组件                           | 用途                                           | 变体/状态                                                                           | 依赖                                                  | 示例                                                         |
| ------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| ProseA                         | 内外链自动区分，外链 ↗ 内链 →，支持 Badge      | `badge`                                                                             | NuxtLink, UBadge                                      | `[链接](/path){badge="NEW"}`                                 |
| ProseAccordion                 | 折叠面板容器，支持步骤编号                     | `type`: single · multiple; `numbered`                                               | Reka UI Accordion                                     | [查看](#proseaccordion-示例)                                 |
| ProseAccordionItem             | 折叠面板子项，#label 和 #content slots         | `icon`, `badge`, `badges`                                                           | -                                                     | [查看](#proseaccordion-示例)                                 |
| ProseAnnotation                | 行内术语注释，hover 显示 Popover               | `color`: inherit · primary · ...; `underline`: dotted · dashed · solid · none       | UPopover, UIcon                                       | `:prose-annotation[术语]{annotation="解释"}`                 |
| ProseCode                      | 代码块渲染，支持高亮和复制                     | `language`, `filename`                                                              | Shiki                                                 | TODO                                                         |
| ProseCodeCard                  | 终端风格代码卡片，带复制和可选 footer actions  | `actions[]`, `height`                                                               | UButton, ProsePre                                     | [查看](content/ProseCodeCard.vue)                            |
| ProseInlineBlocks              | 强制块级元素行内渲染                           | `align`: baseline · top · middle · bottom                                           | MDCSlot                                               | `::prose-inline-blocks` 包裹内容                             |
| ProseMermaid                   | Mermaid 图表渲染，支持主题切换和错误处理       | -                                                                                   | mermaid, UAlert                                       | [设计文档](../docs/designs/ProseMermaid.md)                  |
| ProsePre                       | 代码块包装器，拦截 mermaid 并保留 Nuxt UI 功能 | `filename`, `hideHeader`, `highlights`, `ui`                                        | ProseMermaid, UButton                                 | [设计文档](../docs/designs/ProseMermaid.md)                  |
| ProseLinkSwitch                | 同一文本多链接选择器，支持预设                 | `preset`: merchant-dashboard; `mode`: hover · click                                 | UPopover                                              | `:prose-link-switch{preset="merchant-dashboard"}[Dashboard]` |
| ProseCarousel                  | 轮播封装，支持 #slide-n 命名 slots             | `variant`: dots · tabs · thumbnails · numbers · progress · none; `triggerPlacement` | UCarousel                                             | [查看](content/carousel/ProseCarousel.vue)                   |
| ProseCarouselTriggerDots       | 轮播触发器 - 圆点                              | -                                                                                   | -                                                     | 内部组件                                                     |
| ProseCarouselTriggerNumbers    | 轮播触发器 - 数字                              | `format`: 1 · 01 · roman                                                            | -                                                     | 内部组件                                                     |
| ProseCarouselTriggerProgress   | 轮播触发器 - 进度条                            | `showCounter`                                                                       | -                                                     | 内部组件                                                     |
| ProseCarouselTriggerTabs       | 轮播触发器 - 标签页                            | `orientation`: horizontal · vertical                                                | UTabs                                                 | 内部组件                                                     |
| ProseCarouselTriggerThumbnails | 轮播触发器 - 缩略图                            | `size`: sm · md · lg                                                                | -                                                     | 内部组件                                                     |
| ProseTabs                      | 标签页容器，支持 localStorage 同步和动态 TOC   | `variant`: pill · link · underline · segment; `sync`                                | Reka UI Tabs                                          | [查看](content/ProseTabs.vue)                                |
| ProseTabsItem                  | 标签项数据容器                                 | `icon`                                                                              | -                                                     | `:::tabs-item{label="Tab" icon="i-lucide-x"}`                |
| ProseTaskItem                  | 可交互任务列表项，支持 localStorage 持久化     | `initialChecked`                                                                    | UCheckbox                                             | 自动注入，无需手动使用                                       |
|                                | ProsePdfLink                                   | PDF 预览链接，模态框内预览 + 下载                                                   | `title`; 安全：白名单域名; 降级：超时错误显示下载选项 | UModal, UButton                                              | `:prose-pdf-link{href="/path/file.pdf"}[Preview]` |

## Docs - 文档页面结构组件

| 组件             | 用途                                             | 变体/状态                                                                        | 依赖                      | 示例                                               |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------- |
| DocsPageCard     | 可点击文档卡片，支持 spotlight、badge 和分析追踪 | `variant`: solid · outline · soft · subtle · ghost · naked; `spotlight`; `badge` | UPageCard, UBadge         | [查看](content/DocsPageCard.vue)                   |
| DocsPageGrid     | 响应式网格布局容器                               | `cols.base/sm/md/lg/xl`: 1-3; `as`: div · ul · ol                                | -                         | `::docs-page-grid{cols.md="2"}`                    |
| DocsResources    | 文档末尾资源链接列表，支持 hover 预览            | -                                                                                | UPopover, UButton, UBadge | [查看](content/DocsResources.vue)                  |
| DocsResourceItem | 资源列表子项数据容器                             | `icon`, `tags`, `external`                                                       | -                         | `::docs-resource-item{to="/path" tags="快速入门"}` |
| DocsToc          | 目录导航，桌面固定 + 移动端抽屉                  | `highlight`, `headingSelector`                                                   | USlideover, useScrollSpy  | TODO                                               |
| DocsTocList      | 目录链接递归列表（内部组件）                     | -                                                                                | -                         | 内部组件                                           |

## 组件使用示例

### ProseAccordion 示例

必须使用 `#label` 和 `#content` slot（不支持 `label` 属性）。推荐在 `#label` 中使用 markdown 标题以便 TOC 收录。

```markdown
::prose-accordion{multiple}
  :::prose-accordion-item{icon="i-simple-icons-shopify"}
  #label
  ### Shopify 集成

  #content
  内容...
  :::
::
```

> ❌ 错误：`{label="Shopify"}` 属性不存在，会被忽略。

## 维护约定

- 新增/改动组件时：更新上述表格；为 MDC 组件补充示例链接或在组件内添加
`@example`；缺示例保持 `TODO`。
- 命令/技能的读取顺序：组件示例（权威） → 本 README（概览） →
props/slots 推断；缺失信息时会提示 TODO。
- 示例策略：简单示例直接放表格内；复杂示例放组件文件链接。
