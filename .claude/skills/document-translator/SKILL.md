---
name: document-translator
description: 为 Onerway 文档进行专业的双语翻译和内容同步。使用意译和重写而非直译，确保术语一致性和专业性。当用户提到"翻译文档"、"同步双语内容"、"translate"时使用此 Skill。
---

# Onerway 文档翻译 Skill

为 Onerway 文档提供英 ↔ 中翻译与内容同步。重点是**意译/重写**，保持结构与代码不变。

---

## 使用时机
- 用户提到“翻译文档/同步双语/translate”。
- `translate` 命令会自动调用此 Skill。

## 输入
- **必选**：源文件路径（`content/en/...` 或 `content/zh_cn/...`）。
- **可选**：目标路径（未提供则自动按目录互换生成）。

## 工作流程
1. **读取**源文件，识别语言与方向。
2. **确定目标路径**：使用用户提供路径，否则在 `en ↔ zh_cn` 间互换生成。
3. **覆盖确认**：目标已存在时先询问。
4. **翻译执行**：
   - 应用方向规则：`rules/en-to-zh.md` 或 `rules/zh-to-en.md`。
   - 强制遵循术语表 `terminology.md`；遇到新术语先补充。
   - 结构锁定：标题层级、列表/表格、MDC 组件、代码块位置与内容保持。
   - frontmatter 的 `title`、`description` 必翻译；URL 不改，链接文本翻译。
5. **写入**目标文件并报告源/目标、方向、覆盖情况。

## 快速规则
- 共同守则：意译/重写；语言简洁专业；不翻译代码、变量、端点、URL、品牌与通用技术术语。
- 英 → 中：删除“you can/need to”；用祈使句；中文标点；避免人称代词。详见 `rules/en-to-zh.md`。
- 中 → 英：主动语态优先；补全主语/冠词；自然技术写作；避免中式英语。详见 `rules/zh-to-en.md`。

## 质量检查（交付前）
- 格式：frontmatter 合法；标题层级一致；MDC 组件和代码块语法正确。
- 内容：代码与专有名词原样；术语按术语表；列表/表格结构未变；链接文本翻译且 URL 保留。
- 语言：流畅、简洁、专业；SEO 描述 50-160 字符。

## 资源索引
- `terminology.md`：术语与翻译策略。
- `rules/en-to-zh.md`、`rules/zh-to-en.md`：方向规则。
- `examples.md`：完整示例对照。

## 维护
- 新术语先更新 `terminology.md`，再执行翻译。
- 发现新模式或常见误差时补充对应规则和示例。
- 对齐项目规范：`CLAUDE.MD`、`content/CLAUDE.MD`。
