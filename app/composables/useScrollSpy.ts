/**
 * useScrollSpy composable
 *
 * 基于 Nuxt UI 的 useScrollspy 实现，使用 IntersectionObserver 监听标题元素的可见性。
 * 提供 `updateHeadings` 方法来动态更新需要观察的标题元素。
 *
 * @see https://ui.nuxt.com/docs/components/content-toc
 */
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";

export function useScrollSpy() {
  const observer = ref<IntersectionObserver>();
  const visibleHeadings = ref<string[]>([]);
  const activeHeadings = ref<string[]>([]);

  /**
   * IntersectionObserver 回调函数
   * 当标题元素进入或离开视口时更新 visibleHeadings 数组
   */
  function observerCallback(
    entries: IntersectionObserverEntry[]
  ) {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (!id) return;

      if (entry.isIntersecting) {
        visibleHeadings.value = [
          ...visibleHeadings.value,
          id,
        ];
      } else {
        visibleHeadings.value =
          visibleHeadings.value.filter((h) => h !== id);
      }
    });
  }

  /**
   * 更新需要观察的标题元素
   * @param headings - 需要监听的标题元素数组
   */
  function updateHeadings(headings: Element[]) {
    if (!observer.value) return;

    // 断开所有现有观察
    observer.value.disconnect();

    // 重置 visibleHeadings（watcher 会同步执行，保留 oldVal）
    visibleHeadings.value = [];

    // 空标题列表（如 Tab 切换到空内容）时清空 activeHeadings
    // 由于 watcher 使用 flush: 'sync'，此赋值在 watcher 之后执行
    if (headings.length === 0) {
      activeHeadings.value = [];
    }

    // 重新观察新的标题元素
    headings.forEach((heading) => {
      observer.value?.observe(heading);
    });
  }

  /**
   * 当 visibleHeadings 变化时更新 activeHeadings
   * - 有可见标题：更新为当前可见的标题
   * - 无可见标题：保留上一次的激活状态（滚动时的正常行为）
   *
   * 使用 flush: 'sync' 确保 watcher 同步执行，避免与 updateHeadings 中
   * 直接设置 activeHeadings 产生竞态条件
   */
  watch(
    visibleHeadings,
    (val, oldVal) => {
      if (val.length === 0) {
        activeHeadings.value = oldVal;
      } else {
        activeHeadings.value = val;
      }
    },
    { flush: "sync" }
  );

  onMounted(() => {
    observer.value = new IntersectionObserver(
      observerCallback
    );
  });

  onBeforeUnmount(() => {
    observer.value?.disconnect();
  });

  return {
    visibleHeadings,
    activeHeadings,
    updateHeadings,
  };
}
