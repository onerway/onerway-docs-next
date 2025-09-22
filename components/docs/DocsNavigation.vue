<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import type { mapContentNavigation } from "@nuxt/ui/utils/content";
import { createLogger } from "~/composables/shared/logger";

type ColorName =
  | "error"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "neutral";

type Orientation = "vertical" | "horizontal";

type MenuType = "single" | "multiple";

interface Props {
  navigation: ContentNavigationItem[];
  color?: ColorName;
  highlight?: boolean;
  orientation?: Orientation;
  collapsible?: boolean;
  type?: MenuType;
  trailingIcon?: string;
  moduleUi?: {
    group?: string;
    label?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary" as ColorName,
  highlight: true,
  orientation: "vertical" as Orientation,
  type: "multiple" as MenuType,
  trailingIcon: "i-lucide-chevron-right",
  moduleUi: () => ({
    group:
      "border-t border-default mt-3 py-2 text-highlighted font-bold aria-[disabled=true]:text-default aria-[disabled=true]:cursor-not-allowed",
    label: "",
  }),
});

const route = useRoute();

const logger = createLogger("DocsNavigation");

type NavigationMenuItem = ReturnType<
  typeof mapContentNavigation
>[number];

function collectModulePaths(
  items: ContentNavigationItem[] | undefined,
  set: Set<string>
) {
  if (!items) return;
  for (const item of items) {
    const maybeModule = (
      item as unknown as { module?: boolean }
    ).module;
    if (maybeModule && item.path) set.add(item.path);
    if (item.children?.length)
      collectModulePaths(item.children, set);
  }
}

function enhanceMenuItemsForModuleStyles(
  menuItems: NavigationMenuItem[] | undefined,
  modulePathSet: Set<string>
): NavigationMenuItem[] | undefined {
  if (!menuItems) return menuItems;
  return menuItems.map((mi) => {
    const cloned: NavigationMenuItem &
      Record<string, unknown> = {
      ...(mi as unknown as NavigationMenuItem),
    };
    if (cloned.to && modulePathSet.has(cloned.to)) {
      cloned.class = [cloned.class, props.moduleUi.group]
        .filter(Boolean)
        .join(" ");
      cloned.labelClass = [
        cloned.labelClass,
        props.moduleUi.label,
      ]
        .filter(Boolean)
        .join(" ");
      cloned["data-module"] = true;
      cloned.ui = {
        linkTrailingIcon: "hidden",
      };
      cloned.disabled = true;
      cloned.defaultOpen = true;
    }
    if (
      Array.isArray(cloned.children) &&
      cloned.children.length
    ) {
      cloned.children = enhanceMenuItemsForModuleStyles(
        cloned.children,
        modulePathSet
      );
    }
    return cloned;
  }) as NavigationMenuItem[];
}

const items = computed(() => {
  function mapNavigationItems(
    srcItems: ContentNavigationItem[]
  ): (NavigationMenuItem & Record<string, unknown>)[] {
    return srcItems.map((item) => {
      const hasChildren =
        Array.isArray(item.children) &&
        item.children.length > 0;
      const childHasSamePath = hasChildren
        ? (item.children as ContentNavigationItem[]).some(
            (c) => c.path === item.path
          )
        : false;

      const mapped: NavigationMenuItem &
        Record<string, unknown> = {
        label: String(item.title || ""),
        value: String(item.path || ""),
      };

      // 叶子节点：绑定路由；父级：根据“子项路径是否等于自身路径”决定是否保留 to
      if (!hasChildren) {
        (mapped as unknown as { to?: string }).to = String(
          item.path || ""
        );
      } else if (!childHasSamePath) {
        (mapped as unknown as { to?: string }).to = String(
          item.path || ""
        );
      }

      if (hasChildren) {
        (
          mapped as unknown as {
            children?: NavigationMenuItem[];
          }
        ).children = mapNavigationItems(
          item.children as ContentNavigationItem[]
        );
        // 默认使用 defaultOpen，后续需要受控再切换为 open
        (
          mapped as unknown as { defaultOpen?: boolean }
        ).defaultOpen = route.path.startsWith(item.path);
      }

      const itemWithIcon = item as unknown as {
        icon?: string;
      };
      if (itemWithIcon.icon) {
        (mapped as unknown as { icon?: string }).icon =
          itemWithIcon.icon;
      }

      return mapped;
    });
  }

  const base = mapNavigationItems(
    props.navigation as ContentNavigationItem[]
  );
  const modulePathSet = new Set<string>();
  collectModulePaths(props.navigation, modulePathSet);
  return enhanceMenuItemsForModuleStyles(
    base,
    modulePathSet
  ) as NavigationMenuItem[];
});

logger.info("navigation", items?.value);

const handleUpdateModelValue = (
  value: string | string[] | undefined
) => {
  logger.info("navigation model-value changed", value);
};
</script>

<template>
  <UNavigationMenu
    :items="items"
    :highlight="highlight"
    :trailing-icon="trailingIcon"
    :color="color"
    :orientation="orientation"
    variant="link"
    :type="type"
    :ui="{
      label: 'px-0 py-0',
      link: 'cursor-pointer px-0.5 py-1 font-normal data-[state=open]:font-medium',
      linkLabel: 'line-clamp-2 text-wrap text-sm text-left',
      childList: 'ms-1.5 border-none',
      childItem: 'font-bold',
      linkTrailing: 'self-start',
      linkTrailingIcon: 'group-data-[state=open]:rotate-90',
    }"
    class="sm:mt-8"
    @update:model-value="handleUpdateModelValue" />
</template>
