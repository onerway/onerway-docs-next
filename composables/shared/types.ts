/**
 * 共享类型定义
 * 所有 composables 的通用类型
 */

import type { ContentNavigationItem } from "@nuxt/content";

// ==================== 基础类型 ====================

// 支持的语言类型
export type SupportedLocale = "en" | "zh-CN" | "zh-TW";

// 内容路径语言类型
export type ContentLocale = "en" | "zh-cn" | "zh-tw";

// 支持的模块类型 - 从 MODULE_CONFIG 自动推导
export type SupportedModule =
  keyof typeof import("./constants").MODULE_CONFIG;

// ==================== 模块配置接口 ====================

// 模块配置接口
export interface ModuleConfig {
  readonly collection: string;
  readonly collectionType: "standard";
  readonly schema: "document";
  readonly versions: {
    readonly current: string;
    readonly supported: readonly string[];
    readonly latest: string;
  };
  readonly i18nKey: string;
  readonly order: number;
  readonly icon: string;
  readonly color: string;
  readonly routePath: string;
}

// ==================== 配置接口 ====================

// 基础配置接口
export interface BaseConfig {
  version?: string;
  locale?: SupportedLocale;
  contentLocale?: ContentLocale;
  showNavigation?: boolean;
  showToc?: boolean;
}

// 路径映射配置接口
export interface PathMappingConfig {
  localeMap: Record<SupportedLocale, ContentLocale>;
  domainMap: Record<string, string>;
  defaultVersion: string;
  supportedContentLocales: readonly ContentLocale[];
}

// 文档页面配置接口
export interface DocumentationConfig extends BaseConfig {
  enableCaching?: boolean;
  cacheTimeout?: number;
  errorHandling?: "strict" | "lenient";
}

// ==================== 模块和版本相关 ====================

// 模块信息接口
export interface ModuleInfo {
  module: string;
  version: string;
  hasModule: boolean;
}

// 模块版本配置接口
export interface ModuleVersionConfig {
  current: string; // 模块当前默认版本
  supported: string[]; // 支持的所有版本
  deprecated: string[]; // 已废弃但仍可访问的版本
  latest: string; // 最新版本（可能不是默认版本）
}

// 版本信息接口
export interface VersionInfo {
  module: string;
  version: string;
  isUserPreferred: boolean;
  isLatest: boolean;
  isDeprecated: boolean;
  isSupported: boolean;
}

// 版本解析结果接口
export interface VersionResolution {
  resolved: string; // 最终解析的版本
  source: "path" | "user" | "default"; // 版本来源
  alternatives: string[]; // 其他可用版本
}

// ==================== 路径相关 ====================

// 路径解析结果接口
export interface PathParseResult {
  locale?: string;
  module?: string;
  version?: string;
  subPath?: string;
}

// 路径验证结果接口
export interface PathValidationResult {
  isValid: boolean;
  errors: string[];
}

// ==================== 用户偏好相关 ====================

// 用户版本偏好接口
export interface UserVersionPreferences {
  readonly [module: string]: string; // 用户为每个模块选择的偏好版本
}

// ==================== 导航和页面相关 ====================

// 面包屑项接口
export interface BreadcrumbItem {
  label: string;
  to: string;
}

// 导航状态接口
export interface NavigationState {
  items: ContentNavigationItem[];
  isLoading: boolean;
  error: Error | null;
}

// 页面状态接口
export interface PageState {
  data: Record<string, unknown> | null;
  isLoading: boolean;
  error: Error | null;
}

// ==================== 最近页面相关 ====================

// 最近页面接口
export interface RecentPage {
  title: string;
  description?: string;
  path: string;
  timestamp: number;
  icon?: string;
  iconColor?: string;
  module?: string; // 模块名称，如 "get-started", "payments", "transfers"
  moduleName?: string; // 模块显示名称，如 "Get Started", "Payments", "Transfers"
}

// 最近页面项接口（兼容旧版本）
export interface RecentPageItem {
  id: string;
  title: string;
  path: string;
  description?: string;
  lastVisited: number;
  visitCount: number;
  module?: string;
  version?: string;
}

// 最近页面配置接口
export interface RecentPagesConfig {
  maxItems?: number;
  debounceDelay?: number;
  enablePersistence?: boolean;
}

// 最近页面记录可选参数（行为配置）
export interface RecentPagesOptions {
  useFullPath?: boolean; // 记录 fullPath（包含 query），默认 false 仅记录 path
  includeHash?: boolean; // 是否包含 hash，默认 false
  normalizeTrailingSlash?: boolean; // 归一尾斜杠（根路径除外），默认 true
  skipPredicates?: Array<(path: string) => boolean>; // 额外跳过规则
}

// 最近页面元信息（可由调用方覆盖）
export interface RecentPageMeta {
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  module?: string;
  moduleName?: string;
}

// 格式化的最近页面接口（包含展示信息）
export interface FormattedRecentPage extends RecentPage {
  formattedTime: string;
  timeColor: string;
}

// ==================== 服务配置 ====================

// 版本服务配置
export interface VersionServiceConfig {
  enableCaching?: boolean;
  cacheTimeout?: number;
  errorHandling?: "strict" | "lenient";
}

// 路径服务配置
export interface PathServiceConfig {
  enableValidation?: boolean;
  strictMode?: boolean;
}

// ==================== 调试相关 ====================

// 调试信息接口
export interface DebugInfo {
  [key: string]: unknown;
}

// 日志级别类型
export type LogLevel = "info" | "warn" | "error";

// ==================== 工具类型 ====================

// 只读对象类型
export type ReadonlyRecord<
  K extends string | number | symbol,
  V,
> = {
  readonly [P in K]: V;
};

// 可选的只读对象类型
export type OptionalReadonlyRecord<
  K extends string | number | symbol,
  V,
> = {
  readonly [P in K]?: V;
};
