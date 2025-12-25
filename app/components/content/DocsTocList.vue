<script setup lang="ts">
/**
 * DocsTocList 组件
 * 递归渲染目录链接列表，支持嵌套层级
 *
 * 特点：
 * - 递归渲染支持无限层级嵌套
 * - 自动缩进显示层级关系
 * - 高亮当前激活的标题
 * - 固定行高确保指示器计算准确
 *
 * 作为 DocsToc 的内部辅助组件使用，不建议单独使用。
 */
import type { DocsTocLink } from "./DocsToc.vue";

// ============================================================================
// Types
// ============================================================================

export interface DocsTocListProps {
  /** 目录链接列表 */
  links: DocsTocLink[];
  /** 当前嵌套层级（从 0 开始） */
  level: number;
  /** 当前激活的标题 ID 列表 */
  activeHeadings: string[];
  /** 链接颜色 */
  color?: string;
}

// ============================================================================
// Props & Emits
// ============================================================================

const props = withDefaults(
  defineProps<DocsTocListProps>(),
  {
    color: "primary",
  }
);

const emit = defineEmits<{
  scrollTo: [id: string];
}>();

// ============================================================================
// Constants
// ============================================================================

/**
 * 层级对应的缩进类映射
 */
const INDENT_CLASSES = [
  "",
  "ml-3",
  "ml-6",
  "ml-9",
] as const;

// ============================================================================
// Methods
// ============================================================================

/**
 * 根据层级返回对应的缩进类
 */
const getIndentClass = (
  level: number
): string | undefined =>
  INDENT_CLASSES[
    Math.min(level, INDENT_CLASSES.length - 1)
  ];

/**
 * 检查链接是否激活
 */
function isActive(id: string): boolean {
  return props.activeHeadings.includes(id);
}

/**
 * 获取激活状态的文本颜色类
 * 返回完整的 Tailwind 类名以确保正确编译
 */
const activeTextClass = computed(() => {
  // 使用完整类名，Tailwind 编译器可以识别
  switch (props.color) {
    case "primary":
      return "text-primary";
    case "secondary":
      return "text-secondary";
    case "success":
      return "text-success";
    case "info":
      return "text-info";
    case "warning":
      return "text-warning";
    case "error":
      return "text-error";
    case "neutral":
      return "text-highlighted";
    default:
      return "text-primary";
  }
});
</script>

<template>
  <ul class="text-sm">
    <li
      v-for="link in links"
      :key="link.id"
      :class="getIndentClass(level)">
      <!-- 每个链接高度固定为 28px (h-7)，与 Nuxt UI 指示器计算一致 -->
      <UTooltip
        :text="link.text"
        :delay-duration="300"
        :content="{ side: 'right', align: 'center' }">
        <ULink
          :href="`#${link.id}`"
          :active="isActive(link.id)"
          inactive-class="text-muted hover:text-highlighted"
          :active-class="activeTextClass"
          :class="[
            'flex items-center h-7 text-ellipsis transition-colors duration-200',
            link.class,
          ]"
          raw
          @click.prevent="emit('scrollTo', link.id)">
          <span class="truncate">{{ link.text }}</span>
        </ULink>
      </UTooltip>

      <!-- 递归渲染子链接 -->
      <DocsTocList
        v-if="link.children?.length"
        :links="link.children as DocsTocLink[]"
        :level="level + 1"
        :active-headings="activeHeadings"
        :color="color"
        @scroll-to="emit('scrollTo', $event)" />
    </li>
  </ul>
</template>
