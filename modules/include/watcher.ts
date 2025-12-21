import { utimesSync, existsSync, readFileSync } from "fs";
import { resolve, dirname, basename, relative } from "path";
import { glob } from "glob";
import type { Nuxt } from "@nuxt/schema";
import {
  createIncludeRegex,
  LOG_PREFIX,
} from "./processor";

/**
 * 依赖映射：partial 绝对路径 -> 引用它的主文件绝对路径集合
 */
const dependencyMap = new Map<string, Set<string>>();

/**
 * 防止循环触发：记录最近被 touch 的文件（3秒内不重复触发）
 */
const recentlyTouchedFiles = new Set<string>();

/**
 * 添加依赖关系到映射表
 */
function addDependency(
  partialPath: string,
  mainFilePath: string
): void {
  if (!dependencyMap.has(partialPath)) {
    dependencyMap.set(partialPath, new Set());
  }
  dependencyMap.get(partialPath)!.add(mainFilePath);
}

/**
 * 扫描所有主文件，建立 partial -> 主文件 的依赖映射
 *
 * @param contentDir - content 目录的绝对路径
 */
export async function buildDependencyMap(
  contentDir: string
): Promise<void> {
  dependencyMap.clear();

  // 查找所有非 _partials 的 .md 文件
  const mainFiles = await glob(`${contentDir}/**/*.md`, {
    ignore: [`${contentDir}/**/_partials/**`],
  });

  for (const mainFile of mainFiles) {
    try {
      const content = readFileSync(mainFile, "utf-8");
      const regex = createIncludeRegex();
      let match;

      while ((match = regex.exec(content)) !== null) {
        const relativeIncludePath = match[1]?.trim();
        if (!relativeIncludePath) continue;

        const partialAbsPath = resolve(
          dirname(mainFile),
          relativeIncludePath
        );
        addDependency(partialAbsPath, mainFile);
      }
    } catch {
      // 忽略读取错误
    }
  }

  console.log(
    `${LOG_PREFIX} Dependency map built: ${dependencyMap.size} partials tracked`
  );
}

/**
 * 当 partial 文件变化时，touch 依赖它的主文件以触发 HMR
 *
 * @param partialPath - partial 文件的绝对路径
 */
export function touchDependentFiles(
  partialPath: string
): void {
  const mainFiles = dependencyMap.get(partialPath);

  if (!mainFiles || mainFiles.size === 0) {
    console.log(
      `${LOG_PREFIX} No dependents for: ${basename(partialPath)}`
    );
    return;
  }

  for (const mainFile of mainFiles) {
    // 跳过最近被 touch 的文件，防止循环触发
    if (recentlyTouchedFiles.has(mainFile)) continue;
    if (!existsSync(mainFile)) continue;

    try {
      recentlyTouchedFiles.add(mainFile);
      setTimeout(
        () => recentlyTouchedFiles.delete(mainFile),
        3000
      );

      // 添加 50ms 偏移确保 mtime 变化被文件系统检测到
      const now = new Date(Date.now() + 50);
      utimesSync(mainFile, now, now);

      console.log(
        `${LOG_PREFIX} Touched: ${relative(process.cwd(), mainFile)}`
      );
    } catch (e) {
      console.error(
        `${LOG_PREFIX} Failed to touch ${mainFile}:`,
        e
      );
    }
  }
}

/**
 * 将 Nuxt Content 文件 ID 转换为实际文件系统路径
 *
 * @param fileId - Content 文件 ID (如 "docs_en/path/file.md" 或 "partials/path/file.md")
 * @param contentDir - content 目录的绝对路径
 * @returns 文件的绝对路径
 *
 * @example
 * ```ts
 * contentFileIdToPath("docs_en/guide/intro.md", "/project/content")
 * // => "/project/content/en/guide/intro.md"
 *
 * contentFileIdToPath("partials/en/_partials/tip.md", "/project/content")
 * // => "/project/content/en/_partials/tip.md"
 * ```
 */
export function contentFileIdToPath(
  fileId: string,
  contentDir: string
): string {
  // partials collection: partials/<path>
  const partialsMatch = fileId.match(/^partials\/(.+)$/);
  if (partialsMatch?.[1]) {
    return resolve(contentDir, partialsMatch[1]);
  }

  // docs collection: docs_<locale>/<path>
  const docsMatch = fileId.match(/^docs_([^/]+)\/(.+)$/);
  if (docsMatch?.[1] && docsMatch[2]) {
    return resolve(contentDir, docsMatch[1], docsMatch[2]);
  }

  // 绝对路径直接返回
  if (fileId.startsWith("/")) {
    return fileId;
  }

  // 默认：相对于 contentDir
  return resolve(contentDir, fileId);
}

/**
 * 更新单个主文件的依赖映射（运行时增量更新）
 *
 * @param fileId - Content 文件 ID
 * @param fileBody - 文件内容
 * @param contentDir - content 目录的绝对路径
 */
export function updateDependencyForFile(
  fileId: string,
  fileBody: string,
  contentDir: string
): void {
  const actualFilePath = contentFileIdToPath(
    fileId,
    contentDir
  );
  const regex = createIncludeRegex();
  let match;

  while ((match = regex.exec(fileBody)) !== null) {
    const relativeIncludePath = match[1]?.trim();
    if (!relativeIncludePath) continue;

    const partialAbsPath = resolve(
      dirname(actualFilePath),
      relativeIncludePath
    );
    addDependency(partialAbsPath, actualFilePath);
  }
}

/**
 * 设置 Nuxt Content hooks 以实现开发环境 HMR
 *
 * - afterParse: 当 partial 被解析时，touch 依赖它的主文件
 * - beforeParse: 当主文件被解析时，更新依赖映射
 *
 * @param nuxt - Nuxt 实例
 * @param contentDir - content 目录的绝对路径
 */
export function setupContentHooks(
  nuxt: Nuxt,
  contentDir: string
): void {
  // 当 partial 文件被解析后，触发依赖它的主文件更新
  nuxt.hook("content:file:afterParse", (ctx) => {
    const { file } = ctx;

    // 只处理 partials collection 中的文件
    if (!file.id.startsWith("partials/")) return;

    const actualPath = contentFileIdToPath(
      file.id,
      contentDir
    );
    console.log(
      `${LOG_PREFIX} Partial changed: ${basename(actualPath)}`
    );

    touchDependentFiles(actualPath);
  });

  // 当主文件被解析时，增量更新依赖映射
  nuxt.hook("content:file:beforeParse", (ctx) => {
    const { file } = ctx;
    if (!file.id.endsWith(".md") || !file.body) return;
    if (file.id.startsWith("partials/")) return;

    updateDependencyForFile(file.id, file.body, contentDir);
  });
}
