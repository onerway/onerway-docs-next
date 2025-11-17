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
        linkTrailingIcon:
          "group-data-[state=open]:rotate-90",
      },
      variants: {
        orientation: {
          vertical: {
            link: "p-1.5",
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

    // icon
    icons: {
      chevronRight: "i-lucide-chevron-right",
    }
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
