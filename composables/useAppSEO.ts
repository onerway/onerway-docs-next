import colors from "tailwindcss/colors";
import { withoutTrailingSlash } from "ufo";

export function useAppSEO() {
  const route = useRoute();
  const appConfig = useAppConfig();
  const colorMode = useColorMode();
  const { locale } = useI18n();

  const themeColor = computed(() =>
    colorMode.value === "dark"
      ? (colors as any)[appConfig.ui.colors.neutral][900]
      : "white"
  );

  const radiusStyle = computed(
    () =>
      `:root { --ui-radius: ${appConfig.theme?.radius || 0.5}rem; }`
  );

  const canonicalUrl = computed(
    () =>
      `https://docs.onerway.com${withoutTrailingSlash(route.path)}`
  );

  const setupSEO = () => {
    useHead({
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          key: "theme-color",
          name: "theme-color",
          content: themeColor,
        },
      ],
      link: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
      ],
      style: [
        {
          innerHTML: radiusStyle,
          id: "nuxt-ui-radius",
          tagPriority: -2,
        },
      ],
      htmlAttrs: {
        lang: locale.value,
      },
    });
  };

  return {
    themeColor,
    radiusStyle,
    canonicalUrl,
    setupSEO,
  };
}
