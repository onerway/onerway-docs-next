// content.config.ts
import {
  defineCollection,
  defineContentConfig,
  z,
} from "@nuxt/content";
import {
  MODULE_CONFIG,
  MODULE_ENUMS,
  SUPPORTED_CONTENT_LOCALES,
} from "./composables/shared/constants";

// Constants for better maintainability
const LOCALES = SUPPORTED_CONTENT_LOCALES;
const MODULES = MODULE_ENUMS;

// 文档 schema 定义
const createDocumentSchema = () =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
    category: z.enum(MODULES).optional(),
    tags: z.array(z.string()).optional(),
    lastUpdated: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().optional().default(false),
    showToc: z.boolean().optional().default(true),
    showNavigation: z.boolean().optional().default(true),
    showFooter: z.boolean().optional().default(true),
    layout: z.string().optional(),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    module: z.boolean().optional().default(false),
    defaultOpen: z
      .union([z.boolean(), z.number().int().min(0)])
      .optional()
      .default(false),
    ui: z
      .object({
        itemWithChildren: z.string().optional(),
        link: z.string().optional(),
        linkTrailingIcon: z.string().optional(),
      })
      .optional(),
  });

// 获取本地化目录名
const getLocaleDir = (locale: string): string => {
  return locale === "zh-cn"
    ? "zh-cn"
    : locale === "zh-tw"
      ? "zh-tw"
      : "en";
};

// 统一的 Collection 工厂函数
const createCollection = (
  moduleKey: string,
  locale: string
) => {
  const localeDir = getLocaleDir(locale);

  return defineCollection({
    type: "page",
    source: `${localeDir}/${moduleKey}/**/*.{md,mdc,yml}`,
    schema: createDocumentSchema(),
  });
};

// 生成集合名称的辅助函数
const buildCollectionName = (
  moduleKey: string,
  locale: string
): string => {
  return `${moduleKey.replace("-", "_")}_${locale.replace("-", "_")}`;
};

// 统一的集合生成器
const generateCollections = () => {
  const collections: Record<
    string,
    ReturnType<typeof defineCollection>
  > = {};

  // 基于 MODULE_CONFIG 统一生成所有模块的集合
  Object.entries(MODULE_CONFIG).forEach(([moduleKey]) => {
    LOCALES.forEach((locale) => {
      const collectionName = buildCollectionName(
        moduleKey,
        locale
      );
      collections[collectionName] = createCollection(
        moduleKey,
        locale
      );
    });
  });

  return collections;
};

export default defineContentConfig({
  collections: generateCollections(),
});
