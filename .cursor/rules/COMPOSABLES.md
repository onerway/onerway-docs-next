# Composables Registry

本文档记录了项目中所有组合式函数的用途、依赖关系和使用示例，用于避免重复开发和促进代码复用。

## 🏗️ 架构概览

```
composables/
├── shared/                    # 共享基础设施 (已实现)
│   ├── constants.ts          # 统一常量配置
│   ├── types.ts              # 统一类型定义
│   ├── utils.ts              # 统一工具函数
│   └── skeleton-utils.ts     # 骨架屏工具
├── useContentNavigation.ts   # 内容导航处理
├── useDocumentation.ts       # 文档系统管理
├── useDocumentationVersion.ts # 文档版本管理
├── useRecentPages.ts         # 最近页面追踪
└── useClipboard.ts           # 剪贴板操作
```

## 📋 现有组合式函数清单

### 🔧 Shared Infrastructure (已实现)

> ✅ **已完成**: 所有组合式函数共享的基础设施

| 模块                           | 状态      | 用途         | 主要功能                                  |
| ------------------------------ | --------- | ------------ | ----------------------------------------- |
| `composables/shared/constants` | ✅ 已实现 | 统一常量配置 | 模块配置、语言映射、版本配置、性能常量    |
| `composables/shared/types`     | ✅ 已实现 | 统一类型定义 | 基础类型、配置接口、模块信息、用户偏好    |
| `composables/shared/utils`     | ✅ 已实现 | 统一工具函数 | VueUse 集成、语言工具、缓存管理、路径解析 |

### Feature Composables

#### 🧭 useContentNavigation

- **文件**: `composables/useContentNavigation.ts`
- **复杂度**: 复杂 (单文件，800+ 行)
- **状态**: ✅ 已实现
- **用途**: 内容导航数据处理和扁平化
- **依赖**: VueUse (useMemoize, useStorage), shared 基础设施
- **特性**: 导航合并、容器跳过、路径简化、缓存优化

**API 接口**:

```typescript
const {
  mappedNavigation, // 映射后的导航数据
  filteredNavigation, // 过滤后的导航数据
  currentModule, // 当前模块
  getModuleNavigation, // 获取模块导航方法
} = useContentNavigation(allNavigations);
```

#### 📚 useDocumentation

- **文件**: `composables/useDocumentation.ts`
- **复杂度**: 复杂 (单文件，450+ 行)
- **状态**: ✅ 已实现
- **用途**: 文档页面和导航数据管理
- **依赖**: shared 基础设施，Nuxt Content API
- **特性**: 页面数据获取、导航处理、面包屑生成、TOC 管理

**API 接口**:

```typescript
const {
  page, // 页面数据
  navigation, // 导航数据
  breadcrumbs, // 面包屑导航
  tocLinks, // TOC 链接
  hasNavigation, // 是否显示导航
  hasToc, // 是否显示TOC
  currentVersion, // 当前版本
  isHomePage, // 是否首页
  getDebugInfo, // 调试信息
} = useDocumentation();
```

#### 🔖 useDocumentationVersion

- **文件**: `composables/useDocumentationVersion.ts`
- **复杂度**: 中等 (单文件，270+ 行)
- **状态**: ✅ 已实现
- **用途**: 文档版本管理和用户偏好
- **依赖**: shared 基础设施
- **特性**: 版本解析、用户偏好存储、版本切换路径构建

**API 接口**:

```typescript
const {
  currentModule, // 当前模块
  currentVersion, // 当前版本
  versionInfo, // 版本详细信息
  supportedVersions, // 支持的版本列表
  setUserPreferredVersion, // 设置用户偏好版本
  buildVersionedPath, // 构建版本路径
  getVersionSwitchPath, // 获取版本切换路径
} = useDocumentationVersion();
```

#### 📄 useRecentPages

- **文件**: `composables/useRecentPages.ts`
- **复杂度**: 复杂 (单文件，330+ 行)
- **状态**: ✅ 已实现
- **用途**: 最近访问页面跟踪和管理
- **依赖**: VueUse (useStorage, useDebounceFn),
  shared 基础设施
- **特性**: 页面信息生成、防抖添加、时间格式化、SSR 安全

**API 接口**:

```typescript
const {
  recentPages, // 原始最近页面数据
  formattedPages, // 格式化的页面数据
  recentThreePages, // 最近3个页面
  addCurrentPage, // 添加当前页面
  removePage, // 移除页面
  clearPages, // 清空页面
  stats, // 统计信息
} = useRecentPages();
```

#### 📋 useClipboard

- **文件**: `composables/useClipboard.ts`
- **复杂度**: 简单 (单文件，170+ 行)
- **状态**: ✅ 已实现
- **用途**: 剪贴板操作和提示管理
- **依赖**: VueUse (useClipboard)
- **特性**: 文本转换、Toast 提示、国际化支持

**API 接口**:

```typescript
const {
  copy, // 复制到剪贴板
  copied, // 复制状态
  isSupported, // 是否支持
  text, // 剪贴板内容
  copyCount, // 复制次数
} = useClipboard();
```

## 🔄 代码架构分析

### 已实现的优化模式

| 特性             | useContentNavigation | useDocumentation | useDocumentationVersion | useRecentPages | useClipboard |
| ---------------- | -------------------- | ---------------- | ----------------------- | -------------- | ------------ |
| **VueUse 集成**  | ✅ 多个工具          | ✅ 基础工具      | ✅ 共享存储             | ✅ 存储+防抖   | ✅ 原生API   |
| **共享基础设施** | ✅ 完整使用          | ✅ 完整使用      | ✅ 完整使用             | ✅ 完整使用    | ❌ 独立      |
| **缓存优化**     | ✅ TTL + 内存        | ✅ 异步数据      | ❌ 简单存储             | ❌ 简单存储    | ❌ 无        |
| **防抖/节流**    | ✅ 防抖缓存          | ✅ TOC 刷新      | ❌ 无                   | ✅ 页面添加    | ❌ 无        |
| **SSR 安全**     | ✅ 客户端存储        | ✅ 标准模式      | ✅ localStorage         | ✅ 条件执行    | ✅ 状态管理  |
| **类型安全**     | ✅ 完整类型          | ✅ 完整类型      | ✅ 完整类型             | ✅ 完整类型    | ✅ 完整类型  |
| **国际化支持**   | ✅ 多语言路径        | ✅ 面包屑本地化  | ❌ 路径构建             | ✅ 时间格式化  | ✅ 提示信息  |

### 设计模式应用

1. **🏗️ 三层架构**: shared → feature composables →
   components
2. **🔄 依赖注入**: 通过 shared/utils 注入通用功能
3. **📦 单一职责**: 每个 composable 专注特定功能
4. **🎯 配置驱动**: 通过 MODULE_CONFIG 统一管理模块信息
5. **⚡ 性能优化**: VueUse + 缓存 + 防抖的组合使用

## 📝 开发流程

### 新建组合式函数前的检查清单

- [ ] 🔍 **搜索现有**: 在此注册表和 `composables/`
      目录搜索类似功能
- [ ] 📋 **共享基础设施检查**: 确认 `composables/shared/`
      中是否有可复用的工具
- [ ] 🏗️ **复杂度评估**: 确定是否需要分离为模块化结构
- [ ] 🔄 **VueUse 集成**: 优先使用 VueUse 的成熟解决方案
- [ ] 📚 **文档更新**: 更新此注册表，记录新的组合式函数

### 代码审查关键问题

1. **"shared 基础设施够用吗？"** - 检查是否需要扩展共享工具
2. **"VueUse 有现成方案吗？"** - 优先使用成熟的 VueUse 功能
3. **"性能优化到位吗？"** - 确保合理使用缓存、防抖、记忆化
4. **"类型定义完整吗？"** - 遵循 shared/types 的类型规范
5. **"SSR 兼容吗？"** - 确保服务端渲染安全

## 🎯 发展建议

### 当前状态评估

**✅ 已完成的优秀实践**:

- 统一的共享基础设施
- VueUse 深度集成
- 完善的类型系统
- 性能优化模式
- SSR 安全实践

**🔧 可以优化的点**:

- useClipboard 可集成共享基础设施
- 部分缓存策略可以统一
- 错误处理可以更加一致

### 未来扩展方向

1. **🔍 搜索和过滤**:
   `useContentSearch()` - 基于当前导航系统
2. **🌐 国际化增强**: `useI18nContent()` - 内容翻译状态管理
3. **📊 分析追踪**: `useAnalytics()` - 用户行为分析
4. **🎨 主题管理**: `useThemeContent()` - 内容主题切换

## 📚 参考文档

- [Frontend Development Guidelines](./frontend-development-guidelines.mdc) - 完整开发规范
- [VueUse Documentation](https://vueuse.org/) -
  VueUse 官方文档
- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables) - 官方文档
- [Vue 3 Composition API](https://vuejs.org/guide/reusability/composables.html) -
  Vue 官方指南

---

> 💡
> **当前架构已经很成熟**: 基于 VueUse + 共享基础设施的三层架构提供了良好的可维护性和性能。新功能开发时请优先复用现有的 shared 基础设施！
