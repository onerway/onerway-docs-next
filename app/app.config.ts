export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
    },

    // 组件样式
    navigationMenu: {
      variants: {
        orientation: {
          vertical: {
            link: "px-1.5 py-1",
          },
        },
      },
      compoundVariants: [
        {
          orientation: "vertical",
          collapsed: false,
          class: {
            childList: "ms-1.5 border-none",
            childItem: "ps-1.5 -ms-px",
          },
        },
      ],
    },
  },
  seo: {
    siteName: "Onerway Docs",
  },
});
