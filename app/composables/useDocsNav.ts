// composables/useDocsNav.ts
import { computed, type Ref } from "vue";
import { useRoute } from "#imports";
import type { ContentNavigationItem } from "@nuxt/content";
import type { NavigationMenuItem } from "@nuxt/ui";

/**
 * 文档导航配置项
 * @property includeModules 是否在菜单中显示顶层模块目录（level 1）
 */
export interface DocsNavOptions {
  includeModules?: boolean;
}

/**
 * 文档导航组合式函数
 * 将 Nuxt Content 的导航树转换为 Nuxt UI NavigationMenu 所需的数据结构
 *
 * @param rootNav - Nuxt Content 的导航树根节点
 * @param options - 配置项
 * @returns 包含 navigationItems 的响应式数据
 *
 * @example
 * ```ts
 * const { data: nav } = await useAsyncData('nav', () => fetchContentNavigation())
 * const { navigationItems } = useDocsNav(nav, { includeModules: false })
 * ```
 */
export function useDocsNav(
  rootNav: Ref<ContentNavigationItem[] | undefined>,
  options: DocsNavOptions = {}
) {
  const route = useRoute();
  const { includeModules = false } = options;

  /**
   * 根据内容项和子节点信息决定菜单项类型
   */
  function determineMenuItemType(
    item: ContentNavigationItem,
    hasChildren: boolean
  ): NavigationMenuItem["type"] {
    if (item.page === false) {
      return "label";
    }
    if (hasChildren) {
      return "trigger";
    }
    return "link";
  }

  /**
   * 应用内容项的自定义字段到菜单项
   * 包括：icon、badge、trailingIcon、module 等
   */
  function applyCustomFields(
    menuItem: NavigationMenuItem,
    item: ContentNavigationItem
  ): void {
    if (item.icon) {
      menuItem.icon = item.icon;
    }
    if (item.badge) {
      menuItem.badge = item.badge;
    }
    if (item.trailingIcon) {
      menuItem.trailingIcon = item.trailingIcon;
    }
    // 标记为模块时，设置默认展开
    if (item.module) {
      menuItem.defaultOpen = true;
      menuItem.class = "py-3 border-t border-default";
      // 确保模块有图标（即使为空字符串，由 UI 组件决定默认图标）
      if (!menuItem.icon) {
        menuItem.icon = "";
      }
    }
  }

  /**
   * 创建用于展平的占位节点
   * 当不显示顶层模块时，返回一个占位节点，其子节点会在上层被提升
   */
  function createFlattenPlaceholder(
    children: NavigationMenuItem[]
  ): NavigationMenuItem {
    return {
      label: "", // 空标签，不会被渲染
      children,
      type: "label",
    };
  }

  /**
   * 递归转换 Content 导航项为 UI 菜单项
   *
   * @param item - Content 导航项
   * @param level - 当前层级（1 为顶层）
   * @returns 转换后的菜单项，如果应该跳过则返回 null
   */
  function transformToMenuItem(
    item: ContentNavigationItem,
    level = 1
  ): NavigationMenuItem | null {
    // 递归转换子节点
    const children = item.children
      ?.map((child) =>
        transformToMenuItem(child, level + 1)
      )
      .filter(Boolean) as NavigationMenuItem[] | undefined;

    const hasChildren = Boolean(
      children && children.length > 0
    );

    // 判断是否为需要展平的顶层节点
    const shouldFlattenTopLevel =
      level === 1 && !includeModules;

    // 如果不显示顶层模块，返回占位节点用于后续展平
    if (shouldFlattenTopLevel) {
      return createFlattenPlaceholder(children ?? []);
    }

    // 构建基础菜单项
    const menuItem: NavigationMenuItem = {
      label: item.title,
      to: item.page === false ? undefined : item.path,
      type: determineMenuItemType(item, hasChildren),
      children: hasChildren ? children : undefined,
    };

    // 应用自定义字段
    applyCustomFields(menuItem, item);

    return menuItem;
  }

  /**
   * 递归标记活动节点并展开其父节点
   * ⚠️ 注意：此函数会修改传入的菜单项对象（副作用）
   *
   * @param items - 菜单项数组
   * @param currentPath - 当前路由路径
   * @returns 是否有节点被标记为活动
   */
  function markActiveAndExpandParents(
    items: NavigationMenuItem[],
    currentPath: string
  ): boolean {
    let hasActiveChild = false;

    for (const item of items) {
      let isItemActive = false;

      // 检查当前项是否匹配路由
      if (item.to && currentPath === item.to) {
        isItemActive = true;
      }

      // 递归检查子节点
      if (item.children) {
        const childIsActive = markActiveAndExpandParents(
          item.children,
          currentPath
        );
        if (childIsActive) {
          isItemActive = true;
          item.defaultOpen = true; // 展开包含活动子节点的父节点
        }
      }

      // 标记活动状态
      if (isItemActive) {
        item.active = true;
        hasActiveChild = true;
      }
    }

    return hasActiveChild;
  }

  /**
   * 判断节点是否为需要展平的占位节点
   */
  function isFlattenPlaceholder(
    item: NavigationMenuItem
  ): boolean {
    return (
      !item.to &&
      item.type === "label" &&
      item.label === "" &&
      !!item.children
    );
  }

  /**
   * 响应式的导航菜单项
   * 自动处理顶层模块展平、活动状态标记和父节点展开
   */
  const navigationItems = computed(
    (): NavigationMenuItem[] => {
      const root = rootNav.value ?? [];
      const result: NavigationMenuItem[] = [];

      // 转换并展平导航树
      root.forEach((item) => {
        const transformed = transformToMenuItem(item, 1);
        if (!transformed) return;

        // 如果是占位节点，提升其子节点
        if (isFlattenPlaceholder(transformed)) {
          result.push(...(transformed.children ?? []));
        } else {
          result.push(transformed);
        }
      });

      // 标记活动项并展开其父节点路径
      markActiveAndExpandParents(result, route.path);

      return result;
    }
  );

  return { navigationItems };
}
