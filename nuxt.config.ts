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
    ],
    serverBundle: {
      remote: "jsdelivr",
    },
  },

  features: {
    devLogs: true,
  },

  // content 配置
  content: {
    build: {
      markdown: {
        toc: {
          depth: 4, // include h4 headings
          searchDepth: 6,
        },
      },
    },
  },
});
