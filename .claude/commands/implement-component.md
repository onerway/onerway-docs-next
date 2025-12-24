---
name: implement-component
description: 根据设计文档实现 Vue 组件
argument-hint: <ComponentName>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git:*)
---

# 用途

根据 `docs/designs/{ComponentName}.md` 设计文档实现 Vue 组件。

**组件名**：`$ARGUMENTS`

未提供组件名时，列出 `docs/designs/` 下的设计文档供选择。

---

## 快速使用

```bash
# 实现 ProseTabs 组件
/implement-component ProseTabs

# 实现 ProseAccordionGrid 组件
/implement-component ProseAccordionGrid
```

---

## 工作流程

1. **读取设计文档**
   - 从 `docs/designs/{ComponentName}.md` 读取完整设计
   - 提取 API 设计（props/slots/events）
   - 提取依赖清单
   - 提取实现建议

2. **读取参考组件**（如设计文档中有标注）
   - 读取类似组件的实现（如 ProseAccordion.vue）
   - 学习项目的代码模式

3. **生成组件代码**
   - 创建 `app/components/content/{ComponentName}.vue`
   - 包含：
     - TypeScript 接口定义
     - Props / Slots 定义
     - 组合式 API 逻辑
     - 模板
     - 样式（如需要）
   - 遵循设计文档中的所有约束

4. **更新组件索引**
   - 按设计文档建议更新 `app/components/README.md`
   - 添加组件到对应的表格（App/Prose/Docs）

5. **代码质量检查**（可选）
   - 检查 TypeScript 类型
   - 检查可访问性（ARIA）
   - 检查 i18n 支持
   - 提示是否需要运行 code-reviewer

---

## 设计原则

- **TypeScript**：完整的类型定义
- **Vue 3**：组合式 API
- **可访问性**：ARIA 标签、键盘导航
- **响应式**：支持移动端
- **国际化**：支持 i18n（如需要）
- **SSR**：考虑服务端渲染

---

## 输出示例

```
✅ 组件已创建：app/components/content/ProseTabs.vue
✅ README 已更新：app/components/README.md
📋 设计文档：docs/designs/ProseTabs.md

下一步：
1. 测试组件功能
2. 添加 MDC 示例（如设计文档中标记为 TODO）
3. 可选：运行 /review-md 检查文档质量
```

---

## 注意事项

- 如果设计文档不存在，提示用户先运行 component-designer agent
- 如果组件已存在，询问是否覆盖
- 如果设计文档中有待确认项（❓），先与用户确认再实现
- 如果依赖的组件不存在，提示用户先实现依赖

---

## 相关资源

- 设计文档目录：`docs/designs/`
- 组件目录：`app/components/content/`
- 组件索引：`app/components/README.md`
- 项目规范：`CLAUDE.md`
