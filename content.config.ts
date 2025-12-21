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
   * 控制导航条目（用于菜单）的跳转路径
   */
  to: z.string().optional(),

  /**
   * 控制导航条目（用于菜单）是否隐藏
   */
  hidden: z.boolean().default(false),

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
        include: "en/**",
        exclude: ["**/_partials/**"], // 排除 _partials，不作为独立页面
        prefix: "",
      },
      schema: commonSchema,
    }),
    // 中文内容集合：读取 content/zh_cn 目录下的所有文件
    docs_zh_cn: defineCollection({
      type: "page",
      source: {
        include: "zh_cn/**",
        exclude: ["**/_partials/**"], // 排除 _partials，不作为独立页面
        prefix: "",
      },
      schema: commonSchema,
    }),

    /**
     * Partials 集合：用于 @include 语法引用的片段文件
     *
     * 使用 type: "data" 而非 "page"：
     * - 不会作为独立页面被索引
     * - 但仍被 Nuxt Content 导入和追踪
     * - 修改时能触发 Content 的 HMR 机制
     */
    partials: defineCollection({
      type: "data",
      source: {
        include: "**/_partials/**/*.md",
      },
    }),
  },
});
