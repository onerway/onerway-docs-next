import type {
  ContentLocale,
  SupportedLocale,
  SupportedModule,
} from "./types";
import {
  ADDITIONAL_CATEGORY_CONFIG,
  DOMAIN_COLLECTION_MAP,
  LANGUAGE_SUFFIX_MAP,
  LOCALE_MAP,
  MODULE_CONFIG,
} from "./constants";

export const normalizeModuleName = (
  module: string
): string => {
  const moduleMap: Record<string, string> = {
    transfer: "transfers",
    payment: "payments",
    root: "",
    "get-started": "get-started",
    "getting-started": "get-started",
  };
  return moduleMap[module] || module;
};

// buildCollectionName defined below to avoid forward-reference lint

export function getSupportedModules(): Array<
  keyof typeof MODULE_CONFIG
> {
  return Object.keys(MODULE_CONFIG) as Array<
    keyof typeof MODULE_CONFIG
  >;
}

export function getAllCollectionNames(
  includeLanguages?: ContentLocale[]
): string[] {
  const languages =
    includeLanguages || Object.values(LOCALE_MAP);
  const modules = getSupportedModules();
  return modules.flatMap((module) =>
    languages.map((lang) => {
      const baseName =
        DOMAIN_COLLECTION_MAP[
          module as keyof typeof DOMAIN_COLLECTION_MAP
        ] || "get_started";
      const localeSuffix = (lang as string).replace(
        "-",
        "_"
      );
      return `${baseName}_${localeSuffix}`;
    })
  );
}

export function generateSearchLinks(
  t: (key: string) => string
) {
  return getSupportedModules()
    .sort(
      (a, b) =>
        (MODULE_CONFIG[a]?.order || 0) -
        (MODULE_CONFIG[b]?.order || 0)
    )
    .map((module) => {
      const config = MODULE_CONFIG[module];
      if (!config) return null;
      const iconMap = {
        "get-started": "i-lucide-book",
        payments: "i-lucide-credit-card",
        transfers: "i-lucide-banknote",
      } as const;
      return {
        label: t(`docs.sections.${config.i18nKey}.title`),
        icon:
          iconMap[module as keyof typeof iconMap] ||
          "i-lucide-file",
        to: `/${module}`,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null
    );
}

export function getModuleConfig(module: string) {
  const normalizedModule = normalizeModuleName(module);
  return (
    MODULE_CONFIG[
      normalizedModule as keyof typeof MODULE_CONFIG
    ] || null
  );
}

export function getModuleVersions(module: string) {
  const config = getModuleConfig(module);
  return config?.versions || null;
}

export function getModuleCollection(module: string) {
  const config = getModuleConfig(module);
  return config?.collection || null;
}

export function getModuleI18nKey(module: string) {
  const config = getModuleConfig(module);
  const i18nKey = config?.i18nKey || module;
  return `header.${i18nKey}`;
}

export function getSortedModules() {
  return Object.entries(MODULE_CONFIG)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([module]) => module);
}

// moved earlier to satisfy order and usage

export function getCurrentUILocale(
  locale: SupportedLocale,
  locales: Record<string, any>
) {
  const mappedLocale =
    LOCALE_MAP[locale] || LOCALE_MAP["zh-CN"];
  const uiLocaleKey =
    { "zh-cn": "zh-CN", "zh-tw": "zh-TW", en: "en" }[
      mappedLocale
    ] || "en";
  return locales[uiLocaleKey] || locales.en;
}

export const getContentLocale = (
  locale: SupportedLocale
): ContentLocale => {
  return LOCALE_MAP[locale] || LOCALE_MAP["zh-CN"];
};

export const getCollectionLocaleSuffix = (
  locale: string
): string => {
  return (
    LANGUAGE_SUFFIX_MAP[
      locale as keyof typeof LANGUAGE_SUFFIX_MAP
    ] || "_en"
  );
};

export const buildCollectionName = (
  domain: string,
  locale: ContentLocale
): string => {
  const baseName =
    DOMAIN_COLLECTION_MAP[
      domain as keyof typeof DOMAIN_COLLECTION_MAP
    ] || "get_started";
  const localeSuffix = locale.replace("-", "_");
  return `${baseName}_${localeSuffix}`;
};

export function isSupportedModule(
  module: string
): module is SupportedModule {
  const normalized = normalizeModuleName(module);
  return normalized in DOMAIN_COLLECTION_MAP;
}

export function validateLocale(
  locale: string
): locale is SupportedLocale {
  return locale in LOCALE_MAP;
}

export function isVersionSupportedByModule(
  module: string,
  version: string
): boolean {
  const versions = getModuleVersions(module);
  return versions
    ? versions.supported.includes(version as never)
    : false;
}

export function getModuleDefaultVersion(
  module: string
): string {
  const versions = getModuleVersions(module);
  return versions?.current || "v1";
}

export function getModuleLatestVersion(
  module: string
): string {
  const versions = getModuleVersions(module);
  return versions?.latest || "v1";
}

export function getModuleSupportedVersions(
  module: string | undefined
): string[] {
  const versions = getModuleVersions(module || "");
  return versions ? [...versions.supported] : ["v1"];
}

/**
 * 从模块配置获取路径对应的颜色
 * 优先从 MODULE_CONFIG 获取，降级到 ADDITIONAL_CATEGORY_CONFIG
 */
export function getModuleColor(path: string): string {
  const category = path.split("/")[1] || "";

  // 先从模块配置中查找
  const moduleConfig =
    MODULE_CONFIG[category as keyof typeof MODULE_CONFIG];
  if (moduleConfig) {
    return moduleConfig.color;
  }

  // 降级到额外类别配置
  const additionalConfig =
    ADDITIONAL_CATEGORY_CONFIG[
      category as keyof typeof ADDITIONAL_CATEGORY_CONFIG
    ];

  return additionalConfig?.color || "text-primary";
}

/**
 * 从模块配置获取路径对应的图标
 * 优先从 MODULE_CONFIG 获取，降级到 ADDITIONAL_CATEGORY_CONFIG
 */
export function getModuleIcon(path: string): string {
  const category = path.split("/")[1] || "";

  // 先从模块配置中查找
  const moduleConfig =
    MODULE_CONFIG[category as keyof typeof MODULE_CONFIG];
  if (moduleConfig) {
    return moduleConfig.icon;
  }

  // 降级到额外类别配置
  const additionalConfig =
    ADDITIONAL_CATEGORY_CONFIG[
      category as keyof typeof ADDITIONAL_CATEGORY_CONFIG
    ];

  return additionalConfig?.icon || "i-heroicons-document";
}
