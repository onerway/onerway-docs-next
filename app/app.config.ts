export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
    },

    container: {
      base: " lg:p-4",
    },
    // 组件样式
    button: {
      slots: {
        base: "cursor-pointer",
      },
    },
    card: {
      variants: {
        outline: {
          root: "divide-none",
        },
      },
    },
    navigationMenu: {
      slots: {
        item: "cursor-pointer text-left",
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
        disabled: {
          true: {},
        },
      },
      compoundVariants: [
        {
          orientation: "vertical",
          collapsed: false,
          class: {
            childList: "ms-3 border-none",
            childItem: "ps-1",
          },
        },
      ],
    },

    // icon
    icons: {
      chevronRight: "i-lucide-chevron-right",
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
