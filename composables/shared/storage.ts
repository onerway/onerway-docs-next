import { useStorage } from "@vueuse/core";
import { STORAGE_KEYS } from "./constants";

export function useRecentPagesStorage() {
  return useStorage(
    STORAGE_KEYS.RECENT_PAGES,
    [],
    import.meta.client ? localStorage : undefined,
    {
      mergeDefaults: true,
      serializer: {
        read: (value: string) => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        },
        write: (value: unknown[]) => JSON.stringify(value),
      },
    }
  );
}
