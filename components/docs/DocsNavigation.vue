<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

type ColorName =
  | "error"
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "neutral";
type VariantName = "link" | "pill";

interface Props {
  navigation: ContentNavigationItem[];
  inheritModuleStyling?: boolean;
  color?: ColorName;
  variant?: VariantName;
  highlight?: boolean;
  trailingIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  inheritModuleStyling: true,
  color: "primary",
  variant: "link",
  highlight: true,
  trailingIcon: "i-lucide-chevron-right",
});

type NavItem = ContentNavigationItem & {
  module?: boolean;
  ui?: {
    itemWithChildren?: string;
    link?: string;
    linkTrailingIcon?: string;
  };
};

const DEFAULT_MODULE_UI = {
  itemWithChildren: "border-t-1 border-default mt-3 py-2",
  link: "text-medium font-semibold",
  linkTrailingIcon: "hidden",
} as const;

function enhanceItems(
  items: ContentNavigationItem[] | undefined
): ContentNavigationItem[] {
  if (!items) return [];
  return items.map((item) => {
    const link = item as NavItem;
    const cloned: any = { ...link };

    if (link.children?.length) {
      cloned.children = enhanceItems(link.children);
    }

    if (link.module) {
      // 为模块项直接覆盖 ui：统一默认样式
      cloned.ui = {
        itemWithChildren:
          DEFAULT_MODULE_UI.itemWithChildren,
        link: DEFAULT_MODULE_UI.link,
        linkTrailingIcon:
          DEFAULT_MODULE_UI.linkTrailingIcon,
      };
    }

    return cloned;
  });
}

const enhancedNavigation = computed<
  ContentNavigationItem[]
>(() => enhanceItems(props.navigation));
</script>

<template>
  <UContentNavigation
    :navigation="enhancedNavigation || []"
    :highlight="highlight"
    :trailing-icon="trailingIcon"
    :color="color"
    :variant="variant"
    class="sm:mt-8">
    <template #link-title="{ link }">
      <!-- 外层包裹用于模拟分组容器样式（当该项为模块分组或处于继承范围且有子项时） -->
      <div :data-module="(link as any)?.module === true">
        <UTooltip
          :text="link.title"
          :delay-duration="500"
          :content="{ side: 'right' }"
          class="block w-full text-left">
          <span
            class="block w-full truncate"
            :data-module="(link as any)?.module === true"
            :class="
              (link as any)?.module
                ? (link as any)?.ui?.link
                : ''
            ">
            {{ link.title }}
          </span>
        </UTooltip>
      </div>
    </template>
  </UContentNavigation>
</template>
