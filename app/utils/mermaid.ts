/**
 * Mermaid 图表主题配置
 *
 * 基于素雅的中性灰色调的 Mermaid 主题定制
 * 支持浅色/深色模式自动切换
 *
 * 设计原则：
 * - 只设置核心变量，让 Mermaid 自动计算派生色
 * - 使用 themeCSS 进行更细粒度的样式控制
 * - 颜色使用 hex 格式（Mermaid 不支持颜色名称）
 *
 * @see https://mermaid.js.org/config/theming.html
 * @see https://github.com/mermaidjs/mermaid.cli/pull/24 (themeCSS 灵感来源)
 */

import type { MermaidConfig } from "mermaid";

// ============================================================================
// Theme Variables（主题变量）
// ============================================================================

/**
 * 浅色主题变量
 *
 * 核心变量说明：
 * - primaryColor: 节点背景色，其他颜色从此派生
 * - noteBkgColor: 注释背景，使用 amber 突出显示
 * - noteTextColor: 注释文本
 */
const LIGHT_THEME_VARIABLES = {
  background: "transparent",
  primaryColor: "#F8F9FA",
  primaryTextColor: "#212529",
  primaryBorderColor: "#6C757D",
  secondaryColor: "#E9ECEF",
  secondaryTextColor: "#495057",
  secondaryBorderColor: "#ADB5BD",
  tertiaryColor: "#DEE2E6",
  tertiaryTextColor: "#343A40",
  tertiaryBorderColor: "#868E96",
  lineColor: "#6C757D",
  textColor: "#212529",
  mainBkg: "#F8F9FA",
  secondBkg: "#E9ECEF",
  border1: "#6C757D",
  border2: "#ADB5BD",
  noteBkgColor: "#FFF4E0",
  noteTextColor: "#856404",
  noteBorderColor: "#FFC107",
  actorBorder: "#6C757D",
  actorBkg: "#F8F9FA",
  actorTextColor: "#212529",
  actorLineColor: "#6C757D",
  signalColor: "#495057",
  signalTextColor: "#212529",
  labelBoxBkgColor: "#E9ECEF",
  labelBoxBorderColor: "#ADB5BD",
  labelTextColor: "#495057",
  classText: "#212529",
  errorBkgColor: "#F8D7DA",
  errorTextColor: "#721C24",
};

/**
 * 深色主题变量
 */
const DARK_THEME_VARIABLES = {
  background: "transparent",
  primaryColor: "#1E40AF",
  primaryTextColor: "#E0F2FE",
  primaryBorderColor: "#3B82F6",
  secondaryColor: "#581C87",
  secondaryTextColor: "#F3E8FF",
  secondaryBorderColor: "#A855F7",
  tertiaryColor: "#0E7490",
  tertiaryTextColor: "#CFFAFE",
  tertiaryBorderColor: "#06B6D4",
  lineColor: "#60A5FA",
  textColor: "#E2E8F0",
  mainBkg: "#1E293B",
  secondBkg: "#334155",
  border1: "#3B82F6",
  border2: "#A855F7",
  noteBkgColor: "#1E3A8A",
  noteTextColor: "#DBEAFE",
  noteBorderColor: "#3B82F6",
  actorBorder: "#3B82F6",
  actorBkg: "#1E293B",
  actorTextColor: "#E0F2FE",
  actorLineColor: "#60A5FA",
  signalColor: "#818CF8",
  signalTextColor: "#E2E8F0",
  labelBoxBkgColor: "#334155",
  labelBoxBorderColor: "#60A5FA",
  labelTextColor: "#F1F5F9",
  classText: "#E2E8F0",
  errorBkgColor: "#7F1D1D",
  errorTextColor: "#FEE2E2",
};

// ============================================================================
// Theme CSS（自定义样式）
// ============================================================================

/**
 * 通用自定义 CSS（明暗主题共用）
 *
 * themeCSS 允许注入自定义 CSS 到 SVG 中，用于：
 * - 覆盖 themeVariables 无法控制的样式
 * - 添加动画和过渡效果
 * - 自定义特定图表类型的样式
 */
const BASE_THEME_CSS = `
  /* 序列图 */
  .actor {
    stroke-width: 1.5px;
    rx: 12px;
    ry: 12px;
  }

  .messageLine0,
  .messageLine1 {
    stroke-width: 1.5px;
  }
`;

// 明暗主题当前使用相同 CSS，未来如需差异化可在此扩展
const LIGHT_THEME_CSS = BASE_THEME_CSS;
const DARK_THEME_CSS = BASE_THEME_CSS;

// ============================================================================
// 主配置函数
// ============================================================================

/**
 * 获取 Mermaid 配置
 *
 * @param isDark - 是否为深色模式
 *
 * @example
 * ```typescript
 * const colorMode = useColorMode();
 * const config = getMermaidConfig(colorMode.value === 'dark');
 * ```
 */
export const getMermaidConfig = (
  isDark: boolean
): MermaidConfig => ({
  darkMode: isDark,
  startOnLoad: false,
  theme: "base",
  fontFamily:
    "apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  wrap: true,
  fontSize: 14,
  securityLevel: "strict",
  logLevel: "error",
  markdownAutoWrap: true,
  themeVariables: isDark
    ? DARK_THEME_VARIABLES
    : LIGHT_THEME_VARIABLES,
  themeCSS: isDark ? DARK_THEME_CSS : LIGHT_THEME_CSS,

  // 时序图
  sequence: {
    diagramMarginX: 10,
    diagramMarginY: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 10,
    mirrorActors: true,
    messageFontWeight: 500,
    actorFontWeight: 600,
    wrap: true,
  },
  // 流程图配置 - 柔和曲线风格
  flowchart: {
    curve: "natural", // 平滑曲线
    padding: 20,
    nodeSpacing: 40,
    rankSpacing: 50,
    defaultRenderer: "elk",
  },
});

// ============================================================================
// 导出单独配置（用于高级自定义场景）
// ============================================================================

export {
  LIGHT_THEME_VARIABLES,
  DARK_THEME_VARIABLES,
  BASE_THEME_CSS,
  LIGHT_THEME_CSS,
  DARK_THEME_CSS,
};
