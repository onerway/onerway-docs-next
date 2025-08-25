<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { useI18n, useLocale, useRoute } from "#imports";
import { useStorage } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { MODULE_CONFIG } from "~/composables/shared/constants";
import { createLogger } from "~/composables/shared/logger";

export interface BreadcrumbItem {
  title: string;
  path: string;
  icon?: string;
  description?: string;
  module?: string;
  disabled?: boolean;
}

interface Props {
  navigation: ContentNavigationItem[] | undefined;
  currentPath?: string;
  showHomeIcon?: boolean;
  showIcons?: boolean;
  separatorIcon?: string;
  homeItem?: BreadcrumbItem;
  maxItems?: number;
  class?: string;
  ui?: Record<string, string>;
  sticky?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: "",
  showHomeIcon: true,
  showIcons: false,
  separatorIcon: undefined,
  homeItem: () => ({
    title: "Home",
    path: "/",
  }),
  maxItems: undefined,
  class: undefined,
  ui: undefined,
  sticky: false,
});

const emit = defineEmits<{
  click: [
    item: BreadcrumbItem,
    index: number,
    event: Event,
  ];
}>();

const { dir } = useLocale();
const { t } = useI18n();
const route = useRoute();
const logger = createLogger("DocsBreadcrumb");

// SSR-safe current path
const currentPath = ref("");

// Navigation cache using VueUse
const navigationCache = useStorage(
  "docs-breadcrumb-cache",
  new Map<string, ContentNavigationItem[]>(),
  undefined,
  {
    serializer: {
      read: (v: string) => new Map(JSON.parse(v)),
      write: (v: Map<string, ContentNavigationItem[]>) =>
        JSON.stringify(Array.from(v.entries())),
    },
  }
);

// Error state
const hasNavigationError = ref(false);

onMounted(() => {
  currentPath.value = route.path;
});

const flattenNavigation = (
  items: ContentNavigationItem[],
  parentPath = ""
): ContentNavigationItem[] => {
  // Check cache first
  const cacheKey = `${JSON.stringify(items)}-${parentPath}`;
  if (navigationCache.value.has(cacheKey)) {
    return navigationCache.value.get(cacheKey)!;
  }

  const flattened: ContentNavigationItem[] = [];

  try {
    for (const item of items) {
      flattened.push({
        ...item,
        fullPath: item._path || item.path || "",
        parentPath,
      });

      if (item.children && item.children.length > 0) {
        const childItems = flattenNavigation(
          item.children,
          item.path || ""
        );
        flattened.push(...childItems);
      }
    }

    // Cache the result
    navigationCache.value.set(cacheKey, flattened);
    hasNavigationError.value = false;
  } catch (error) {
    logger.error("Error flattening navigation:", error);
    hasNavigationError.value = true;
  }

  return flattened;
};

// 检查是否是模块根路径（会被重定向的路径）
const isModuleRootPath = (
  path: string
): { redirectPath: string; moduleKey: string } | null => {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 1) {
    const moduleKey = segments[0]!;
    const supportedModules = Object.keys(MODULE_CONFIG);
    if (supportedModules.includes(moduleKey)) {
      return {
        redirectPath: `/${moduleKey}/overview`,
        moduleKey,
      };
    }
  }
  return null;
};

// 获取模块的国际化标题
const getModuleTitle = (moduleKey: string): string => {
  const moduleConfig = MODULE_CONFIG[moduleKey];
  if (moduleConfig && moduleConfig.i18nKey) {
    return t(`header.${moduleConfig.i18nKey}`);
  }
  // 降级处理：首字母大写
  return moduleKey
    .split("-")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const generateSmartBreadcrumb = (
  currentPath: string,
  navigation: ContentNavigationItem[]
): BreadcrumbItem[] => {
  const pathSegments = currentPath
    .split("/")
    .filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  const flatItems = flattenNavigation(navigation);

  logger.info("flatItems", flatItems);

  let accumulatedPath = "";

  for (const segment of pathSegments) {
    accumulatedPath += `/${segment}`;

    // 首先尝试直接匹配
    let navItem = flatItems.find((item) => {
      return item.path === accumulatedPath;
    });

    // 如果直接匹配失败，检查是否是模块根路径
    if (!navItem) {
      const moduleInfo = isModuleRootPath(accumulatedPath);
      if (moduleInfo) {
        navItem = flatItems.find((item) => {
          logger.info(
            "重定向路径匹配",
            item.path,
            moduleInfo.redirectPath
          );
          return item.path === moduleInfo.redirectPath;
        });
        // 如果找到重定向的项目，使用模块的国际化标题
        if (navItem) {
          breadcrumbs.push({
            title: getModuleTitle(moduleInfo.moduleKey), // 使用国际化标题
            path: accumulatedPath, // 使用原始路径而不是重定向路径
            icon: navItem.icon as string | undefined,
            description: navItem.description as
              | string
              | undefined,
            module: (navItem as Record<string, unknown>)
              .module as string | undefined,
            disabled: navItem.disabled as
              | boolean
              | undefined,
          });
          continue;
        }
      }
    }

    if (navItem) {
      breadcrumbs.push({
        title: navItem.title || "",
        path: navItem.module
          ? navItem.children?.[0]?.path || ""
          : navItem.path || "",
        icon: navItem.icon as string | undefined,
        description: navItem.description as
          | string
          | undefined,
        module: (navItem as Record<string, unknown>)
          .module as string | undefined,
        disabled: navItem.disabled as boolean | undefined,
      });
    } else {
      const title = segment
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

      breadcrumbs.push({
        title,
        path: accumulatedPath,
      });
    }
  }

  return breadcrumbs;
};

const separatorIcon = computed(() => {
  return (
    props.separatorIcon ||
    (dir.value === "rtl"
      ? "heroicons:chevron-left"
      : "heroicons:chevron-right")
  );
});

const breadcrumbItems = computed((): BreadcrumbItem[] => {
  const pathToUse = props.currentPath || currentPath.value;

  if (!pathToUse || !props.navigation?.length) {
    return [
      {
        title: t("docs.breadcrumb.home"),
        path: "/",
      },
    ];
  }

  // Handle navigation errors
  if (hasNavigationError.value) {
    return [
      {
        title: t("docs.breadcrumb.home"),
        path: "/",
      },
      {
        title: t("common.error"),
        path: pathToUse,
        disabled: true,
      },
    ];
  }

  const smartBreadcrumbs = generateSmartBreadcrumb(
    pathToUse,
    props.navigation
  );

  logger.info("smartBreadcrumbs", smartBreadcrumbs);

  const homeItem = {
    title: t("docs.breadcrumb.home"),
    path: "/",
  };

  const items =
    pathToUse === "/"
      ? [homeItem]
      : [homeItem, ...smartBreadcrumbs];

  if (props.maxItems && items.length > props.maxItems) {
    const maxItems = props.maxItems;
    if (maxItems <= 2) {
      return [
        items[0]!,
        {
          title: t("common.ellipsis", "..."),
          path: "",
          disabled: true,
        },
        items[items.length - 1]!,
      ];
    } else {
      const startCount = Math.ceil(maxItems / 2);
      const endCount = Math.floor(maxItems / 2) - 1;

      return [
        ...items.slice(0, startCount),
        {
          title: t("common.ellipsis", "..."),
          path: "",
          disabled: true,
        },
        ...items.slice(-endCount),
      ];
    }
  }

  logger.info("breadcrumbItems", items);

  return items;
});

const getComponent = (
  item: BreadcrumbItem,
  index: number
) => {
  if (
    item.disabled ||
    index === breadcrumbItems.value.length - 1
  ) {
    return "span";
  }
  return resolveComponent("NuxtLink");
};

const getPath = (item: BreadcrumbItem, index: number) => {
  if (
    item.disabled ||
    index === breadcrumbItems.value.length - 1
  ) {
    return undefined;
  }
  return item.path;
};

const isCurrentPage = (index: number) =>
  index === breadcrumbItems.value.length - 1;

const handleClick = (
  item: BreadcrumbItem,
  index: number,
  event: Event
) => {
  if (!item.disabled && !isCurrentPage(index)) {
    emit("click", item, index, event);
  }
};

const handleKeydown = (
  item: BreadcrumbItem,
  index: number,
  event: KeyboardEvent
) => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    !item.disabled &&
    !isCurrentPage(index)
  ) {
    event.preventDefault();
    emit("click", item, index, event);
  }
};

defineExpose({
  breadcrumbItems,
  flattenNavigation,
  generateSmartBreadcrumb,
});
</script>

<template>
  <nav
    class="flex items-center gap-1 text-sm"
    :class="[
      ui?.root || 'text-primary',
      props.class,
      sticky &&
        'sticky top-[var(--ui-header-height)] sm:top-[var(--ui-header-total-height)] pt-6 z-10',
    ]"
    :aria-label="t('docs.breadcrumb.ariaLabel')"
    role="navigation">
    <ol :class="ui?.list || 'flex items-center gap-1'">
      <template
        v-for="(item, index) in breadcrumbItems"
        :key="item.path || index">
        <li
          :class="
            ui?.item ||
            'flex items-center gap-2 group cursor-pointer'
          ">
          <!-- Icon -->
          <UIcon
            v-if="item.icon && showIcons"
            :name="item.icon"
            :class="[
              ui?.linkLeadingIcon ||
                'h-4 w-4 shrink-0 group-hover:text-default',
              item.disabled && 'text-default',
            ]" />
          <UIcon
            v-else-if="index === 0 && showHomeIcon"
            name="heroicons:home"
            :class="
              ui?.linkLeadingIcon ||
              'h-4 w-4 shrink-0 text-primary group-hover:text-default'
            " />

          <!-- Link or Text -->
          <component
            :is="getComponent(item, index)"
            :to="getPath(item, index)"
            :class="[
              ui?.link ||
                'font-medium transition-colors group-hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded',
              {
                'cursor-default text-default':
                  isCurrentPage(index) || item.disabled,
                'text-primary group-hover:text-default':
                  !isCurrentPage(index) && !item.disabled,
              },
              item.disabled && 'text-default',
              isCurrentPage(index) && 'font-medium',
            ]"
            :aria-current="
              isCurrentPage(index) ? 'page' : undefined
            "
            :title="item.description || item.title"
            :tabindex="
              item.disabled || isCurrentPage(index) ? -1 : 0
            "
            @click="handleClick(item, index, $event)"
            @keydown="handleKeydown(item, index, $event)">
            {{ item.title }}
          </component>
        </li>

        <!-- Separator -->
        <li
          v-if="index < breadcrumbItems.length - 1"
          role="presentation"
          aria-hidden="true"
          :class="ui?.separator || 'flex items-center'">
          <UIcon
            :name="separatorIcon"
            :class="
              ui?.separatorIcon ||
              'h-4 w-4 shrink-0 text-highlighted group-hover:text-default'
            " />
        </li>
      </template>
    </ol>
  </nav>
</template>
