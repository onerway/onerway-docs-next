<script setup lang="ts">
/**
 * ProseLinkSwitch 组件
 * 支持为同一文本配置多个链接选项，用户可通过 hover/click 选择目标链接
 *
 * 特点：
 * - 下拉箭头图标标识，区分普通链接
 * - 支持预设配置（如 merchant-dashboard）
 * - 支持自定义链接列表
 * - hover/click 两种触发模式
 *
 * @example MDC 用法 - 预设模式（使用 label prop）
 * ```markdown
 * :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label="Onerway Dashboard"}
 * ```
 *
 * @example MDC 用法 - 预设模式（使用 slot）
 * ```markdown
 * :prose-link-switch{preset="merchant-dashboard" path="/dashboard"}[Dashboard]
 * ```
 *
 * @example MDC 用法 - 自定义模式
 * ```markdown
 * :prose-link-switch{:links='[{"label":"iOS","to":"/sdk/ios"},{"label":"Android","to":"/sdk/android"}]'}[SDK]
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/** 预设类型 */
export type LinkPreset = "merchant-dashboard";

/** 链接选项 */
export interface LinkOption {
  /** 选项显示标签 */
  label: string;
  /** 链接地址 */
  to: string;
  /** 可选图标 */
  icon?: string;
}

/** 组件 Props */
export interface ProseLinkSwitchProps {
  /** 预设类型（与 links 二选一） */
  preset?: LinkPreset;
  /** 预设模式下的路径（如 /dashboard） */
  path?: string;
  /** 自定义链接列表（与 preset 二选一） */
  links?: LinkOption[];
  /** 显示标签（替代 slot，优先级：slot > label > presetLabel） */
  label?: string;
  /** 触发模式 */
  mode?: "hover" | "click";
}

// ============================================================================
// Constants - 预设配置
// ============================================================================

/**
 * Merchant Dashboard 预设配置
 * 定义 Sandbox 和 Production 环境的 Portal URL
 */
const MERCHANT_DASHBOARD_PRESET: LinkOption[] = [
  {
    label: "Sandbox",
    to: "https://sandbox-portal.onerway.com",
    icon: "i-lucide-flask-conical",
  },
  {
    label: "Production",
    to: "https://portal.onerway.com",
    icon: "i-lucide-globe",
  },
];

/**
 * 预设配置映射
 * 可扩展更多预设类型
 */
const PRESETS: Record<LinkPreset, LinkOption[]> = {
  "merchant-dashboard": MERCHANT_DASHBOARD_PRESET,
};

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(
  defineProps<ProseLinkSwitchProps>(),
  {
    preset: undefined,
    path: "",
    links: undefined,
    label: undefined,
    mode: "hover",
  }
);

// ============================================================================
// Composables & Injections
// ============================================================================

const { t } = useI18n();

// ============================================================================
// Reactive State
// ============================================================================

const isOpen = ref(false);

// ============================================================================
// Computed Properties
// ============================================================================

/**
 * 计算最终的链接列表
 * 预设模式优先，否则使用自定义 links
 */
const resolvedLinks = computed<LinkOption[]>(() => {
  // 预设模式
  if (props.preset && PRESETS[props.preset]) {
    const presetLinks = PRESETS[props.preset];
    // 如果有 path，追加到每个链接的 to 后面
    if (props.path) {
      return presetLinks.map((link) => ({
        ...link,
        to: `${link.to}${props.path}`,
      }));
    }
    return presetLinks;
  }

  // 自定义模式
  if (props.links && props.links.length > 0) {
    return props.links;
  }

  // 兜底：返回空数组
  return [];
});

/**
 * 从预设名称推导显示标签
 * 例如：merchant-dashboard → "Merchant Dashboard"
 */
const presetLabel = computed(() => {
  if (!props.preset) return "";
  return props.preset
    .split("-")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
});

/**
 * 触发器显示文本
 * 优先级：label prop > presetLabel
 */
const displayLabel = computed(() => {
  return props.label || presetLabel.value || "";
});

/**
 * Popover 内容配置
 */
const popoverContent = computed(() => ({
  align: "start" as const,
  side: "bottom" as const,
  sideOffset: 4,
}));

// ============================================================================
// Methods
// ============================================================================

/**
 * 处理链接点击
 */
const handleLinkClick = (link: LinkOption) => {
  isOpen.value = false;
  // 使用 navigateTo 进行导航
  navigateTo(link.to, {
    external: true,
    open: { target: "_blank" },
  });
};

/**
 * 处理键盘事件
 */
const handleKeyDown = (
  event: KeyboardEvent,
  link: LinkOption
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleLinkClick(link);
  }
};

// ============================================================================
// Styles
// ============================================================================

const styles = {
  /** 触发器样式 */
  trigger: [
    "inline-flex items-center gap-0.5",
    "text-primary font-medium",
    "hover:text-primary/80",
    "transition-colors duration-200",
    "cursor-pointer",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:rounded-sm",
  ],
  /** 下拉箭头图标 */
  chevron: [
    "size-3.5",
    "transition-transform duration-200",
  ],
  /** 箭头旋转状态 */
  chevronOpen: "rotate-180",
  /** 选项列表容器 */
  optionList: "py-1 min-w-36",
  /** 选项项样式 */
  option: [
    "flex items-center gap-2 px-3 py-1.5 w-full",
    "text-sm text-default",
    "hover:bg-elevated hover:text-highlighted",
    "transition-colors duration-150",
    "cursor-pointer",
    "focus-visible:outline-none focus-visible:bg-elevated",
  ],
  /** 选项图标 */
  optionIcon: "size-4 text-muted",
};
</script>

<template>
  <UPopover
    v-model:open="isOpen"
    :mode="mode"
    :content="popoverContent"
    :open-delay="200"
    :close-delay="100">
    <!-- 触发器 -->
    <span
      :class="styles.trigger"
      :aria-label="t('linkSwitch.selectLink')"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      tabindex="0">
      <slot>{{ displayLabel }}</slot>
      <UIcon
        name="i-lucide-chevron-down"
        :class="[
          styles.chevron,
          isOpen && styles.chevronOpen,
        ]" />
    </span>

    <!-- 下拉内容 -->
    <template #content>
      <div
        :class="styles.optionList"
        role="menu"
        :aria-label="t('linkSwitch.linkOptions')">
        <div
          v-for="(link, index) in resolvedLinks"
          :key="index"
          :class="styles.option"
          role="menuitem"
          tabindex="0"
          @click="handleLinkClick(link)"
          @keydown="(e) => handleKeyDown(e, link)">
          <UIcon
            v-if="link.icon"
            :name="link.icon"
            :class="styles.optionIcon" />
          <span>{{ link.label }}</span>
          <UIcon
            name="i-lucide-external-link"
            class="size-3 text-muted ml-auto" />
        </div>
      </div>
    </template>
  </UPopover>
</template>
