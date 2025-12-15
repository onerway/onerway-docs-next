import type { NavigationMenuProps } from "@nuxt/ui";

/**
 * 导航菜单响应式 UI 配置
 *
 * 用于 Header 和移动端导航组件，解决以下问题：
 * 1. 长文本在移动端的显示 - 使用 line-clamp-2 限制为 2 行
 * 2. 桌面端完整显示 - 使用 lg:line-clamp-none 移除行数限制
 * 3. 文本换行优化 - 使用 text-pretty 和 wrap-break-word
 *
 * 应用场景：
 * - AppHeader: 桌面端水平导航菜单
 * - AppHeaderMobileNav: 移动端侧边栏导航
 *
 * @example
 * ```vue
 * <UNavigationMenu :ui="navigationMenuResponsiveUi" />
 * ```
 */
export const navigationMenuResponsiveUi = {
  /** 一级链接对齐方式 */
  link: "items-start",
  /** 一级链接文本样式：移动端最多 2 行，桌面端不截断 */
  linkLabel:
    "whitespace-normal wrap-break-word text-pretty line-clamp-2 lg:line-clamp-none",
  /** 一级链接尾部图标对齐 */
  linkTrailing: "items-start",
  /** 子级链接对齐方式 */
  childLink: "items-start",
  /** 子级链接文本样式：移动端最多 2 行，桌面端不截断 */
  childLinkLabel:
    "whitespace-normal wrap-break-word text-pretty line-clamp-2 lg:line-clamp-none",
  /** 子级链接容器：确保文本可以正常换行 */
  childLinkWrapper: "min-w-0",
  /** 子级链接描述：最多显示 2 行 */
  childLinkDescription: "text-balance line-clamp-2",
} satisfies NonNullable<NavigationMenuProps["ui"]>;
