/**
 * 共享工具函数
 * 基于 VueUse 的成熟解决方案
 */

import type { ContentNavigationItem } from "@nuxt/content";

import type {
  Awaitable,
  EventHookOff,
  EventHookOn,
  EventHookTrigger,
  MaybeRefOrGetter,
} from "@vueuse/core";

import type {
  ContentLocale,
  DebugInfo,
  SupportedLocale,
  SupportedModule,
} from "./types";

import {
  createEventHook,
  tryOnMounted,
  tryOnUnmounted,
  until,
  useAsyncState,
  useCounter,
  useDebounceFn,
  useMemoize,
  useStorage,
  useThrottleFn,
  useTimeAgo,
  useTimestamp,
  useToggle,
  watchDebounced,
  watchThrottled,
  whenever,
} from "@vueuse/core";
import {
  ADDITIONAL_CATEGORY_CONFIG,
  CONTENT_LOCALE_MAP,
  DEBUG_CONFIG,
  DOMAIN_COLLECTION_MAP,
  LANGUAGE_SUFFIX_MAP,
  LOCALE_MAP,
  MODULE_CONFIG,
  PATH_MAPPING_CONFIG,
  SKIP_PATHS,
  STORAGE_KEYS,
  TIME_COLOR_THRESHOLDS,
} from "./constants";

// ==================== 导出 VueUse 工具函数 ====================

// 防抖和节流 - VueUse 的成熟解决方案
export {
  useDebounceFn,
  useThrottleFn,
  watchDebounced,
  watchThrottled,
};

// 事件钩子 - 提供响应式事件处理
export {
  createEventHook,
  type EventHookOff,
  type EventHookOn,
  type EventHookTrigger,
};

// 生命周期工具 - 安全的生命周期钩子
export { tryOnMounted, tryOnUnmounted };

// 响应式工具 - 响应式状态管理
export { until, useCounter, useToggle, whenever };

// 时间工具 - 基于 VueUse 的时间处理
export { useTimeAgo, useTimestamp };

// 存储工具 - 响应式存储
export { useStorage };

// 异步状态 - 异步操作状态管理
export { useAsyncState };

// 记忆化 - 函数结果缓存
export { useMemoize };

// 类型导出
export type { Awaitable, MaybeRefOrGetter };

// ==================== 自定义缓存管理 ====================

/**
 * 使用 VueUse 的 useMemoize 创建缓存管理器
 */
export function createCacheManager<T = unknown>(
  ttl: number = 5 * 60 * 1000
) {
  const cache = new Map<
    string,
    { value: T; expiry: number }
  >();

  return {
    get: useMemoize((key: string): T | undefined => {
      const item = cache.get(key);
      if (!item) return undefined;

      if (Date.now() > item.expiry) {
        cache.delete(key);
        return undefined;
      }

      return item.value;
    }),

    set: (key: string, value: T, customTtl?: number) => {
      const expiry = Date.now() + (customTtl || ttl);
      cache.set(key, { value, expiry });
    },

    delete: (key: string) => cache.delete(key),
    clear: () => cache.clear(),

    getStats: () => ({
      size: cache.size,
      keys: Array.from(cache.keys()),
    }),
  };
}

// ==================== 存储工具 ====================

/**
 * 创建响应式版本偏好存储
 */
export function useVersionPreferencesStorage() {
  return useStorage(
    STORAGE_KEYS.VERSION_PREFERENCES,
    {},
    localStorage,
    {
      mergeDefaults: true,
      serializer: {
        read: (value: string) => {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        },
        write: (value: Record<string, string>) =>
          JSON.stringify(value),
      },
    }
  );
}

/**
 * 创建响应式最近页面存储
 */
export function useRecentPagesStorage() {
  return useStorage(
    STORAGE_KEYS.RECENT_PAGES,
    [],
    localStorage,
    {
      mergeDefaults: true,
      serializer: {
        read: (value: string) => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        },
        write: (value: unknown[]) => JSON.stringify(value),
      },
    }
  );
}

// ==================== 语言和本地化工具 ====================

/**
 * 将 kebab-case 模块名转换为 Title Case 格式
 *
 * @param moduleName - kebab-case 格式的模块名，如 "get-started"
 * @returns Title Case 格式的模块名，如 "Get Started"
 */
export const convertModuleNameToTitle = useMemoize(
  (moduleName: string): string => {
    return moduleName
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }
);

/**
 * 标准化模块名 - 使用 VueUse 的 useMemoize 缓存结果
 */
export const normalizeModuleName = useMemoize(
  (module: string): string => {
    const moduleMap: Record<string, string> = {
      transfer: "transfers",
      payment: "payments",
      root: "",
      "get-started": "get-started",
      "getting-started": "get-started",
    };

    return moduleMap[module] || module;
  }
);

/**
 * 获取当前 UI 语言环境配置
 *
 * @param locale - 当前语言代码
 * @param locales - UI Pro 语言包
 * @returns UI 语言环境配置
 */
export function getCurrentUILocale(
  locale: SupportedLocale,
  locales: Record<string, any>
) {
  const mappedLocale =
    LOCALE_MAP[locale] || LOCALE_MAP["zh-CN"];
  const uiLocaleKey =
    {
      "zh-cn": "zh-CN",
      "zh-tw": "zh-TW",
      en: "en",
    }[mappedLocale] || "en";

  return locales[uiLocaleKey] || locales.en;
}

/**
 * 检查模块是否被支持
 */
export function isSupportedModule(
  module: string
): module is SupportedModule {
  const normalized = normalizeModuleName(module);
  return normalized in DOMAIN_COLLECTION_MAP;
}

/**
 * 验证语言环境
 */
export function validateLocale(
  locale: string
): locale is SupportedLocale {
  return locale in CONTENT_LOCALE_MAP;
}

/**
 * 获取内容路径语言 - 使用 VueUse 的 useMemoize 缓存结果
 */
export const getContentLocale = useMemoize(
  (locale: SupportedLocale): ContentLocale => {
    return LOCALE_MAP[locale] || LOCALE_MAP["zh-CN"];
  }
);

/**
 * 获取集合语言后缀（根据实际集合命名格式）
 */
export const getCollectionLocaleSuffix = (
  locale: string
): string => {
  return (
    LANGUAGE_SUFFIX_MAP[
      locale as keyof typeof LANGUAGE_SUFFIX_MAP
    ] || "_en"
  );
};

/**
 * 构建集合名称 - 使用 VueUse 的 useMemoize 缓存结果
 *
 * @param domain - 模块域名，如 "get-started"
 * @param locale - 内容语言，如 "zh-cn"
 * @returns 集合名称，如 "get_started_zh_cn"
 *
 * @example
 * buildCollectionName("get-started", "zh-cn") // "get_started_zh_cn"
 * buildCollectionName("payments", "en") // "payments_en"
 */
export const buildCollectionName = useMemoize(
  (domain: string, locale: ContentLocale): string => {
    const baseName =
      DOMAIN_COLLECTION_MAP[
        domain as keyof typeof DOMAIN_COLLECTION_MAP
      ] || "get_started";
    const localeSuffix = locale.replace("-", "_");
    return `${baseName}_${localeSuffix}`;
  }
);

// ==================== 缓存键生成 ====================

/**
 * 生成缓存键 - 使用 VueUse 的 useMemoize 缓存结果
 */
export const generateCacheKey = useMemoize(
  (
    path: string,
    locale: SupportedLocale,
    additionalParams?: Record<string, string | number>
  ): string => {
    const baseKey = `${path}-${locale}`;

    if (!additionalParams) {
      return baseKey;
    }

    const paramString = Object.entries(additionalParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return `${baseKey}-${paramString}`;
  }
);

// ==================== 日志工具 ====================

/**
 * 创建日志记录器 - 使用 VueUse 的 createEventHook 支持事件监听
 */
export function createLogger(prefix: string) {
  const fullPrefix = `[${DEBUG_CONFIG.logPrefix}${prefix}]`;

  // 创建日志事件钩子
  const onLog = createEventHook<{
    level: string;
    message: string;
    args: unknown[];
  }>();

  const logger = {
    info: (message: string, ...args: unknown[]) => {
      if (DEBUG_CONFIG.enabled) {
        console.log(`${fullPrefix} ${message} - `, ...args);
        onLog.trigger({ level: "info", message, args });
      }
    },
    warn: (message: string, ...args: unknown[]) => {
      if (DEBUG_CONFIG.enabled) {
        console.warn(
          `${fullPrefix} ${message} - `,
          ...args
        );
        onLog.trigger({ level: "warn", message, args });
      }
    },
    error: (message: string, ...args: unknown[]) => {
      if (DEBUG_CONFIG.enabled) {
        console.error(
          `${fullPrefix} ${message} - `,
          ...args
        );
        onLog.trigger({ level: "error", message, args });
      }
    },
    debug: (message: string, data?: DebugInfo) => {
      if (
        DEBUG_CONFIG.enabled &&
        DEBUG_CONFIG.logLevel === "info"
      ) {
        console.log(`${fullPrefix} ${message} - `, data);
        onLog.trigger({
          level: "debug",
          message,
          args: [data],
        });
      }
    },
    // 暴露事件钩子用于监听日志
    onLog: onLog.on,
  };

  return logger;
}

// ==================== 异步操作工具 ====================

/**
 * 安全执行异步函数 - 使用 VueUse 的 useAsyncState
 */
export function useSafeAsyncState<T>(
  promise: Promise<T> | (() => Promise<T>),
  initialState: T,
  options?: {
    resetOnExecute?: boolean;
    shallow?: boolean;
    delay?: number;
    throwError?: boolean;
  }
) {
  return useAsyncState(promise, initialState, {
    resetOnExecute: false,
    throwError: false,
    ...options,
  });
}

/**
 * 重试异步函数 - 基于 VueUse 的 until 实现
 */
export async function retryUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const result = await fn();
      if (condition(result)) {
        return result;
      }
      attempts++;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
    }

    if (attempts < maxAttempts) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts`);
}

// ==================== 时间工具 ====================

/**
 * 格式化时间差 - 简化实现，避免复杂的 VueUse 类型配置
 */
export function formatTimeAgo(
  timestamp: number | Date
): string {
  const now = Date.now();
  const time =
    typeof timestamp === "number"
      ? timestamp
      : timestamp.getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? "去年" : `${years} 年前`;
  } else if (months > 0) {
    return months === 1 ? "上个月" : `${months} 个月前`;
  } else if (days > 0) {
    return days === 1 ? "昨天" : `${days} 天前`;
  } else if (hours > 0) {
    return `${hours} 小时前`;
  } else if (minutes > 0) {
    return `${minutes} 分钟前`;
  } else {
    return "刚刚";
  }
}

/**
 * 获取当前时间戳 - 使用 VueUse 的 useTimestamp
 */
export function useCurrentTimestamp() {
  return useTimestamp();
}

// ==================== 深度合并对象 ====================

/**
 * 深度合并对象 - 保留原实现但添加类型优化
 */
export function deepMerge<
  T extends Record<string, unknown>,
>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<
          keyof T,
          string
        >];
      }
    }
  }

  return result;
}

// ==================== 常用组合函数 ====================

/**
 * 创建切换状态 - 使用 VueUse 的 useToggle
 */
export function useFeatureToggle(
  initialValue: boolean = false
) {
  return useToggle(initialValue);
}

/**
 * 创建计数器 - 使用 VueUse 的 useCounter
 */
export function useVisitCounter(initialValue: number = 0) {
  return useCounter(initialValue);
}

/**
 * 创建防抖监听器 - 使用 VueUse 的 watchDebounced
 */
export { watchDebounced as useDebounceWatch };

/**
 * 创建节流监听器 - 使用 VueUse 的 watchThrottled
 */
export { watchThrottled as useThrottleWatch };

// ==================== 防抖和节流工具函数 ====================

/**
 * 创建防抖函数 - 使用 VueUse 的 useDebounceFn
 *
 * @param fn 要防抖的函数
 * @param ms 延迟时间（毫秒）
 * @param options 可选配置
 * @param options.maxWait 最大等待时间（毫秒）
 * @param options.rejectOnCancel 取消时是否拒绝 Promise
 * @returns 防抖后的函数和相关控制方法
 *
 * @example
 * const debouncedFn = createDebouncedFn(() => console.log('Hello'), 300);
 * debouncedFn(); // 300ms 后执行
 */
export function createDebouncedFn<
  T extends (...args: unknown[]) => unknown,
>(
  fn: T,
  ms: number = 500,
  options?: {
    maxWait?: number;
    rejectOnCancel?: boolean;
  }
) {
  return useDebounceFn(fn, ms, options);
}

/**
 * 创建节流函数 - 使用 VueUse 的 useThrottleFn
 *
 * @param fn 要节流的函数
 * @param ms 节流间隔（毫秒）
 * @param trailing 是否在尾部执行
 * @param leading 是否在首部执行
 * @returns 节流后的函数
 *
 * @example
 * const throttledFn = createThrottledFn(() => console.log('Hello'), 300);
 * throttledFn(); // 最多每 300ms 执行一次
 */
export function createThrottledFn<
  T extends (...args: unknown[]) => unknown,
>(
  fn: T,
  ms: number = 200,
  trailing: boolean = true,
  leading: boolean = true
) {
  return useThrottleFn(fn, ms, trailing, leading);
}

/**
 * 兼容的防抖函数 - 为了向后兼容保留的简单接口
 */
export function debounce<
  T extends (...args: unknown[]) => unknown,
>(func: T, wait: number): (...args: Parameters<T>) => void {
  return createDebouncedFn(func, wait);
}

/**
 * 兼容的节流函数 - 为了向后兼容保留的简单接口
 */
export function throttle<
  T extends (...args: unknown[]) => unknown,
>(func: T, wait: number): (...args: Parameters<T>) => void {
  return createThrottledFn(func, wait);
}

// ==================== 配置驱动的模块管理 ====================

/**
 * 获取所有支持的模块列表
 */
export function getSupportedModules(): Array<
  keyof typeof MODULE_CONFIG
> {
  return Object.keys(MODULE_CONFIG) as Array<
    keyof typeof MODULE_CONFIG
  >;
}

/**
 * 根据配置生成所有集合名称列表
 *
 * @param includeLanguages - 要包含的语言列表，默认为所有支持的语言
 * @returns 所有集合名称的数组
 */
export function getAllCollectionNames(
  includeLanguages?: ContentLocale[]
): string[] {
  const languages =
    includeLanguages || Object.values(LOCALE_MAP);
  const modules = getSupportedModules();

  const collections: string[] = [];

  modules.forEach((module) => {
    languages.forEach((lang) => {
      const collectionName = buildCollectionName(
        module,
        lang
      );
      collections.push(collectionName);
    });
  });

  return collections;
}

/**
 * 生成搜索链接配置
 *
 * @param t - 国际化函数
 * @returns 搜索链接配置数组
 */
export function generateSearchLinks(
  t: (key: string) => string
) {
  return getSupportedModules()
    .sort(
      (a, b) =>
        (MODULE_CONFIG[a]?.order || 0) -
        (MODULE_CONFIG[b]?.order || 0)
    )
    .map((module) => {
      const config = MODULE_CONFIG[module];
      if (!config) return null;
      const iconMap = {
        "get-started": "i-lucide-book",
        payments: "i-lucide-credit-card",
        transfers: "i-lucide-banknote",
      } as const;

      return {
        label: t(`docs.sections.${config.i18nKey}.title`),
        icon:
          iconMap[module as keyof typeof iconMap] ||
          "i-lucide-file",
        to: `/${module}`,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null
    );
}

/**
 * 获取模块配置
 */
export function getModuleConfig(module: string) {
  const normalizedModule = normalizeModuleName(module);
  return (
    MODULE_CONFIG[
      normalizedModule as keyof typeof MODULE_CONFIG
    ] || null
  );
}

/**
 * 获取模块的版本配置
 */
export function getModuleVersions(module: string) {
  const config = getModuleConfig(module);
  return config?.versions || null;
}

/**
 * 获取模块的集合名称
 */
export function getModuleCollection(module: string) {
  const config = getModuleConfig(module);
  return config?.collection || null;
}

/**
 * 获取模块的国际化键名（带 header 前缀）
 */
export function getModuleI18nKey(module: string) {
  const config = getModuleConfig(module);
  const i18nKey = config?.i18nKey || module;
  return `header.${i18nKey}`;
}

/**
 * 获取排序后的模块列表
 */
export function getSortedModules() {
  return Object.entries(MODULE_CONFIG)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([module]) => module);
}

// ==================== 最近页面工具函数 ====================

/**
 * 根据时间戳获取颜色类名
 */
export function getTimeColor(timestamp: number): string {
  const now = Date.now();
  const hours = Math.floor(
    (now - timestamp) / (1000 * 60 * 60)
  );

  if (hours < TIME_COLOR_THRESHOLDS.RECENT)
    return "text-green-500";
  if (hours < TIME_COLOR_THRESHOLDS.TODAY)
    return "text-blue-500";
  if (hours < TIME_COLOR_THRESHOLDS.WEEK)
    return "text-yellow-500";
  return "text-gray-400";
}

/**
 * 格式化时间为国际化文本
 */
export function formatTimeI18n(
  timestamp: number,
  locale: string = "en"
): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (locale.startsWith("zh")) {
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    return `${days} 天前`;
  }

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

/**
 * 格式化时间（英文）
 */
export function formatTime(timestamp: number): string {
  return formatTimeI18n(timestamp, "en");
}

/**
 * 判断是否应该跳过路径记录
 */
export function shouldSkipPath(path: string): boolean {
  return SKIP_PATHS.some((skipPath: string) => {
    // 对于根路径 "/" 只做精确匹配，避免匹配所有路径
    if (skipPath === "/") {
      return path === "/";
    }
    // 其他路径使用 startsWith 匹配
    return path === skipPath || path.startsWith(skipPath);
  });
}

/**
 * 从模块配置获取路径对应的颜色
 * 优先从 MODULE_CONFIG 获取，降级到 ADDITIONAL_CATEGORY_CONFIG
 */
export function getModuleColor(path: string): string {
  const category = path.split("/")[1] || "";

  // 先从模块配置中查找
  const moduleConfig =
    MODULE_CONFIG[category as keyof typeof MODULE_CONFIG];
  if (moduleConfig) {
    return moduleConfig.color;
  }

  // 降级到额外类别配置
  const additionalConfig =
    ADDITIONAL_CATEGORY_CONFIG[
      category as keyof typeof ADDITIONAL_CATEGORY_CONFIG
    ];

  return additionalConfig?.color || "text-primary";
}

/**
 * 从模块配置获取路径对应的图标
 * 优先从 MODULE_CONFIG 获取，降级到 ADDITIONAL_CATEGORY_CONFIG
 */
export function getModuleIcon(path: string): string {
  const category = path.split("/")[1] || "";

  // 先从模块配置中查找
  const moduleConfig =
    MODULE_CONFIG[category as keyof typeof MODULE_CONFIG];
  if (moduleConfig) {
    return moduleConfig.icon;
  }

  // 降级到额外类别配置
  const additionalConfig =
    ADDITIONAL_CATEGORY_CONFIG[
      category as keyof typeof ADDITIONAL_CATEGORY_CONFIG
    ];

  return additionalConfig?.icon || "i-heroicons-document";
}

/**
 * 生成页面标题（从路径）
 */
export function generateTitleFromPath(
  path: string
): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    return (
      lastSegment
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) ??
      "Unknown Page"
    );
  }
  return "Unknown Page";
}

/**
 * 生成页面描述（从路径）
 */
export function generateDescriptionFromPath(
  path: string
): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[
      segments.length - 1
    ]!.replace(/-/g, " ").replace(/\b\w/g, (l) =>
      l.toUpperCase()
    );
    return `Information about ${lastSegment}`;
  }
  return "Page content and information";
}

/**
 * 清理页面标题
 */
export function cleanTitle(title: string): string {
  return title
    .replace(
      /\s*[-|]\s*(Onerway|Documentation|Docs).*$/i,
      ""
    )
    .replace(/\s*[-|]\s*Nuxt.*$/i, "")
    .trim();
}

/**
 * 检查版本是否被模块支持
 */
export function isVersionSupportedByModule(
  module: string,
  version: string
): boolean {
  const versions = getModuleVersions(module);
  return versions
    ? versions.supported.includes(version as never)
    : false;
}

/**
 * 获取模块的默认版本
 */
export function getModuleDefaultVersion(
  module: string
): string {
  const versions = getModuleVersions(module);
  return versions?.current || "v1";
}

/**
 * 获取模块的最新版本
 */
export function getModuleLatestVersion(
  module: string
): string {
  const versions = getModuleVersions(module);
  return versions?.latest || "v1";
}

/**
 * 获取模块的支持版本列表
 */
export function getModuleSupportedVersions(
  module: string | undefined
): string[] {
  const versions = getModuleVersions(module || "");
  return versions ? [...versions.supported] : ["v1"];
}

// ==================== 导航数据处理 ====================

/**
 * 提取模块级别的导航数据
 * 从复杂的多层嵌套结构中提取出实际需要的导航项
 */
export function extractModuleNavigation(
  rawNavigation: unknown[]
): ContentNavigationItem[] {
  if (
    !Array.isArray(rawNavigation) ||
    rawNavigation.length === 0
  ) {
    return [];
  }

  // 通常结构是：[{ title: "En", children: [{ title: "Getting Started", children: [...] }] }]
  // 我们需要找到模块级别的导航数据

  for (const topLevel of rawNavigation) {
    if (
      isNavNode(topLevel) &&
      topLevel.children &&
      Array.isArray(topLevel.children)
    ) {
      for (const moduleLevel of topLevel.children) {
        if (
          isNavNode(moduleLevel) &&
          moduleLevel.children &&
          Array.isArray(moduleLevel.children)
        ) {
          // 找到了模块下的版本级别导航
          for (const versionLevel of moduleLevel.children) {
            if (
              isNavNode(versionLevel) &&
              versionLevel.children &&
              Array.isArray(versionLevel.children)
            ) {
              // 这是我们需要的导航数据
              return versionLevel.children as ContentNavigationItem[];
            }
          }
        }
      }
    }
  }

  return [];
}

/**
 * 类型守卫：检查是否为导航节点
 */
function isNavNode(
  obj: unknown
): obj is { children?: unknown[]; [key: string]: unknown } {
  return typeof obj === "object" && obj !== null;
}

/**
 * 简化导航路径
 * 移除 locale 和 version 信息，转换为简化路径
 */
export function simplifyNavigationPaths(
  navigation: ContentNavigationItem[],
  currentLocale: ContentLocale,
  currentVersion: string
): ContentNavigationItem[] {
  const localePrefix = `/${currentLocale}`;
  const versionPattern = `/${currentVersion}`;

  function simplifyItem(
    item: ContentNavigationItem
  ): ContentNavigationItem {
    let simplifiedPath = item.path;

    // 移除 locale 前缀
    if (simplifiedPath.startsWith(localePrefix)) {
      simplifiedPath = simplifiedPath.substring(
        localePrefix.length
      );
    }

    // 移除 version 信息
    if (simplifiedPath.includes(versionPattern)) {
      simplifiedPath = simplifiedPath.replace(
        versionPattern,
        ""
      );
    }

    // 确保路径以 / 开头
    if (!simplifiedPath.startsWith("/")) {
      simplifiedPath = `/${simplifiedPath}`;
    }

    // 处理根路径情况
    if (simplifiedPath === "//") {
      simplifiedPath = "/";
    }

    const result: ContentNavigationItem = {
      ...item, // 保留所有原始字段
      path: simplifiedPath, // 只覆盖 path 字段
    };

    // 递归处理子项
    if (item.children && Array.isArray(item.children)) {
      result.children = item.children.map(simplifyItem);
    }

    return result;
  }

  return navigation.map(simplifyItem);
}

/**
 * 处理导航数据的完整流程
 * 提取 + 简化路径
 */
export function processNavigationData(
  rawNavigation: ContentNavigationItem[],
  currentLocale: ContentLocale,
  currentVersion: string
): ContentNavigationItem[] {
  const extracted = extractModuleNavigation(rawNavigation);
  return simplifyNavigationPaths(
    extracted,
    currentLocale,
    currentVersion
  );
}

// ==================== 统一的路径解析 ====================

/**
 * 路径信息接口
 */
export interface PathInfo {
  isRoot: boolean;
  isSimplified: boolean;
  module: string | undefined;
  version: string;
  subPath: string;
  contentPath: string;
  collectionName: string;
  hasModule: boolean;
}

/**
 * 创建根路径信息对象
 */
function createRootPathInfo(): PathInfo {
  return {
    isRoot: true,
    isSimplified: false,
    module: "root",
    version: "",
    subPath: "",
    contentPath: "/",
    collectionName: "",
    hasModule: false,
  };
}

/**
 * 解析简化路径（不包含语言前缀）
 * @param segments - 路径片段
 * @param contentLocale - 内容语言
 * @param defaultVersion - 默认版本
 */
function parseSimplifiedPath(
  segments: string[],
  contentLocale: ContentLocale,
  defaultVersion: string
) {
  const module = segments[0] || "";
  const rawSubPath = segments.slice(1).join("/");

  // 当仅访问 "/{module}" 时，补全默认子路径
  // 优先使用 MODULE_CONFIG[module].routePath 中的默认子路径（如 /get-started/overview → overview）
  // 否则回退到 "overview"
  const normalizedModule = normalizeModuleName(module);
  const configuredRoutePath =
    MODULE_CONFIG[
      normalizedModule as keyof typeof MODULE_CONFIG
    ]?.routePath || "";

  let inferredDefaultSubPath = "overview";
  if (
    configuredRoutePath &&
    configuredRoutePath.startsWith(`/${normalizedModule}/`)
  ) {
    inferredDefaultSubPath = configuredRoutePath.replace(
      new RegExp(`^/${normalizedModule}/`),
      ""
    );
  }

  const subPath = rawSubPath || inferredDefaultSubPath;
  const contentPath = `/${contentLocale}/${normalizedModule}/${defaultVersion}/${subPath}`;

  return {
    module: normalizedModule,
    version: defaultVersion,
    subPath,
    contentPath,
  };
}

/**
 * 解析完整路径（包含语言前缀）
 * @param segments - 路径片段
 * @param originalPath - 原始路径
 * @param defaultVersion - 默认版本
 */
function parseFullPath(
  segments: string[],
  originalPath: string,
  defaultVersion: string
) {
  const [, module, version, ...rest] = segments;
  const resolvedVersion = version?.startsWith("v")
    ? version
    : defaultVersion;

  // 若未提供子路径，则按模块配置或回退到 overview
  const normalizedModule = normalizeModuleName(
    module || ""
  );
  const configuredRoutePath =
    MODULE_CONFIG[
      normalizedModule as keyof typeof MODULE_CONFIG
    ]?.routePath || "";
  let inferredDefaultSubPath = "overview";
  if (
    configuredRoutePath &&
    configuredRoutePath.startsWith(`/${normalizedModule}/`)
  ) {
    inferredDefaultSubPath = configuredRoutePath.replace(
      new RegExp(`^/${normalizedModule}/`),
      ""
    );
  }

  const providedSubPath = rest.join("/");
  const subPath = providedSubPath || inferredDefaultSubPath;

  return {
    module: normalizedModule,
    version: resolvedVersion,
    subPath,
    contentPath: providedSubPath
      ? originalPath
      : `/${segments[0]}/${normalizedModule}/${resolvedVersion}/${subPath}`,
  };
}

/**
 * 解析路径信息 - 两个 composables 的共用逻辑
 *
 * @param path - 要解析的路径
 * @param contentLocale - 内容语言
 * @returns 解析后的路径信息
 *
 * @example
 * // 简化路径
 * parsePathInfo("/get-started/overview", "zh-cn")
 * // 完整路径
 * parsePathInfo("/zh-cn/get-started/v1/overview", "zh-cn")
 */
export function parsePathInfo(
  path: string,
  contentLocale: ContentLocale
): PathInfo {
  const segments = path.split("/").filter(Boolean);
  const logger = createLogger("utils-parsePathInfo");

  // 处理根路径
  if (path === "/" || segments.length === 0) {
    return createRootPathInfo();
  }

  logger.info("segments", segments);

  // 检测路径类型：简化路径 vs 完整路径
  const isSimplified =
    !PATH_MAPPING_CONFIG.supportedContentLocales.includes(
      segments[0] as ContentLocale
    );
  const defaultVersion = PATH_MAPPING_CONFIG.defaultVersion;

  // 根据路径类型解析基本信息
  const pathData = isSimplified
    ? parseSimplifiedPath(
        segments,
        contentLocale,
        defaultVersion
      )
    : parseFullPath(segments, path, defaultVersion);

  logger.info("pathData", pathData);
  // 标准化模块名并构建集合信息
  const normalizedModule =
    normalizeModuleName(pathData.module) || undefined;
  const hasModule = normalizedModule
    ? isSupportedModule(normalizedModule)
    : false;
  const collectionName = hasModule
    ? buildCollectionName(
        normalizedModule as string,
        contentLocale
      )
    : "";

  return {
    isRoot: false,
    isSimplified,
    module: normalizedModule,
    version: pathData.version,
    subPath: pathData.subPath,
    contentPath: pathData.contentPath,
    collectionName,
    hasModule,
  };
}

/**
 * 创建共享的路径解析 composable
 *
 * 提供响应式的路径信息，包括当前语言、内容语言和解析后的路径数据
 *
 * @returns 包含路径解析相关响应式数据的对象
 *
 * @example
 * const {
 *   currentLocale,    // 当前 UI 语言
 *   contentLocale,    // 内容语言，对应文档集合的语言
 *   pathInfo          // 解析后的路径信息
 * } = useSharedPathInfo();
 */
export function useSharedPathInfo() {
  const route = useRoute();
  const { locale } = useI18n();

  // 计算内容语言（将 UI 语言转换为内容语言）
  const contentLocale = computed(() =>
    getContentLocale(locale.value as SupportedLocale)
  );

  // 解析当前路径信息
  const pathInfo = computed(() =>
    parsePathInfo(route.path, contentLocale.value)
  );

  return {
    currentLocale: readonly(locale),
    contentLocale: readonly(contentLocale),
    pathInfo: readonly(pathInfo),
  };
}
