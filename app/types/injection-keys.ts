/**
 * Vue Provide/Inject 类型安全的键定义
 *
 * 使用 Symbol 而非字符串，避免命名冲突并提供更好的类型推断
 */

import type { InjectionKey, Ref } from "vue";
import type { ContentNavigationItem } from "@nuxt/content";

/**
 * 页面 Body 结构
 * 由 Nuxt Content 解析的 MDC 内容
 */
export interface DocPageBody {
  /** 节点类型 */
  type: string;
  /** 子节点 */
  children: unknown;
  /** 目录结构 */
  toc: unknown;
}

/**
 * SEO 元数据
 * 用于控制页面的 SEO 信息
 */
export interface DocPageSeo {
  /** SEO 标题（覆盖 title） */
  title?: string;
  /** SEO 描述（覆盖 description） */
  description?: string;
  /** 自定义 meta 标签 */
  meta?: Array<Record<string, unknown>>;
  /** 自定义 link 标签 */
  link?: Array<Record<string, unknown>>;
  /** 其他自定义 SEO 字段 */
  [key: string]: unknown;
}

/**
 * 导航配置
 * 控制页面在导航菜单中的显示方式
 */
export type DocPageNavigation =
  | boolean // false = 不在菜单中显示
  | {
      /** 导航菜单中显示的标题（覆盖 title） */
      title: string;
      /** 导航菜单中的描述 */
      description?: string;
      /** 导航菜单中的图标 */
      icon?: string;
    };

/**
 * 文档页面数据
 * 包含 Nuxt Content 的标准字段和自定义配置字段
 *
 * 基于 content.config.ts 中定义的 schema
 */
export interface DocPage {
  // ==================== Nuxt Content 标准字段 ====================
  /** 页面路径（必填） */
  path: string;
  /** 页面标题（必填） */
  title: string;
  /** 页面描述（必填） */
  description: string;
  /** 页面内容结构 */
  body: DocPageBody;

  // ==================== 自定义 Schema 字段 ====================
  /** SEO 元数据（可选，默认为 {}） */
  seo?: DocPageSeo;
  /**
   * 导航配置（默认为 true）
   * - true: 使用默认标题显示在菜单
   * - false: 不在菜单中显示
   * - object: 自定义菜单显示
   */
  navigation: DocPageNavigation;
  /** 是否显示右侧目录（默认 true） */
  showToc: boolean;
  /** 是否显示页面底部（默认 true） */
  showFooter: boolean;

  // ==================== 兼容性字段 ====================
  /**
   * @deprecated 使用 navigation 字段替代
   * 为了向后兼容保留，控制是否显示左侧导航栏
   */
  showNavigation?: boolean;

  // ==================== 其他字段 ====================
  /** 支持任意其他字段 */
  [key: string]: unknown;
}

/**
 * 导航树的 injection key
 */
export const NAVIGATION_KEY: InjectionKey<
  Ref<ContentNavigationItem[] | undefined>
> = Symbol("navigation");

/**
 * 当前页面数据的状态 key（用于 useState）
 *
 * @example
 * ```typescript
 * // 在 page 中设置
 * const page = useState<DocPage | null>("currentPage");
 * page.value = data;
 *
 * // 在 layout/component 中读取
 * const page = useState<DocPage | null>("currentPage");
 * ```
 */
export const CURRENT_PAGE_STATE_KEY =
  "currentPage" as const;
