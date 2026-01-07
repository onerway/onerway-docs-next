// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/ui",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/i18n",
    // @include 语法支持 + 开发环境 HMR
    "./modules/include",
    // Task list 可交互支持
    "./modules/task-list",
  ],

  i18n: {
    locales: [
      {
        code: "en",
        name: "English",
        language: "en-US",
        dir: "ltr",
        files: ["en.json"],
      },
      {
        code: "zh_cn",
        name: "中文",
        language: "zh-CN",
        dir: "ltr",
        files: ["zh_cn.json"],
      },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  icon: {
    customCollections: [
      {
        prefix: "custom",
        dir: "./app/assets/icons",
      },
      {
        prefix: "payment",
        dir: "./app/assets/icons/payment",
      },
      {
        prefix: "platforms",
        dir: "./app/assets/icons/platforms",
      },
    ],
    serverBundle: {
      remote: "jsdelivr",
    },
  },

  taskList: {
    enabled: true,
  },

  features: {
    devLogs: true,
  },

  // content 配置
  content: {
    build: {
      markdown: {
        remarkPlugins: {
          "remark-emoji": {
            options: {
              emoticon: true,
            },
          },
        },
        rehypePlugins: {},
        // 代码高亮
        highlight: {
          langs: [
            "bash",
            "yaml",
            "ts",
            "typescript",
            "diff",
            "vue",
            "json",
            "yml",
            "css",
            "mdc",
            "md",
            "js",
            "javascript",
            "jsx",
            "tsx",
            "java",
            "go",
            "python",
            "php",
            "html",
            "xml",
            "mermaid",
          ],
          theme: {
            default: "catppuccin-latte",
            dark: "dracula",
            light: "catppuccin-latte",
          },
        },
        toc: {
          depth: 4, // include h4 headings
          searchDepth: 10,
        },
      },
    },
  },
});
