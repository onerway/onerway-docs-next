import type { ContentNavigationItem } from "@nuxt/content";

function isNavNode(
  obj: unknown
): obj is { children?: unknown[]; [key: string]: unknown } {
  return typeof obj === "object" && obj !== null;
}

export function extractModuleNavigation(
  rawNavigation: unknown[]
): ContentNavigationItem[] {
  if (
    !Array.isArray(rawNavigation) ||
    rawNavigation.length === 0
  )
    return [];

  for (const topLevel of rawNavigation) {
    if (
      isNavNode(topLevel) &&
      topLevel.children &&
      Array.isArray(topLevel.children)
    ) {
      for (const moduleLevel of topLevel.children) {
        if (
          isNavNode(moduleLevel) &&
          moduleLevel.children &&
          Array.isArray(moduleLevel.children)
        ) {
          for (const versionLevel of moduleLevel.children) {
            if (
              isNavNode(versionLevel) &&
              versionLevel.children &&
              Array.isArray(versionLevel.children)
            ) {
              return versionLevel.children as ContentNavigationItem[];
            }
          }
        }
      }
    }
  }

  return [];
}

export function simplifyNavigationPaths(
  navigation: ContentNavigationItem[],
  currentLocale: string,
  currentVersion: string
): ContentNavigationItem[] {
  const localePrefix = `/${currentLocale}`;
  const versionPattern = `/${currentVersion}`;

  function simplifyItem(
    item: ContentNavigationItem
  ): ContentNavigationItem {
    let simplifiedPath = item.path;
    if (simplifiedPath.startsWith(localePrefix)) {
      simplifiedPath = simplifiedPath.substring(
        localePrefix.length
      );
    }
    if (simplifiedPath.includes(versionPattern)) {
      simplifiedPath = simplifiedPath.replace(
        versionPattern,
        ""
      );
    }
    if (!simplifiedPath.startsWith("/")) {
      simplifiedPath = `/${simplifiedPath}`;
    }
    if (simplifiedPath === "//") simplifiedPath = "/";

    const result: ContentNavigationItem = {
      ...item,
      path: simplifiedPath,
    };
    if (item.children && Array.isArray(item.children)) {
      result.children = item.children.map(simplifyItem);
    }
    return result;
  }

  return navigation.map(simplifyItem);
}

export function processNavigationData(
  rawNavigation: ContentNavigationItem[],
  currentLocale: string,
  currentVersion: string
): ContentNavigationItem[] {
  const extracted = extractModuleNavigation(rawNavigation);
  return simplifyNavigationPaths(
    extracted,
    currentLocale,
    currentVersion
  );
}
