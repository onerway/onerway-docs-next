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
      },
      {
        code: "zh",
        name: "中文",
        language: "zh-CN",
        dir: "ltr",
      },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
  },
});
