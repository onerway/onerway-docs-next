<script setup lang="ts">
/**
 * ProseCodeCard
 * 可复用的“代码展示卡片”，适用于首页 showcase / 文档内容中的示例展示。
 *
 * 特点：
 * - 终端风格 header（title）+ copy 按钮
 * - MDC 对齐：默认 slot 可直接放 fenced code block（让 Nuxt Content/Prose 负责渲染与高亮）
 * - 支持 footer actions（可变数量 CTA）
 */

import type { ButtonProps } from "#ui/types";

// ============================================================================
// Types
// ============================================================================

export interface ProseCodeCardAction {
  label: string;
  to: string;
  icon?: string;
  trailingIcon?: string;
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export interface ProseCodeCardProps {
  /** header 左侧标题（更通用的文本，如命令/标题） */
  title?: string;

  /**
   * fallback 代码文本（当没有 slot 内容时，默认以 ProsePre 展示）
   * 同时也是 copy 的首选来源
   */
  code?: string;

  /** 代码语言（仅用于 ProsePre 的语义类名/属性） */
  language?: string;

  /** 固定高度（px）。不传则动态高度；传值则内容区滚动 */
  height?: number;

  /** 底部 CTA actions（MDC 友好：数量可变） */
  actions?: ProseCodeCardAction[];
}

// ============================================================================
// Props & Slots
// ============================================================================

const props = withDefaults(
  defineProps<ProseCodeCardProps>(),
  {
    title: undefined,
    code: undefined,
    language: "json",
    height: undefined,
    actions: () => [],
  }
);

const slots = defineSlots<{
  default?: () => VNode[];
  footer?: () => VNode[];
}>();

// ============================================================================
// Composables & Injections
// ============================================================================

const { t } = useI18n();
const { copy, copied } = useClipboard();

// ============================================================================
// Computed Properties
// ============================================================================

const isFixedHeight = computed(() => {
  return (
    typeof props.height === "number" && props.height > 0
  );
});

const canCopy = computed(() => {
  return !!props.code?.trim();
});

const hasFooter = computed(() => {
  return !!slots.footer || props.actions.length > 0;
});

// ============================================================================
// Methods
// ============================================================================

const handleCopy = () => {
  const text = props.code?.trim() || "";
  if (!text) return;
  copy(text, {
    successTitle: t("copied"),
  });
};

// ============================================================================
// Styles
// ============================================================================

const styles = computed(() => ({
  root: [
    "w-full rounded-lg overflow-hidden border border-default",
    isFixedHeight.value ? "flex flex-col" : undefined,
  ],
  header:
    "flex items-center justify-between px-4 py-3 border-b border-default",
  headerLeft: "flex items-center gap-3 min-w-0",
  windowControls: "flex gap-1.5 shrink-0",
  commandRow:
    "flex items-center gap-2 text-sm font-mono min-w-0",
  commandPrompt: "text-success",
  commandText: "truncate",
  content: [
    "overflow-auto bg-elevated",
    isFixedHeight.value ? "flex-1" : undefined,
  ],
  footer:
    "flex items-center justify-between px-4 py-3 border-t border-default",
}));
</script>

<template>
  <div
    :class="styles.root"
    :style="
      isFixedHeight ? { height: `${height}px` } : undefined
    ">
    <!-- Header -->
    <div :class="styles.header">
      <div :class="styles.headerLeft">
        <div :class="styles.windowControls">
          <div class="size-3 rounded-full bg-error" />
          <div class="size-3 rounded-full bg-warning" />
          <div class="size-3 rounded-full bg-success" />
        </div>

        <div :class="styles.commandRow">
          <span :class="styles.commandPrompt">$</span>
          <span :class="styles.commandText">
            {{ title }}
          </span>
        </div>
      </div>

      <UButton
        v-if="canCopy"
        :icon="
          copied
            ? 'i-heroicons-check'
            : 'i-heroicons-clipboard-document'
        "
        size="xs"
        :color="copied ? 'primary' : 'success'"
        variant="ghost"
        :title="t('apiCopy')"
        :aria-label="t('apiCopy')"
        @click="handleCopy" />
    </div>

    <!-- Content -->
    <div :class="styles.content">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else>
        <ProsePre
          :language="language"
          :code="code || ''"
          :ui="{
            root: 'my-0',
            base: 'border-none bg-inherit',
            copy: 'hidden',
          }">
          {{ code || "" }}
        </ProsePre>
      </template>
    </div>

    <!-- Footer -->
    <div
      v-if="hasFooter"
      :class="styles.footer">
      <slot name="footer">
        <UButton
          v-for="(action, index) in actions"
          :key="`${action.to}-${index}`"
          :to="action.to"
          :icon="action.icon"
          :trailing-icon="action.trailingIcon"
          :color="action.color || 'primary'"
          :variant="
            action.variant ||
            (index === 0 ? 'solid' : 'ghost')
          "
          :size="action.size || 'sm'">
          {{ action.label }}
        </UButton>
      </slot>
    </div>
  </div>
</template>
