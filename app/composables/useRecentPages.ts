/**
 * Recent pages composable for tracking visited documentation pages
 */
export interface RecentPage {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  moduleName?: string;
  timestamp: number;
}

const STORAGE_KEY = "onerway-recent-pages";
const MAX_PAGES = 10;

export const useRecentPages = () => {
  const { t, locale } = useI18n();
  const pages = useState<RecentPage[]>(
    "recentPages",
    () => []
  );

  // Load from localStorage on client
  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        pages.value = JSON.parse(stored);
      }
    } catch {
      pages.value = [];
    }
  });

  // Save to localStorage
  const save = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(pages.value)
      );
    } catch {
      // Ignore storage errors
    }
  };

  // Add a page to recent list
  const addPage = (page: Omit<RecentPage, "timestamp">) => {
    const existing = pages.value.findIndex(
      (p) => p.path === page.path
    );
    if (existing !== -1) {
      pages.value.splice(existing, 1);
    }

    pages.value.unshift({
      ...page,
      timestamp: Date.now(),
    });

    if (pages.value.length > MAX_PAGES) {
      pages.value = pages.value.slice(0, MAX_PAGES);
    }

    save();
  };

  // Remove a page
  const removePage = (path: string) => {
    pages.value = pages.value.filter(
      (p) => p.path !== path
    );
    save();
  };

  // Clear all pages
  const clearPages = () => {
    pages.value = [];
    save();
  };

  // Get recent 3 pages
  const recentThreePages = computed(() =>
    pages.value.slice(0, 3)
  );

  // Format time relative to now
  const formatTimeI18n = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("timeJustNow");
    if (minutes < 60)
      return t("timeMinutesAgo", { count: minutes });
    if (hours < 24)
      return t("timeHoursAgo", { count: hours });
    if (days < 7) return t("timeDaysAgo", { count: days });

    return new Intl.DateTimeFormat(locale.value, {
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  // Get color based on recency
  const getTimeColor = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = diff / 3600000;

    if (hours < 1) return "text-success";
    if (hours < 24) return "text-primary";
    return "text-muted";
  };

  return {
    pages: readonly(pages),
    recentThreePages,
    addPage,
    removePage,
    clearPages,
    formatTimeI18n,
    getTimeColor,
  };
};
