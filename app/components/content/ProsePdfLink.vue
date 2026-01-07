<script setup lang="ts">
/**
 * ProsePdfLink 组件
 * 支持点击链接后在模态框中预览 PDF 文档，同时提供下载功能
 *
 * 特点：
 * - 点击链接打开全屏模态框预览 PDF
 * - 使用 iframe 嵌入 PDF（浏览器原生支持，无需额外依赖）
 * - 提供下载按钮
 * - 支持自定义链接文本（通过默认插槽）
 * - 支持 MDC 内联语法，可在表格等场景中使用
 * - PDF 路径验证（仅允许 .pdf 文件和白名单域名）
 * - 加载超时检测（10 秒超时保护）
 * - 支持 URL 编码和查询参数的文件名
 *
 * 安全性：
 * - 相对路径：直接允许（如 /assets/files/example.pdf）
 * - 绝对路径：仅允许白名单域名（docs.onerway.com, cdn.onerway.com）
 * - 开发环境会在控制台输出验证警告
 *
 * @example MDC 用法
 * ```markdown
 * # 基本用法（使用默认的 "Preview" 文字）
 * :prose-pdf-link{href="/assets/files/example.pdf"}
 *
 * # 自定义按钮文字
 * :prose-pdf-link{href="/assets/files/example.pdf"}[View Guide]
 *
 * # 自定义模态框标题
 * :prose-pdf-link{href="/assets/files/example.pdf" title="Integration Guide"}
 *
 * # 在表格中使用
 * | Platform | Documentation |
 * |----------|---------------|
 * | Shopify | :prose-pdf-link{href="/assets/files/shopify.pdf"}[Preview] |
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export interface ProsePdfLinkProps {
  /** PDF 文件路径 */
  href: string;
  /** 模态框标题（默认从文件名提取） */
  title?: string;
}

// ============================================================================
// Props & Slots
// ============================================================================

const props = withDefaults(
  defineProps<ProsePdfLinkProps>(),
  {
    title: undefined,
  }
);

defineSlots<{
  /** 链接文本 */
  default?: () => VNode[];
}>();

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n();

// ============================================================================
// Constants
// ============================================================================

/**
 * PDF 路径白名单域名
 * 只允许来自这些域名的绝对路径 PDF
 */
const ALLOWED_DOMAINS = [
  "docs.onerway.com",
  "cdn.onerway.com",
];

/**
 * 加载超时时间（毫秒）
 */
const LOAD_TIMEOUT = 10000; // 10 秒

// ============================================================================
// State
// ============================================================================

const isOpen = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const loadTimeout = ref<ReturnType<typeof setTimeout>>();

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * 验证 PDF 路径是否有效且安全
 */
const isValidPdfPath = computed(() => {
  const href = props.href.toLowerCase().trim();

  // 必须以 .pdf 结尾
  if (!href.endsWith(".pdf")) {
    if (import.meta.dev) {
      console.warn(
        `[ProsePdfLink] Invalid PDF path: "${props.href}" (must end with .pdf)`
      );
    }
    return false;
  }

  // 相对路径直接允许
  if (
    !href.startsWith("http://") &&
    !href.startsWith("https://")
  ) {
    return true;
  }

  // 绝对路径需要验证域名
  try {
    const url = new URL(props.href);
    const isAllowed = ALLOWED_DOMAINS.some(
      (domain) =>
        url.hostname === domain ||
        url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed && import.meta.dev) {
      console.warn(
        `[ProsePdfLink] Blocked external PDF URL: "${props.href}"`,
        `\nAllowed domains: ${ALLOWED_DOMAINS.join(", ")}`
      );
    }

    return isAllowed;
  } catch {
    if (import.meta.dev) {
      console.warn(
        `[ProsePdfLink] Invalid URL format: "${props.href}"`
      );
    }
    return false;
  }
});

/**
 * 从 href 中提取文件名作为默认标题
 * 支持 URL 编码和查询参数
 */
const displayTitle = computed(() => {
  if (props.title) return props.title;

  try {
    // 尝试使用 URL API 解析（支持绝对和相对路径）
    const url = new URL(props.href, window.location.origin);
    const pathname = url.pathname;
    const filename = decodeURIComponent(
      pathname.split("/").pop() || "PDF"
    );
    return filename.replace(/\.pdf$/i, "");
  } catch {
    // 降级到简单的字符串处理
    const filename =
      props.href
        .split("/")
        .pop()
        ?.replace(/\.pdf$/i, "") || "PDF";
    try {
      return decodeURIComponent(filename);
    } catch {
      return filename;
    }
  }
});

/**
 * 下载文件名
 * 支持 URL 编码和查询参数
 */
const downloadFilename = computed(() => {
  try {
    const url = new URL(props.href, window.location.origin);
    const pathname = url.pathname;
    const filename = decodeURIComponent(
      pathname.split("/").pop() || "document.pdf"
    );
    return filename;
  } catch {
    const filename =
      props.href.split("/").pop() || "document.pdf";
    try {
      return decodeURIComponent(filename);
    } catch {
      return filename;
    }
  }
});

// ============================================================================
// Methods
// ============================================================================

/**
 * 清理加载超时定时器
 */
const clearLoadTimeout = () => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value);
    loadTimeout.value = undefined;
  }
};

/**
 * 打开 PDF 预览模态框
 */
const handleOpen = () => {
  // 路径验证失败，不打开模态框
  if (!isValidPdfPath.value) {
    if (import.meta.dev) {
      console.error(
        "[ProsePdfLink] Cannot open invalid PDF path:",
        props.href
      );
    }
    return;
  }

  isOpen.value = true;
  isLoading.value = true;
  hasError.value = false;

  // 清除之前的定时器（如果存在）
  clearLoadTimeout();

  // 设置加载超时检测
  loadTimeout.value = setTimeout(() => {
    if (isLoading.value) {
      if (import.meta.dev) {
        console.warn(
          `[ProsePdfLink] PDF load timeout after ${LOAD_TIMEOUT}ms:`,
          props.href
        );
      }
      hasError.value = true;
      isLoading.value = false;
    }
  }, LOAD_TIMEOUT);
};

/**
 * 关闭模态框
 */
const handleClose = () => {
  isOpen.value = false;
  clearLoadTimeout();
};

/**
 * iframe 加载成功
 */
const handleIframeLoad = () => {
  clearLoadTimeout();
  isLoading.value = false;
};

/**
 * iframe 加载失败
 */
const handleIframeError = () => {
  clearLoadTimeout();
  isLoading.value = false;
  hasError.value = true;
};

// ============================================================================
// Lifecycle
// ============================================================================

/**
 * 组件卸载时清理定时器
 */
onUnmounted(() => {
  clearLoadTimeout();
});

// ============================================================================
// Styles
// ============================================================================

const linkClass = computed(() => [
  "inline-flex items-center gap-1",
  "font-medium",
  "transition duration-200",
  isValidPdfPath.value
    ? [
        "text-primary cursor-pointer",
        "hover:text-default",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:rounded-sm",
      ]
    : ["text-muted cursor-not-allowed opacity-60"],
]);

const iconClass = computed(() => [
  "size-3.5",
  "transition-transform duration-200",
  "group-hover/pdf-link:scale-120",
]);
</script>

<template>
  <!-- Trigger Link -->
  <span
    role="button"
    :tabindex="isValidPdfPath ? 0 : -1"
    :class="['group/pdf-link', linkClass]"
    :aria-label="
      t('pdfPreview.open', { title: displayTitle })
    "
    :aria-disabled="!isValidPdfPath"
    @click="handleOpen"
    @keydown.enter="handleOpen"
    @keydown.space.prevent="handleOpen">
    <slot>{{ t("pdfPreview.preview") }}</slot>
    <UIcon
      name="i-lucide-eye"
      :class="iconClass" />
  </span>

  <!-- Preview Modal -->
  <UModal
    v-model:open="isOpen"
    fullscreen
    :title="displayTitle"
    :description="t('pdfPreview.modalDescription')"
    :ui="{
      content: 'flex flex-col',
      body: 'flex-1 p-0 overflow-hidden',
      footer: 'border-t border-default',
      description: 'sr-only',
    }">
    <!-- Empty trigger slot since we control open state manually -->
    <template #default />

    <!-- Modal Body -->
    <template #body>
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-elevated">
        <div class="flex flex-col items-center gap-4">
          <UIcon
            name="i-lucide-loader-2"
            class="size-8 animate-spin text-muted" />
          <span class="text-muted text-sm">
            {{ t("pdfPreview.loading") }}
          </span>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="hasError"
        class="absolute inset-0 flex items-center justify-center bg-elevated">
        <div
          class="flex flex-col items-center gap-4 text-center px-4">
          <UIcon
            name="i-lucide-file-warning"
            class="size-12 text-error" />
          <div>
            <p class="text-highlighted font-medium">
              {{ t("pdfPreview.errorTitle") }}
            </p>
            <p class="text-muted text-sm mt-1">
              {{ t("pdfPreview.errorDescription") }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              :href="props.href"
              :download="downloadFilename"
              external
              color="neutral"
              variant="outline"
              :leading-icon="'i-lucide-download'">
              {{ t("pdfPreview.download") }}
            </UButton>
            <UButton
              :href="props.href"
              target="_blank"
              external
              color="primary"
              variant="solid"
              :trailing-icon="'i-lucide-external-link'">
              {{ t("pdfPreview.openInNewTab") }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- PDF iframe -->
      <iframe
        v-show="!hasError"
        :src="props.href"
        :title="displayTitle"
        class="w-full h-full border-0"
        @load="handleIframeLoad"
        @error="handleIframeError" />
    </template>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div
          class="text-sm text-muted truncate max-w-[50%]">
          {{ downloadFilename }}
        </div>
        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="handleClose">
            {{ t("pdfPreview.close") }}
          </UButton>
          <UButton
            :href="props.href"
            :download="downloadFilename"
            external
            color="primary"
            variant="solid"
            :leading-icon="'i-lucide-download'">
            {{ t("pdfPreview.download") }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
