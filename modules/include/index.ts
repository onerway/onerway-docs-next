import {
  defineNuxtModule,
  createResolver,
} from "@nuxt/kit";
import { processIncludes, LOG_PREFIX } from "./processor";
import {
  buildDependencyMap,
  setupContentHooks,
  contentFileIdToPath,
} from "./watcher";

/**
 * 模块配置选项
 */
export interface ModuleOptions {
  /**
   * 是否启用模块
   * @default true
   */
  enabled: boolean;
}

/**
 * Nuxt Module: Markdown @include 语法支持
 *
 * 功能：
 * 1. 在 Markdown 中使用 `<!-- @include: ./path/to/file.md -->` 引入其他文件
 * 2. 开发环境自动 HMR：修改 partial 文件后，引用它的主文件自动更新
 *
 * 前置条件：
 * - 在 content.config.ts 中配置 `partials` 为 `data` collection
 *
 * @example
 * ```typescript
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['./modules/include'],
 *   contentInclude: {
 *     enabled: true, // 默认启用
 *   },
 * })
 * ```
 *
 * @example
 * ```markdown
 * // content/en/guide/intro.md
 * <!-- @include: ./_partials/common-setup.md -->
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-content-include",
    configKey: "contentInclude",
  },
  defaults: {
    enabled: true,
  },
  async setup(options, nuxt) {
    // 如果模块被禁用，直接返回
    if (!options.enabled) {
      console.log(`${LOG_PREFIX} Module disabled`);
      return;
    }

    const { resolve } = createResolver(import.meta.url);
    const contentDir = resolve(
      nuxt.options.rootDir,
      "content"
    );

    // 核心功能：在解析前处理 @include 语法
    nuxt.hook("content:file:beforeParse", (ctx) => {
      const { file } = ctx;
      if (!file.id.endsWith(".md") || !file.body) return;

      const actualFilePath = contentFileIdToPath(
        file.id,
        contentDir
      );
      file.body = processIncludes(
        file.body,
        actualFilePath
      );
    });

    // 开发环境：启用 HMR 支持
    if (nuxt.options.dev) {
      nuxt.hook("ready", async () => {
        await buildDependencyMap(contentDir);
        console.log(`${LOG_PREFIX} Ready (HMR enabled)`);
      });

      setupContentHooks(nuxt, contentDir);
    }
  },
});

// 导出类型和工具函数，供外部使用
export type { ModuleOptions as ContentIncludeOptions };
export {
  processIncludes,
  INCLUDE_REGEX,
} from "./processor";
