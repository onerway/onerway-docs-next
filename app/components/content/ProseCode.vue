<script lang="ts">
/**
 * ProseCode 组件 - 增强版内联代码
 *
 * 覆盖 @nuxtjs/mdc 的默认 ProseCode 组件，提供额外功能：
 * - 图标显示：根据语言自动显示图标
 * - 复制功能：悬停显示复制按钮
 * - 链接功能：可点击跳转
 * - 徽章模式：更紧凑的样式
 * - Tooltip：悬停提示
 *
 * @example 基础用法
 * ```markdown
 * `npm install`
 * `deprecated`{color="warning"}
 * ```
 *
 * @example 图标显示
 * ```markdown
 * `config`{icon="i-lucide-settings"}
 * `star`{icon="i-lucide-star"}
 * ```
 *
 * @example 复制功能（点击代码或复制图标都可以复制）
 * ```markdown
 * `sk_live_xxxxx`{copy color="error"}
 * `API_KEY=xxxxx`{copy}
 * ```
 *
 * @example 徽章模式
 * ```markdown
 * `v4.2.1`{badge color="success"}
 * ```
 *
 * @example 链接功能
 * ```markdown
 * `useAsyncData`{to="/docs/api#use-async-data" color="primary"}
 * ```
 *
 * @example 格式化显示（复制时使用原始值）
 * ```markdown
 * `1234567890123456`{format="card" copy}
 * `13812345678`{format="phone" copy}
 * `GB82WEST12345698765432`{format="iban" copy}
 * ```
 */

export interface ProseCodeProps {
  /**
   * 颜色变体
   * @defaultValue 'neutral'
   */
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral";

  /** 自定义 class */
  class?: string;

  // === 新增功能属性 ===

  /**
   * 显示图标
   * - string: 图标名称（如 "i-lucide-star"）
   */
  icon?: string;

  /**
   * 启用复制功能
   * @defaultValue false
   */
  copy?: boolean;

  /**
   * 点击跳转链接（内部或外部）
   */
  to?: string;

  /**
   * 徽章模式（更紧凑的样式）
   * @defaultValue false
   */
  badge?: boolean;

  /**
   * 鼠标悬停提示文本
   */
  tooltip?: string;

  /**
   * 格式化显示内容
   * - card: 银行卡号（每4位加空格）
   * - phone: 手机号（3-4-4格式）
   * - iban: IBAN账号（每4位加空格）
   */
  format?: "card" | "phone" | "iban";
}

export interface ProseCodeSlots {
  default?(props?: Record<string, never>): unknown;
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<ProseCodeProps>(), {
  color: "neutral",
  class: undefined,
  icon: undefined,
  copy: undefined,
  badge: undefined,
  to: undefined,
  tooltip: undefined,
  format: undefined,
});

defineSlots<ProseCodeSlots>();

// ============================================================================
// Composables
// ============================================================================

const slots = useSlots();

// 客户端专用 composables
const { copy: copyToClipboard, copied } = useClipboard();

// ============================================================================
// 内容提取和格式化
// ============================================================================

// 原始代码文本（用于复制）
const codeText = computed(() => {
  const vnodes = slots.default?.();
  if (!vnodes) return "";

  return vnodes
    .map((vnode) => {
      if (typeof vnode.children === "string")
        return vnode.children;
      if (Array.isArray(vnode.children)) {
        return vnode.children
          .map((child: unknown) => {
            if (typeof child === "string") return child;
            if (
              child &&
              typeof child === "object" &&
              "children" in child
            ) {
              const childObj = child as {
                children?: unknown;
              };
              if (typeof childObj.children === "string")
                return childObj.children;
            }
            return "";
          })
          .join("");
      }
      return "";
    })
    .join("")
    .trim();
});

// 格式化器定义（集中管理，易于扩展）
const formatters: Record<
  NonNullable<ProseCodeProps["format"]>,
  (text: string) => string
> = {
  /**
   * 银行卡号格式化：每4位加空格
   * 示例：1234567890123456 → 1234 5678 9012 3456
   */
  card: (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  },

  /**
   * 手机号格式化：3-4-4格式
   * 示例：13812345678 → 138 1234 5678
   */
  phone: (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
    }
    return text;
  },

  /**
   * IBAN账号格式化：每4位加空格
   * 示例：GB82WEST12345698765432 → GB82 WEST 1234 5698 7654 32
   */
  iban: (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    return cleaned.replace(/(.{4})(?=.)/g, "$1 ");
  },
};

// 显示文本（应用格式化）
const displayText = computed(() => {
  if (!props.format) {
    return codeText.value;
  }

  const formatter = formatters[props.format];
  if (!formatter) {
    return codeText.value;
  }

  return formatter(codeText.value);
});

const handleCopy = (e?: Event) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!codeText.value) return;

  copyToClipboard(codeText.value);
};

// ============================================================================
// 链接逻辑
// ============================================================================

const WrapperComponent = computed(() => {
  return props.to ? resolveComponent("NuxtLink") : "span";
});

const wrapperProps = computed(() => {
  if (!props.to) return {};
  return {
    to: props.to,
    class: "no-underline",
  };
});

// ============================================================================
// 样式计算
// ============================================================================

const rootClasses = computed(() => {
  const classes = [
    "group/code",
    "inline-flex",
    "items-center",
    "gap-1",
    "align-middle",
  ];

  if (props.to) {
    classes.push(
      "cursor-pointer",
      "hover:opacity-80",
      "transition-opacity"
    );
  }

  // 处理用户自定义 class
  if (props.class) {
    const customClasses = (props.class || "")
      .split(",")
      .join(" ");
    if (customClasses) classes.push(customClasses);
  }

  return classes;
});

const codeClasses = computed(() => {
  const classes = [
    "px-1.5",
    "py-0.5",
    "text-sm",
    "font-mono",
    "font-medium",
    "rounded-md",
    "inline-block",
  ];

  // 徽章模式
  if (props.badge) {
    classes.splice(0, classes.length); // 清空
    classes.push(
      "px-2",
      "py-0.5",
      "rounded-full",
      "text-xs",
      "font-semibold",
      "tracking-tight"
    );
  }

  // 可复制模式：添加点击样式
  if (props.copy) {
    classes.push(
      "cursor-pointer",
      "transition-all",
      "duration-200",
      "hover:brightness-95",
      "active:scale-[0.98]"
    );
  }

  // 颜色变体
  switch (props.color) {
    case "primary":
      classes.push(
        "border",
        "border-primary/25",
        "bg-primary/10",
        "text-primary"
      );
      break;
    case "secondary":
      classes.push(
        "border",
        "border-secondary/25",
        "bg-secondary/10",
        "text-secondary"
      );
      break;
    case "success":
      classes.push(
        "border",
        "border-success/25",
        "bg-success/10",
        "text-success"
      );
      break;
    case "info":
      classes.push(
        "border",
        "border-info/25",
        "bg-info/10",
        "text-info"
      );
      break;
    case "warning":
      classes.push(
        "border",
        "border-warning/25",
        "bg-warning/10",
        "text-warning"
      );
      break;
    case "error":
      classes.push(
        "border",
        "border-error/25",
        "bg-error/10",
        "text-error"
      );
      break;
    case "neutral":
    default:
      classes.push(
        "border",
        "border-muted",
        "text-highlighted",
        "bg-muted"
      );
      break;
  }

  return classes;
});

const iconClasses = ["size-3", "shrink-0", "opacity-70"];

const copyClasses = computed(() => [
  "size-3",
  "shrink-0",
  "cursor-pointer",
  "opacity-0",
  "group-hover/code:opacity-100",
  "transition-all",
  "duration-200",
  copied.value ? "text-success" : "hover:text-primary",
]);
</script>

<template>
  <UTooltip
    v-if="tooltip"
    :text="tooltip">
    <component
      :is="WrapperComponent"
      v-bind="wrapperProps"
      :class="rootClasses">
      <!-- 图标 -->
      <UIcon
        v-if="icon"
        :name="icon"
        :class="iconClasses" />

      <!-- Code 元素 -->
      <code
        :class="codeClasses"
        :title="copy && !to ? (copied ? $t('copied') : $t('apiCopy')) : undefined"
        @click="copy && !to ? handleCopy() : undefined">
        <template v-if="format">{{ displayText }}</template>
        <slot v-else />
      </code>

      <!-- 复制按钮 -->
      <UIcon
        v-if="copy"
        :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        :class="copyClasses"
        :title="copied ? $t('copied') : $t('apiCopy')"
        :aria-label="copied ? $t('copied') : $t('apiCopy')"
        @click="handleCopy" />
    </component>
  </UTooltip>

  <component
    :is="WrapperComponent"
    v-else
    v-bind="wrapperProps"
    :class="rootClasses">
    <!-- 图标 -->
    <UIcon
      v-if="icon"
      :name="icon"
      :class="iconClasses" />

    <!-- Code 元素 -->
    <code
      :class="codeClasses"
      :title="copy && !to ? (copied ? $t('copied') : $t('apiCopy')) : undefined"
      @click="copy && !to ? handleCopy() : undefined">
      <template v-if="format">{{ displayText }}</template>
      <slot v-else />
    </code>

    <!-- 复制按钮 -->
    <UIcon
      v-if="copy"
      :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      :class="copyClasses"
      :title="copied ? $t('copied') : $t('apiCopy')"
      :aria-label="copied ? $t('copied') : $t('apiCopy')"
      @click="handleCopy" />
  </component>
</template>
