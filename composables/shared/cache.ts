import { useMemoize } from "@vueuse/core";

export const generateCacheKey = useMemoize(
  (
    path: string,
    locale: string,
    additionalParams?: Record<string, string | number>
  ): string => {
    const baseKey = `${path}-${locale}`;
    if (!additionalParams) return baseKey;
    const paramString = Object.entries(additionalParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    return `${baseKey}-${paramString}`;
  }
);
