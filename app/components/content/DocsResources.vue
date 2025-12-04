<script setup lang="ts">
/**
 * DocsResources 组件
 * 用于在文档末尾显示相关资源链接列表
 *
 * 特点：
 * - 紧凑的行内链接列表布局
 * - 支持通过 #title slot 自定义标题（可使用 markdown）
 * - 内部链接自动获取文档的 title 和 description
 * - 支持外部链接检测和图标显示
 * - 支持 tags 标签显示文档特点
 * - UPopover (hover 模式) 展示富内容（标签、标题、描述）
 * - 桌面端显示 Popover，移动端直接跳转
 *
 * @example MDC 用法
 * ```mdc
 * ::docs-resources
 *
 * #title
 * ## See also
 *
 * #default
 *   ::docs-resource-item{to="/get-started" icon="i-lucide-book" tags="快速入门"}
 *   ::
 *
 * ::
 * ```
 */
import {
  computed,
  ref,
  inject,
  onMounted,
  onBeforeUpdate,
  type VNode,
} from "vue";
import type { PageCollections } from "@nuxt/content";
import { NAVIGATION_KEY } from "~/types/injection-keys";
import { useDocsNav } from "~/composables/useDocsNav";

// ============================================================================
// Types
// ============================================================================

export interface DocsResourcesProps {
  class?: string;
}

/** 从 slot 中解析出的原始资源数据 */
interface SlotResourceItem {
  index: number;
  to: string;
  title?: string;
  description?: string;
  icon?: string;
  external: boolean;
  tags?: string[];
}

/** 解析后的完整资源数据（包含 navigation 和懒加载数据） */
interface ResolvedResourceItem extends SlotResourceItem {
  /** 链接显示标题：优先用户传入 */
  linkTitle: string;
  /** Popover 显示标题：优先文档本身 */
  docTitle: string;
  /** 解析后的描述 */
  resolvedDescription?: string;
}

// ============================================================================
// Props & Slots
// ============================================================================

const props = withDefaults(
  defineProps<DocsResourcesProps>(),
  {
    class: undefined,
  }
);

const slots = defineSlots<{
  title(): VNode[];
  default(): VNode[];
}>();

// ============================================================================
// Composables & Injections
// ============================================================================

const { locale } = useI18n();
const navigation = inject(NAVIGATION_KEY);
const { findTitleByPath } = useDocsNav(
  computed(() => navigation?.value ?? [])
);

// ============================================================================
// Reactive State
// ============================================================================

/** 强制触发 slot 重新解析的计数器 */
const slotUpdateCounter = ref(1);

/** 懒加载的 description 缓存（undefined=未加载, null=加载中, string=已加载） */
const descriptionCache = ref<Record<string, string | null>>(
  {}
);

/** 检测设备是否支持 hover（桌面端） */
const supportsHover = ref(false);

onMounted(() => {
  supportsHover.value = window.matchMedia(
    "(hover: hover)"
  ).matches;
});

onBeforeUpdate(() => slotUpdateCounter.value++);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 检测是否为外部链接
 */
const isExternalUrl = (url: string): boolean => {
  return (
    url?.startsWith("http://") ||
    url?.startsWith("https://")
  );
};

/**
 * 解析 tags：支持逗号分隔字符串或字符串数组
 * MDC 属性传入的数组会被序列化为逗号分隔字符串
 */
const parseTags = (tags: unknown): string[] | undefined => {
  if (!tags) return undefined;
  if (Array.isArray(tags))
    return tags.filter(Boolean).map(String);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return undefined;
};

/**
 * 检测 VNode 是否为 DocsResourceItem 组件
 */
const isResourceItemVNode = (vnode: VNode): boolean => {
  if (!vnode.type) return false;
  const typeName =
    typeof vnode.type === "object" && "__name" in vnode.type
      ? vnode.type.__name
      : typeof vnode.type === "string"
        ? vnode.type
        : "";
  return (
    typeName === "DocsResourceItem" ||
    Boolean(vnode.props?.to)
  );
};

/**
 * 从 VNode 中提取资源数据
 */
const extractResourceFromVNode = (
  vnode: VNode,
  index: number
): SlotResourceItem | SlotResourceItem[] | undefined => {
  // Fragment 节点：递归处理子节点
  if (typeof vnode.type === "symbol") {
    return (vnode.children as VNode[])?.map((child, i) =>
      extractResourceFromVNode(child, index + i)
    ) as SlotResourceItem[];
  }

  if (!isResourceItemVNode(vnode)) return undefined;

  const to = (vnode.props?.to as string) || "";
  return {
    index,
    to,
    title: vnode.props?.title as string | undefined,
    description: vnode.props?.description as
      | string
      | undefined,
    icon: vnode.props?.icon as string | undefined,
    external:
      vnode.props?.external !== undefined
        ? Boolean(vnode.props.external)
        : isExternalUrl(to),
    tags: parseTags(vnode.props?.tags),
  };
};

// ============================================================================
// Computed Properties
// ============================================================================

/** 从 slot 解析的原始资源列表 */
const slotItems = computed<SlotResourceItem[]>(() => {
  // 触发响应式更新
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  slotUpdateCounter.value;

  const vnodes = slots.default?.() ?? [];
  return vnodes
    .flatMap(extractResourceFromVNode)
    .filter(Boolean) as SlotResourceItem[];
});

/** 解析后的完整资源列表（包含 title 和 description） */
const resolvedItems = computed<ResolvedResourceItem[]>(
  () => {
    return slotItems.value.map((item) => {
      // 从 navigation 查找文档本身的标题
      const navTitle = !item.external
        ? findTitleByPath(item.to)
        : undefined;

      return {
        ...item,
        // 链接显示：优先使用用户传入的 title
        linkTitle: item.title || navTitle || item.to,
        // Popover 显示：优先使用文档本身的 title
        docTitle: navTitle || item.title || item.to,
        // 优先使用用户指定的，其次使用懒加载的
        resolvedDescription:
          item.description ||
          descriptionCache.value[item.to] ||
          undefined,
      };
    });
  }
);

/** 是否有自定义标题 slot */
const hasTitleSlot = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  slotUpdateCounter.value;
  const titleNodes = slots.title?.();
  return titleNodes && titleNodes.length > 0;
});

// ============================================================================
// Methods
// ============================================================================

/**
 * 懒加载文档 description
 * 仅在客户端执行，Hover 时触发
 */
const loadDocDescription = async (path: string) => {
  // 已加载或加载中，跳过
  if (descriptionCache.value[path] !== undefined) return;

  // 标记为加载中
  descriptionCache.value[path] = null;

  const collection =
    `docs_${locale.value}` as keyof PageCollections;
  const doc = await queryCollection(collection)
    .path(path)
    .first();
  descriptionCache.value[path] = doc?.description || "";
};

/**
 * 判断是否需要显示 Popover
 * - 仅在桌面端（支持 hover）显示
 * - 内部链接：始终显示（支持懒加载 description）
 * - 外部链接：仅在有 tags 或 description 时显示
 */
const shouldShowPopover = (
  item: ResolvedResourceItem
): boolean => {
  // 移动端不显示 Popover
  if (!supportsHover.value) return false;
  // 内部链接始终显示（可以懒加载 description）
  if (!item.external) return true;
  // 外部链接仅在有 tags 或 description 时显示
  return Boolean(
    item.tags?.length || item.resolvedDescription
  );
};

/**
 * Popover 打开时触发懒加载
 */
const handlePopoverOpen = (
  open: boolean,
  item: ResolvedResourceItem
) => {
  if (open && !item.external && !item.description) {
    loadDocDescription(item.to);
  }
};

// ============================================================================
// Styles
// ============================================================================

const styles = {
  // 容器：顶部分隔线
  root: "not-prose mt-10 pt-6 border-t border-default",
  // 标题
  titleWrapper: "mb-2 resources-title",
  defaultTitle:
    "text-xs font-semibold text-primary uppercase tracking-wider",
  // 列表
  list: "flex flex-col",
  linkWrapper: "block",
  linkInner: "relative inline-flex",
  // Popover
  popoverContent: [
    "w-64 p-3 rounded-xl",
    "bg-default/95 backdrop-blur-sm",
    "border border-default/60 shadow-xl shadow-black/5 dark:shadow-black/20",
  ].join(" "),
  tagsWrapper: "flex flex-wrap gap-1 mb-2",
  popoverTitle:
    "text-sm font-medium text-highlighted mb-1 leading-snug",
  popoverDesc: "text-xs text-muted leading-relaxed",
};

/** UButton 的 UI 自定义样式 */
const buttonUi = {
  trailingIcon: "size-3",
};
</script>

<template>
  <nav
    :class="[styles.root, props.class]"
    aria-label="Resources">
    <!-- 标题区域 -->
    <div
      v-if="hasTitleSlot"
      :class="styles.titleWrapper">
      <slot name="title" />
    </div>
    <h3
      v-else
      :class="[styles.titleWrapper, styles.defaultTitle]">
      相关资源
    </h3>

    <!-- 链接列表 -->
    <div :class="styles.list">
      <div
        v-for="item in resolvedItems"
        :key="item.index"
        :class="styles.linkWrapper">
        <div :class="styles.linkInner">
          <!-- 带 Popover 的链接（桌面端） -->
          <UPopover
            v-if="shouldShowPopover(item)"
            :dismissible="false"
            mode="hover"
            :close-delay="100"
            :content="{
              side: 'right',
              align: 'center',
              sideOffset: 12,
            }"
            arrow
            :ui="{ content: styles.popoverContent }"
            @update:open="
              (open: boolean) =>
                handlePopoverOpen(open, item)
            ">
            <UButton
              :to="item.to"
              :target="item.external ? '_blank' : undefined"
              :external="item.external"
              variant="link"
              color="primary"
              size="md"
              :icon="item.icon"
              :trailing-icon="
                item.external
                  ? 'i-lucide-arrow-up-right'
                  : undefined
              "
              :label="item.linkTitle"
              :ui="buttonUi" />

            <template #content>
              <!-- 标签 -->
              <div
                v-if="item.tags?.length"
                :class="styles.tagsWrapper">
                <UBadge
                  v-for="tag in item.tags"
                  :key="tag"
                  size="sm"
                  variant="soft"
                  color="primary">
                  {{ tag }}
                </UBadge>
              </div>
              <!-- 文档标题 -->
              <h4 :class="styles.popoverTitle">{{
                item.docTitle
              }}</h4>
              <!-- 描述 -->
              <p
                v-if="item.resolvedDescription"
                :class="styles.popoverDesc">
                {{ item.resolvedDescription }}
              </p>
            </template>
          </UPopover>

          <!-- 无 Popover 的链接（移动端或外部链接无内容） -->
          <UButton
            v-else
            :to="item.to"
            :target="item.external ? '_blank' : undefined"
            :external="item.external"
            variant="link"
            color="primary"
            size="md"
            :icon="item.icon"
            :trailing-icon="
              item.external
                ? 'i-lucide-arrow-up-right'
                : undefined
            "
            :label="item.linkTitle"
            :ui="buttonUi" />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
:deep(.resources-title h1),
:deep(.resources-title h2),
:deep(.resources-title h3),
:deep(.resources-title h4),
:deep(.resources-title h5),
:deep(.resources-title h6) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
