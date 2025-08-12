import type { NavigationMenuItem } from "@nuxt/ui";
import { MODULE_CONFIG } from "~/composables/shared/constants";
import { getModuleI18nKey } from "~/composables/shared/utils";

/**
 * 基于 MODULE_CONFIG 生成导航菜单的 composable
 */
export function useNavigation() {
  const { t } = useI18n();
  const route = useRoute();

  // 生成主要导航菜单项（来自 MODULE_CONFIG）
  const mainItems = computed<NavigationMenuItem[]>(() => {
    return Object.entries(MODULE_CONFIG)
      .sort(([, a], [, b]) => a.order - b.order) // 按 order 排序
      .map(([module, config]) => ({
        label: t(getModuleI18nKey(module)),
        to: config.routePath,
        active: route.path.startsWith(config.routePath),
        icon: config.icon,
      }));
  });

  // 外部链接菜单项（保持现有逻辑）
  const externalItems = computed<NavigationMenuItem[]>(
    () => [
      {
        label: t(getModuleI18nKey("apisAndSdks")),
        to: "https://docs.onerway.com/",
        target: "_blank",
        children: [
          {
            label: t(getModuleI18nKey("payments")),
            to: "https://docs.onerway.com/apis/zh/",
            target: "_blank",
          },
          {
            label: t(getModuleI18nKey("transfers")),
            to: "https://docs.onerway.com/apis/payout/",
            target: "_blank",
          },
        ],
      },
      {
        label: t(getModuleI18nKey("help")),
        to: "https://docs.onerway.com/",
        target: "_blank",
        children: [
          {
            label: t(getModuleI18nKey("support")),
            to: "https://docs.onerway.com/",
            target: "_blank",
          },
          {
            label: t(getModuleI18nKey("contactUs")),
            to: "https://docs.onerway.com/",
            target: "_blank",
          },
        ],
      },
    ]
  );

  // 完整的导航菜单项
  const items = computed<NavigationMenuItem[][]>(() => [
    mainItems.value,
    externalItems.value,
  ]);

  return {
    mainItems,
    externalItems,
    items,
  };
}
