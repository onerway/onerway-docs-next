import type { DropdownMenuItem } from "@nuxt/ui";

/**
 * 语言切换 Composable
 * 封装多语言切换的菜单项生成逻辑
 *
 * @example
 * ```vue
 * <script setup>
 * const { languageItems, currentLanguageLabel, currentLocale } = useLanguageSwitcher()
 * </script>
 *
 * <template>
 *   <UDropdownMenu :items="languageItems">
 *     <UButton :label="currentLanguageLabel" />
 *   </UDropdownMenu>
 * </template>
 * ```
 */
export const useLanguageSwitcher = () => {
  const { t, locale, locales, setLocale } = useI18n();

  /**
   * 语言切换下拉菜单项
   * 格式符合 UDropdownMenu 的 items prop
   */
  const languageItems = computed<DropdownMenuItem[][]>(() => [
    locales.value.map((l) => ({
      label: t(`header.language.${l.code}`),
      icon: locale.value === l.code ? "i-lucide-check" : undefined,
      onSelect: () => setLocale(l.code),
    })),
  ]);

  /**
   * 当前语言的显示标签
   */
  const currentLanguageLabel = computed(() =>
    t(`header.language.${locale.value}`)
  );

  /**
   * 当前语言代码
   */
  const currentLocale = computed(() => locale.value);

  /**
   * 切换到指定语言
   */
  const switchLanguage = (code: string) => {
    setLocale(code);
  };

  return {
    languageItems,
    currentLanguageLabel,
    currentLocale,
    switchLanguage,
  };
};
