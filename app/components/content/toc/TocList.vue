<script setup lang="ts">
/**
 * TocList 组件
 *
 * 递归渲染目录链接列表，支持嵌套层级。
 * 作为 ContentToc 的内部辅助组件使用。
 */
import type { ContentTocLink } from "./ContentToc.vue";

interface Props {
  links: ContentTocLink[];
  level: number;
  activeHeadings: string[];
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
});

const emit = defineEmits<{
  scrollTo: [id: string];
}>();

/**
 * 层级对应的缩进类映射
 */
const INDENT_CLASSES = [
  "",
  "ml-3",
  "ml-6",
  "ml-9",
] as const;

/**
 * 根据层级返回对应的缩进类
 */
const getIndentClass = (level: number): string | undefined =>
  INDENT_CLASSES[
    Math.min(level, INDENT_CLASSES.length - 1)
  ];

/**
 * 检查链接是否激活
 */
function isActive(id: string): boolean {
  return props.activeHeadings.includes(id);
}
</script>

<template>
  <ul class="text-sm">
    <li
      v-for="(link, index) in links"
      :key="index"
      :class="getIndentClass(level)">
      <!-- 每个链接高度固定为 28px (h-7)，与 Nuxt UI 指示器计算一致 -->
      <a
        :href="`#${link.id}`"
        :class="[
          'flex items-center h-7 transition-colors duration-200 truncate',
          isActive(link.id)
            ? 'text-primary'
            : 'text-muted hover:text-default',
          link.class,
        ]"
        @click.prevent="emit('scrollTo', link.id)">
        {{ link.text }}
      </a>

      <!-- 递归渲染子链接 -->
      <TocList
        v-if="link.children?.length"
        :links="link.children as ContentTocLink[]"
        :level="level + 1"
        :active-headings="activeHeadings"
        :color="color"
        @scroll-to="emit('scrollTo', $event)" />
    </li>
  </ul>
</template>
