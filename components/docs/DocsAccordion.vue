<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import { createLogger } from "~/composables/shared/logger";

type AccordionType = "single" | "multiple";

interface DocsAccordionItem extends AccordionItem {
  anchor?: string | boolean; // 支持自定义锚点或自动生成
}

interface DocsAccordionProps {
  items?: DocsAccordionItem[];
  type?: AccordionType;
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  ui?: Record<string, string>;
  contentClass?: string;
  renderMarkdown?: boolean;
  disabled?: boolean;
  unmountOnHide?: boolean;
  labelKey?: string;
  trailingIcon?: string;
  ariaLive?: "off" | "polite" | "assertive";
  emptyClass?: string;
  enableAnchors?: boolean; // 是否启用锚点功能
  anchorPrefix?: string; // 锚点前缀
}

const props = withDefaults(
  defineProps<DocsAccordionProps>(),
  {
    items: () => [],
    type: "multiple" as AccordionType,
    collapsible: false,
    renderMarkdown: true,
    unmountOnHide: false,
    ariaLive: "polite",
    enableAnchors: true,
    anchorPrefix: "accordion",
  }
);

const emit = defineEmits<{
  (
    e: "update:value",
    value: string | string[] | undefined
  ): void;
}>();

const logger = createLogger("DocsAccordion");

const { t } = useI18n();
const { copy } = useClipboard();
const route = useRoute();

// ==================== 锚点功能 ====================

// 生成锚点 ID 的工具函数
const generateAnchorId = (
  text: string,
  index: number
): string => {
  // 清理文本：移除特殊字符，转换为小写，替换空格为连字符
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // 移除特殊字符
    .replace(/\s+/g, "-") // 空格转连字符
    .replace(/-+/g, "-") // 多个连字符合并
    .replace(/^-|-$/g, ""); // 移除首尾连字符

  return cleanText || `${props.anchorPrefix}-${index}`;
};

// 处理带锚点的 items
const processedItems = computed(() => {
  if (!props.enableAnchors || !props.items)
    return props.items;

  return props.items.map((item, index) => {
    let anchorId = "";

    if (item.anchor === false) {
      // 明确禁用锚点
      return { ...item, anchorId: null };
    } else if (typeof item.anchor === "string") {
      // 使用自定义锚点
      anchorId = item.anchor;
    } else if (
      item.anchor === true ||
      item.anchor === undefined
    ) {
      // 自动生成锚点
      const labelText =
        typeof item.label === "string"
          ? item.label
          : `Item ${index + 1}`;
      anchorId = generateAnchorId(labelText, index);
    }

    return { ...item, anchorId };
  });
});

logger.info("processedItems", processedItems.value);

const modelValueProxy = computed<
  string | string[] | undefined
>({
  get: () => props.value,
  set: (val) => emit("update:value", val),
});

const accordionUi = computed(() => ({
  trigger: "text-base cursor-pointer",
  body: "text-base text-muted",
  ...(props.ui || {}),
}));

const hasItems = computed(
  () => (props.items?.length ?? 0) > 0
);

// ==================== 锚点复制功能 ====================

/**
 * 复制锚点 URL
 */
const copyAnchorUrl = async (item: DocsAccordionItem) => {
  if (!item.anchorId) return;

  const fullUrl = `${window.location.origin}${route.path}#${item.anchorId}`;

  const success = await copy(fullUrl, {
    successTitle: t("clipboard.success.title"),
    successDesc: `${item.label} ${t("docs.accordion.anchorCopied")}`,
  });

  if (success && import.meta.dev) {
    logger.info(
      `[DocsAccordion] Copied anchor URL: ${fullUrl}`
    );
  }
};
</script>

<template>
  <UAccordion
    v-if="hasItems"
    v-model="modelValueProxy"
    :type="props.type"
    :items="processedItems"
    :collapsible="props.collapsible"
    :disabled="props.disabled"
    :unmount-on-hide="props.unmountOnHide"
    :default-value="props.defaultValue"
    :label-key="props.labelKey"
    :trailing-icon="props.trailingIcon"
    :ui="accordionUi">
    <!-- leading 插槽 -->
    <template #leading="slotProps">
      <slot
        name="leading"
        v-bind="slotProps" />
    </template>

    <!-- default 插槽 - 自定义 label 区域以支持锚点 -->
    <template #default="slotProps">
      <slot v-bind="slotProps">
        <div
          :id="slotProps.item.anchorId"
          class="flex items-center justify-between w-full group">
          <!-- Label 内容区域 -->
          <div class="flex-1">
            <slot
              name="label"
              v-bind="slotProps">
              <span
                class="font-semibold text-xl text-primary/85 group-hover:text-primary/65 transition-colors duration-200"
                >{{ slotProps.item.label }}</span
              >
            </slot>
          </div>

          <!-- 锚点复制按钮区域 -->
          <div
            v-if="
              props.enableAnchors && slotProps.item.anchorId
            "
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
            <ClientOnly>
              <UButton
                variant="ghost"
                size="xs"
                :aria-label="t('docs.accordion.copyAnchor')"
                class="cursor-pointer"
                @click.stop="copyAnchorUrl(slotProps.item)">
                <UIcon
                  name="i-heroicons-link"
                  class="w-4 h-4" />
              </UButton>
            </ClientOnly>
          </div>
        </div>
      </slot>
    </template>

    <!-- trailing 插槽 -->
    <template #trailing="slotProps">
      <slot
        name="trailing"
        v-bind="slotProps" />
    </template>

    <!-- content 插槽 -->
    <template #content="slotProps">
      <slot
        name="content"
        v-bind="slotProps">
      </slot>
    </template>

    <!-- body 插槽 - 支持 markdown 渲染 -->
    <template #body="slotProps">
      <slot
        name="body"
        v-bind="slotProps">
        <MDC
          v-if="
            props.renderMarkdown && slotProps.item.content
          "
          :class="props.contentClass"
          :value="slotProps.item.content as string"
          unwrap="p">
        </MDC>
        <div
          v-else-if="slotProps.item.content"
          :class="props.contentClass">
          {{ slotProps.item.content }}
        </div>
      </slot>
    </template>

    <!-- 支持动态插槽（用于具名插槽内容） -->
    <template
      v-for="(_, slotName) in $slots"
      :key="slotName"
      #[slotName]="slotProps">
      <slot
        :name="slotName"
        v-bind="slotProps || {}">
      </slot>
    </template>
  </UAccordion>

  <!-- 空状态 -->
  <div
    v-else
    role="status"
    :aria-live="props.ariaLive"
    :class="props.emptyClass || 'text-sm text-muted'">
    <slot name="empty">
      {{ t("home.tryItOut.noContent") }}
    </slot>
  </div>
</template>
