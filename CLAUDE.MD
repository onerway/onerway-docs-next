# Onerway 文档项目

## 项目概述
这是一个为 Onerway 构建的多语言文档站点，基于 Nuxt 4 和 Nuxt Content。该项目为 Onerway 支付平台提供全面的文档，支持英语和简体中文。

## 技术栈
- **框架**: Nuxt 4.2.1
- **内容管理**: @nuxt/content 3.8.0
- **UI 框架**: @nuxt/ui 4.1.0
- **国际化**: @nuxtjs/i18n 10.2.0
- **样式**: 自定义 CSS 配合 Nuxt UI 组件
- **图标**: @nuxt/icon 支持自定义图标
- **图片**: @nuxt/image 用于图片优化
- **字体**: @nuxt/fonts
- **开发工具**: TypeScript、ESLint、Vite

## 项目结构

```
onerway-docs-next2/
├── app/
│   ├── assets/
│   │   ├── css/           # 全局样式
│   │   └── icons/         # 自定义图标集合
│   ├── components/
│   │   ├── content/       # 内容相关组件
│   │   │   ├── DocsPageCard.vue
│   │   │   ├── DocsPageGrid.vue
│   │   │   ├── DocsResourceItem.vue
│   │   │   ├── DocsResources.vue
│   │   │   ├── DocsToc.vue
│   │   │   ├── DocsTocList.vue
│   │   │   ├── ProseA.vue
│   │   │   ├── ProseAccordion.vue
│   │   │   ├── ProseAccordionItem.vue
│   │   │   ├── ProseAnnotation.vue
│   │   │   ├── ProseCodeCard.vue
│   │   │   ├── ProseInlineBlocks.vue
│   │   │   ├── ProseLinkSwitch.vue
│   │   │   ├── carousel/
│   │   │   │   ├── ProseCarousel.vue
│   │   │   │   └── triggers/
│   │   │   │       ├── ProseCarouselTriggerDots.vue
│   │   │   │       ├── ProseCarouselTriggerNumbers.vue
│   │   │   │       ├── ProseCarouselTriggerProgress.vue
│   │   │   │       ├── ProseCarouselTriggerTabs.vue
│   │   │   │       └── ProseCarouselTriggerThumbnails.vue
│   │   │   ├── ProseTabs.vue
│   │   │   └── ProseTabsItem.vue
│   │   ├── header/        # 头部导航组件
│   │   │   ├── AppHeader.vue
│   │   │   └── AppHeaderMobileNav.vue
│   │   └── AppLogo.vue
│   ├── composables/
│   │   ├── useDocsNav.ts  # 文档导航逻辑
│   │   ├── useDocsScroll.ts # 哈希导航滚动行为
│   │   └── useScrollSpy.ts # TOC 滚动跟踪
│   ├── layouts/
│   │   └── docs.vue       # 主文档布局
│   ├── pages/
│   │   └── [...slug].vue  # 内容页面的通配路由
│   ├── types/
│   │   └── injection-keys.ts
│   ├── app.config.ts
│   └── app.vue
├── content/
│   ├── en/                # 英文文档
│   │   ├── 1.get-started/
│   │   └── ...
│   └── zh_cn/             # 中文文档
│       ├── 1.get-started/
│       ├── 2.payments/
│       └── ...
├── i18n/
│   └── locales/
│       ├── en.json        # 英文 UI 翻译
│       └── zh_cn.json     # 中文 UI 翻译
├── content.config.ts      # Content 模块配置
├── nuxt.config.ts         # Nuxt 配置
└── package.json
```

## 核心功能

### 1. 多语言支持
- 支持两种语言：英语（en）和简体中文（zh_cn）
- 策略：`no_prefix` - 无 URL 前缀的语言检测
- 每种语言有独立的内容目录
- 通过 i18n JSON 文件提供 UI 翻译

### 2. 内容管理
- 使用 Nuxt Content 的基于文件的内容管理
- Markdown 文件支持 YAML frontmatter
- 导航结构通过 `.navigation.yml` 文件定义
- 自动生成目录（深度：4，搜索深度：6）

### 3. 文档布局
- 响应式文档布局，带侧边栏导航
- 带滚动监听的目录
- 移动端优化导航
- 带语言切换器的头部

### 4. 自定义组件
- **DocsResources/DocsResourceItem**：展示资源链接
- **DocsPageCard/DocsPageGrid**：卡片式内容展示
- **DocsToc/DocsTocList**：带滚动跟踪的动态目录
- **ProseA**：链接渲染，自动区分内部/外部链接并显示图标
- **ProseAccordion/ProseAccordionItem**：可展开的内容区块
- **ProseAnnotation**：块级注释，支持悬停提示（使用 `::` 语法）
- **ProseCodeCard**：可复用的代码展示卡片，带复制按钮和可选的底部操作（支持默认插槽的代码块）
- **ProseCarousel / ProseCarouselTrigger\***：Nuxt UI `UCarousel` 的封装组件，支持多种触发器变体和 `#slide-n` 命名插槽
- **ProseInlineBlocks**：强制块级元素在同一行内联渲染
- **ProseLinkSwitch**：多链接选择器，支持预设（如沙盒/生产环境的商户后台切换）
- **ProseTabs/ProseTabsItem**：增强的标签页组件，支持多种变体（pill、link、underline、segment），localStorage 同步，可滚动的标签页头部（带左右控制），自动滚动到活动标签，以及动态 TOC 集成
- **AppHeader**：主导航头部
- **AppHeaderMobileNav**：移动端友好的导航菜单
- **AppLogo**：应用 Logo 组件

### 5. 组合式函数
- **useDocsNav**：管理文档导航状态和结构
- **useScrollSpy**：跟踪滚动位置以高亮 TOC
- **useDocsScroll**：处理文档布局中的哈希导航滚动行为

## 开发指南

### 安装依赖
```bash
pnpm install
```

### 开发服务器
```bash
pnpm dev
# 运行于 http://localhost:3000
```

### 生产构建
```bash
pnpm build
```

### 预览生产构建
```bash
pnpm preview
```

## 内容组织

### 内容结构
- 内容按数字组织（1.get-started、2.payments 等）
- 每个部分可以有 `.navigation.yml` 文件进行自定义导航
- Markdown 文件支持 frontmatter 元数据

### 添加新内容
1. 在相应语言目录中创建 markdown 文件
2. 添加 frontmatter，包含标题、描述等
3. 如需自定义导航，更新 `.navigation.yml`
4. 内容将自动出现在导航中

### 导航文件
`.navigation.yml` 文件定义每个部分的导航项结构和顺序。

## 配置说明

### Nuxt 配置（`nuxt.config.ts`）
- 内容深度配置
- i18n 设置
- 模块配置
- 组件自动导入设置
- 图标配置，支持自定义图标集

### Content 配置（`content.config.ts`）
- Content 模块特定配置

### App 配置（`app.config.ts`）
- 应用级配置
- UI 主题设置

## Git Commit 规范

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 基本格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型
- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码格式（不影响代码运行）
- **refactor**: 重构（既不是新功能也不是修复 bug）
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

### 规则
- **subject**: 简明扼要描述改动（动词开头，50-72 字符）
- **scope**: 可选，影响范围（如组件名、模块名）
- **body**: 可选但推荐，使用 `-` bullet points 详细说明每个改动
- **footer**: 可选，Breaking Changes 或关联 issue

### 示例
```
feat(ProseA): add badge support for MDC links

- Introduced badge prop to display labels on links
- Added UBadge component rendering between text and icons
- Enhanced link styling with increased gap spacing
- Maintained full backward compatibility

Closes #123
```

## Git 状态
当前分支：`main`

最近的重要变更：
- 更新 README 并移除未使用的 DocsToc 组件
- 重构文档组件并增强国际化支持
- 添加多语言支持并增强文档结构
- 添加 DocsToc 和 ProseAccordion 组件及完整文档
- 增强配置和布局以改善用户体验

## 开发规范

### 组件开发
- 将内容相关的组件放在 `app/components/content/` 目录
- 使用 TypeScript 确保类型安全
- 遵循 Vue 3 组合式 API 模式
- 尽可能使用 Nuxt UI 组件
- **命名规范**：根据组件类型使用前缀：
  - `App` - 全局布局（Header、Logo、Sidebar）
  - `Prose` - 内容表达增强（Accordion、Annotation）
  - `Docs` - 页面结构（PageCard、Toc、Resources）
- 详细指南请参考 `app/components/README.md`

### 样式规范
- 全局样式位于 `app/assets/css/main.css`
- 使用 Nuxt UI 的工具类
- 需要时使用组件作用域样式

### 组合式函数
- 在 `app/composables/` 目录中创建可复用逻辑
- 使用正确的 TypeScript 类型
- 遵循 Vue 组合式函数模式

### 内容编写
- 使用 Markdown 编写，包含 frontmatter
- 使用正确的标题层级（h1-h4）
- 正确引用内部链接
- 添加 SEO 元数据

## 最佳实践

1. **类型安全**：在整个项目中使用 TypeScript
2. **组件结构**：保持组件专注和可复用
3. **性能优化**：利用 Nuxt 的自动导入和代码分割
4. **可访问性**：确保使用正确的语义化 HTML 和 ARIA 标签
5. **移动优先**：为移动端设计，为桌面端增强
6. **国际化**：保持各语言翻译同步
7. **内容质量**：维护一致的文档结构

## 重要说明

- 项目使用 Nuxt 4（最新版本）
- 内容深度设置为 4，用于 TOC 生成
- 自定义图标存储在 `app/assets/icons/`
- 语言检测是自动的（无 URL 前缀）
- 默认语言是英语

## 故障排查

### 常见问题
1. **内容不显示**：检查 `.navigation.yml` 结构
2. **i18n 问题**：验证语言文件格式是否正确
3. **构建错误**：清除 `.nuxt` 目录并重新构建
4. **样式问题**：检查 `nuxt.config.ts` 中的 CSS 导入顺序

## 相关资源
- [Nuxt 文档](https://nuxt.com/docs)
- [Nuxt Content](https://content.nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Nuxt i18n](https://i18n.nuxtjs.org/)
