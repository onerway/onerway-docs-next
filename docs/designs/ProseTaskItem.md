# ProseTaskItem 设计文档

可交互的任务列表项组件，将 GFM task list checkbox 转换为可交互组件。

---

## 实现状态

  **MVP 完成** ✅（2025-12-25）

---

## 组件概述

| 属性 | 值 |
|------|-----|
| 组件名 | `ProseTaskItem` |
| 类型 | Prose（内容增强） |
| 来源 | 自研（非 Nuxt UI 封装） |
| 依赖 | `UCheckbox`（Nuxt UI） |
| 调研文档 | `investigations/task-list-investigation.md` |

---

## API 设计

### Props

  | Prop | 类型 | 默认值 | 说明 |
  |------|------|--------|------|
  | `id` | `string` | **必填** | 任务唯一标识符（由 transformer 生成） |
  | `initialChecked` | `boolean` | `false` | 初始勾选状态（来自 Markdown） |

### Slots

  | Slot | 说明 |
  |------|------|
  | `default` | 任务描述文字（checkbox 后面的内容） |

### 事件

  组件不对外暴露事件，状态变更直接持久化到 localStorage。

---

## 文件结构

```
modules/task-list/
├── index.ts          # Nuxt 模块入口（注册 transformer）
└── transformer.ts    # Nuxt Content Transformer（转换 minimark AST）

app/components/content/
└── ProseTaskItem.vue # 可交互任务项组件
```

---

## Transformer 实现

### 技术选型

  使用 **Nuxt Content Transformer** 而非 rehype 插件，因为：

  - Nuxt Content 3 使用 `minimark` 格式存储解析后的 Markdown
  - `minimark` 是数组结构：`["tagName", {props}, ...children]`
  - 非标准 HAST，rehype 插件无法直接处理

### 转换流程

```
Markdown: - [ ] Task description
    ↓ remark-gfm
minimark: ["li", {}, ["input", {type:"checkbox", disabled:true}], " Task"]
    ↓ transformer.ts
minimark: ["li", {}, ["ProseTaskItem", {id:"xxx", initialChecked:false}, " Task"]]
    ↓ Vue 渲染
HTML: <li><label><UCheckbox />Task</label></li>
```

### ID 生成策略

  **格式**：`${routePath}-${taskIndex}`

  **示例**：
  - 文件：`content/en/1.get-started/.../4.go-live-checklist.md`
  - 生成 ID：`get-started-start-building-start-developing-go-live-checklist-0`

  **特点**：
  - ✅ 可读性好（包含文档路径信息）
  - ✅ 稳定性好（基于文件位置和任务索引）
  - ⚠️ 文档重命名会导致 ID 变化（已有状态会丢失）

### 核心代码

```typescript
// modules/task-list/transformer.ts
import { defineTransformer } from "@nuxt/content";

const COMPONENT_NAME = "ProseTaskItem";

// minimark 节点类型
type MinimarkNode = [string, Record<string, unknown>, ...(string | MinimarkNode)[]];

export default defineTransformer({
  name: "task-list",
  extensions: [".md"],
  transform(file) {
    const body = file.body as { type: string; value: (string | MinimarkNode)[] };
    if (!body || body.type !== "minimark") return file;

    const routePath = filePathToRoutePath(file.id || "");
    visitAndTransform(body.value, routePath, { taskIndex: 0 });
    return file;
  },
});
```

---

## 组件实现

### 完整代码

```vue
<!-- app/components/content/ProseTaskItem.vue -->
<script setup lang="ts">
/**
 * ProseTaskItem - 可交互的任务列表项组件
 *
 * 由 task-list transformer 自动注入，无需手动使用
 */

export interface ProseTaskItemProps {
  id: string;
  initialChecked?: boolean;
}

const props = withDefaults(defineProps<ProseTaskItemProps>(), {
  initialChecked: false,
});

const isChecked = ref(props.initialChecked);
const storageKey = computed(() => `task-${props.id}`);

onMounted(() => {
  if (!import.meta.client) return;

  const savedValue = localStorage.getItem(storageKey.value);
  if (savedValue !== null) {
    isChecked.value = savedValue === "true";
  }

  watch(isChecked, (newValue: boolean) => {
    localStorage.setItem(storageKey.value, String(newValue));
  });
});
</script>

<template>
  <label class="inline-flex items-start gap-1 cursor-pointer select-none">
    <UCheckbox
      v-model="isChecked"
      :ui="{
        root: 'inline-flex items-center translate-y-1',
        base: 'shrink-0 size-4',
        wrapper: 'hidden',
      }" />
    <span class="flex-1">
      <slot />
    </span>
  </label>
</template>
```

### 关键设计点

| 设计点 | 实现方式 |
|--------|----------|
| SSR 安全 | `import.meta.client` + `onMounted` |
| 状态优先级 | localStorage > Markdown 初始值 |
| 点击区域 | `<label>` 包装，支持点击文字触发勾选 |
| 主题集成 | 使用 `UCheckbox` 组件 |
| 样式对齐 | `translate-y-1` 对齐文字基线 |

---

## 状态持久化

### 存储方案

  | 方案 | 适用场景 | 当前状态 |
  |------|----------|----------|
  | localStorage | 单用户、少量任务 | ✅ 已实现 |
  | IndexedDB | 大量任务、离线需求 | 待定 |
  | 云端同步 | 多设备、协作场景 | 待定 |

### localStorage 实现

  **Key 格式**：`task-${id}`

  **Value**：`"true"` 或 `"false"`

  **初始化流程**：

```
1. 组件挂载
2. 检查 localStorage 是否有已保存的值
   - 有：使用保存的值
   - 无：使用 props.initialChecked
3. 监听状态变更，自动保存
```

---

## 交互规范

### 触发方式

- ✅ 点击 checkbox
- ✅ 点击任务描述文字
- ✅ 键盘操作（Space/Enter，由 UCheckbox 内置支持）

### 视觉反馈

- 勾选/取消时的过渡动画（由 UCheckbox 提供）
- 深色模式自动适配（由 Nuxt UI 主题系统）

### 待实现

- [ ] 勾选时的弹跳动画
- [ ] 移动端触摸优化

---

## 无障碍支持

### 当前支持

  | 特性 | 状态 | 说明 |
  |------|------|------|
  | 键盘导航 | ✅ | UCheckbox 内置 |
  | 屏幕阅读器 | ✅ | 语义化 label + checkbox |
  | 焦点可见 | ✅ | UCheckbox 内置 focus-visible |

### 待完善

  - [ ] `aria-label` 动态描述
  - [ ] 状态变更播报 (`aria-live`)
  - [ ] 高对比度模式测试

---

## 样式集成

### 全局样式（可选）

```css
/* app/assets/css/main.css */
.prose ul.contains-task-list {
  list-style: none;
  padding-left: 0;
}

.prose ul.contains-task-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
```

### 深色模式

通过 Nuxt UI 主题系统自动支持，无需额外配置。

---

## 模块配置

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: [
    // ...
    "./modules/task-list",
  ],
  taskList: {
    enabled: true, // 默认启用
  },
});
```

### 禁用模块

  方式 1：配置文件

```typescript
taskList: {
  enabled: false,
}
```

  方式 2：环境变量（推荐，避免缓存问题）

```bash
TASK_LIST_ENABLED=false pnpm dev
```

---

## 实现路线图

### 阶段 1：MVP ✅

- [x] Nuxt Content Transformer
- [x] ProseTaskItem 组件
- [x] localStorage 持久化
- [x] 点击文字触发勾选

### 阶段 2：体验优化（待定）

- [ ] 勾选动画反馈
- [ ] 移动端触摸优化
- [ ] 完善无障碍支持

### 阶段 3：增强功能（待定）

- [ ] `ProseTaskList` 容器组件
- [ ] 进度统计和显示
- [ ] 批量操作（全选/取消）
- [ ] `useTaskList` composable

### 阶段 4：高级功能（待定）

- [ ] IndexedDB 支持
- [ ] 云端同步
- [ ] 导入/导出
- [ ] 撤销/重做

---

## 参考文件

  | 文件 | 作用 |
  |------|------|
  | `modules/task-list/index.ts` | Nuxt 模块入口 |
  | `modules/task-list/transformer.ts` | AST 转换逻辑 |
  | `app/components/content/ProseTaskItem.vue` | 组件实现 |
  | `app/components/content/ProseTabs.vue` | localStorage 模式参考 |

---

*文档创建时间：2025-12-25*
*基于项目版本：Nuxt 4.2.1 + @nuxt/content 3.8.0 + Nuxt UI 4.1.0*

