import type { AsyncDataRequestStatus } from "#app";

/**
 * 延迟显示加载状态的 Composable
 *
 * 用于实现"延迟骨架屏"策略：
 * - 快速加载（<delay）：不显示骨架屏，避免闪烁
 * - 慢速加载（>delay）：显示骨架屏，提供加载反馈
 *
 * @param status - useAsyncData 返回的 status ref
 * @param delay - 延迟显示骨架屏的时间（毫秒），默认 200ms
 * @returns showSkeleton - 是否应该显示骨架屏
 *
 * @example
 * ```ts
 * const { data, status } = await useAsyncData(...)
 * const { showSkeleton } = useDelayedLoading(status, 200)
 * ```
 */
export const useDelayedLoading = (
  status: Ref<AsyncDataRequestStatus>,
  delay = 200
) => {
  const showSkeleton = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  watch(
    status,
    (newStatus) => {
      if (newStatus === "pending") {
        // 开始计时，超过 delay 才显示骨架屏
        timer = setTimeout(() => {
          showSkeleton.value = true;
        }, delay);
      } else {
        // 加载完成，清除计时器并隐藏骨架屏
        clearTimer();
        showSkeleton.value = false;
      }
    },
    { immediate: true } // 立即执行，处理初始状态
  );

  onUnmounted(() => {
    clearTimer();
  });

  return { showSkeleton };
};
