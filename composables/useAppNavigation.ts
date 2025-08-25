import { createLogger } from "~/composables/shared/logger";
import { getAllCollectionNames } from "~/composables/shared/module";

export function useAppNavigation() {
  const logger = createLogger("app-navigation");

  const { data: allNavigations } = useAsyncData(
    "navigation",
    async () => {
      const collections = getAllCollectionNames();

      logger.info("collections", collections);

      const navigationPromises = collections.map(
        (collection) =>
          queryCollectionNavigation(collection as any, [
            "icon",
            "title",
            "description",
            "version",
            "showToc",
            "showNavigation",
            "path",
            "module",
            "defaultOpen",
            "ui",
            "showFooter",
          ])
            .where("draft", "<>", true)
            .catch(() => [])
      );

      const results = await Promise.all(navigationPromises);

      return collections.reduce(
        (acc, collection, index) => {
          const result = results[index];
          if (result && result.length > 0) {
            acc[collection] = result;
          }
          return acc;
        },
        {} as Record<string, any[]>
      );
    }
  );

  const { mappedNavigation, filteredNavigation } =
    useContentNavigation(
      allNavigations as Ref<Record<string, any[]> | null>
    );

  const setupNavigationProvider = () => {
    provide("navigation", filteredNavigation);
  };

  logger.info("allNavigations", allNavigations.value);
  logger.info("mappedNavigation", mappedNavigation.value);

  return {
    allNavigations,
    mappedNavigation,
    filteredNavigation,
    setupNavigationProvider,
  };
}
