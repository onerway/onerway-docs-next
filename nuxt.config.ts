// https://nuxt.com/docs/api/configuration/nuxt-config

// 导入 Node.js 子进程模块的 execSync 函数，用于同步执行系统命令
// 在这个项目中用于构建时运行 generate-missing-content.js 脚本来检测多语言内容缺失项
import { execSync } from "node:child_process";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  // 开发环境禁用缓存
  ssr: true,

  modules: [
    "@nuxt/ui-pro",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxtjs/google-fonts",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxtjs/mdc",
  ],

  // css
  css: [
    "~/assets/css/main.css",
    "~/assets/css/scrollbar.css",
  ],

  // components
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  // Nuxt UI 组件
  ui: {
    fonts: false, // 启用字体支持
  },

  // Icon configuration for production builds
  icon: {
    clientBundle: {
      // Pre-bundle commonly used heroicons for SSR compatibility
      scan: true,
      includeCustomCollections: true,
    },
    serverBundle: {
      // Server-side bundle for dynamic icons and SSR support
      collections: ["heroicons", "lucide"],
    },
    provider: "iconify",
  },

  // typescript
  typescript: {
    typeCheck: true,
    strict: true,
  },

  // i18n
  i18n: {
    lazy: true,
    langDir: "locales",
    strategy: "no_prefix",
    locales: [
      {
        code: "zh-CN",
        name: "简体中文",
        files: ["zh-cn/common.json"],
      },
      {
        code: "en",
        name: "English",
        files: ["en/common.json"],
      },
      {
        code: "zh-TW",
        name: "繁體中文",
        files: ["zh-tw/common.json"],
      },
    ],
    defaultLocale: "zh-CN",
    detectBrowserLanguage: {
      useCookie: true,
      fallbackLocale: "zh-CN",
      redirectOn: "root", // recommended
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  // google fonts
  googleFonts: {
    families: {
      // 核心英文字体
      Inter: [300, 400, 500, 600, 700], // 主要无衬线字体
      "Crimson Pro": [400, 500, 600, 700], // 主要衬线字体

      // 核心中文字体
      "Noto Sans SC": [300, 400, 500, 700], // 简体中文无衬线
      "Noto Sans TC": [400, 500, 700], // 繁体中文无衬线
      "Noto Serif SC": [400, 500, 700], // 简体中文衬线
      "Source Han Sans": [400, 500, 700], // 思源黑体

      // Emoji 和符号字体支持
      "Noto Color Emoji": true, // Emoji 字体
    },
    // 字体显示策略
    display: "swap",
    // 预连接到字体服务器
    preconnect: true,
    // 子集化优化
    subsets: [
      "latin",
      "latin-ext",
      "chinese-simplified",
      "chinese-traditional",
    ],
  },

  experimental: {
    payloadExtraction: false,
  },

  // nitro 配置
  nitro: {
    prerender: {
      // 排除无效的路由，避免预渲染错误
      ignore: [
        "/mock",
        "/mock/**",
        "/**/mock",
        "/**/mock/**",
      ],
      failOnError: false,
    },
  },

  // content
  content: {
    experimental: { nativeSqlite: true },
    preview: {
      api: "https://api.nuxt.studio",
    },
    build: {
      markdown: {
        highlight: {
          langs: [
            "bash",
            "ts",
            "typescript",
            "diff",
            "vue",
            "json",
            "yml",
            "css",
            "mdc",
            "md",
          ],
          theme: {
            default: "catppuccin-latte",
            dark: "dracula",
            light: "catppuccin-latte",
          },
        },
      },
    },
  },

  mdc: {
    highlight: {
      // noApiRoute: false,
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  // eslint
  eslint: {
    config: {
      stylistic: false,
      standalone: false, // `standalone` 为 `false` 时，eslint 会自动检测项目中的 `eslint.config.mjs` 文件，并使用该文件作为 eslint 的配置文件。
    },
  },

  // hooks
  hooks: {
    "build:before": function () {
      execSync("node scripts/generate-missing-content.js", {
        stdio: "inherit",
      });
    },
  },

  // 生产环境优化
  vite: {
    optimizeDeps: {
      include: ["three"],
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: ["log", "info"], // 去除 console，去除注释
          drop_debugger: true,
        },
        format: {
          comments: false, // 去除所有注释
        },
      },
      cssMinify: true,
      rollupOptions: {
        external: (id) => {
          // 在服务端渲染时排除 Three.js
          return (
            id === "three" &&
            // eslint-disable-next-line node/prefer-global/process
            process.env.NODE_ENV === "production"
          );
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          // CSS 注释处理
        ],
      },
    },
  },
});
