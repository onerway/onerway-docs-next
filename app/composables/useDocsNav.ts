// composables/useDocsNav.ts
import { computed, type Ref } from "vue";
import type { ContentNavigationItem } from "@nuxt/content";
import type { NavigationMenuItem } from "@nuxt/ui";

/**
 * 将 ContentNavigationItem 递归转换为 NavigationMenuItem。
 * - 使用 `label` 映射标题，`to` 映射路由路径；
 * - 如果含有子节点，则设置 children，并根据 `page` 字段决定 type：
 *   - page === false  => type = 'label'（纯标题，不可点击）
 *   - page !== false && children.length > 0 => type = 'trigger'（可展开/折叠）
 *   - 叶子节点使用默认类型（link）
 */
function convertItem(
  item: ContentNavigationItem
): NavigationMenuItem {
  const menuItem: NavigationMenuItem = {
    label: item.title,
    to: item.path,
  };

  if (item.children && item.children.length > 0) {
    menuItem.children = item.children.map(convertItem);
    menuItem.type =
      item.page === false ? "label" : "trigger";
  }

  // 如有其他字段映射（例如 icon、badge 等），可在此扩展

  return menuItem;
}

/**
 * 根据从 queryCollectionNavigation 得到的导航树生成 UNavigationMenu 可用的数据。
 * @param rootNav 导航树的顶层数组（通常来自 inject('navigation')）
 */
export function useDocsNav(
  rootNav: Ref<ContentNavigationItem[] | undefined>
) {
  const navigationItems = computed<NavigationMenuItem[]>(
    () => {
      return rootNav.value?.map(convertItem) ?? [];
    }
  );

  return { navigationItems };
}
