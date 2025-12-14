# Components Registry

项目中 Vue 组件的开发规范、命名约定和使用指南。

## 🏗️ 目录结构

```
app/components/
├── AppLogo.vue                    # 全局应用组件（App 前缀）
├── content/                       # 内容相关组件
│   ├── DocsPageCard.vue          # 文档辅助组件（Docs 前缀）
│   ├── DocsPageGrid.vue
│   ├── DocsResourceItem.vue
│   ├── DocsResources.vue
│   ├── DocsToc.vue               # 目录组件
│   ├── DocsTocList.vue           # 目录内部组件
│   ├── ProseA.vue                # 链接组件（覆盖默认）
│   ├── ProseAccordion.vue        # MDC 内容组件（Prose 前缀）
│   ├── ProseAccordionItem.vue
│   ├── ProseAnnotation.vue
│   ├── ProseCodeCard.vue          # 代码展示卡片
│   ├── ProseInlineBlocks.vue
│   ├── carousel/                  # Carousel（ProseCarousel + triggers）
│   │   ├── ProseCarousel.vue
│   │   └── triggers/
│   │       ├── ProseCarouselTriggerDots.vue
│   │       ├── ProseCarouselTriggerNumbers.vue
│   │       ├── ProseCarouselTriggerProgress.vue
│   │       ├── ProseCarouselTriggerTabs.vue
│   │       └── ProseCarouselTriggerThumbnails.vue
│   ├── ProseLinkSwitch.vue       # 多链接选择器
│   ├── ProseTabs.vue             # 标签页（覆盖 Nuxt UI）
│   └── ProseTabsItem.vue         # 标签页项
└── header/                        # 头部导航组件
    ├── AppHeader.vue
    └── AppHeaderMobileNav.vue
```

## 📋 命名规范

### 组件前缀分类

文档项目的组件分为三类：

| 前缀 | 用途 | 示例 |
|------|------|------|
| `App` | 全局布局组件（Header、Logo、Sidebar 等） | `AppLogo`, `AppHeader` |
| `Prose` | 内容表达增强（折叠、注释、行内渲染等） | `ProseAccordion`, `ProseAnnotation` |
| `Docs` | 文档页面结构（卡片、网格、资源列表、目录等） | `DocsPageCard`, `DocsToc` |

### 前缀选择指南

```
新组件 → 是全局布局组件吗？（Header、Footer、Logo）
         │
         ├─ 是 → App 前缀
         │
         └─ 否 → 是内容表达增强组件吗？（折叠、注释、高亮等）
                 │
                 ├─ 是 → Prose 前缀
                 │
                 └─ 否 → Docs 前缀
```

**Prose vs Docs 的区别**：
- `Prose`：增强 Markdown **内容本身**的表达（如折叠展开、术语注释）
- `Docs`：构建文档**页面结构**（如卡片布局、资源列表、目录导航）

### 命名规则

```typescript
// ✅ 正确：使用前缀 + 描述性名称（PascalCase）
AppHeader.vue
DocsPageCard.vue
ProseAccordion.vue
DocsToc.vue

// ❌ 错误：缺少前缀或命名模糊
Header.vue        // 缺少前缀
PageCard.vue      // 缺少前缀
Utils.vue         // 命名模糊
```

### 文件组织规则

1. **全局组件**：放在 `components/` 根目录
2. **功能分组**：相关组件放在子目录（如 `header/`, `content/`）
3. **内部组件**：作为父组件的辅助组件，放在同一目录（如 `DocsTocList.vue`）

### 内部/辅助组件命名

当组件作为另一个组件的内部辅助时，使用相同前缀 + 父组件名 + 功能描述：

```
DocsToc.vue             # 主组件
DocsTocList.vue         # 内部辅助组件（递归列表）

ProseAccordion.vue      # 主组件
ProseAccordionItem.vue  # 子组件

DocsResources.vue       # 主组件
DocsResourceItem.vue    # 子组件
```

**命名模式**：`{Prefix}{Feature}.vue` + `{Prefix}{Feature}{SubPart}.vue`

## 📝 代码风格规范

### 组件结构模板

```vue
<script setup lang="ts">
/**
 * 组件名称
 * 组件的简要描述，说明用途和特点
 *
 * 特点：
 * - 特点 1
 * - 特点 2
 *
 * @example MDC 用法（如适用）
 * ```mdc
 * ::component-name{prop="value"}
 * 内容
 * ::
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface ComponentNameProps {
  /** prop 描述 */
  propName?: string;
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(
  defineProps<ComponentNameProps>(),
  {
    propName: 'default',
  }
);

const emit = defineEmits<{
  (e: 'eventName', payload: EventPayload): void;
}>();

// ============================================================================
// Composables & Injections
// ============================================================================

const { locale } = useI18n();

// ============================================================================
// Reactive State
// ============================================================================

const isOpen = ref(false);

// ============================================================================
// Computed Properties
// ============================================================================

const computedValue = computed(() => {
  return props.propName?.toUpperCase();
});

// ============================================================================
// Methods
// ============================================================================

/**
 * 方法描述
 */
const handleClick = () => {
  emit('eventName', { /* payload */ });
};

// ============================================================================
// Lifecycle & Watchers
// ============================================================================

onMounted(() => {
  // 初始化逻辑
});

// ============================================================================
// Styles
// ============================================================================

const styles = {
  root: 'flex items-center gap-2',
  title: 'text-lg font-semibold',
};
</script>

<template>
  <div :class="styles.root">
    <slot />
  </div>
</template>
```

### Section 分隔符规范

使用统一的分隔符格式划分代码区域：

```typescript
// ============================================================================
// Section Name
// ============================================================================
```

**标准 Section 顺序**：

1. `Types` - 类型定义
2. `Props & Emits` - Props 和事件定义
3. `Composables & Injections` - 组合式函数和依赖注入
4. `Reactive State` - 响应式状态
5. `Constants` - 常量定义（如适用）
6. `Computed Properties` - 计算属性
7. `Methods` - 方法
8. `Lifecycle & Watchers` - 生命周期和监听器
9. `Styles` - 样式配置（如适用）

> **注意**：简单组件（< 100 行）可省略分隔符，保持代码简洁。

### Props 接口规范

```typescript
// ✅ 推荐：导出接口，使用 JSDoc 注释每个 prop
export interface DocsPageCardProps {
  /** 卡片标题 */
  title?: string;
  /** 卡片描述 */
  description?: string;
  /** 链接地址，支持内部路径或外部 URL */
  to?: string | RouteLocationRaw;
  /** 是否禁用 */
  disabled?: boolean;
}

// ✅ 使用 withDefaults 设置默认值
const props = withDefaults(
  defineProps<DocsPageCardProps>(),
  {
    disabled: false,
  }
);
```

### Emits 定义规范

```typescript
// ✅ 使用泛型定义，包含完整的类型信息
const emit = defineEmits<{
  (e: 'activate', payload: { event: Event; title?: string }): void;
  (e: 'close'): void;
}>();
```

### Slots 定义规范

```typescript
// ✅ 使用 defineSlots 定义 slot 类型
const slots = defineSlots<{
  /** 默认内容 */
  default(): VNode[];
  /** 标题区域 */
  title(): VNode[];
}>();
```

## 🎨 样式规范

### 样式配置对象

对于复杂组件，使用样式配置对象集中管理类名：

```typescript
// ✅ 静态样式：使用 const 对象
const styles = {
  root: 'flex items-center gap-2',
  title: 'text-lg font-semibold text-highlighted',
  description: 'text-sm text-muted',
};

// ✅ 动态样式：使用 computed
const styles = computed(() => ({
  root: [
    'flex items-center',
    props.variant === 'compact' && 'gap-1',
    props.variant === 'spacious' && 'gap-4',
  ].filter(Boolean).join(' '),
}));
```

### Tailwind 类使用规范

```vue
<!-- ✅ 使用语义化 Tailwind 类 -->
<div class="bg-default text-highlighted border-default">
  <p class="text-muted">辅助文本</p>
</div>

<!-- ❌ 避免硬编码颜色 -->
<div class="bg-blue-500 text-white">
  <p class="text-gray-500">辅助文本</p>
</div>
```

## 📚 现有组件一览

### App - 全局布局组件

| 组件 | 用途 |
|------|------|
| `AppLogo` | 品牌 Logo（SVG） |
| `AppHeader` | 顶部导航栏 |
| `AppHeaderMobileNav` | 移动端导航菜单 |

### Prose - 内容表达增强组件

增强 Markdown 内容本身的表达能力，在 `.md` 文件中用 `::` 语法调用。

| 组件 | MDC 语法 | 用途 |
|------|----------|------|
| `ProseA` | `[text](url)` | 链接渲染（区分内部/外部链接） |
| `ProseAccordion` | `::prose-accordion` | 可折叠面板 |
| `ProseAccordionItem` | `:::prose-accordion-item` | 折叠面板项 |
| `ProseAnnotation` | `:prose-annotation[text]{...}` | 术语注释 |
| `ProseCodeCard` | - | 代码展示卡片（copy + 可选 footer actions，支持默认 slot 直写 fenced code block） |
| `ProseInlineBlocks` | `::prose-inline-blocks` | 强制行内渲染 |
| `ProseLinkSwitch` | `:prose-link-switch{preset="env" path="/dashboard"}[text]` | 多链接选择器（环境切换等） |
| `ProseCarousel` | - | 轮播封装（基于 Nuxt UI `UCarousel` + 多种 triggers，支持 `#slide-n` 命名 slots） |
| `ProseTabs` | `::prose-tabs{sync="key" variant="pill"}` | 标签页容器（覆盖 Nuxt UI 默认实现）：支持横向滚动 tabs 头、左右按钮、激活项自动滚动、sync 与 TOC 集成 |
| `ProseTabsItem` | `:::prose-tabs-item{label="标签"}` | 标签页项 |

### Docs - 文档页面结构组件

构建文档页面的结构和布局，部分支持 MDC 语法调用。

| 组件 | MDC 语法 | 用途 |
|------|----------|------|
| `DocsPageCard` | `::docs-page-card` | 文档卡片 |
| `DocsPageGrid` | `::docs-page-grid` | 卡片网格 |
| `DocsResources` | `::docs-resources` | 资源链接列表 |
| `DocsResourceItem` | `::docs-resource-item` | 资源链接项 |
| `DocsToc` | - | 目录导航 |
| `DocsTocList` | - | 目录列表（内部） |

## ✅ 开发检查清单

### 新建组件前

- [ ] 确认组件前缀：全局布局用 `App`，内容表达增强用 `Prose`，页面结构用 `Docs`
- [ ] 确认组件放置目录
- [ ] 检查是否有可复用的现有组件

### 开发中

- [ ] 添加组件级 JSDoc 注释
- [ ] 导出 Props 接口（如需要外部使用）
- [ ] 使用 Section 分隔符组织代码（复杂组件）
- [ ] 使用语义化 Tailwind 类，不硬编码颜色
- [ ] 为 MDC 组件添加使用示例

### Code Review

- [ ] 命名符合前缀规范
- [ ] TypeScript 类型完整
- [ ] JSDoc 注释清晰
- [ ] 代码结构一致

## 📖 参考文档

- [Component Quality Checklist](../.cursor/rules/COMPONENT_CHECKLIST.md) - 组件质量检查清单
- [COMPOSABLES.md](../.cursor/rules/COMPOSABLES.md) - Composables 开发指南
- [Frontend Development Guidelines](../.cursor/rules/frontend-development-guidelines.mdc) - 前端开发规范
- [Nuxt UI Components](https://ui.nuxt.com/components) - Nuxt UI 组件库
- [Nuxt Content MDC](https://content.nuxt.com/usage/markdown) - MDC 语法文档

---

  > 💡 **保持简单**：规范的目的是提高一致性和可维护性，不是增加复杂度。对于简单组件，合理简化即可。

