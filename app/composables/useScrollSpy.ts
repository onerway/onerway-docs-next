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
  onBeforeMount,
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
      if (!id) {
        return;
      }

      if (entry.isIntersecting) {
        // 标题进入视口，添加到 visibleHeadings
        visibleHeadings.value = [
          ...visibleHeadings.value,
          id,
        ];
      } else {
        // 标题离开视口，从 visibleHeadings 中移除
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
    headings.forEach((heading) => {
      if (!observer.value) {
        return;
      }

      observer.value.observe(heading);
    });
  }

  /**
   * 当 visibleHeadings 变化时更新 activeHeadings
   * - 如果有可见标题，activeHeadings 更新为当前可见的标题
   * - 如果没有可见标题，保留上一次的激活状态
   */
  watch(visibleHeadings, (val, oldVal) => {
    if (val.length === 0) {
      activeHeadings.value = oldVal;
    } else {
      activeHeadings.value = val;
    }
  });

  onBeforeMount(() => {
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
