/**
 * NavigationMenu trigger + 跳转 composable
 *
 * 解决 UNavigationMenu 中 trigger 类型菜单项只展开不跳转的问题。
 * 当父级菜单有独立页面（to 与 children[0].to 不同）时，点击时自动执行跳转。
 *
 * 交互逻辑：
 * - 菜单关闭时点击：展开 + 跳转
 * - 菜单展开 + 当前不在该页面：只跳转，不折叠
 * - 菜单展开 + 当前已在该页面：正常折叠，不跳转
 *
 * 使用方式：
 * 1. 在 UNavigationMenu 的 #item-label slot 中添加 data-nav-to 属性
 * 2. 用 @click.capture 事件委托调用 handleClick
 *
 * @returns handleClick - 事件处理函数，用于 @click.capture 事件委托
 *
 * @example
 * ```vue
 * <script setup>
 * const { handleClick } = useNavigationMenuTriggerClick()
 * </script>
 *
 * <template>
 *   <div @click.capture="handleClick">
 *     <UNavigationMenu :items="menuItems">
 *       <template #item-label="{ item }">
 *         <!-- 仅当父级有独立页面（to 与 children[0].to 不同）时才启用跳转 -->
 *         <span :data-nav-to="
 *           item.type === 'trigger' &&
 *           item.to &&
 *           item.children?.[0]?.to !== item.to
 *             ? item.to
 *             : undefined
 *         ">
 *           {{ item.label }}
 *         </span>
 *       </template>
 *     </UNavigationMenu>
 *   </div>
 * </template>
 * ```
 */
export function useNavigationMenuTriggerClick() {
  const route = useRoute();

  /**
   * 处理导航菜单点击事件
   * 用于实现 trigger 类型菜单项的"展开 + 跳转"功能
   *
   * 交互逻辑：
   * - 菜单关闭时点击：展开 + 跳转
   * - 菜单展开 + 当前不在该页面：只跳转，不折叠
   * - 菜单展开 + 当前已在该页面：正常折叠，不跳转
   */
  function handleClick(e: MouseEvent) {
    // 查找被点击的按钮
    const button = (e.target as HTMLElement).closest(
      "button"
    );
    if (!button) return;

    // 从按钮内查找 data-nav-to 属性
    const navToElement =
      button.querySelector("[data-nav-to]");
    if (!navToElement) return;

    const navTo = navToElement.getAttribute("data-nav-to");
    if (!navTo) return;

    // 检查是否已在目标页面
    const isCurrentPage = route.path === navTo;

    // 如果已在目标页面，不执行跳转，让默认的展开/折叠行为生效
    if (isCurrentPage) return;

    // 检查菜单是否已展开（data-state="open"）
    const isOpen =
      button.getAttribute("data-state") === "open";

    if (isOpen) {
      // 已展开 + 不在当前页面 → 阻止折叠，只跳转
      e.stopPropagation();
      e.preventDefault();
    }

    // 执行跳转
    navigateTo(navTo);
  }

  return { handleClick };
}
