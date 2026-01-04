<script setup lang="ts">
/**
 * ProseMermaid 组件 - Mermaid 图表渲染
 *
 * 将 Markdown 中的 mermaid 代码块渲染为可交互的 SVG 图表。
 *
 * 功能特性：
 * - 文字可选：默认可以选中图表中的文字
 * - 智能光标：按下 Alt 显示 grab，拖拽时显示 grabbing
 * - 拖拽平移：Alt + 拖拽移动图表
 * - 滚轮缩放：Alt + 滚轮缩放图表
 * - 全屏预览：点击全屏按钮在弹窗中查看大图
 * - 主题适配：自动适配明暗主题
 * - 点状背景：默认显示，可禁用
 *
 * @example
 * ```markdown
 * <!-- 默认支持缩放和全屏 -->
 * ```mermaid
 * graph TD
 *     A[开始] --> B[结束]
 * ```
 *
 * <!-- 禁用缩放（同时禁用全屏） -->
 * ```mermaid zoomable="false"
 * graph TD
 *     A[开始] --> B[结束]
 * ```
 *
 * <!-- 禁用点状背景 -->
 * ```mermaid dottedBg="false"
 * graph TD
 *     A[开始] --> B[结束]
 * ```
 * ```
 */

import type { PanZoom } from "panzoom";
import type { Ref } from "vue";

// ============================================================================
// Props
// ============================================================================

const props = defineProps<{
  /** Mermaid 图表源代码 */
  code: string;
  /**
   * 代码块元信息（Markdown 代码块语言后的附加文本）
   * - `zoomable="false"`: 禁用拖拽缩放（默认启用）
   * - `dottedBg="false"`: 禁用点状背景（默认启用）
   */
  meta?: string;
}>();

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n();
const colorMode = useColorMode();

// ============================================================================
// State
// ============================================================================

const svgContent = ref<string>("");
const error = ref<string>();
const isLoading = ref(true);
const diagramRef = ref<HTMLElement | null>(null);
const panzoomInstance = ref<PanZoom | null>(null);
const isModalOpen = ref(false);
const modalDiagramRef = ref<HTMLElement | null>(null);
const modalPanzoomInstance = ref<PanZoom | null>(null);

// 光标状态
const isAltPressed = ref(false);
const isDragging = ref(false);
const isHovering = ref(false); // 追踪鼠标是否在图表上

// ============================================================================
// Helpers
// ============================================================================

/** 从 meta 字符串解析布尔值（默认 true，仅 "false" 时返回 false） */
const parseMetaBoolean = (key: string) => {
  if (!props.meta) return true;
  const match = props.meta.match(
    new RegExp(`${key}\\s*=\\s*"?(\\w+)"?`)
  );
  return match?.[1] !== "false";
};

// ============================================================================
// Computed
// ============================================================================

const hasDottedBg = computed(() =>
  parseMetaBoolean("dottedBg")
);
const isZoomable = computed(() =>
  parseMetaBoolean("zoomable")
);

const mermaidConfig = computed(() =>
  getMermaidConfig(colorMode.value === "dark")
);

/** 图表容器的光标样式（仅在鼠标悬停时生效） */
const cursorClass = computed(() => {
  if (!isZoomable.value || !isHovering.value) return "";
  if (isDragging.value) return "cursor-grabbing";
  if (isAltPressed.value) return "cursor-grab";
  return "";
});

// ============================================================================
// Panzoom 控制
// ============================================================================

/** panzoom 配置：需要按住 Alt 键才能拖拽和滚轮缩放 */
const panzoomOptions = {
  maxZoom: 4,
  minZoom: 0.25,
  smoothScroll: false,
  zoomDoubleClickSpeed: 1, // 禁用双击缩放
  beforeWheel: (e: WheelEvent) => {
    // 只有按住 Alt 键才允许滚轮缩放
    return !e.altKey;
  },
  beforeMouseDown: (e: MouseEvent) => {
    // 只有按住 Alt 键才允许拖拽（返回 false 表示阻止拖拽）
    return !e.altKey;
  },
};

/** 初始化 panzoom */
const initPanzoom = async (
  container: HTMLElement | null,
  instanceRef: Ref<PanZoom | null>
) => {
  // 清理旧实例
  if (instanceRef.value) {
    instanceRef.value.dispose();
    instanceRef.value = null;
  }

  if (!container) {
    return;
  }

  const svg = container.querySelector("svg");
  if (!svg) {
    return;
  }

  // 动态导入 panzoom
  const panzoom = (await import("panzoom")).default;
  const instance = panzoom(svg, panzoomOptions);

  // 监听拖拽事件以更新光标状态
  instance.on("panstart", () => {
    isDragging.value = true;
  });
  instance.on("panend", () => {
    isDragging.value = false;
  });

  instanceRef.value = instance;
};

/** 销毁所有 panzoom 实例 */
const destroyPanzoom = () => {
  if (panzoomInstance.value) {
    panzoomInstance.value.dispose();
    panzoomInstance.value = null;
  }
  if (modalPanzoomInstance.value) {
    modalPanzoomInstance.value.dispose();
    modalPanzoomInstance.value = null;
  }
};

/** 获取容器中心点 */
const getContainerCenter = (
  container: HTMLElement | null
) => {
  if (!container) return { x: 0, y: 0 };
  const rect = container.getBoundingClientRect();
  return { x: rect.width / 2, y: rect.height / 2 };
};

/** 创建缩放控制方法 */
const createZoomControls = (
  elementRef: Ref<HTMLElement | null>,
  instanceRef: Ref<PanZoom | null>
) => ({
  zoomIn: () => {
    if (!instanceRef.value) return;
    const center = getContainerCenter(elementRef.value);
    instanceRef.value.smoothZoom(center.x, center.y, 1.5);
  },
  zoomOut: () => {
    if (!instanceRef.value) return;
    const center = getContainerCenter(elementRef.value);
    instanceRef.value.smoothZoom(center.x, center.y, 0.67);
  },
  reset: () => {
    if (!instanceRef.value) return;
    instanceRef.value.moveTo(0, 0);
    instanceRef.value.zoomAbs(0, 0, 1);
  },
});

// 缩放控制实例
const diagramControls = createZoomControls(
  diagramRef,
  panzoomInstance
);
const modalControls = createZoomControls(
  modalDiagramRef,
  modalPanzoomInstance
);

/** 打开全屏弹窗 */
const handleOpenModal = () => {
  isModalOpen.value = true;
};

/** 弹窗打开后初始化 panzoom */
const handleModalOpen = async () => {
  await nextTick();
  await initPanzoom(
    modalDiagramRef.value,
    modalPanzoomInstance
  );
};

/** 弹窗关闭时清理 */
const handleModalClose = () => {
  if (modalPanzoomInstance.value) {
    modalPanzoomInstance.value.dispose();
    modalPanzoomInstance.value = null;
  }
};

// ============================================================================
// 渲染逻辑
// ============================================================================

const renderDiagram = async () => {
  if (!import.meta.client) return;

  try {
    isLoading.value = true;
    error.value = undefined;
    destroyPanzoom();

    const mermaid = (await import("mermaid")).default;
    mermaid.initialize(mermaidConfig.value);

    const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
    const { svg } = await mermaid.render(id, props.code);
    svgContent.value = svg;
  } catch (e) {
    if (import.meta.dev) {
      console.error("[ProseMermaid] Rendering error:", e);
    }
    error.value =
      e instanceof Error
        ? e.message
        : t("mermaid.unknownError");
  } finally {
    isLoading.value = false;
  }

  // 渲染完成后初始化 panzoom（必须在 isLoading=false 之后，且等待 Vue DOM 更新）
  if (
    svgContent.value &&
    !error.value &&
    isZoomable.value
  ) {
    await nextTick();
    await initPanzoom(diagramRef.value, panzoomInstance);
  }
};

// ============================================================================
// 键盘事件（追踪 Alt 键状态）
// ============================================================================

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Alt") {
    isAltPressed.value = true;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.key === "Alt") {
    isAltPressed.value = false;
    // isDragging 由 panzoom 的 panend 事件控制，无需在此重置
  }
};

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  renderDiagram();
  // 监听键盘事件
  if (import.meta.client) {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }
});

onUnmounted(() => {
  destroyPanzoom();
  // 移除键盘事件监听
  if (import.meta.client) {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  }
});

watch(() => colorMode.value, renderDiagram);
</script>

<template>
  <div class="my-6">
    <!-- 骨架屏：时序图风格 -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center py-6"
      role="status"
      :aria-label="t('mermaid.loading')">
      <!-- 参与者行 -->
      <div class="flex justify-center gap-8 sm:gap-12 mb-4">
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
      </div>

      <!-- 生命线 + 消息 -->
      <div class="relative w-full max-w-md h-32">
        <!-- 垂直生命线 -->
        <div
          class="absolute inset-x-0 top-0 flex justify-center gap-8 sm:gap-12">
          <USkeleton class="h-32 w-0.5" />
          <USkeleton class="h-32 w-0.5" />
          <USkeleton class="h-32 w-0.5" />
          <USkeleton class="h-32 w-0.5" />
        </div>

        <!-- 水平消息线 -->
        <div
          class="absolute inset-x-0 flex flex-col items-center gap-6 pt-4">
          <USkeleton class="h-0.5 w-24 sm:w-32" />
          <USkeleton
            class="h-0.5 w-32 sm:w-40 -translate-x-4" />
          <USkeleton
            class="h-0.5 w-20 sm:w-28 translate-x-6" />
        </div>
      </div>

      <!-- 底部参与者 -->
      <div class="flex justify-center gap-8 sm:gap-12 mt-4">
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
        <USkeleton class="h-10 w-16 sm:w-20 rounded-lg" />
      </div>
    </div>

    <!-- 错误提示 -->
    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      :title="t('mermaid.errorTitle')"
      :description="error"
      :close-button="undefined">
      <template #icon>
        <UIcon name="i-lucide-triangle-alert" />
      </template>
    </UAlert>

    <!-- 渲染结果 -->
    <div
      v-else
      class="relative group">
      <!-- 缩放控制按钮 -->
      <div
        v-if="isZoomable"
        class="absolute top-2 right-2 z-10 flex gap-1">
        <UButton
          icon="i-lucide-zoom-in"
          color="neutral"
          variant="soft"
          size="xs"
          :title="t('mermaid.zoomIn')"
          :aria-label="t('mermaid.zoomIn')"
          @click="diagramControls.zoomIn" />
        <UButton
          icon="i-lucide-zoom-out"
          color="neutral"
          variant="soft"
          size="xs"
          :title="t('mermaid.zoomOut')"
          :aria-label="t('mermaid.zoomOut')"
          @click="diagramControls.zoomOut" />
        <UButton
          icon="system-uicons:reset"
          color="neutral"
          variant="soft"
          size="xs"
          :title="t('mermaid.reset')"
          :aria-label="t('mermaid.reset')"
          @click="diagramControls.reset" />
        <UButton
          icon="i-lucide-maximize-2"
          color="neutral"
          variant="soft"
          size="xs"
          :title="t('mermaid.fullscreen')"
          :aria-label="t('mermaid.fullscreen')"
          @click="handleOpenModal" />
      </div>

      <!-- 图表容器 -->
      <figure
        ref="diagramRef"
        :class="[
          'm-0 flex justify-center p-6 rounded-xl border-2 border-default',
          hasDottedBg && 'mermaid-dotted-bg',
          isZoomable
            ? 'overflow-hidden'
            : 'overflow-x-auto',
          cursorClass,
        ]"
        role="img"
        aria-label="Mermaid diagram"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
        v-html="svgContent" />

      <!-- 提示：Alt + 滚轮缩放 -->
      <p
        v-if="isZoomable"
        class="mt-2 text-xs text-muted text-center">
        {{ t("mermaid.zoomHint") }}
      </p>
    </div>

    <!-- 全屏弹窗 -->
    <UModal
      v-model:open="isModalOpen"
      :title="t('mermaid.fullscreenTitle')"
      fullscreen
      @after:enter="handleModalOpen"
      @after:leave="handleModalClose">
      <template #body>
        <div class="relative h-full group">
          <!-- 弹窗内缩放按钮 -->
          <div
            class="absolute top-4 right-4 z-10 flex gap-1">
            <UButton
              icon="i-lucide-zoom-in"
              color="neutral"
              variant="soft"
              size="sm"
              :title="t('mermaid.zoomIn')"
              :aria-label="t('mermaid.zoomIn')"
              @click="modalControls.zoomIn" />
            <UButton
              icon="i-lucide-zoom-out"
              color="neutral"
              variant="soft"
              size="sm"
              :title="t('mermaid.zoomOut')"
              :aria-label="t('mermaid.zoomOut')"
              @click="modalControls.zoomOut" />
            <UButton
              icon="system-uicons:reset"
              color="neutral"
              variant="soft"
              size="sm"
              :title="t('mermaid.reset')"
              :aria-label="t('mermaid.reset')"
              @click="modalControls.reset" />
          </div>

          <!-- 弹窗内图表容器 -->
          <figure
            ref="modalDiagramRef"
            :class="[
              'm-0 flex justify-center items-center h-full p-8 overflow-hidden',
              hasDottedBg && 'mermaid-dotted-bg',
              cursorClass,
            ]"
            role="img"
            aria-label="Mermaid diagram fullscreen"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
            v-html="svgContent" />

          <!-- 提示 -->
          <p
            class="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted">
            {{ t("mermaid.zoomHint") }}
          </p>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style>
/* 点状背景 - Tailwind 无内置支持，必须用 CSS */
figure.mermaid-dotted-bg {
  background-image: radial-gradient(
    circle,
    rgb(209 213 219 / 80%) 1px,
    transparent 1px
  );
  background-size: 16px 16px;
}
.dark figure.mermaid-dotted-bg {
  background-image: radial-gradient(
    circle,
    rgb(55 65 81 / 80%) 1px,
    transparent 1px
  );
}
</style>
