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

    // icon
    icons: {
      chevronRight: "i-lucide-chevron-right",
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

    pageCTA: {
      slots: {
        container:
          "px-0 py-0 lg:py-0 lg:px-0 flex flex-col-reverse",
        footer: "mt-0",
      },
    },

    // prose 组件样式
    prose: {
      p: {
        base: "my-3 leading-7 text-pretty",
      },
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
