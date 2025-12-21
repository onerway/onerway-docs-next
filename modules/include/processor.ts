import { readFileSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";

/**
 * @include 语法的正则表达式
 * 匹配: <!-- @include: ./path/to/file.md -->
 */
export const INCLUDE_REGEX =
  /<!--\s*@include:\s*(.+?)\s*-->/g;

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
 * 处理 Markdown 文件中的 @include 语法
 *
 * 将 `<!-- @include: ./path/to/file.md -->` 替换为目标文件内容，
 * 支持嵌套引用（最大深度 5 层）。
 *
 * @example
 * ```markdown
 * <!-- @include: ./_partials/checklist.md -->
 * ```
 *
 * @param content - 原始文件内容
 * @param filePath - 当前文件的绝对路径
 * @param depth - 当前递归深度（内部使用）
 * @returns 处理后的内容，所有 @include 已被替换为对应文件内容
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
    (_match, includePath) => {
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
        return `<!-- [INCLUDE ERROR] File not found: ${trimmedPath} -->`;
      }

      // 检查是否是文件（而不是目录）
      try {
        const stat = statSync(absolutePath);
        if (!stat.isFile()) {
          console.warn(
            `${LOG_PREFIX} Not a file: ${absolutePath}`
          );
          return `<!-- [INCLUDE ERROR] Not a file: ${trimmedPath} -->`;
        }
      } catch {
        return `<!-- [INCLUDE ERROR] Cannot stat: ${trimmedPath} -->`;
      }

      // 读取并递归处理
      try {
        const includedContent = readFileSync(
          absolutePath,
          "utf-8"
        );
        return processIncludes(
          includedContent,
          absolutePath,
          depth + 1
        );
      } catch (error) {
        console.error(
          `${LOG_PREFIX} Error reading ${absolutePath}:`,
          error
        );
        return `<!-- [INCLUDE ERROR] ${trimmedPath}: ${error} -->`;
      }
    }
  );
}
