<script setup lang="ts">
/**
 * ProsePre 组件 - 代码块包装器
 *
 * 覆盖 @nuxt/ui 的默认 ProsePre 组件，保留完整功能并增加 Mermaid 支持：
 * - 检测 `language="mermaid"` 时路由到 ProseMermaid 组件
 * - 其他语言保持 Nuxt UI 原有渲染（复制按钮、文件名、行高亮等）
 *
 * @see https://ui.nuxt.com/docs/typography/code
 */

import { tv } from "tailwind-variants";

// ============================================================================
// Types
// ============================================================================

export interface ProsePreProps {
  /** 自定义图标 */
  icon?: string | Record<string, unknown>;
  /** 代码内容 */
  code?: string;
  /** 代码语言标识 */
  language?: string;
  /** 文件名 */
  filename?: string;
  /** 高亮行号 */
  highlights?: number[];
  /** 隐藏头部 */
  hideHeader?: boolean;
  /** 元信息 */
  meta?: string;
  /** CSS 类名 */
  class?: string;
  /** UI 样式覆盖 */
  ui?: {
    root?: string;
    header?: string;
    filename?: string;
    icon?: string;
    copy?: string;
    base?: string;
  };
}

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(defineProps<ProsePreProps>(), {
  icon: undefined,
  code: undefined,
  language: undefined,
  filename: undefined,
  highlights: () => [],
  hideHeader: false,
  meta: undefined,
  class: undefined,
  ui: undefined,
});

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n();
const { copy, copied } = useClipboard();
const appConfig = useAppConfig();

// ============================================================================
// Computed
// ============================================================================

const isMermaid = computed(
  () => props.language === "mermaid"
);

/**
 * Nuxt UI 默认主题配置
 * @see node_modules/@nuxt/ui/.nuxt/ui/prose/pre.ts
 */
const theme = tv({
  slots: {
    root: "relative my-5 group",
    header:
      "flex items-center gap-1.5 border border-muted bg-default border-b-0 relative rounded-t-md px-4 py-3",
    filename: "text-default text-sm/6",
    icon: "size-4 shrink-0",
    copy: "absolute top-[11px] right-[11px] lg:opacity-0 lg:group-hover:opacity-100 transition",
    base: "group font-mono text-sm/6 border border-muted bg-muted rounded-md px-4 py-3 whitespace-pre-wrap break-words overflow-x-auto focus:outline-none",
  },
  variants: {
    filename: {
      true: {
        root: "[&>pre]:rounded-t-none [&>pre]:my-0 my-5",
      },
    },
  },
});

const ui = computed(() =>
  theme({ filename: !!props.filename })
);

/**
 * 获取文件类型图标
 */
const fileIcon = computed(() => {
  if (props.icon) return props.icon;
  if (!props.filename) return undefined;

  const cleanFilename = props.filename.replace(
    /\s*\(.*\)\s*$/,
    ""
  );
  const extension =
    cleanFilename.includes(".") &&
    cleanFilename.split(".").pop();
  const name = cleanFilename.split("/").pop();

  // 从 appConfig 获取自定义图标映射
  const uiConfig = appConfig.ui;
  const icons: Record<string, string> =
    uiConfig?.prose?.codeIcon || {};

  return (
    (name && icons[name.toLowerCase()]) ??
    (extension &&
      (icons[extension] ??
        `i-vscode-icons-file-type-${extension}`))
  );
});

/**
 * 复制图标
 */
const copyIcon = computed(() => {
  const uiConfig = appConfig.ui;
  const icons: Record<string, string> =
    uiConfig?.icons || {};
  return copied.value
    ? (icons.copyCheck ?? "i-lucide-copy-check")
    : (icons.copy ?? "i-lucide-copy");
});

// ============================================================================
// Methods
// ============================================================================

const handleCopy = () => {
  copy(props.code || "");
};
</script>

<template>
  <!-- Mermaid 图表 -->
  <ProseMermaid
    v-if="isMermaid"
    :code="code || ''"
    :meta="meta" />

  <!-- 普通代码块 - 保持 Nuxt UI 完整功能 -->
  <div
    v-else
    :class="ui.root({ class: props.ui?.root })">
    <!-- 文件名头部 -->
    <div
      v-if="filename && !hideHeader"
      :class="ui.header({ class: props.ui?.header })">
      <UIcon
        v-if="fileIcon"
        :name="fileIcon as string"
        :class="ui.icon({ class: props.ui?.icon })" />
      <span
        :class="ui.filename({ class: props.ui?.filename })">
        {{ filename }}
      </span>
    </div>

    <!-- 复制按钮 -->
    <UButton
      :icon="copyIcon"
      color="neutral"
      variant="outline"
      size="sm"
      :aria-label="t('apiCopy')"
      :class="ui.copy({ class: props.ui?.copy })"
      tabindex="-1"
      @click="handleCopy" />

    <!-- 代码内容 -->
    <pre
      :class="
        ui.base({ class: [props.ui?.base, props.class] })
      "><slot /></pre>
  </div>
</template>

<style>
/* Shiki 高亮行样式 - 与 Nuxt UI 保持一致 */
.shiki span.line {
  display: block;
}
.shiki span.line.highlight {
  margin: 0 -16px;
  padding: 0 16px;
  @apply bg-(--ui-bg-accented)/50;
}
</style>
