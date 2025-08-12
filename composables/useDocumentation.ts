/**
 * 文档系统组合式函数
 *
 * 提供完整的文档管理功能，包括：
 * - 页面内容和导航数据获取
 * - 面包屑导航生成
 * - TOC 目录管理
 * - SEO 元数据处理
 *
 * @example
 * ```ts
 * const {
 *   page,
 *   navigation,
 *   breadcrumbs,
 *   hasNavigation,
 *   hasToc,
 *   tocLinks
 * } = useDocumentation();
 * ```
 */

import type { ContentNavigationItem } from "@nuxt/content";
import type { BreadcrumbItem } from "./shared/types";
import { findPageBreadcrumb } from "@nuxt/content/utils";
import {
  createLogger,
  processNavigationData,
  useDebounceFn,
  useSharedPathInfo,
  whenever,
} from "./shared/utils";

// ==================== 类型定义 ====================

/**
 * 首页分区配置
 */
interface HomeSection {
  title: string;
  description: string;
  to: string;
}

/**
 * 页面配置选项
 */
interface PageConfig {
  showNavigation?: boolean;
  showToc?: boolean;
}

// ==================== 主要组合式函数 ====================

/**
 * 文档系统主要组合式函数
 *
 * 集成了页面内容获取、导航管理、面包屑生成等核心功能
 */
export function useDocumentation() {
  // ==================== 初始化依赖 ====================

  const route = useRoute();
  const { t } = useI18n();
  const logger = createLogger("useDocumentation");

  // 使用共享路径解析工具
  const { currentLocale, contentLocale, pathInfo } =
    useSharedPathInfo();

  // ==================== 数据获取层 ====================

  /**
   * 获取当前页面内容数据
   *
   * 处理根路径、集合查询、错误处理等逻辑
   */
  const {
    data: page,
    pending: pageLoading,
    error: pageError,
  } = useAsyncData(
    `page-${route.path}-${currentLocale.value}`,
    async () => {
      const info = pathInfo.value;

      // 根路径处理：返回默认首页数据
      if (info.isRoot) {
        return {
          title: t("docs.meta.defaultTitle"),
          description: t("docs.meta.defaultDescription"),
          _path: "/",
          body: { toc: { links: [] } },
        };
      }

      // 集合验证：确保集合存在
      if (!info.collectionName) {
        throw createError({
          statusCode: 404,
          statusMessage: "Collection not found",
        });
      }

      try {
        logger.info("Fetching page content", {
          contentPath: info.contentPath,
          collectionName: info.collectionName,
        });

        // 查询页面数据
        const pageData = await queryCollection(
          info.collectionName as any
        )
          .path(info.contentPath)
          .first();

        if (!pageData) {
          throw createError({
            statusCode: 404,
            statusMessage: "Page not found",
          });
        }

        logger.info("Page data fetched successfully", {
          title: pageData.title,
          path: pageData._path || pageData.path,
        });
        return pageData;
      } catch (error) {
        logger.error("Failed to fetch page content", {
          error,
          info,
        });
        throw error;
      }
    },
    {
      watch: [() => route.path, currentLocale],
      server: true,
    }
  );

  /**
   * 获取导航数据
   *
   * 使用 Nuxt Content 3.6.3 的增强查询功能
   * 支持字段选择、条件过滤和排序
   */
  const { data: navigation } = useAsyncData(
    `navigation-${pathInfo.value.module}-${currentLocale.value}`,
    async () => {
      const info = pathInfo.value;

      // 根路径或无集合时返回空导航
      if (info.isRoot || !info.collectionName) {
        return [];
      }

      try {
        logger.info("Fetching navigation data", {
          collectionName: info.collectionName,
          module: info.module,
          version: info.version,
        });

        // 使用增强的 queryCollectionNavigation API
        const rawNav = await queryCollectionNavigation(
          info.collectionName as any,
          [
            // 核心字段
            "icon",
            "title",
            "description",
            // 版本和排序
            "version",
            "order",
            // 显示控制
            "showToc",
            "showNavigation",
          ]
        )
          .where("draft", "<>", true) // 过滤草稿
          .order("order", "ASC"); // 按序号排序

        logger.info("Raw navigation fetched", {
          itemCount: rawNav?.length || 0,
        });

        // 处理导航数据：提取模块级导航并简化路径
        const processedNav = processNavigationData(
          rawNav || [],
          contentLocale.value,
          info.version
        );

        logger.info("Navigation processed successfully", {
          processedCount: processedNav.length,
        });

        return processedNav;
      } catch (error) {
        logger.error("Failed to fetch navigation", {
          error,
          info,
        });
        return [];
      }
    },
    {
      watch: [() => pathInfo.value.module, currentLocale],
      server: true,
    }
  );

  // ==================== 计算属性层 ====================

  /**
   * 页面状态计算属性
   */
  const isHomePage = computed(() => pathInfo.value.isRoot);

  const pageTitle = computed(
    () => page.value?.title || t("docs.meta.defaultTitle")
  );

  const pageDescription = computed(
    () =>
      page.value?.description ||
      t("docs.meta.defaultDescription")
  );

  const currentVersion = computed(
    () => pathInfo.value.version || "v1"
  );

  /**
   * TOC 相关计算属性
   */
  const tocLinks = computed(
    () => page.value?.body?.toc?.links || []
  );

  const hasToc = computed(() => {
    const pageConfig = page.value as PageConfig;
    const showToc = pageConfig?.showToc ?? true;
    return showToc && tocLinks.value.length > 0;
  });

  /**
   * 导航相关计算属性
   */
  const hasNavigation = computed(() => {
    const pageConfig = page.value as PageConfig;
    const showNav = pageConfig?.showNavigation ?? true;
    return (
      showNav &&
      !!navigation.value &&
      navigation.value.length > 0
    );
  });

  /**
   * 面包屑导航 - 使用 Nuxt Content 官方工具
   *
   * 利用 findPageBreadcrumb 自动生成面包屑，
   * 避免手动路径解析的复杂性和错误
   */
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    // 首页直接返回根面包屑
    if (isHomePage.value) {
      return [
        { label: t("docs.breadcrumb.home"), to: "/" },
      ];
    }

    // 数据未就绪时返回默认面包屑
    if (!page.value || !navigation.value) {
      return [
        { label: t("docs.breadcrumb.home"), to: "/" },
      ];
    }

    try {
      // 使用 Nuxt Content 官方工具生成面包屑
      const navBreadcrumb = findPageBreadcrumb(
        navigation.value,
        page.value._path || page.value.path,
        { indexAsChild: true }
      );

      const crumbs: BreadcrumbItem[] = [
        { label: t("docs.breadcrumb.home"), to: "/" },
      ];

      // 转换为标准格式
      if (navBreadcrumb && Array.isArray(navBreadcrumb)) {
        navBreadcrumb.forEach((item: any) => {
          if (item.path && item.title) {
            crumbs.push({
              label: item.title,
              to: item.path,
            });
          }
        });
      }

      return crumbs;
    } catch (error) {
      logger.warn("Failed to generate breadcrumbs", {
        error,
      });
      return [
        { label: t("docs.breadcrumb.home"), to: "/" },
      ];
    }
  });

  /**
   * 首页分区配置
   *
   * 定义首页展示的模块卡片
   */
  const homeSections = computed<HomeSection[]>(() => [
    {
      title: t("docs.sections.getStarted.title"),
      description: t(
        "docs.sections.getStarted.description"
      ),
      to: "/get-started",
    },
    {
      title: t("docs.sections.payments.title"),
      description: t("docs.sections.payments.description"),
      to: "/payments",
    },
    {
      title: t("docs.sections.transfers.title"),
      description: t("docs.sections.transfers.description"),
      to: "/transfers",
    },
  ]);

  // ==================== TOC 重新渲染控制 ====================

  /**
   * TOC 重新渲染机制
   *
   * 解决路由切换时 UContentToc 组件不更新的问题
   * 使用 VueUse 的防抖和条件监听优化性能
   */
  const tocKey = ref(0);

  // 防抖刷新函数，避免频繁更新
  const debouncedRefreshToc = useDebounceFn(() => {
    tocKey.value++;
    logger.debug("TOC refreshed", { newKey: tocKey.value });
  }, 200);

  // 页面加载完成时刷新 TOC
  whenever(
    () => !pageLoading.value && !!page.value,
    () => debouncedRefreshToc(),
    { immediate: false }
  );

  // TOC 内容变化时刷新
  whenever(
    () => tocLinks.value.length > 0,
    () => debouncedRefreshToc(),
    { immediate: false }
  );

  // ==================== SEO 处理 ====================

  /**
   * 自动设置页面 SEO 元数据
   */
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
  });

  // ==================== 调试工具 ====================

  /**
   * 开发调试信息收集
   *
   * 提供组合式函数内部状态的完整视图
   */
  const getDebugInfo = () => ({
    // 路由信息
    currentPath: route.path,
    currentLocale: currentLocale.value,
    contentLocale: contentLocale.value,
    pathInfo: pathInfo.value,

    // 数据状态
    hasPage: !!page.value,
    pageTitle: pageTitle.value,
    navigationCount: navigation.value?.length || 0,

    // 功能状态
    hasNavigation: hasNavigation.value,
    hasToc: hasToc.value,
    tocCount: tocLinks.value.length,
    isHomePage: isHomePage.value,

    // TOC 详情
    tocLinks: tocLinks.value,
    tocKey: tocKey.value,
  });

  // ==================== 公共接口 ====================

  /**
   * 返回组合式函数的公共接口
   *
   * 所有返回值都是只读的，确保数据的不可变性
   */
  return {
    // 核心数据
    page: readonly(page),
    navigation: readonly(navigation) as Readonly<
      Ref<ContentNavigationItem[]>
    >,
    pageLoading: readonly(pageLoading),
    pageError: readonly(pageError),

    // 页面信息
    pageTitle: readonly(pageTitle),
    pageDescription: readonly(pageDescription),
    currentVersion: readonly(currentVersion),
    isHomePage: readonly(isHomePage),

    // 导航相关
    breadcrumbs: readonly(breadcrumbs),
    hasNavigation: readonly(hasNavigation),
    homeSections: readonly(homeSections),

    // TOC 相关
    tocLinks: readonly(tocLinks),
    hasToc: readonly(hasToc),
    tocKey: readonly(tocKey),

    // 路径信息
    pathInfo: readonly(pathInfo),
    currentLocale: readonly(currentLocale),
    contentLocale: readonly(contentLocale),

    // 工具函数
    getDebugInfo,
  };
}

// ==================== 类型导出 ====================

export type { BreadcrumbItem } from "./shared/types";
export type { HomeSection };
