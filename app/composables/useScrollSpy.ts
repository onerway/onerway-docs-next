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
   * 会清除旧的观察目标，避免内存泄漏和状态不一致
   * @param headings - 需要监听的标题元素数组
   */
  function updateHeadings(headings: Element[]) {
    if (!observer.value) {
      return;
    }

    // 1. 断开所有现有观察，避免观察已卸载的元素
    observer.value.disconnect();

    // 2. 重置可见标题列表，避免保留已不存在的标题
    visibleHeadings.value = [];

    // 3. 如果没有标题需要观察（如空 Tab），清空 activeHeadings
    //    注意：watch 中的逻辑会在 visibleHeadings 为空时保留 activeHeadings（为滚动场景设计）
    //    但 Tab 切换到空内容时，应该清空
    if (headings.length === 0) {
      activeHeadings.value = [];
    }

    // 4. 重新观察新的标题元素
    headings.forEach((heading) => {
      observer.value?.observe(heading);
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

  // 使用 onMounted 确保只在客户端执行
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
