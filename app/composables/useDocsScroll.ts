/**
 * useDocsScroll composable
 *
 * 处理文档页面的滚动和导航行为，适用于自定义滚动容器（如 UDashboardPanel）。
 *
 * ============================================================================
 * 架构说明：职责划分
 * ============================================================================
 *
 * 本 composable 专注于"如何滚动"（滚动能力），不处理"何时滚动"（路由监听）。
 *
 * 职责分工：
 * - useDocsScroll: 提供滚动能力（scrollToElement、navigateToHash 等）
 * - [...slug].vue: 监听路由变化，决定何时调用滚动能力
 * - DocsToc/ProseA: 响应用户点击，调用 navigateToHash
 *
 * 为什么不在这里监听路由？
 * - 避免重复注册：本 composable 会被多个组件调用
 * - 职责分离：让页面组件控制自己的路由响应逻辑
 * - 灵活性：不同页面可能有不同的监听需求
 *
 * ============================================================================
 * API 分类和使用场景
 * ============================================================================
 *
 * 提供三类 API：
 *
 * 1. 底层滚动函数（scrollToElement、scrollToTop、scrollToHash）
 *    - 只负责滚动，不更新 URL
 *    - 适用于响应路由变化的场景（[...slug].vue）
 *
 * 2. 高级导航函数（navigateToHash、navigateToTop）
 *    - 滚动 + 更新 URL + 防止重复滚动
 *    - 适用于用户交互场景（TOC 点击、锚点链接）
 *
 * 3. 辅助工具函数
 *    - markProgrammaticScroll / checkProgrammaticScroll: 程序滚动标记
 *    - isElementVisible: Tab 可见性检查
 *
 * ============================================================================
 * 使用示例
 * ============================================================================
 *
 * @example 场景 1: 用户点击 TOC/锚点链接（推荐用法）
 * ```typescript
 * const { navigateToHash } = useDocsScroll();
 *
 * function handleClick(id: string) {
 *   // 自动处理：标记程序滚动 + 执行滚动 + 更新 URL
 *   navigateToHash(id);
 * }
 * ```
 *
 * @example 场景 2: 响应路由 hash 变化（浏览器前进/后退）
 * ```typescript
 * const { scrollToHash, checkProgrammaticScroll } = useDocsScroll();
 * const route = useRoute();
 *
 * watch(() => route.hash, () => {
 *   // 检查是否为程序触发（TOC 点击），避免重复滚动
 *   if (checkProgrammaticScroll()) return;
 *
 *   // 使用底层滚动函数（URL 已由路由器更新）
 *   scrollToHash(route.hash);
 * });
 * ```
 *
 * @example 场景 3: 返回顶部按钮
 * ```typescript
 * const { navigateToTop } = useDocsScroll();
 *
 * function handleBackToTop() {
 *   // 自动处理：标记程序滚动 + 滚动到顶部 + 清空 hash
 *   navigateToTop();
 * }
 * ```
 *
 * @example 场景 4: 只滚动不更新 URL（高级用法）
 * ```typescript
 * const { scrollToElement } = useDocsScroll();
 *
 * // 只执行滚动，不改变 URL
 * scrollToElement("section-1");
 * ```
 */

/** 滚动容器的 CSS 选择器 */
export const SCROLL_CONTAINER_SELECTOR =
  ".docs-scroll-container";

/**
 * 程序触发的滚动标记（用于防止浏览器前进/后退时重复滚动）
 */
let isProgrammaticScroll = false;

/**
 * 标记即将发生的滚动是由程序触发的（如 TOC 点击、链接点击）
 * 用于区分用户点击浏览器后退按钮触发的 hash 变化
 */
export function markProgrammaticScroll() {
  isProgrammaticScroll = true;
  // 短暂延迟后重置标记（确保 router.replace 完成）
  setTimeout(() => {
    isProgrammaticScroll = false;
  }, 50);
}

/**
 * 检查当前是否为程序触发的滚动
 */
export function checkProgrammaticScroll(): boolean {
  return isProgrammaticScroll;
}

/**
 * 检查元素是否在所有激活的 Tab 中
 * 支持嵌套 tabs：需要所有层级的 data-tab-active 都为 true
 * @param el - 要检查的元素
 * @returns 如果元素在所有激活的 Tab 中，返回 true
 */
export function isElementVisible(el: Element): boolean {
  let current: Element | null = el;

  // 向上遍历所有祖先元素，检查每一层的 data-tab-active
  while (current) {
    const tabContent: Element | null = current.closest(
      "[data-tab-active]"
    );
    if (!tabContent) {
      // 没有更多的 tab 容器，说明已检查完所有层级
      break;
    }

    // 如果当前层级的 tab 不是激活状态，返回 false
    if (
      tabContent.getAttribute("data-tab-active") !== "true"
    ) {
      return false;
    }

    // 继续检查上一层的 tab 容器
    current = tabContent.parentElement;
  }

  return true;
}

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

    // 元素不存在检查
    if (!el) {
      if (import.meta.dev) {
        console.warn(
          `[useDocsScroll] 元素不存在: #${id}`
        );
      }
      return;
    }

    // Tab 可见性检查
    if (!isElementVisible(el)) {
      if (import.meta.dev) {
        console.warn(
          `[useDocsScroll] 元素在隐藏的 Tab 中，跳过滚动: #${id}`
        );
      }
      return;
    }

    if (!container) {
      if (import.meta.dev) {
        console.warn(
          "[useDocsScroll] 滚动容器不存在"
        );
      }
      return;
    }

    // 使用双重 RAF 确保 DOM 布局计算完成
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const containerRect =
          container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const offsetTop =
          elRect.top -
          containerRect.top +
          container.scrollTop;
        container.scrollTo({ top: offsetTop, behavior });
      });
    });
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

  // ============================================================================
  // 导航函数（推荐使用）
  // ============================================================================

  /**
   * 跳转到指定的 hash 锚点
   *
   * 这是推荐的导航方式，自动处理：
   * - 标记程序触发的滚动
   * - 滚动到目标元素
   * - 更新 URL hash
   *
   * @param id - 目标元素的 id（不含 # 前缀）
   * @param options - 可选配置
   *
   * @example
   * ```typescript
   * // TOC 点击
   * navigateToHash('section-id');
   *
   * // 自定义滚动行为
   * navigateToHash('section-id', { behavior: 'auto' });
   *
   * // 只滚动不更新 URL（少见场景）
   * navigateToHash('section-id', { updateUrl: false });
   * ```
   */
  const navigateToHash = (
    id: string,
    options: {
      /** 滚动行为，默认 smooth */
      behavior?: ScrollBehavior;
      /** 是否更新 URL，默认 true */
      updateUrl?: boolean;
    } = {}
  ): void => {
    const { behavior = "smooth", updateUrl = true } = options;

    // 标记为程序触发的滚动
    markProgrammaticScroll();

    // 执行滚动
    scrollToElement(id, behavior);

    // 更新 URL hash
    if (updateUrl) {
      const router = useRouter();
      router.replace({
        hash: `#${encodeURIComponent(id)}`,
      });
    }
  };

  /**
   * 滚动到页面顶部并清空 hash
   *
   * 推荐用于"返回顶部"按钮，自动处理：
   * - 标记程序触发的滚动
   * - 滚动到顶部
   * - 清空 URL hash
   *
   * @param options - 可选配置
   *
   * @example
   * ```typescript
   * // 返回顶部按钮
   * navigateToTop();
   *
   * // 自定义滚动行为
   * navigateToTop({ behavior: 'auto' });
   *
   * // 只滚动不清空 hash（少见场景）
   * navigateToTop({ clearHash: false });
   * ```
   */
  const navigateToTop = (
    options: {
      /** 滚动行为，默认 smooth */
      behavior?: ScrollBehavior;
      /** 是否清空 URL hash，默认 true */
      clearHash?: boolean;
    } = {}
  ): void => {
    const { behavior = "smooth", clearHash = true } = options;

    // 标记为程序触发的滚动
    markProgrammaticScroll();

    // 执行滚动
    scrollToTop(behavior);

    // 清空 URL hash
    if (clearHash) {
      const router = useRouter();
      router.replace({ hash: "" });
    }
  };

  return {
    // 滚动函数（底层 API）
    getScrollContainer,
    scrollToElement,
    scrollToTop,
    scrollToHash,
    // 程序标记函数
    markProgrammaticScroll,
    checkProgrammaticScroll,
    // 工具函数
    isElementVisible,
    // 导航函数（推荐使用）
    navigateToHash,
    navigateToTop,
  };
}
