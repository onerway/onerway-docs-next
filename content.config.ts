// content.config.ts
import {
  defineCollection,
  defineContentConfig,
} from "@nuxt/content";
import { z } from "zod";

// 公共 schema（所有文档通用的 front-matter）
const commonSchema = z.object({
  /**
   * 控制右侧 ToC 是否显示（默认显示）
   */
  showToc: z.boolean().default(true),

  /**
   * 控制文档 footer 是否显示（默认显示）
   */
  showFooter: z.boolean().default(true),

  /**
   * 控制导航条目（用于菜单）是否显示或自定义标题
   */
  navigation: z
    .union([
      z.boolean(), // false = 不显示在菜单
      z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
      }),
    ])
    .default(true),
});

export default defineContentConfig({
  collections: {
    // 英文内容集合：读取 content/en 目录下的所有文件
    docs_en: defineCollection({
      type: "page",
      source: {
        include: "en/**/*.md", // 匹配 en 目录及子目录中的文件
        prefix: "", // 不在 URL 中添加语言前缀 [oai_citation:0‡content.nuxt.com](https://content.nuxt.com/docs/integrations/i18n#:~:text=collections%3A%20,schema%3A%20commonSchema%2C)
      },
      schema: commonSchema,
    }),
    // 中文内容集合：读取 content/zh 目录下的所有文件
    docs_zh: defineCollection({
      type: "page",
      source: {
        include: "zh/**/*.md",
        prefix: "", // 同样不带前缀 [oai_citation:1‡content.nuxt.com](https://content.nuxt.com/docs/integrations/i18n#:~:text=collections%3A%20,schema%3A%20commonSchema%2C)
      },
      schema: commonSchema,
    }),
  },
});
