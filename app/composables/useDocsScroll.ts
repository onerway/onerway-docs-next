/**
 * useDocsScroll composable
 *
 * 处理文档页面的滚动行为，适用于自定义滚动容器（如 UDashboardPanel）。
 * 提供滚动到指定元素和滚动到顶部的功能。
 *
 * @example
 * ```typescript
 * const { scrollToElement, scrollToTop } = useDocsScroll();
 *
 * // 滚动到指定 id 的元素
 * scrollToElement("section-1");
 *
 * // 滚动到页面顶部
 * scrollToTop();
 * ```
 */

/** 滚动容器的 CSS 选择器 */
export const SCROLL_CONTAINER_SELECTOR =
  ".docs-scroll-container";

export function useDocsScroll() {
  /**
   * 获取滚动容器元素
   */
  const getScrollContainer = (): Element | null => {
    return document.querySelector(
      SCROLL_CONTAINER_SELECTOR
    );
  };

  /**
   * 滚动到指定 id 的元素
   * @param id - 目标元素的 id（不含 # 前缀）
   * @param behavior - 滚动行为，默认 "smooth"
   */
  const scrollToElement = (
    id: string,
    behavior: ScrollBehavior = "smooth"
  ): void => {
    const container = getScrollContainer();
    const el = document.getElementById(id);

    if (container && el) {
      // 计算元素相对于滚动容器的偏移量
      const containerRect =
        container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offsetTop =
        elRect.top -
        containerRect.top +
        container.scrollTop;
      container.scrollTo({ top: offsetTop, behavior });
    }
  };

  /**
   * 滚动到页面顶部
   * @param behavior - 滚动行为，默认 "smooth"
   */
  const scrollToTop = (
    behavior: ScrollBehavior = "smooth"
  ): void => {
    const container = getScrollContainer();
    container?.scrollTo({ top: 0, behavior });
  };

  /**
   * 根据当前路由 hash 滚动到对应位置
   * @param hash - 路由 hash（含 # 前缀）
   * @param behavior - 滚动行为，默认 "smooth"
   */
  const scrollToHash = (
    hash: string,
    behavior: ScrollBehavior = "smooth"
  ): void => {
    if (hash) {
      scrollToElement(hash.slice(1), behavior);
    } else {
      scrollToTop(behavior);
    }
  };

  return {
    getScrollContainer,
    scrollToElement,
    scrollToTop,
    scrollToHash,
  };
}
