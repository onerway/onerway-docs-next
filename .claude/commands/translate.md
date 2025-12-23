---
name: translate
description: 快速翻译 Onerway 文档（英文 ↔ 中文），使用意译/重写而非直译
argument-hint: <源文件路径> [目标文件路径]
allowed-tools: Read, Write, Grep, Glob, Bash(git:*)
---

# 用途
翻译单个 Onerway 文档（英 ↔ 中），使用意译/重写，保持结构与代码不变。完整流程由 `document-translator` Skill 执行。

**源文件**：`$ARGUMENTS`

未提供路径时，先列出最近修改的内容文件供选择。

---

## 快速使用
```bash
# 英 → 中（自动推断目标路径）
/translate content/en/guide/quick-start.md

# 中 → 英
/translate content/zh_cn/api/payments.md

# 指定目标路径
/translate content/en/overview.md content/zh_cn/overview.md
```

---

## 行为说明
- 自动识别翻译方向；未给目标路径时按 `content/en/…` ↔ `content/zh_cn/…` 互换生成。
- 读取源文件后交由 `document-translator` Skill，严格复用规则/术语表。
- 目标已存在时需确认是否覆盖。
- 写入完成后报告源/目标路径与方向。

---

## 翻译准则（简版）
- 意译、简洁、专业；避免“你可以/需要”。
- 结构不变：标题层级、列表/表格、MDC 组件、代码块。
- 不翻译：代码、变量/端点/URL、品牌与通用技术术语（详见术语表）。
- 必翻译：frontmatter 的 `title`、`description`，正文及链接文本（URL 保持）。

---

## 深入资料
- `.claude/skills/document-translator/SKILL.md`（流程与职责）
- `.claude/skills/document-translator/terminology.md`（术语表）
- `.claude/skills/document-translator/examples.md`（示例）
- `.claude/skills/document-translator/rules/en-to-zh.md` 与 `rules/zh-to-en.md`（方向规则）
