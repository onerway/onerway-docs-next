export default defineAppConfig({
  ui: {
    colors: {
      primary: "indigo",
      neutral: "slate",
    },
    tabs: {
      slots: {
        trigger: "cursor-pointer",
      },
    },
    accordion: {
      slots: {
        trigger: "cursor-pointer",
      },
    },
    navigationMenu: {
      variants: {
        active: {
          false: {
            link: "text-default",
          },
        },
      },
    },
    button: {
      compoundVariants: [
        {
          color: "primary",
          variant: "link",
          class:
            "text-primary hover:text-default active:text-primary/75 disabled:text-primary aria-disabled:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        },
      ],
    },
    contentNavigation: {
      slots: {
        link: "cursor-pointer",
        trigger: "font-medium",
      },
      variants: {
        level: {
          true: {},
        },
      },
    },
    pageCTA: {
      slots: {
        container:
          "px-0 py-0 lg:py-0 lg:px-0 flex flex-col-reverse",
        footer: "mt-0",
      },
    },
    prose: {
      a: {
        base: [
          "text-primary border-b-0 border-transparent hover:text-default hover:border-primary font-medium focus-visible:outline-primary [&>code]:border-dashed hover:[&>code]:border-primary hover:[&>code]:text-muted",
          "transition-colors [&>code]:transition-colors",
        ],
      },
    },
    pageCard: {
      slots: {
        title: "",
      },
    },
  },
  toaster: {
    position: "bottom-right" as const,
    expand: true,
    duration: 5000,
  },
  theme: {
    radius: 0.25,
    blackAsPrimary: false,
  },
  // 滚动条会自动使用这些颜色
  scrollbar: {
    primary: true, // 使用 primary 颜色
    thickness: "normal", // thin | normal | thick
  },
});
