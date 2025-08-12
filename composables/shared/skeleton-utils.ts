/**
 * 骨架屏工具函数
 * 提供优雅的加载状态和用户体验
 */

// 骨架屏类型定义
export type SkeletonType =
  | "text-line" // 文本行
  | "text-title" // 标题文本
  | "text-block" // 文本块
  | "rectangle" // 矩形
  | "square" // 正方形
  | "circle" // 圆形
  | "avatar" // 头像
  | "button" // 按钮
  | "card" // 卡片
  | "image"; // 图片占位

// 骨架屏尺寸
export type SkeletonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

// 动画类型
export type SkeletonAnimation =
  | "pulse"
  | "wave"
  | "shimmer"
  | "none";

interface SkeletonOptions {
  type: SkeletonType;
  size?: SkeletonSize;
  animation?: SkeletonAnimation;
  rounded?: boolean | "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

/**
 * 获取基础骨架屏类名
 */
const getBaseSkeletonClasses = (
  animation: SkeletonAnimation = "pulse"
): string => {
  const baseClasses =
    "bg-gray-200 dark:bg-gray-700 skeleton-base";

  switch (animation) {
    case "pulse":
      return `${baseClasses} animate-pulse`;
    case "wave":
      return `${baseClasses} skeleton-wave`;
    case "shimmer":
      return `${baseClasses} skeleton-shimmer`;
    case "none":
      return baseClasses;
    default:
      return `${baseClasses} animate-pulse`;
  }
};

/**
 * 获取圆角类名
 */
const getRoundedClasses = (
  rounded: SkeletonOptions["rounded"]
): string => {
  if (rounded === false) return "";
  if (rounded === true) return "rounded";

  switch (rounded) {
    case "sm":
      return "rounded-sm";
    case "md":
      return "rounded-md";
    case "lg":
      return "rounded-lg";
    case "xl":
      return "rounded-xl";
    case "full":
      return "rounded-full";
    default:
      return "rounded";
  }
};

/**
 * 获取尺寸类名
 */
const getSizeClasses = (
  type: SkeletonType,
  size: SkeletonSize = "md"
): string => {
  const sizeMap = {
    "text-line": {
      xs: "h-3",
      sm: "h-4",
      md: "h-5",
      lg: "h-6",
      xl: "h-7",
      "2xl": "h-8",
    },
    "text-title": {
      xs: "h-6",
      sm: "h-7",
      md: "h-8",
      lg: "h-10",
      xl: "h-12",
      "2xl": "h-14",
    },
    "text-block": {
      xs: "h-16",
      sm: "h-20",
      md: "h-24",
      lg: "h-32",
      xl: "h-40",
      "2xl": "h-48",
    },
    rectangle: {
      xs: "h-8",
      sm: "h-10",
      md: "h-12",
      lg: "h-16",
      xl: "h-20",
      "2xl": "h-24",
    },
    square: {
      xs: "h-8 w-8",
      sm: "h-10 w-10",
      md: "h-12 w-12",
      lg: "h-16 w-16",
      xl: "h-20 w-20",
      "2xl": "h-24 w-24",
    },
    circle: {
      xs: "h-8 w-8",
      sm: "h-10 w-10",
      md: "h-12 w-12",
      lg: "h-16 w-16",
      xl: "h-20 w-20",
      "2xl": "h-24 w-24",
    },
    avatar: {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
      "2xl": "h-20 w-20",
    },
    button: {
      xs: "h-8 px-3",
      sm: "h-9 px-4",
      md: "h-10 px-5",
      lg: "h-11 px-6",
      xl: "h-12 px-7",
      "2xl": "h-14 px-8",
    },
    card: {
      xs: "h-32",
      sm: "h-40",
      md: "h-48",
      lg: "h-56",
      xl: "h-64",
      "2xl": "h-72",
    },
    image: {
      xs: "h-24",
      sm: "h-32",
      md: "h-40",
      lg: "h-48",
      xl: "h-56",
      "2xl": "h-64",
    },
  };

  return sizeMap[type]?.[size] || "h-4";
};

/**
 * 生成骨架屏类名
 */
export const getSkeletonClasses = (
  options: SkeletonOptions
): string => {
  const {
    type,
    size = "md",
    animation = "pulse",
    rounded,
    className = "",
  } = options;

  const baseClasses = getBaseSkeletonClasses(animation);
  const sizeClasses = getSizeClasses(type, size);
  const roundedClasses = getRoundedClasses(
    rounded !== undefined
      ? rounded
      : type === "circle" || type === "avatar"
        ? "full"
        : type === "button" || type === "card"
          ? "lg"
          : "md"
  );

  return [
    baseClasses,
    sizeClasses,
    roundedClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");
};

/**
 * 预设的骨架屏配置
 */
export const skeletonPresets = {
  // 文本相关
  titleLarge: {
    type: "text-title" as const,
    size: "xl" as const,
  },
  titleMedium: {
    type: "text-title" as const,
    size: "lg" as const,
  },
  titleSmall: {
    type: "text-title" as const,
    size: "md" as const,
  },
  textLine: {
    type: "text-line" as const,
    size: "md" as const,
  },
  textBlock: {
    type: "text-block" as const,
    size: "md" as const,
  },

  // 按钮相关
  buttonPrimary: {
    type: "button" as const,
    size: "lg" as const,
  },
  buttonSecondary: {
    type: "button" as const,
    size: "md" as const,
  },

  // 卡片相关
  card: { type: "card" as const, size: "md" as const },
  avatar: { type: "avatar" as const, size: "md" as const },

  // 图片相关
  heroImage: {
    type: "image" as const,
    size: "xl" as const,
  },
  cardImage: {
    type: "image" as const,
    size: "md" as const,
  },
};

/**
 * 创建骨架屏布局助手
 */
export const createSkeletonLayout = {
  // Hero 区域骨架屏
  hero: () => ({
    container: "space-y-6",
    title: `${getSkeletonClasses(
      skeletonPresets.titleLarge
    )} w-3/4`,
    subtitle: `${getSkeletonClasses(
      skeletonPresets.titleMedium
    )} w-1/2`,
    description: [
      `${getSkeletonClasses(
        skeletonPresets.textLine
      )} w-full`,
      `${getSkeletonClasses(
        skeletonPresets.textLine
      )} w-2/3`,
    ],
    buttons: [
      `${getSkeletonClasses(
        skeletonPresets.buttonPrimary
      )} w-48`,
      `${getSkeletonClasses(
        skeletonPresets.buttonSecondary
      )} w-36`,
    ],
  }),

  // 功能卡片骨架屏
  featureCard: () => ({
    container: "space-y-4 p-6",
    icon: getSkeletonClasses({
      type: "square",
      size: "md",
    }),
    title: `${getSkeletonClasses(
      skeletonPresets.titleSmall
    )} w-3/4`,
    description: [
      `${getSkeletonClasses(
        skeletonPresets.textLine
      )} w-full`,
      `${getSkeletonClasses(
        skeletonPresets.textLine
      )} w-5/6`,
    ],
    links: [
      `${getSkeletonClasses({
        type: "text-line",
        size: "sm",
      })} w-24`,
      `${getSkeletonClasses({
        type: "text-line",
        size: "sm",
      })} w-32`,
    ],
  }),

  // 简单矩形骨架屏
  rectangle: (className = "h-64") =>
    `${getSkeletonClasses({
      type: "rectangle",
      animation: "pulse",
    })} ${className}`,
};

/**
 * 骨架屏容器包装器
 */
export const getSkeletonContainer = (className = "") =>
  `skeleton-container ${className}`;
