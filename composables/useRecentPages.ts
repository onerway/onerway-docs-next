/**
 * 最近访问页面管理组合式函数
 *
 * 基于 VueUse 的响应式存储和防抖机制
 * 支持自动页面信息生成和智能时间格式化
 * SSR 安全的客户端状态管理
 * 性能优化：使用 VueUse 的 useLocalStorage、useDebounceFn 提升性能
 */

import type {
  FormattedRecentPage,
  RecentPage,
  SupportedLocale,
} from "./shared/types";
import {
  MAX_RECENT_PAGES,
  PAGE_ADD_DEBOUNCE_DELAY,
} from "./shared/constants";
import {
  cleanTitle,
  createLogger,
  formatTime,
  formatTimeI18n,
  generateDescriptionFromPath,
  generateTitleFromPath,
  getModuleColor,
  getModuleIcon,
  getTimeColor,
  shouldSkipPath,
  useDebounceFn,
  useStorage,
} from "./shared/utils";

// 创建日志记录器实例
const logger = createLogger("useRecentPages");

// ==================== VueUse 优化的存储管理 ====================

/**
 * 使用 VueUse 的 useStorage 创建响应式最近页面存储
 * SSR 安全：在服务器端使用内存存储，客户端使用 localStorage
 */
const recentPagesStorage = useStorage<RecentPage[]>(
  "onerway-recent-pages",
  [],
  import.meta.client ? localStorage : undefined,
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
      write: (value: RecentPage[]) => JSON.stringify(value),
    },
  }
);

// ==================== 页面信息生成工具函数 ====================

/**
 * 生成完整的页面信息
 * 优先从页面 head 信息获取，降级到路径推断
 */
function generatePageInfo(
  path: string
): Omit<RecentPage, "timestamp"> {
  // 尝试从 Nuxt 应用状态获取当前页面的 head 信息
  const pageInfo = tryGetPageHeadInfo();

  // 使用页面 head 信息或降级到路径推断
  const title =
    pageInfo?.title || generateTitleFromPath(path);
  const description =
    pageInfo?.description ||
    generateDescriptionFromPath(path);
  const icon = getModuleIcon(path);
  const iconColor = getModuleColor(path);

  return {
    path,
    title: cleanTitle(title),
    description,
    icon,
    iconColor,
  };
}

/**
 * 尝试从当前页面的 DOM 获取 head 信息
 * SSR 安全的实现，只在客户端执行
 */
function tryGetPageHeadInfo(): {
  title?: string;
  description?: string;
} | null {
  if (!import.meta.client) {
    return null;
  }

  try {
    // 从 document 获取当前页面的 meta 信息
    const titleElement = document.querySelector("title");
    const descriptionMeta = document.querySelector(
      'meta[name="description"], meta[property="og:description"]'
    );

    // 提取并清理标题
    let title = titleElement?.textContent || "";
    title = title
      .replace(/ - Onerway Docs?$/i, "")
      .replace(/^Onerway Docs? - ?/i, "")
      .trim();

    // 提取描述
    const description =
      descriptionMeta?.getAttribute("content")?.trim() ||
      "";

    return {
      title:
        title && title !== "Onerway Docs"
          ? title
          : undefined,
      description:
        description.length > 0 ? description : undefined,
    };
  } catch (error) {
    logger.warn(
      "获取页面 head 信息失败，降级到路径推断",
      error
    );
    return null;
  }
}

// ==================== 主要 Composable ==========

/**
 * 最近访问页面管理 Composable
 *
 * @returns 包含页面管理相关响应式数据和方法的对象
 *
 * @example
 * const {
 *   recentPages,        // 原始最近页面数据
 *   formattedPages,     // 格式化后的页面数据（包含时间格式化）
 *   recentThreePages,   // 最近3个页面
 *   addCurrentPage,     // 添加当前页面
 *   removePage,         // 移除页面
 *   clearPages,         // 清空所有页面
 *   stats               // 统计信息
 * } = useRecentPages();
 */
export function useRecentPages() {
  const route = useRoute();
  const { locale } = useI18n();

  // ==================== 防抖的页面添加函数 ====================

  /**
   * 防抖的添加页面函数
   * 避免快速连续的页面访问导致重复记录
   */
  const addCurrentPage = useDebounceFn(
    async (currentPath?: string) => {
      if (!route && !currentPath) return;

      const path = currentPath || route?.path;
      if (!path) return;

      if (shouldSkipPath(path)) {
        logger.warn(`跳过路径记录: ${path}`);
        return;
      }

      try {
        // 生成页面信息
        const pageInfo = generatePageInfo(path);

        // 创建页面对象
        const page: RecentPage = {
          ...pageInfo,
          timestamp: Date.now(),
        };

        logger.info(`添加页面: ${page.title}`, {
          path: page.path,
          timestamp: page.timestamp,
        });

        // 更新存储：移除重复项，添加到开头，限制总数
        recentPagesStorage.value = [
          page,
          ...recentPagesStorage.value.filter(
            (p) => p.path !== page.path
          ),
        ].slice(0, MAX_RECENT_PAGES);
      } catch (error) {
        logger.error(`添加页面失败: ${path}`, error);
      }
    },
    PAGE_ADD_DEBOUNCE_DELAY
  );

  // ==================== 页面管理方法 ====================

  /**
   * 移除指定路径的页面
   */
  const removePage = (path: string) => {
    logger.info(`移除页面: ${path}`);
    recentPagesStorage.value =
      recentPagesStorage.value.filter(
        (page) => page.path !== path
      );
  };

  /**
   * 清空所有最近访问的页面
   */
  const clearPages = () => {
    logger.info("清空所有最近页面");
    recentPagesStorage.value = [];
  };

  // ==================== 计算属性 ====================

  /**
   * 格式化的最近页面列表
   * 包含格式化的时间和颜色信息
   */
  const formattedPages = computed(
    (): FormattedRecentPage[] => {
      return recentPagesStorage.value.map((page) => ({
        ...page,
        formattedTime: formatTime(page.timestamp),
        timeColor: getTimeColor(page.timestamp),
        // 确保 icon 和 iconColor 有默认值
        icon: page.icon || "i-heroicons-document",
        iconColor: page.iconColor || "text-primary",
      }));
    }
  );

  /**
   * 获取最近的3个页面
   * 用于在组件中显示简化列表
   */
  const recentThreePages = computed(() =>
    formattedPages.value.slice(0, 3)
  );

  /**
   * 获取最近页面的统计信息
   */
  const stats = computed(() => ({
    totalPages: recentPagesStorage.value.length,
    maxPages: MAX_RECENT_PAGES,
    hasPages: recentPagesStorage.value.length > 0,
  }));

  // ==================== 自动路由监听 ====================

  // 客户端路由监听和初始记录
  if (import.meta.client) {
    // 使用 onMounted 确保组件挂载后再记录初始页面
    onMounted(() => {
      logger.info("路由监听初始化", { path: route.path });
      addCurrentPage();
    });

    // 监听路由变化
    watch(
      () => route.path,
      (newPath, oldPath) => {
        logger.info("路由变化监听", {
          newPath,
          oldPath,
          shouldSkip: shouldSkipPath(newPath || ""),
        });

        if (newPath && !shouldSkipPath(newPath)) {
          addCurrentPage(newPath);
        }
      },
      { immediate: false }
    );
  }

  // ==================== 返回 API ====================

  return {
    // 状态 - 保持向后兼容
    recentPages: readonly(recentPagesStorage),
    pages: readonly(recentPagesStorage), // 别名兼容
    formattedPages: readonly(formattedPages),
    recentThreePages: readonly(recentThreePages),
    stats: readonly(stats),

    // 方法 - 保持向后兼容
    addCurrentPage,
    removePage,
    clearPages,

    // 工具函数 - 暴露给组件使用
    formatTime: (timestamp: number) =>
      formatTime(timestamp),
    formatTimeI18n: (timestamp: number) =>
      formatTimeI18n(timestamp, locale.value || "en"),
    getTimeColor: (timestamp: number) =>
      getTimeColor(timestamp),

    // 调试工具（仅开发环境）
    ...(import.meta.dev
      ? {
          debugInfo: () => ({
            storageSize: recentPagesStorage.value.length,
            latestPage:
              recentPagesStorage.value[0]?.title ||
              "No pages",
            locale: locale.value,
          }),
        }
      : {}),
  };
}

// ==================== 类型导出 ====================

// 重新导出类型以保持兼容性
export type {
  FormattedRecentPage,
  RecentPage,
  SupportedLocale,
};
