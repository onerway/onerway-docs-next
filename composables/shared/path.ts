import {
  MODULE_CONFIG,
  PATH_MAPPING_CONFIG,
  SKIP_PATHS,
} from "./constants";
import {
  buildCollectionName,
  getContentLocale,
  isSupportedModule,
  normalizeModuleName,
} from "./module";

export interface PathInfo {
  isRoot: boolean;
  isSimplified: boolean;
  module: string | undefined;
  version: string;
  subPath: string;
  contentPath: string;
  collectionName: string;
  hasModule: boolean;
}

export function normalizePath(
  path: string,
  options?: {
    normalizeTrailingSlash?: boolean;
    includeHash?: boolean;
    fullPath?: string;
  }
): string {
  const {
    normalizeTrailingSlash = true,
    includeHash = false,
    fullPath,
  } = options || {};
  let result = fullPath || path || "";
  if (!includeHash) {
    const hashIndex = result.indexOf("#");
    if (hashIndex >= 0) result = result.slice(0, hashIndex);
  }
  if (
    normalizeTrailingSlash &&
    result.length > 1 &&
    result.endsWith("/")
  ) {
    result = result.replace(/\/+$/, "");
  }
  return result;
}

export function isCanonicalOverviewPath(
  path: string
): boolean {
  return /^\/[\w-]+\/overview$/.test(path);
}

export function areSamePage(
  a: string,
  b: string,
  options: {
    normalizeTrailingSlash?: boolean;
    includeHash?: boolean;
    useFullPath?: boolean;
  }
): boolean {
  const normalizedA = normalizePath(a, {
    normalizeTrailingSlash:
      options.normalizeTrailingSlash !== false,
    includeHash: options.includeHash === true,
    fullPath: options.useFullPath ? a : undefined,
  });
  const normalizedB = normalizePath(b, {
    normalizeTrailingSlash:
      options.normalizeTrailingSlash !== false,
    includeHash: options.includeHash === true,
    fullPath: options.useFullPath ? b : undefined,
  });
  return normalizedA === normalizedB;
}

export function parseSimplifiedPath(
  segments: string[],
  contentLocale: string,
  defaultVersion: string
) {
  const module = segments[0] || "";
  const rawSubPath = segments.slice(1).join("/");
  const normalizedModule = normalizeModuleName(module);
  const configuredRoutePath =
    MODULE_CONFIG[
      normalizedModule as keyof typeof MODULE_CONFIG
    ]?.routePath || "";
  let inferredDefaultSubPath = "overview";
  if (
    configuredRoutePath &&
    configuredRoutePath.startsWith(`/${normalizedModule}/`)
  ) {
    inferredDefaultSubPath = configuredRoutePath.replace(
      new RegExp(`^/${normalizedModule}/`),
      ""
    );
  }
  const subPath = rawSubPath || inferredDefaultSubPath;
  const contentPath = `/${contentLocale}/${normalizedModule}/${defaultVersion}/${subPath}`;
  return {
    module: normalizedModule,
    version: defaultVersion,
    subPath,
    contentPath,
  };
}

export function parseFullPath(
  segments: string[],
  originalPath: string,
  defaultVersion: string
) {
  const [, module, version, ...rest] = segments;
  const resolvedVersion = version?.startsWith("v")
    ? version
    : defaultVersion;
  const normalizedModule = normalizeModuleName(
    module || ""
  );
  const configuredRoutePath =
    MODULE_CONFIG[
      normalizedModule as keyof typeof MODULE_CONFIG
    ]?.routePath || "";
  let inferredDefaultSubPath = "overview";
  if (
    configuredRoutePath &&
    configuredRoutePath.startsWith(`/${normalizedModule}/`)
  ) {
    inferredDefaultSubPath = configuredRoutePath.replace(
      new RegExp(`^/${normalizedModule}/`),
      ""
    );
  }
  const providedSubPath = rest.join("/");
  const subPath = providedSubPath || inferredDefaultSubPath;
  return {
    module: normalizedModule,
    version: resolvedVersion,
    subPath,
    contentPath: providedSubPath
      ? originalPath
      : `/${segments[0]}/${normalizedModule}/${resolvedVersion}/${subPath}`,
  };
}

export function parsePathInfo(
  path: string,
  contentLocale: string
): PathInfo {
  const segments = path.split("/").filter(Boolean);
  if (path === "/" || segments.length === 0) {
    return {
      isRoot: true,
      isSimplified: false,
      module: "root",
      version: "",
      subPath: "",
      contentPath: "/",
      collectionName: "",
      hasModule: false,
    };
  }

  const isSimplified =
    !PATH_MAPPING_CONFIG.supportedContentLocales.includes(
      segments[0] as any
    );
  const defaultVersion = PATH_MAPPING_CONFIG.defaultVersion;
  const pathData = isSimplified
    ? parseSimplifiedPath(
        segments,
        contentLocale,
        defaultVersion
      )
    : parseFullPath(segments, path, defaultVersion);

  const normalizedModule =
    normalizeModuleName(pathData.module) || undefined;
  const hasModule = normalizedModule
    ? isSupportedModule(normalizedModule)
    : false;
  const collectionName = hasModule
    ? buildCollectionName(
        normalizedModule as string,
        contentLocale as any
      )
    : "";

  return {
    isRoot: false,
    isSimplified,
    module: normalizedModule,
    version: pathData.version,
    subPath: pathData.subPath,
    contentPath: pathData.contentPath,
    collectionName,
    hasModule,
  };
}

/**
 * 判断是否应该跳过路径记录
 */
export function shouldSkipPath(path: string): boolean {
  return SKIP_PATHS.some((skipPath: string) => {
    // 对于根路径 "/" 只做精确匹配，避免匹配所有路径
    if (skipPath === "/") {
      return path === "/";
    }
    // 其他路径使用 startsWith 匹配
    return path === skipPath || path.startsWith(skipPath);
  });
}

/**
 * 生成页面标题（从路径）
 */
export function generateTitleFromPath(
  path: string
): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    return (
      lastSegment
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()) ??
      "Unknown Page"
    );
  }
  return "Unknown Page";
}

/**
 * 生成页面描述（从路径）
 */
export function generateDescriptionFromPath(
  path: string
): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[
      segments.length - 1
    ]!.replace(/-/g, " ").replace(/\b\w/g, (l) =>
      l.toUpperCase()
    );
    return `Information about ${lastSegment}`;
  }
  return "Page content and information";
}

/**
 * 清理页面标题
 */
export function cleanTitle(title: string): string {
  return title
    .replace(
      /\s*[-|]\s*(Onerway|Documentation|Docs).*$/i,
      ""
    )
    .replace(/\s*[-|]\s*Nuxt.*$/i, "")
    .trim();
}

export function useSharedPathInfo() {
  const route = useRoute();
  const { locale } = useI18n();

  const contentLocale = computed(() =>
    getContentLocale(locale.value as any)
  );
  const pathInfo = computed(() =>
    parsePathInfo(route.path, contentLocale.value)
  );

  return {
    currentLocale: readonly(locale),
    contentLocale: readonly(contentLocale),
    pathInfo: readonly(pathInfo),
  };
}
