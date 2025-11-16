export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
    },

    container: {
      base: " lg:p-4",
    },
    // 组件样式
    navigationMenu: {
      slots: {
        item: "cursor-pointer",
      },
      variants: {
        orientation: {
          vertical: {
            link: "px-1.5 py-1",
          },
        },
        active: {
          false: {
            link: "text-default",
            linkLeadingIcon: "text-default",
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

  header: {
    to: "/",
    logo: {
      alt: "",
      light: "",
      dark: "",
    },
  },
});
