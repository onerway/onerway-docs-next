import {
  defineNuxtModule,
  createResolver,
} from "@nuxt/kit";

const LOG_PREFIX = "[task-list]";

/**
 * 模块配置选项
 */
export interface ModuleOptions {
  /** 是否启用模块 */
  enabled?: boolean;
}

/**
 * Nuxt Module: Task List 交互支持
 *
 * 功能：
 * 1. 注册 transformer 将 task list checkbox 转换为 Vue 组件
 * 2. 支持用户交互和 localStorage 持久化
 *
 * 注意：修改 taskList.enabled 配置后需要重启服务器并清除缓存：
 * rm -rf .nuxt .data && pnpm dev
 *
 * @example
 * ```typescript
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['./modules/task-list'],
 *   taskList: {
 *     enabled: true, // 默认启用
 *   },
 * })
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-content-task-list",
    configKey: "taskList",
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) {
      console.log(`${LOG_PREFIX} Module disabled`);
      return;
    }

    const { resolve } = createResolver(import.meta.url);

    // 注册 transformer
    nuxt.options.content = nuxt.options.content || {};
    nuxt.options.content.build =
      nuxt.options.content.build || {};
    nuxt.options.content.build.transformers =
      nuxt.options.content.build.transformers || [];

    // 添加 transformer 路径
    const transformerPath = resolve("./transformer");
    if (
      !nuxt.options.content.build.transformers.includes(
        transformerPath
      )
    ) {
      nuxt.options.content.build.transformers.push(
        transformerPath
      );
    }

    console.log(
      `${LOG_PREFIX} Module enabled, transformer: ${transformerPath}`
    );
  },
});

// 导出类型
export type { ModuleOptions as TaskListOptions };
