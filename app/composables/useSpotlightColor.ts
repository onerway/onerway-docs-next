import type { PageCardProps } from "#ui/types";

/**
 * useSpotlightColor
 * 提供 spotlight 颜色相关的工具函数
 *
 * 功能：
 * - 根据 spotlightColor 生成对应的图标背景样式类
 * - 类型安全，自动同步 Nuxt UI 的颜色定义
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { getIconBgClass } = useSpotlightColor();
 * </script>
 *
 * <template>
 *   <div :class="getIconBgClass('primary')">
 *     <UIcon name="i-heroicons-star" />
 *   </div>
 * </template>
 * ```
 */

// 从 Nuxt UI 的 PageCardProps 提取 spotlightColor 类型
export type SpotlightColor = NonNullable<
  PageCardProps["spotlightColor"]
>;

// 图标背景色映射（跟随 spotlightColor）
// 包含：背景色、hover 背景色、文字颜色
const iconBgColorMap: Record<SpotlightColor, string> = {
  primary:
    "bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 text-primary",
  secondary:
    "bg-secondary/10 dark:bg-secondary/20 group-hover:bg-secondary/20 dark:group-hover:bg-secondary/30 text-secondary",
  success:
    "bg-success/10 dark:bg-success/20 group-hover:bg-success/20 dark:group-hover:bg-success/30 text-success",
  info: "bg-info/10 dark:bg-info/20 group-hover:bg-info/20 dark:group-hover:bg-info/30 text-info",
  warning:
    "bg-warning/10 dark:bg-warning/20 group-hover:bg-warning/20 dark:group-hover:bg-warning/30 text-warning",
  error:
    "bg-error/10 dark:bg-error/20 group-hover:bg-error/20 dark:group-hover:bg-error/30 text-error",
  neutral:
    "bg-muted/50 dark:bg-muted/30 group-hover:bg-muted/70 dark:group-hover:bg-muted/50 text-muted",
};

export const useSpotlightColor = () => {
  /**
   * 根据 spotlightColor 获取图标背景样式类
   * @param color - spotlight 颜色
   * @returns Tailwind 类字符串
   */
  const getIconBgClass = (color: SpotlightColor): string =>
    iconBgColorMap[color];

  return {
    getIconBgClass,
    iconBgColorMap,
  };
};
