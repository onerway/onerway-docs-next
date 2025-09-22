/**
 * 页面数据获取组合式函数
 *
 * 提供统一的页面内容和导航数据获取逻辑，支持：
 * - 自动语言回退（当前语言不存在时回退到英文）
 * - 周围导航数据获取（上一页/下一页）
 * - SSR 兼容和缓存优化
 * - 响应式路径和语言监听
 */

import { kebabCase } from "scule";
import { createLogger } from "~/composables/shared/logger";
import {
  buildCollectionName,
  getContentLocale,
} from "~/composables/shared/module";
import {
  normalizePath,
  parsePathInfo,
  useSharedPathInfo,
} from "~/composables/shared/path";

// 创建日志记录器实例
const logger = createLogger("usePageData");

/**
 * 页面内容数据类型 - 灵活的类型定义以适应 Nuxt Content
 */
export interface PageContent {
  title?: string;
  description?: string;
  navigation?: Record<string, unknown> | boolean;
  body?: {
    toc?: {
      links?: Array<{
        text: string;
        id: string;
        depth: number;
      }>;
    };
  };
  showNavigation?: boolean;
  showToc?: boolean;
  showFooter?: boolean;
  path?: string;
  draft?: boolean;
  [key: string]: unknown;
}

/**
 * 页面数据接口定义
 */
export interface PageData {
  /** 页面内容 */
  page: Ref<PageContent | null>;
  /** 周围导航数据（上一页/下一页） */
  surround: Ref<unknown>;
  /** 页面加载状态 */
  isLoading: Ref<boolean>;
  /** 错误状态 */
  error: Ref<Error | null>;
  /** 刷新页面数据的方法 */
  refresh: () => Promise<void>;
  /** 获取指定路径的页面数据方法 */
  getPageByPath: (
    path: string
  ) => Promise<PageContent | null>;
}

/**
 * 页面数据获取配置
 */
export interface UsePageDataOptions {
  /** 是否自动监听路由变化，默认为 true */
  watchRoute?: boolean;
  /** 是否启用英文回退，默认为 true */
  enableFallback?: boolean;
  /** 缓存键前缀，默认使用路径 */
  cacheKeyPrefix?: string;
  /** 是否获取周围导航数据，默认为 true */
  includeSurround?: boolean;
}

/**
 * 获取页面内容数据
 *
 * @param pathInfo - 路径信息对象
 * @param enableFallback - 是否启用英文回退
 * @returns 页面内容数据
 */
async function fetchPageContent(
  pathInfo: ReturnType<
    typeof useSharedPathInfo
  >["pathInfo"]["value"],
  enableFallback: boolean = true
): Promise<PageContent | null> {
  // 检查集合名称是否存在
  if (!pathInfo.collectionName) {
    throw createError({
      statusCode: 404,
      statusMessage: "Collection not found",
    });
  }

  logger.info("fetchPageContent", {
    collectionName: pathInfo.collectionName,
    contentPath: pathInfo.contentPath,
  });

  // 1) 尝试获取当前语言内容
  let doc = await queryCollection(
    // @ts-expect-error: Dynamic collection name from pathInfo
    pathInfo.collectionName
  )
    .path(pathInfo.contentPath)
    .first();

  // 2) 如果不存在且启用回退，尝试获取英文内容
  if (!doc && enableFallback && pathInfo.module) {
    const fallbackLocale = "en";
    const fallbackCollection = buildCollectionName(
      pathInfo.module,
      fallbackLocale as "en"
    );

    // 将内容路径的首个语言段替换为 /en/
    const fallbackPath = pathInfo.contentPath.replace(
      /^\/[a-z]{2}(?:-[a-z]{2})?\//i,
      `/${fallbackLocale}/`
    );

    logger.info("fallback to EN", {
      fallbackCollection,
      fallbackPath,
    });

    doc = await queryCollection(
      // @ts-expect-error: Dynamic collection name from buildCollectionName
      fallbackCollection
    )
      .path(fallbackPath)
      .first();
  }

  return doc as PageContent | null;
}

/**
 * 获取周围导航数据
 *
 * @param pathInfo - 路径信息对象
 * @returns 周围导航数据
 */
async function fetchSurroundData(
  pathInfo: ReturnType<
    typeof useSharedPathInfo
  >["pathInfo"]["value"]
): Promise<unknown> {
  if (!pathInfo.collectionName) {
    return null;
  }

  const surroundings =
    await queryCollectionItemSurroundings(
      // @ts-expect-error: Dynamic collection name from pathInfo
      pathInfo.collectionName,
      pathInfo.contentPath,
      {
        fields: ["description", "title"],
      }
    );

  logger.info("surroundings", surroundings);
  return surroundings;
}

/**
 * 页面数据获取组合式函数
 *
 * @param options - 配置选项
 * @returns 页面数据响应式对象和相关方法
 */
export function usePageData(
  options: UsePageDataOptions = {}
): PageData {
  const {
    watchRoute = true,
    enableFallback = true,
    cacheKeyPrefix,
    includeSurround = true,
  } = options;

  const route = useRoute();
  const { locale } = useI18n();
  const { pathInfo } = useSharedPathInfo();

  // 响应式状态
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  // 生成缓存键
  const cacheKey = computed(() => {
    const prefix =
      cacheKeyPrefix ||
      kebabCase(pathInfo.value.contentPath);
    return `page-data-${prefix}`;
  });

  const surroundCacheKey = computed(() => {
    const prefix = cacheKeyPrefix || kebabCase(route.path);
    return `${prefix}-surround`;
  });

  // 获取页面内容数据
  const { data: page, refresh: refreshPage } = useAsyncData(
    cacheKey,
    async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const doc = await fetchPageContent(
          pathInfo.value,
          enableFallback
        );
        logger.info("page data fetched", doc);

        return doc;
      } catch (err) {
        const errorObj =
          err instanceof Error
            ? err
            : new Error(String(err));
        error.value = errorObj;
        logger.error("Failed to fetch page data", errorObj);
        throw errorObj;
      } finally {
        isLoading.value = false;
      }
    },
    {
      watch: watchRoute ? [() => route.path, locale] : [],
    }
  );

  // 获取周围导航数据
  const { data: surround, refresh: refreshSurround } =
    useAsyncData(
      surroundCacheKey,
      async () => {
        if (!includeSurround) return null;

        try {
          return await fetchSurroundData(pathInfo.value);
        } catch (err) {
          logger.warn("Failed to fetch surround data", err);
          return null;
        }
      },
      {
        watch: watchRoute ? [() => route.path, locale] : [],
      }
    );

  /**
   * 刷新所有页面数据
   */
  const refresh = async () => {
    await Promise.all([
      refreshPage(),
      includeSurround
        ? refreshSurround()
        : Promise.resolve(),
    ]);
  };

  /**
   * 根据指定路径获取页面数据
   *
   * @param path - 页面路径
   * @returns 页面内容
   */
  const getPageByPath = async (path: string) => {
    // 这里需要根据路径构建 pathInfo，暂时简化实现
    // 实际使用时可能需要更复杂的路径解析逻辑
    const normalizedPath = normalizePath(path);
    const contentLocale = getContentLocale(
      locale.value as SupportedLocale
    );

    try {
      // 使用当前的 pathInfo 作为基础，修改 contentPath
      const targetPathInfo = parsePathInfo(
        normalizedPath,
        contentLocale
      );

      return await fetchPageContent(
        targetPathInfo,
        enableFallback
      );
    } catch (err) {
      logger.error("Failed to fetch page by path", {
        path,
        error: err,
      });
      return null;
    }
  };

  // 开发环境调试信息
  if (import.meta.dev) {
    logger.info("usePageData initialized", {
      pathInfo: pathInfo.value,
      options,
      hasPage: !!page.value,
      hasSurround: !!surround.value,
    });
  }

  return {
    page: readonly(page) as Ref<PageContent | null>,
    surround: readonly(surround),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh,
    getPageByPath,
  };
}

/**
 * 获取指定路径的页面标题和描述
 * 便捷方法，专门用于获取页面的基本信息
 *
 * @param path - 页面路径
 * @returns 包含标题和描述的对象
 */
export async function getPageInfo(path: string): Promise<{
  title?: string;
  description?: string;
} | null> {
  try {
    const { getPageByPath } = usePageData({
      watchRoute: false,
      includeSurround: false,
    });

    const page = await getPageByPath(path);

    if (!page) return null;

    return {
      title: page.title || "",
      description: page.description || "",
    };
  } catch (error) {
    logger.error("Failed to get page info", {
      path,
      error,
    });
    return null;
  }
}

/**
 * 获取当前页面的标题
 *
 * @param page - 页面数据
 * @returns 页面标题
 */
export function usePageTitle(
  page: Ref<PageContent | null>
) {
  return computed(() => {
    if (!page.value) return "";
    return page.value.title || "";
  });
}

/**
 * 获取当前页面的描述
 *
 * @param page - 页面数据
 * @returns 页面描述
 */
export function usePageDescription(
  page: Ref<PageContent | null>
) {
  return computed(() => page.value?.description || "");
}
