import {
  generateSearchLinks,
  getAllCollectionNames,
} from "~/composables/shared/utils";

export function useAppSearch() {
  const { locale, t } = useI18n();

  const { data: files } = useLazyAsyncData(
    "search",
    async () => {
      const searchCollections = getAllCollectionNames([
        locale.value as any,
      ]);

      const searchPromises = searchCollections.map(
        (collection) =>
          queryCollectionSearchSections(
            collection as any
          ).catch(() => [])
      );

      const results = await Promise.all(searchPromises);
      return results.flat();
    },
    {
      server: false,
    }
  );

  const searchLinks = computed(() =>
    generateSearchLinks(t)
  );

  return {
    files,
    searchLinks,
  };
}
