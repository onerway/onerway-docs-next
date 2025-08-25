/**
 * 共享常量定义
 * 所有 composables 的通用常量
 */

import type {
  ContentLocale,
  ModuleConfig,
  PathMappingConfig,
  SupportedLocale,
} from "./types";

// ==================== 语言相关常量 ====================

// 语言映射配置
export const LOCALE_MAP: Record<
  SupportedLocale,
  ContentLocale
> = {
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
  en: "en",
} as const;

// 内容路径语言映射（反向映射）
export const CONTENT_LOCALE_MAP: Record<
  ContentLocale,
  SupportedLocale
> = {
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
  en: "en",
} as const;

// 支持的语言代码
export const SUPPORTED_CONTENT_LOCALES = [
  "en",
  "zh-cn",
  "zh-tw",
] as const;

// ==================== Collection 类型和 Schema 配置 ====================

// Collection 类型枚举
export const COLLECTION_TYPES = ["standard"] as const;

// Schema 类型枚举
export const SCHEMA_TYPES = ["document"] as const;

// ==================== 模块配置中心 ====================

/**
 * 统一的模块配置 - 所有模块信息的单一来源
 * 新增模块只需要在这里添加配置即可
 */
export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  "get-started": {
    collection: "get_started",
    collectionType: "standard" as const,
    schema: "document" as const,
    versions: {
      current: "v1" as const,
      supported: ["v1"] as const,
      latest: "v1" as const,
    },
    i18nKey: "getStarted",
    order: 1,
    icon: "",
    color: "text-blue-500",
    routePath: "/get-started/overview",
  },
  payments: {
    collection: "payments",
    collectionType: "standard" as const,
    schema: "document" as const,
    versions: {
      current: "v1" as const,
      supported: ["v1"] as const,
      latest: "v1" as const,
    },
    i18nKey: "payments",
    order: 2,
    icon: "",
    color: "text-green-500",
    routePath: "/payments/overview",
  },
  transfers: {
    collection: "transfers",
    collectionType: "standard" as const,
    schema: "document" as const,
    versions: {
      current: "v1" as const,
      supported: ["v1"] as const,
      latest: "v1" as const,
    },
    i18nKey: "transfers",
    order: 3,
    icon: "",
    color: "text-purple-500",
    routePath: "/transfers/overview",
  },
  "development-resources": {
    collection: "development_resources",
    collectionType: "standard" as const,
    schema: "document" as const,
    versions: {
      current: "v1" as const,
      supported: ["v1"] as const,
      latest: "v1" as const,
    },
    i18nKey: "developmentResources",
    order: 4,
    icon: "",
    color: "text-indigo-500",
    routePath: "/development-resources/overview",
  },
  revenue: {
    collection: "revenue",
    collectionType: "standard" as const,
    schema: "document" as const,
    versions: {
      current: "v1" as const,
      supported: ["v1"] as const,
      latest: "v1" as const,
    },
    i18nKey: "revenue",
    order: 5,
    icon: "",
    color: "text-amber-500",
    routePath: "/revenue/overview",
  },
} as const;

// 所有的模块配置
export const MODULE_ENUMS = Object.keys(MODULE_CONFIG) as [
  keyof typeof MODULE_CONFIG,
  ...(keyof typeof MODULE_CONFIG)[],
];

// ==================== 兼容性映射（从统一配置生成）====================

// 域名到集合的映射（向后兼容）
export const DOMAIN_COLLECTION_MAP = Object.fromEntries(
  Object.entries(MODULE_CONFIG).map(([module, config]) => [
    module,
    config.collection,
  ])
) as Record<keyof typeof MODULE_CONFIG, string>;

// ==================== 版本相关常量 ====================

// 版本正则表达式
export const VERSION_REGEX = /^v\d+(?:\.\d+)*$/;

// ==================== 默认配置 ====================

// 默认配置
export const DEFAULT_CONFIG = {
  version: "v1",
  locale: "zh-CN" as SupportedLocale,
  contentLocale: "zh-cn" as ContentLocale,
  showNavigation: true,
  showToc: true,
} as const;

// ==================== 存储键名 ====================

export const STORAGE_KEYS = {
  VERSION_PREFERENCES: "onerway-docs-version-preferences",
  RECENT_PAGES: "onerway-docs-recent-pages",
} as const;

// ==================== 性能相关常量 ====================

// 最大最近页面数
export const MAX_RECENT_PAGES = 10;

// 缓存防抖延迟
export const CACHE_DEBOUNCE_DELAY = 500;

// 页面添加防抖延迟
export const PAGE_ADD_DEBOUNCE_DELAY = 200;

// ==================== 最近页面相关常量 ====================

// 非模块类别的额外配置（用于支持 api、docs、guide、tutorial 等）
export const ADDITIONAL_CATEGORY_CONFIG = {
  api: {
    icon: "i-heroicons-code-bracket",
    color: "text-indigo-500",
  },
  docs: {
    icon: "i-heroicons-document-text",
    color: "text-cyan-500",
  },
  guide: {
    icon: "i-heroicons-academic-cap",
    color: "text-teal-500",
  },
  tutorial: {
    icon: "i-heroicons-play-circle",
    color: "text-pink-500",
  },
} as const;

// 时间颜色阈值配置（小时）
export const TIME_COLOR_THRESHOLDS = {
  RECENT: 1, // 1小时内 - 绿色
  TODAY: 24, // 24小时内 - 蓝色
  WEEK: 168, // 7天内 - 黄色
  // 超过7天 - 灰色
} as const;

// 需要跳过记录的路径模式
export const SKIP_PATHS = [
  "/",
  "/404",
  "/__",
  "/preview",
  "/admin",
  "/.well-known",
] as const;

// ==================== 导航相关常量 ====================

// 语言容器标识符（用于导航扁平化）
export const LANGUAGE_CONTAINER_IDENTIFIERS = [
  "en",
  "zh-cn",
  "zh-tw",
  "En",
  "Zh",
  "Zh Cn",
  "Zh Tw",
] as const;

// 模块容器标识符（用于导航扁平化）
// 包含所有语言版本的模块标题
export const MODULE_CONTAINER_IDENTIFIERS = [
  // 英文标题（Title Case 格式）
  "Get Started",
  "Payments",
  "Transfers",
  "Development Resources",
  "Revenue",

  // 简体中文标题
  "快速开始",
  "支付",
  "转账",
  "开发资源",
  "营收",

  // 繁体中文标题
  "快速開始",
  "支付", // 同简体中文
  "轉帳",
  "開發資源",
  "營收",
] as const;

// 语言后缀键映射（修复了中文版本的映射错误）
export const LANGUAGE_SUFFIX_MAP = {
  en: "_en",
  "zh-cn": "_zh_cn",
  "zh-tw": "_zh_tw",
  "zh-CN": "_zh_cn",
  "zh-TW": "_zh_tw",
} as const;

// 语言后缀正则表达式（支持完整的语言代码）
export const LANGUAGE_SUFFIX_REGEX = /_(en|zh_cn|zh_tw)$/;

// 导航文件检测字符串
export const NAVIGATION_FILE_IDENTIFIER = ".navigation";

// ==================== 调试配置 ====================

export const DEBUG_CONFIG = {
  enabled: import.meta.dev,
  logLevel: "info" as "info" | "warn" | "error",
  logPrefix: "module - ",
} as const;

// ==================== 路径映射配置 ====================

// 路径映射完整配置
export const PATH_MAPPING_CONFIG: PathMappingConfig = {
  localeMap: LOCALE_MAP, // locale -> contentLocale，比如 zh-CN -> zh-cn
  domainMap: DOMAIN_COLLECTION_MAP, // module -> collection，比如 get-started -> get_started
  defaultVersion: DEFAULT_CONFIG.version,
  supportedContentLocales: SUPPORTED_CONTENT_LOCALES, // supported content locales，比如 en, zh-cn, zh-tw
} as const;
