<script setup lang="ts">
/**
 * ProseCodeCard
 * 可复用的“代码展示卡片”，适用于首页 showcase / 文档内容中的示例展示。
 *
 * 特点：
 * - 复用 Nuxt UI（UButton）实现复制与按钮样式
 * - 支持固定高度（用于 carousel slides 统一高度）
 * - 支持 `#code` slot 覆盖（例如未来接入 Nuxt Content 已高亮的代码 HTML）
 */

// ============================================================================
// Types
// ============================================================================

export interface ProseCodeCardFooter {
  tryItTo?: string;
  learnMoreTo?: string;
  tryItLabel?: string;
  learnMoreLabel?: string;
}

export interface ProseCodeCardProps {
  /** 终端命令行标题（展示在 header 左侧） */
  command?: string;

  /** 代码内容（默认以 ProsePre 展示） */
  code?: string;

  /** 代码语言（仅用于 ProsePre 的语义类名/属性） */
  language?: string;

  /** 点击复制时写入剪贴板的文本（默认等于 code） */
  copyText?: string;

  /** 复制按钮 hover/title 文案 */
  copyLabel?: string;

  /**
   * 是否显示左侧“三点”装饰
   * @defaultValue true
   */
  showWindowControls?: boolean;

  /**
   * 最小高度（用于保持布局稳定）
   * @defaultValue 380
   */
  minHeight?: number;

  /**
   * 是否固定卡片高度（用于多张卡片高度一致）
   * 开启后内容区会占满剩余空间并支持滚动
   * @defaultValue false
   */
  fixedHeight?: boolean;

  /** 底部 CTA */
  footer?: ProseCodeCardFooter;
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(
  defineProps<ProseCodeCardProps>(),
  {
    command: undefined,
    code: undefined,
    language: "json",
    copyText: undefined,
    copyLabel: undefined,
    showWindowControls: true,
    minHeight: 380,
    fixedHeight: false,
    footer: undefined,
  }
);

// ============================================================================
// Composables & Injections
// ============================================================================

const { t } = useI18n();
const { copy, copied } = useClipboard();

// ============================================================================
// Computed Properties
// ============================================================================

const resolvedCopyLabel = computed(
  () => props.copyLabel || t("apiCopy")
);

const resolvedCode = computed(() => props.code ?? "");

// ============================================================================
// Methods
// ============================================================================

const handleCopy = () => {
  const text = props.copyText ?? props.code ?? "";
  if (!text) return;
  copy(text, { successTitle: t("copied") });
};

// ============================================================================
// Styles
// ============================================================================

const styles = computed(() => ({
  root: [
    "w-full rounded-lg overflow-hidden border border-default",
    props.fixedHeight ? "flex flex-col" : undefined,
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
    props.fixedHeight ? "flex-1" : "max-h-80",
  ],
  footer:
    "flex items-center justify-between px-4 py-3 border-t border-default",
}));
</script>

<template>
  <div
    :class="styles.root"
    :style="
      fixedHeight
        ? { height: `${minHeight}px` }
        : { minHeight: `${minHeight}px` }
    ">
    <!-- Header -->
    <div :class="styles.header">
      <div :class="styles.headerLeft">
        <div
          v-if="showWindowControls"
          :class="styles.windowControls">
          <div class="size-3 rounded-full bg-error" />
          <div class="size-3 rounded-full bg-warning" />
          <div class="size-3 rounded-full bg-success" />
        </div>

        <div :class="styles.commandRow">
          <span :class="styles.commandPrompt">$</span>
          <span :class="styles.commandText">
            {{ command }}
          </span>
        </div>
      </div>

      <UButton
        :icon="
          copied
            ? 'i-heroicons-check'
            : 'i-heroicons-clipboard-document'
        "
        size="xs"
        :color="copied ? 'primary' : 'success'"
        variant="ghost"
        :title="resolvedCopyLabel"
        @click="handleCopy" />
    </div>

    <!-- Content -->
    <div :class="styles.content">
      <slot name="code">
        <ProsePre
          :language="language"
          :code="resolvedCode"
          :ui="{
            root: 'my-0',
            base: 'border-none bg-inherit',
            copy: 'hidden',
          }">
          {{ resolvedCode }}
        </ProsePre>
      </slot>
    </div>

    <!-- Footer -->
    <div
      v-if="footer?.tryItTo || footer?.learnMoreTo"
      :class="styles.footer">
      <UButton
        v-if="footer?.tryItTo"
        :to="footer.tryItTo"
        color="primary"
        size="sm"
        icon="i-heroicons-play">
        {{ footer.tryItLabel || t("apiTryIt") }}
      </UButton>

      <UButton
        v-if="footer?.learnMoreTo"
        :to="footer.learnMoreTo"
        color="primary"
        variant="ghost"
        size="sm"
        trailing-icon="i-heroicons-arrow-top-right-on-square">
        {{ footer.learnMoreLabel || t("apiLearnMore") }}
      </UButton>
    </div>
  </div>
</template>
