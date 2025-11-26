// composables/useDocsNav.ts
import { computed, type Ref } from "vue";
import { useRoute } from "#imports";
import type { ContentNavigationItem } from "@nuxt/content";
import type { NavigationMenuItem } from "@nuxt/ui";

/**
 * 文档导航配置项
 * @property includeModules 是否在 navigationItems 中包含顶层模块目录
 */
export interface DocsNavOptions {
  includeModules?: boolean;
}

/**
 * 扩展的导航菜单项，包含自定义字段
 */
interface ExtendedNavigationMenuItem
  extends NavigationMenuItem {
  module?: boolean;
}

/**
 * 归一化的模块结构
 * root：顶层模块菜单项（包含子菜单）
 * menu：模块的子菜单（不包含模块节点）
 */
interface NormalizedModule {
  root: ExtendedNavigationMenuItem;
  menu: ExtendedNavigationMenuItem[];
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
  ): ExtendedNavigationMenuItem["type"] {
    if (item.page === false) {
      return "link";
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
    menuItem: ExtendedNavigationMenuItem,
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
    if (item.module) {
      menuItem.module = true;
      if (!menuItem.icon) {
        menuItem.icon = "";
      }
    }
  }

  /**
   * 模块节点的样式与交互（避免点击触发，默认展开）
   */
  function applyModuleStyling(
    menuItem: ExtendedNavigationMenuItem,
    item: ContentNavigationItem
  ): void {
    if (!item.module) {
      menuItem.ui = {
        link: "font-normal cursor-pointer hover:text-primary",
      };
      return;
    }
    menuItem.defaultOpen = true;
    menuItem.disabled = true;
    menuItem.ui = {
      item: "py-2 border-t border-default",
      link: "opacity-100 cursor-default font-semibold text-highlight",
      linkTrailingIcon: "hidden",
    };
  }

  /**
   * 递归转换 Content 导航项为 UI 菜单项
   *
   * @param item - Content 导航项
   * @param level - 当前层级（1 为顶层）
   * @returns 转换后的菜单项
   */
  function transformToMenuItem(
    item: ContentNavigationItem,
    level = 1
  ): ExtendedNavigationMenuItem {
    const children = item.children
      ?.map((child) =>
        transformToMenuItem(child, level + 1)
      )
      .filter(Boolean) as
      | ExtendedNavigationMenuItem[]
      | undefined;

    const hasChildren = Boolean(
      children && children.length > 0
    );

    const menuItem: ExtendedNavigationMenuItem = {
      label: item.title,
      to: item.page === false ? undefined : item.path,
      type: determineMenuItemType(item, hasChildren),
      children: hasChildren ? children : undefined,
    };

    applyCustomFields(menuItem, item);
    applyModuleStyling(menuItem, item);

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
    items: ExtendedNavigationMenuItem[],
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
          item.children as ExtendedNavigationMenuItem[],
          currentPath
        );
        if (childIsActive) {
          isItemActive = true;
          item.defaultOpen = true; // 展开包含活动子节点的父节点
        }
      }

      // 标记活动状态
      if (isItemActive) {
        // 模块节点不标记为活动状态
        item.active = item.module !== true;
        hasActiveChild = true;
      }
    }

    return hasActiveChild;
  }

  /**
   * 归一化的模块数据：root 为顶层模块，menu 为其子菜单
   */
  const normalizedModules = computed<NormalizedModule[]>(
    () => {
      const root = rootNav.value ?? [];

      return root.map((item) => {
        const rootItem = transformToMenuItem(item, 1);

        // 标记活跃态并展开父节点
        markActiveAndExpandParents([rootItem], route.path);

        const menu =
          (rootItem.children as ExtendedNavigationMenuItem[]) ??
          [];

        return {
          root: rootItem,
          menu,
        };
      });
    }
  );

  /**
   * 顶层模块列表（供 Header 或模块选择器）
   */
  const topLevelModules = computed(
    (): ExtendedNavigationMenuItem[] =>
      normalizedModules.value.map((mod) => mod.root)
  );

  /**
   * 根据 includeModules 输出：顶层+子菜单 或仅子菜单
   */
  const navigationItems = computed(
    (): ExtendedNavigationMenuItem[] => {
      if (includeModules) {
        return topLevelModules.value;
      }
      return normalizedModules.value.flatMap(
        (mod) => mod.menu
      );
    }
  );

  /**
   * 根据路径获取当前模块
   */
  function getCurrentModule(
    path: string
  ): NormalizedModule | null {
    const segments = path.split("/").filter(Boolean);
    if (!segments.length) return null;

    const moduleSlug = segments[0];
    if (!moduleSlug) return null;

    return (
      normalizedModules.value.find((mod) => {
        const to = mod.root.to;
        if (!to || typeof to !== "string") return false;
        const modulePath = to.replace(/^\/|\/$/g, "");
        return (
          modulePath.toLowerCase() ===
          moduleSlug.toLowerCase()
        );
      }) ?? null
    );
  }

  const currentModule = computed(
    (): NormalizedModule | null =>
      getCurrentModule(route.path)
  );

  const currentModuleMenu = computed(
    (): ExtendedNavigationMenuItem[] =>
      currentModule.value?.menu ?? []
  );

  return {
    navigationItems,
    topLevelModules,
    currentModule,
    currentModuleMenu,
    getCurrentModule,
  };
}
