---
name: generate-commit-message
description: 根据当前改动生成符合 Conventional Commits 规范的中文 commit message 草稿，并可选择直接提交
argument-hint: [可选的 scope]
allowed-tools: Bash(git:*), Read, Grep, Glob, AskUserQuestion
---

# 用途
分析当前的 git 改动，生成符合项目 Conventional Commits 规范的中文 commit message 草稿，用户确认后可直接提交。

**可选参数**：`$ARGUMENTS` - 指定 scope（如组件名、模块名）

---

## 快速使用
```bash
# 自动分析并生成 commit message
/generate-commit-message

# 指定 scope
/generate-commit-message ProseA
/generate-commit-message i18n
```

---

## 工作流程
1. **检查 git 状态**：运行 `git status` 查看所有未跟踪和已修改的文件。
2. **查看改动**：运行 `git diff --staged` 和 `git diff` 查看已暂存和未暂存的改动。
3. **分析提交历史**：运行 `git log --oneline -10` 了解项目的提交信息风格。
4. **分析改动内容**：
  - 识别改动类型（新功能、修复、文档、重构等）
  - 确定影响范围（scope）
  - 总结主要改动点
5. **生成提交信息草稿**：
  - 格式：`<type>(<scope>): <subject>`
  - Body：使用 `-` bullet points 列出详细改动
  - Footer：如有 Breaking Changes 或关联 issue
6. **确认并提交**：
  - 向用户展示生成的 commit message
  - 询问用户是否确认提交
  - 如果确认：
    - 暂存所有改动（`git add .`）
    - 使用生成的 message 创建提交
    - 运行 `git status` 验证提交成功
  - 如果不确认：
    - 提供修改建议或让用户手动调整

---

## 提交信息规范

### Type 类型
  - **feat**: 新功能
  - **fix**: 修复 bug
  - **docs**: 文档更新
  - **style**: 代码格式（不影响代码运行）
  - **refactor**: 重构（既不是新功能也不是修复 bug）
  - **perf**: 性能优化
  - **test**: 测试相关
  - **chore**: 构建过程或辅助工具的变动

### Subject 规则
  - 使用动词开头（添加、更新、修复、移除、重构等）
  - 简明扼要（50-72 字符）
  - 不使用句号结尾
  - 使用中文（项目提交信息为中文）

### Body 规则
  - 使用 `-` 开头的 bullet points
  - 详细说明每个改动点
  - 解释"为什么"而不仅是"做了什么"
  - 可选但推荐添加

### Scope 规则
  - 组件名：ProseA, DocsToc, AppHeader
  - 模块名：i18n, content, layout
  - 功能区：docs, config, build
  - 可选，但推荐添加以提高可读性

---

## 示例输出

### 示例 1：组件功能添加
```
feat(ProseA): 为 MDC 链接添加徽章支持

- 引入 badge 属性，在链接上显示标签
- 在文本和图标之间添加 UBadge 组件渲染
- 增强链接样式，增加间距
- 保持完全向后兼容
```

### 示例 2：文档更新
```
docs(content): 更新支付集成指南

- 添加 webhook 设置说明
- 明确 API 认证步骤
- 修复损坏的内部链接
- 使用最新 SDK 版本更新代码示例
```

### 示例 3：Bug 修复
```
fix(DocsToc): 修复滚动监听未跟踪活动标题的问题

- 修复 intersection observer 阈值计算
- 纠正标题 ID 匹配逻辑
- 添加防抖以防止过度更新
```

### 示例 4：重构
```
refactor(composables): 将滚动逻辑提取到 useDocsScroll

- 将滚动行为从布局移至组合式函数
- 提高跨组件代码复用性
- 使用适当接口增强类型安全
- 无功能性改动
```

---

## 输出格式
  生成的提交信息应：
  1. **标题行**：清晰的 type(scope): subject
  2. **空行**
  3. **Body**：bullet points 列出具体改动
  4. **空行**
  5. **Footer**（如需要）：Breaking Changes 或 Closes #issue

  完整格式示例：
```
feat(ProseTabs): 添加 localStorage 同步和自动滚动

- 实现跨页面重载的标签状态持久化
- 在溢出模式下添加自动滚动到活动标签
- 通过触摸手势增强移动端响应性
- 与 TOC 集成实现动态内容更新

Closes #45
```

---

## 自动提交流程
生成 commit message 后：
1. **展示草稿**：完整显示生成的提交信息
2. **用户确认**：询问用户是否满意并确认提交
3. **执行提交**：
   - ✅ 确认：自动暂存所有改动并提交
   - ❌ 取消：可以请求调整或手动编辑
4. **验证结果**：显示 git 状态确认提交成功

## 注意事项
- 提交信息使用**中文**（项目规范）
- 确保分析**所有改动**，不仅是最新的
- 如果改动涉及多个类型，建议拆分为多个提交
- Breaking Changes 必须在 footer 中注明
- 保持简洁但信息完整
- **⚠️ 确认后会自动暂存并提交所有改动**，请谨慎确认

---

## 深入资料
  - Conventional Commits: https://www.conventionalcommits.org/
  - 项目规范：`CLAUDE.MD` 中的 "Git Commit 规范"
