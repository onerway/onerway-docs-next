/**
 * 内容导航处理组合式函数
 *
 * 基于 Nuxt UI 官方模式，处理和映射导航数据
 * 支持导航扁平化和父子关系构建
 * 核心思路：识别 .navigation.yml → 构建父子关系 → 处理 shadow 逻辑 → 应用父级信息
 * 性能优化：使用 VueUse 的 useMemoize、useDebounceFn、useStorage 提升性能
 */

import type { ContentNavigationItem } from "@nuxt/content";
import type { CONTENT_LOCALE_MAP } from "./shared/constants";
import type {
  ContentLocale,
  SupportedLocale,
} from "./shared/types";
import { useMemoize, useStorage } from "@vueuse/core";
import { createLogger } from "~/composables/shared/logger";
import {
  getCollectionLocaleSuffix,
  getContentLocale,
  normalizeModuleName,
} from "~/composables/shared/module";
import { simplifyNavigationPaths } from "~/composables/shared/navigation";
import { useSharedPathInfo } from "~/composables/shared/path";
import {
  LANGUAGE_CONTAINER_IDENTIFIERS,
  LANGUAGE_SUFFIX_REGEX,
  MODULE_CONTAINER_IDENTIFIERS,
  NAVIGATION_FILE_IDENTIFIER,
  PATH_MAPPING_CONFIG,
  SUPPORTED_CONTENT_LOCALES,
} from "./shared/constants";

// 创建日志记录器实例
const logger = createLogger("useContentNavigation");

// ==================== VueUse 优化的缓存和防抖 ====================

/**
 * 使用 useMemoize 缓存导航结果
 * TTL: 5分钟，避免内存占用过多
 * SSR 安全：在服务器端使用内存缓存，客户端使用 localStorage
 */
const navigationCache = useStorage(
  "onerway-navigation-cache",
  new Map<
    string,
    { result: ContentNavigationItem[]; timestamp: number }
  >(),
  import.meta.client ? localStorage : undefined,
  {
    mergeDefaults: true,
    serializer: {
      read: (value: string) => {
        try {
          const parsed = JSON.parse(value);
          return new Map(parsed);
        } catch {
          return new Map();
        }
      },
      write: (
        value: Map<
          string,
          {
            result: ContentNavigationItem[];
            timestamp: number;
          }
        >
      ) => {
        return JSON.stringify([...value.entries()]);
      },
    },
  }
);

/**
 * 序列化跳过规则为字符串
 */
function serializeSkipRules(
  rules?: ContainerSkipRule[]
): string {
  if (!rules || rules.length === 0) return "default";
  return rules
    .map(
      (rule) =>
        `${rule.type}-${rule.depth}-${rule.identifiers?.join(",") || "none"}`
    )
    .join("|");
}

/**
 * 生成缓存键
 */
function generateCacheKey(
  items: ContentNavigationItem[],
  targetModule?: string,
  contentLocale?: ContentLocale,
  defaultVersion?: string,
  skipRules?: ContainerSkipRule[]
): string {
  const itemsHash = JSON.stringify(
    items.map((item) => ({
      title: item.title,
      path: item.path,
      childrenCount: item.children?.length || 0,
    }))
  );
  const rulesHash = serializeSkipRules(skipRules);
  return `${itemsHash}-${targetModule || "all"}-${contentLocale || "zh-cn"}-${defaultVersion || "v1"}-${rulesHash}`;
}

/**
 * 检查缓存是否有效（5分钟TTL）
 */
function isCacheValid(timestamp: number): boolean {
  const TTL = 5 * 60 * 1000; // 5分钟
  return Date.now() - timestamp < TTL;
}

// ==================== 记忆化的昂贵操作 ====================

/**
 * 记忆化的按标题分组函数
 */
const memoizedGroupByTitle = useMemoize(
  (items: ContentNavigationItem[]) => {
    const groupMap = new Map<
      string,
      ContentNavigationItem[]
    >();

    items.forEach((item) => {
      const title = item.title as string;
      if (!title) return;

      if (!groupMap.has(title)) {
        groupMap.set(title, []);
      }
      groupMap.get(title)!.push(item);
    });

    return groupMap;
  }
);

/**
 * 记忆化的子项合并函数
 */
const memoizedMergeChildren = useMemoize(
  (items: ContentNavigationItem[]) => {
    const allChildren: ContentNavigationItem[] = [];

    // 收集所有子项
    items.forEach((item) => {
      if (item.children && Array.isArray(item.children)) {
        allChildren.push(...item.children);
      }
    });

    if (allChildren.length === 0) return [];

    // 递归处理子项 - 按标题分组并合并
    const childGroups = memoizedGroupByTitle(allChildren);
    const mergedChildren: ContentNavigationItem[] = [];

    childGroups.forEach((childGroup) => {
      if (childGroup.length === 1 && childGroup[0]) {
        mergedChildren.push(
          processItemRecursively(childGroup[0])
        );
      } else {
        mergedChildren.push(
          mergeNavigationItemGroup(childGroup)
        );
      }
    });

    return mergedChildren;
  }
);

// ==================== 父子关系处理工具函数 ====================

/**
 * 检测是否为 .navigation.yml 文件
 */
function isNavigationFile(
  item: ContentNavigationItem
): boolean {
  return (
    (item.path as string)?.includes(
      NAVIGATION_FILE_IDENTIFIER
    ) || false
  );
}

/**
 * 管道式处理工具函数
 */
function pipeline<T>(
  input: T,
  ...transforms: Array<(input: T) => T>
): T {
  return transforms.reduce(
    (result, transform) => transform(result),
    input
  );
}

/**
 * 按标题分组所有导航项（使用记忆化版本）
 */
function groupNavigationItemsByTitle(
  items: ContentNavigationItem[]
): Map<string, ContentNavigationItem[]> {
  return memoizedGroupByTitle(items);
}

/**
 * 合并所有children，去重并递归处理（使用记忆化版本）
 */
function mergeAllChildren(
  items: ContentNavigationItem[]
): ContentNavigationItem[] {
  return memoizedMergeChildren(items);
}

/**
 * 选择最佳的主项（优先选择非.navigation文件）
 */
function selectBestMainItem(
  items: ContentNavigationItem[]
): ContentNavigationItem {
  // 优先级：非.navigation文件 > 有更多子项的 > 描述更长的
  return items.reduce((best, current) => {
    logger.debug("主项候选", {
      best,
      current,
    });
    const bestIsNav = isNavigationFile(best);
    const currentIsNav = isNavigationFile(current);

    // 优先选择非.navigation文件
    if (!currentIsNav && bestIsNav) return current;
    if (!bestIsNav && currentIsNav) return best;

    // 比较子项数量
    const bestChildCount = best.children?.length || 0;
    const currentChildCount = current.children?.length || 0;
    if (currentChildCount > bestChildCount) return current;
    if (bestChildCount > currentChildCount) return best;

    // 比较描述长度
    const bestDescLength =
      (best.description as string)?.length || 0;
    const currentDescLength =
      (current.description as string)?.length || 0;
    return currentDescLength > bestDescLength
      ? current
      : best;
  });
}

/**
 * 应用.navigation.yml文件的元数据
 */
function applyNavigationMetadata(
  mainItem: ContentNavigationItem,
  allItems: ContentNavigationItem[]
): ContentNavigationItem {
  const navigationFiles = allItems.filter((item) =>
    isNavigationFile(item)
  );

  if (navigationFiles.length === 0 || !navigationFiles[0])
    return mainItem;

  // 使用第一个.navigation文件的元数据
  const navFile = navigationFiles[0];

  return {
    ...mainItem,
    // 优先使用.navigation文件的元数据
    title: navFile.title || mainItem.title,
    description:
      navFile.description || mainItem.description,
    icon: navFile.icon || mainItem.icon,
    order: navFile.order || mainItem.order,
    // 保留主项的其他重要属性
    path: mainItem.path,
    stem: mainItem.stem,
    children: mainItem.children,
    page: mainItem.page,
  };
}

/**
 * 智能合并同标题的导航项组
 */
function mergeNavigationItemGroup(
  items: ContentNavigationItem[]
): ContentNavigationItem {
  if (items.length === 1 && items[0]) {
    return processItemRecursively(items[0]);
  }

  logger.debug(`合并同标题导航项组: ${items[0]?.title}`, {
    count: items.length,
    items: items.map((item) => ({
      path: item.path,
      isNavFile: isNavigationFile(item),
      hasChildren: !!item.children?.length,
    })),
  });

  // 1. 选择最佳主项
  const mainItem = selectBestMainItem(items);
  logger.debug("选择最佳主项", {
    mainItem,
  });

  // 2. 合并所有子项
  const mergedChildren = mergeAllChildren(items);
  logger.debug("合并后所有子项", {
    mergedChildren,
  });

  // 3. 创建合并后的项目
  const mergedItem: ContentNavigationItem = {
    ...mainItem,
    children:
      mergedChildren.length > 0
        ? mergedChildren
        : undefined,
  };
  logger.debug("合并后项目", {
    mergedItem,
  });

  // 4. 应用.navigation.yml的元数据
  const finalItem = applyNavigationMetadata(
    mergedItem,
    items
  );

  // 5. 递归处理（确保子项也被正确处理）
  return processItemRecursively(finalItem);
}

/**
 * 递归处理每个项目的子项
 */
function processItemRecursively(
  item: ContentNavigationItem
): ContentNavigationItem {
  if (!item.children || item.children.length === 0) {
    return item;
  }

  // 对子项按标题分组并合并
  const childGroups = groupNavigationItemsByTitle(
    item.children
  );
  const processedChildren: ContentNavigationItem[] = [];

  childGroups.forEach((childGroup) => {
    if (childGroup.length === 1 && childGroup[0]) {
      processedChildren.push(
        processItemRecursively(childGroup[0])
      );
    } else {
      processedChildren.push(
        mergeNavigationItemGroup(childGroup)
      );
    }
  });

  return {
    ...item,
    children:
      processedChildren.length > 0
        ? processedChildren
        : undefined,
  };
}

/**
 * 按标题合并所有项目
 */
function mergeItemsByTitle(
  items: ContentNavigationItem[]
): ContentNavigationItem[] {
  const groups = groupNavigationItemsByTitle(items);
  logger.debug("按标题合并所有项目", {
    groups,
  });
  const result: ContentNavigationItem[] = [];

  groups.forEach((group) => {
    if (group.length === 1 && group[0]) {
      result.push(processItemRecursively(group[0]));
    } else {
      result.push(mergeNavigationItemGroup(group));
    }
  });

  return result;
}

/**
 * 容器跳过规则配置接口
 */
export interface ContainerSkipRule {
  /** 要跳过的容器标识符 */
  identifiers?: readonly string[];
  /** 应用此规则的深度 */
  depth: number;
  /** 容器类型名称（用于日志） */
  type: string;
}

/**
 * 默认的容器跳过规则
 */
const DEFAULT_SKIP_RULES: ContainerSkipRule[] = [
  {
    identifiers: LANGUAGE_CONTAINER_IDENTIFIERS,
    depth: 0,
    type: "语言",
  },
  {
    identifiers: MODULE_CONTAINER_IDENTIFIERS,
    depth: 1,
    type: "模块",
  },
  {
    identifiers: [],
    depth: 2,
    type: "模块",
  },
];

/**
 * 创建自定义容器跳过规则的工具函数
 */
export const createContainerSkipRule = (
  identifiers: string[],
  depth: number,
  type: string
): ContainerSkipRule => ({
  identifiers: identifiers as readonly string[],
  depth,
  type,
});

/**
 * 预定义的常用跳过规则
 */
export const CONTAINER_SKIP_PRESETS = {
  /** 只跳过语言容器 */
  LANGUAGE_ONLY: [DEFAULT_SKIP_RULES[0]],
  /** 只跳过模块容器 */
  MODULE_ONLY: [DEFAULT_SKIP_RULES[1]],
  /** 跳过所有默认容器（语言 + 模块） */
  ALL_DEFAULT: DEFAULT_SKIP_RULES,
  /** 不跳过任何容器 */
  NONE: [] as ContainerSkipRule[],
} as const;

/**
 * 使用 flatMap 跳过容器层级 - 灵活配置版本
 *
 * @param items - 要处理的导航项数组
 * @param options - 配置选项
 * @param options.depth - 当前处理深度，从 0 开始
 * @param options.rules - 自定义跳过规则，默认使用语言和模块容器规则
 * @param options.maxDepth - 最大递归深度，防止无限递归，默认 10
 * @returns 处理后的导航项数组
 *
 * @example
 * // 使用默认规则跳过语言和模块容器
 * const result = skipContainers(items);
 *
 * // 只跳过语言容器
 * const result = skipContainers(items, {
 *   rules: CONTAINER_SKIP_PRESETS.LANGUAGE_ONLY
 * });
 *
 * // 自定义跳过规则
 * const result = skipContainers(items, {
 *   rules: [createContainerSkipRule(["Custom Container"], 0, "自定义")]
 * });
 *
 * // 不跳过任何容器
 * const result = skipContainers(items, {
 *   rules: CONTAINER_SKIP_PRESETS.NONE
 * });
 */
export function skipContainers(
  items: ContentNavigationItem[],
  options: {
    depth?: number;
    rules?: ContainerSkipRule[];
    maxDepth?: number;
  } = {}
): ContentNavigationItem[] {
  const {
    depth = 0,
    rules = DEFAULT_SKIP_RULES,
    maxDepth = 10,
  } = options;

  // 防止无限递归
  if (depth > maxDepth) {
    logger.warn(
      `跳过容器递归深度超过限制 ${maxDepth}，停止处理`
    );
    return items;
  }

  return items.flatMap((item) => {
    // 检查是否匹配任何跳过规则
    const matchedRule = rules.find(
      (rule) =>
        rule.depth === depth ||
        rule.identifiers?.includes(item?.title as string)
    );

    if (matchedRule) {
      logger.debug(
        `跳过${matchedRule.type}容器: ${item.title} (深度: ${depth})`
      );

      // 递归处理子项，深度 +1
      return item.children?.length
        ? skipContainers(item.children, {
            depth: depth + 1,
            rules,
            maxDepth,
          })
        : [];
    }

    return [item];
  });
}

/**
 * 根据目标模块过滤导航项
 */
function filterByModule(
  items: ContentNavigationItem[],
  targetModule?: string
): ContentNavigationItem[] {
  if (!targetModule) return items;

  return items.filter((item) => {
    if (!item.path) return true;

    const pathSegments = item.path
      .split("/")
      .filter(Boolean);
    const itemModule = pathSegments[1];

    if (
      itemModule &&
      normalizeModuleName(itemModule) !==
        normalizeModuleName(targetModule)
    ) {
      logger.debug(`跳过非目标模块: ${item.title}`);
      return false;
    }

    return true;
  });
}

/**
 * 清理单个导航项
 */
function cleanNavigationItem(
  item: ContentNavigationItem
): ContentNavigationItem {
  const cleanedItem: ContentNavigationItem = {
    ...item,
    title: (item.title as string)
      ?.replace(/\d+$/, "")
      .trim(), // 移除标题末尾的数字
    path: (item.path as string)?.replace(
      new RegExp(`\\/${NAVIGATION_FILE_IDENTIFIER}$`),
      ""
    ), // 移除路径中的 .navigation 后缀
    children: item.children?.map((child) =>
      cleanNavigationItem(child)
    ),
  };

  return cleanedItem;
}

/**
 * 扁平化导航项，正确处理父子关系和 shadow 逻辑
 * 核心思路：识别 .navigation.yml → 构建父子关系 → 处理 shadow 逻辑 → 应用父级信息
 * 跳过层级：语言容器（深度0）和模块容器（深度1）
 * 性能优化：使用缓存和防抖提升性能
 *
 * @param navigationItems - 原始导航数据数组
 * @param targetModule - 目标模块名（如 "get-started"），用于过滤
 * @param contentLocale - 内容语言，用于路径简化
 * @param defaultVersion - 默认版本，用于路径简化
 * @param skipRules - 自定义跳过规则，默认使用 DEFAULT_SKIP_RULES
 * @returns 扁平化后的导航数据
 *
 * @example
 * // 使用默认规则
 * const result = flattenNavigationItems(items, "get-started", "zh-cn", "v1");
 *
 * // 使用自定义规则
 * const customRules = [createContainerSkipRule(["Custom"], 0, "自定义")];
 * const result = flattenNavigationItems(items, "get-started", "zh-cn", "v1", customRules);
 *
 * // 不跳过任何容器
 * const result = flattenNavigationItems(items, "get-started", "zh-cn", "v1", CONTAINER_SKIP_PRESETS.NONE);
 */
function _flattenNavigationItemsCore(
  navigationItems: ContentNavigationItem[],
  targetModule?: string,
  contentLocale?: ContentLocale,
  defaultVersion?: string,
  skipRules?: ContainerSkipRule[]
): ContentNavigationItem[] {
  // 生成缓存键
  const cacheKey = generateCacheKey(
    navigationItems,
    targetModule,
    contentLocale,
    defaultVersion,
    skipRules
  );

  // 检查缓存
  const cached = navigationCache.value.get(cacheKey);
  if (cached && isCacheValid(cached.timestamp)) {
    logger.debug("使用缓存的导航结果", { cacheKey });
    return cached.result;
  }

  logger.debug("开始扁平化导航处理", {
    itemCount: navigationItems.length,
    targetModule,
    cacheKey,
  });

  const result = pipeline(
    navigationItems,
    // 1. 跳过容器（使用自定义规则或默认规则）
    (items) => {
      const result = skipContainers(items, {
        depth: 0,
        rules: skipRules || DEFAULT_SKIP_RULES,
      });
      logger.debug("跳过容器后", {
        itemCount: result.length,
        result,
        usingCustomRules: !!skipRules,
      });
      return result;
    },
    // 2. 按标题合并所有项目
    (items) => mergeItemsByTitle(items),
    // 3. 按模块过滤
    (items) => filterByModule(items, targetModule),
    // 4. 清理导航项
    (items) =>
      items.map((item) => cleanNavigationItem(item)),
    // 5. 简化路径（如果提供了语言和版本信息）
    (items) =>
      contentLocale && defaultVersion
        ? simplifyNavigationPaths(
            items,
            contentLocale,
            defaultVersion
          )
        : items
  );

  // 缓存结果
  navigationCache.value.set(cacheKey, {
    result,
    timestamp: Date.now(),
  });

  logger.debug("导航处理完成并缓存", {
    resultCount: result.length,
    cacheKey,
  });

  return result;
}

/**
 * 导航扁平化函数（已优化缓存）
 * 由于flattenNavigationItems在computed中使用，需要同步返回
 * 防抖逻辑已通过缓存机制实现类似效果
 */
const flattenNavigationItems = _flattenNavigationItemsCore;

/**
 * 从集合名称中提取模块名
 *
 * @param collectionName - 集合名称，如 "get_started_en"
 * @returns 模块名，如 "get-started"
 */
function extractModuleFromCollectionName(
  collectionName: string
): string {
  // 移除语言后缀
  const withoutLanguageSuffix = collectionName.replace(
    LANGUAGE_SUFFIX_REGEX,
    ""
  );
  // 转换下划线为连字符
  return withoutLanguageSuffix.replace(/_/g, "-");
}

/**
 * 从路径中提取模块名
 *
 * @param path - 路径字符串，如 "/en/get-started/overview"
 * @returns 模块名，如 "get-started"
 */
function extractModuleFromPath(
  path: string
): string | undefined {
  const pathSegments = path.split("/").filter(Boolean);
  let moduleSegment = pathSegments[0];

  // 如果第一个路径段是语言标识符，则使用下一个段作为模块名
  if (
    SUPPORTED_CONTENT_LOCALES.includes(
      moduleSegment as keyof typeof CONTENT_LOCALE_MAP
    )
  ) {
    moduleSegment = pathSegments[1];
  }

  return moduleSegment;
}

/**
 * 检查导航项是否应该被过滤
 *
 * @param navigationItem - 导航项
 * @param currentModuleName - 当前模块名
 * @returns 是否应该过滤该导航项
 */
function shouldFilterNavigationItem(
  navigationItem: ContentNavigationItem,
  currentModuleName: string | undefined
): boolean {
  // 过滤草稿内容
  if (navigationItem.draft) {
    logger.debug("过滤草稿内容", {
      title: navigationItem.title,
      path: navigationItem.path,
    });
    return true;
  }

  // 如果存在当前模块且有路径，检查模块匹配
  if (currentModuleName && navigationItem.path) {
    const itemModule = extractModuleFromPath(
      navigationItem.path as string
    );

    if (itemModule) {
      const normalizedItemModule =
        normalizeModuleName(itemModule);
      const isModuleMatch =
        normalizedItemModule === currentModuleName;

      if (!isModuleMatch) {
        logger.debug("过滤模块不匹配的导航项", {
          title: navigationItem.title,
          path: navigationItem.path,
          itemModule: normalizedItemModule,
          currentModule: currentModuleName,
        });
        return true;
      }
    }
  }

  return false;
}

/**
 * 处理内容导航数据
 *
 * @param allNavigations - 从 app.vue 传入的所有导航数据
 * @returns 映射和过滤后的导航数据
 */
export function useContentNavigation(
  allNavigations: Ref<Record<
    string,
    ContentNavigationItem[]
  > | null>
) {
  const { locale } = useI18n();
  const { pathInfo } = useSharedPathInfo();

  // 自动检测当前模块
  const currentModule = computed(() => {
    return pathInfo.value.module;
  });

  // 根据当前语言生成当前集合语言后缀
  const collectionLocaleSuffix = computed(() => {
    return getCollectionLocaleSuffix(locale.value);
  });

  // 将所有导航数据映射为标准格式
  const mappedNavigation = computed(() => {
    if (!allNavigations.value) return [];

    // 获取当前内容语言和默认版本
    // 计算内容语言（将 UI 语言转换为内容语言）
    const contentLocale = computed(() =>
      getContentLocale(locale.value as SupportedLocale)
    );
    const defaultVersion =
      PATH_MAPPING_CONFIG.defaultVersion;

    // 收集并合并所有模块的导航数据
    const allNavigationItems: ContentNavigationItem[] = [];

    Object.entries(allNavigations.value).forEach(
      ([collection, items]) => {
        // 只处理当前语言环境的导航数据
        if (
          collection.endsWith(
            collectionLocaleSuffix.value
          ) &&
          Array.isArray(items)
        ) {
          try {
            // 使用 Nuxt UI Pro 的工具映射导航数据
            logger.info("处理集合数据", {
              collection,
              itemCount: items.length,
            });

            // 从包含语言后缀的集合名提取模块名
            const moduleFromCollection =
              extractModuleFromCollectionName(collection);

            // 扁平化处理，移除语言层级，并按模块过滤，同时简化路径
            const processedItems = flattenNavigationItems(
              items,
              moduleFromCollection,
              contentLocale.value,
              defaultVersion
            );

            allNavigationItems.push(...processedItems);
          } catch (error) {
            logger.error("处理导航数据失败", {
              collection,
              error,
            });
          }
        }
      }
    );

    return allNavigationItems;
  });

  // 根据当前模块和状态过滤导航数据
  const filteredNavigation = computed(() => {
    logger.info(
      "filteredNavigation",
      mappedNavigation.value
    );
    logger.info(
      "currentModule(当前模块)",
      currentModule.value
    );
    return mappedNavigation.value.filter(
      (navigationItem) =>
        !shouldFilterNavigationItem(
          navigationItem,
          currentModule.value
        )
    );
  });

  /**
   * 获取特定模块的导航数据
   *
   * @param module - 模块名称，如 "get-started"
   * @param skipRules - 可选的自定义跳过规则，默认使用 DEFAULT_SKIP_RULES
   * @returns 处理后的模块导航数据
   *
   * @example
   * // 使用默认规则
   * const navigation = getModuleNavigation("get-started");
   *
   * // 使用自定义规则
   * const customRules = CONTAINER_SKIP_PRESETS.LANGUAGE_ONLY;
   * const navigation = getModuleNavigation("get-started", customRules);
   *
   * // 不跳过任何容器
   * const navigation = getModuleNavigation("get-started", CONTAINER_SKIP_PRESETS.NONE);
   */
  const getModuleNavigation = (
    module: string,
    skipRules?: ContainerSkipRule[]
  ) => {
    if (!allNavigations.value) return [];

    const normalizedModule = normalizeModuleName(module);
    const currentLocaleKey = collectionLocaleSuffix.value;

    // 找到对应模块的集合
    const targetCollection = Object.keys(
      allNavigations.value
    ).find((collection) => {
      // 从包含语言后缀的集合名提取模块名
      const moduleFromCollection =
        extractModuleFromCollectionName(collection);
      return (
        moduleFromCollection === normalizedModule &&
        collection.endsWith(currentLocaleKey)
      );
    });

    if (!targetCollection) {
      logger.warn("未找到模块对应的集合", {
        module: normalizedModule,
      });
      return [];
    }

    const targetNavigations =
      allNavigations.value[targetCollection];
    if (!Array.isArray(targetNavigations)) return [];

    try {
      // 获取当前内容语言和默认版本用于路径简化
      const contentLocale = locale.value as ContentLocale;
      const defaultVersion =
        PATH_MAPPING_CONFIG.defaultVersion;

      return flattenNavigationItems(
        targetNavigations,
        normalizedModule,
        contentLocale,
        defaultVersion,
        skipRules
      );
    } catch (error) {
      logger.error("获取模块导航失败", {
        module: normalizedModule,
        error,
      });
      return [];
    }
  };

  return {
    /** 映射后的所有导航数据 */
    mappedNavigation,
    /** 根据当前模块过滤后的导航数据 */
    filteredNavigation,
    /** 当前页面所属模块（只读） */
    currentModule: readonly(currentModule),
    /** 获取指定模块导航数据的方法，支持自定义跳过规则 */
    getModuleNavigation,
  };
}
