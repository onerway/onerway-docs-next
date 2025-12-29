import { readFileSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";

/**
 * @include 语法的正则表达式
 * 匹配: <!-- @include: ./path/to/file.md -->
 * 捕获组：
 * - $1: 行首的缩进（空格或 Tab）
 * - $2: 文件路径
 */
export const INCLUDE_REGEX =
  /^(\s*)<!--\s*@include:\s*(.+?)\s*-->$/gm;

/**
 * 创建新的 @include 正则实例（避免全局正则的 lastIndex 问题）
 */
export const createIncludeRegex = () =>
  new RegExp(INCLUDE_REGEX.source, "g");

/**
 * 日志前缀
 */
export const LOG_PREFIX = "[@include]";

/**
 * 最大递归深度，防止无限嵌套
 */
const MAX_DEPTH = 5;

/**
 * 给内容的每一行添加统一的缩进
 *
 * @param content - 要添加缩进的内容
 * @param indent - 缩进字符串（空格或 Tab）
 * @returns 添加缩进后的内容
 *
 * @example
 * ```typescript
 * applyIndent('line1\nline2', '  ')
 * // 返回: '  line1\n  line2'
 * ```
 */
function applyIndent(content: string, indent: string): string {
  // 无缩进，直接返回
  if (!indent) return content;

  return content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();

      // 空行保持空（不添加尾随空格）
      if (trimmed === '') return line;

      // Markdown 标题行不添加缩进（# 开头）
      if (/^#{1,6}\s/.test(trimmed)) return line;

      // 代码块标记不添加缩进（``` 开头）
      if (/^```/.test(trimmed)) return line;

      // Frontmatter 分隔符不添加缩进（--- 开头）
      if (/^---$/.test(trimmed)) return line;

      // 其他行添加缩进
      return indent + line;
    })
    .join('\n');
}

/**
 * 处理 Markdown 文件中的 @include 语法
 *
 * 将 `<!-- @include: ./path/to/file.md -->` 替换为目标文件内容，
 * 支持嵌套引用（最大深度 5 层）。
 *
 * **自动缩进功能：**
 * 被引入的内容会自动继承 @include 指令的缩进，这样可以正确处理 MDC 组件的嵌套。
 *
 * @example
 * ```markdown
 * // 主文件
 * ::prose-tabs
 *   <!-- @include: ./_partials/my-tab.md -->
 * ::
 *
 * // _partials/my-tab.md
 * :::prose-tabs-item{label="Tab 1"}
 * Content here
 * :::
 *
 * // 展开后（注意缩进自动继承）
 * ::prose-tabs
 *   :::prose-tabs-item{label="Tab 1"}
 *   Content here
 *   :::
 * ::
 * ```
 *
 * @param content - 原始文件内容
 * @param filePath - 当前文件的绝对路径
 * @param depth - 当前递归深度（内部使用）
 * @returns 处理后的内容，所有 @include 已被替换为对应文件内容（含缩进）
 */
export function processIncludes(
  content: string,
  filePath: string,
  depth = 0
): string {
  if (depth > MAX_DEPTH) {
    console.warn(
      `${LOG_PREFIX} Max depth (${MAX_DEPTH}) reached at: ${filePath}`
    );
    return content;
  }

  return content.replace(
    INCLUDE_REGEX,
    (_match, indent, includePath) => {
      const trimmedPath = includePath.trim();
      const absolutePath = resolve(
        dirname(filePath),
        trimmedPath
      );

      // 检查文件是否存在
      if (!existsSync(absolutePath)) {
        console.warn(
          `${LOG_PREFIX} File not found: ${absolutePath}`
        );
        return `${indent}<!-- [INCLUDE ERROR] File not found: ${trimmedPath} -->`;
      }

      // 检查是否是文件（而不是目录）
      try {
        const stat = statSync(absolutePath);
        if (!stat.isFile()) {
          console.warn(
            `${LOG_PREFIX} Not a file: ${absolutePath}`
          );
          return `${indent}<!-- [INCLUDE ERROR] Not a file: ${trimmedPath} -->`;
        }
      } catch {
        return `${indent}<!-- [INCLUDE ERROR] Cannot stat: ${trimmedPath} -->`;
      }

      // 读取并递归处理
      try {
        const includedContent = readFileSync(
          absolutePath,
          "utf-8"
        );
        const processedContent = processIncludes(
          includedContent,
          absolutePath,
          depth + 1
        );

        // 应用父级缩进到每一行
        return applyIndent(processedContent, indent);
      } catch (error) {
        console.error(
          `${LOG_PREFIX} Error reading ${absolutePath}:`,
          error
        );
        return `${indent}<!-- [INCLUDE ERROR] ${trimmedPath}: ${error} -->`;
      }
    }
  );
}
