/**
 * Clipboard composable with toast feedback
 */
export interface ClipboardOptions {
  successTitle?: string;
  successDesc?: string;
  errorTitle?: string;
  errorDesc?: string;
  transform?: (text: string) => string;
  duration?: number;
}

export const useClipboard = () => {
  const toast = useToast();
  const { t } = useI18n();
  const copied = ref(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const copy = async (
    text: string,
    options: ClipboardOptions = {}
  ) => {
    const {
      successTitle = t("copied"),
      successDesc,
      errorTitle = t("copyFailed"),
      errorDesc,
      transform,
      duration = 2000,
    } = options;

    try {
      const textToCopy = transform ? transform(text) : text;
      await navigator.clipboard.writeText(textToCopy);

      copied.value = true;
      toast.add({
        title: successTitle,
        description: successDesc,
        color: "success",
        duration,
      });

      // Reset copied state
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        copied.value = false;
      }, duration);

      return true;
    } catch {
      toast.add({
        title: errorTitle,
        description: errorDesc,
        color: "error",
        duration,
      });
      return false;
    }
  };

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout);
  });

  return {
    copy,
    copied: readonly(copied),
  };
};
