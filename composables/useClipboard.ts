import { useClipboard as useVueUseClipboard } from "@vueuse/core";
import { readonly } from "vue";

export interface ClipboardOptions {
  successTitle?: string;
  successDesc?: string;
  errorTitle?: string;
  errorDesc?: string;
  transform?: (text: string) => string;
  duration?: number;
}

export interface ClipboardResult {
  copy: (
    text: string,
    options?: ClipboardOptions
  ) => Promise<boolean>;
  copied: Readonly<Ref<boolean>>;
  isSupported: Readonly<Ref<boolean>>;
  text: Readonly<Ref<string>>;
  copyCount: Readonly<Ref<number>>;
}

/**
 * 剪贴板操作组合式函数 - 基于 VueUse 最佳实践
 *
 * 特性:
 * - 直接使用 VueUse 的原生 useClipboard API
 * - 响应式剪贴板内容同步
 * - 可选的成功/错误提示
 * - 文本转换支持
 * - 完整的国际化支持
 * - 内置防抖和优化
 *
 * @example
 * ```typescript
 * const { copy, copied, text } = useClipboard()
 *
 * // 基础用法
 * await copy('Hello World')
 *
 * // 自定义消息和转换
 * await copy('4242 4242 4242 4242', {
 *   successTitle: t('clipboard.cardCopied'),
 *   transform: (text) => text.replace(/\s/g, '')
 * })
 * ```
 */
export const useClipboard = (): ClipboardResult => {
  const { t } = useI18n();
  const toast = useToast();

  // 直接使用 VueUse 的 useClipboard
  const {
    text,
    copy: vueUseCopy,
    copied,
    isSupported,
  } = useVueUseClipboard();

  // SSR 安全的复制计数
  const copyCount = useState("clipboard-count", () => 0);

  /**
   * 复制文本到剪贴板 - 简化版本
   */
  const copy = async (
    inputText: string,
    options: ClipboardOptions = {}
  ): Promise<boolean> => {
    const {
      successTitle,
      successDesc,
      errorTitle,
      errorDesc,
      transform,
      duration = 3000,
    } = options;

    // 基础验证
    if (!inputText || inputText.trim().length === 0) {
      console.warn("[useClipboard] Empty text provided");

      if (errorTitle || errorDesc) {
        toast.add({
          title: errorTitle || t("common.error"),
          description:
            errorDesc ||
            t("clipboard.validation.textRequired"),
          color: "error",
          icon: "i-heroicons-exclamation-triangle",
          duration,
        });
      }

      return false;
    }

    if (!isSupported.value) {
      console.warn(
        "[useClipboard] Clipboard API not supported"
      );

      if (errorTitle || errorDesc) {
        toast.add({
          title:
            errorTitle || t("clipboard.error.notSupported"),
          description:
            errorDesc ||
            t("clipboard.error.notSupportedDesc"),
          color: "error",
          icon: "i-heroicons-exclamation-triangle",
          duration,
        });
      }

      return false;
    }

    try {
      // 应用文本转换
      const textToCopy = transform
        ? transform(inputText)
        : inputText;

      // 直接使用 VueUse 的 copy 方法（内置优化）
      await vueUseCopy(textToCopy);

      // 更新计数
      copyCount.value += 1;

      // 显示成功提示
      if (successTitle || successDesc) {
        toast.add({
          title:
            successTitle || t("clipboard.success.title"),
          description:
            successDesc ||
            t("clipboard.success.description"),
          color: "success",
          icon: "i-heroicons-check-circle",
          duration,
        });
      }

      return true;
    } catch (error) {
      console.error("[useClipboard] Copy failed:", error);

      // 显示错误提示
      if (errorTitle || errorDesc) {
        toast.add({
          title: errorTitle || t("clipboard.error.title"),
          description:
            errorDesc || t("clipboard.error.description"),
          color: "error",
          icon: "i-heroicons-x-circle",
          duration,
        });
      }

      return false;
    }
  };

  return {
    copy,
    copied: readonly(copied),
    isSupported: readonly(isSupported),
    text: readonly(text), // VueUse 原生的响应式剪贴板内容
    copyCount: readonly(copyCount),
  };
};
