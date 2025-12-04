<script setup lang="ts">
/**
 * DocsResourceItem 组件
 * 作为 DocsResources 的子组件使用
 *
 * 此组件作为数据容器，实际渲染由父组件 DocsResources 处理
 *
 * @example MDC 用法
 * ```mdc
 * ::docs-resource-item{to="/get-started" icon="i-lucide-book" title="Get Started" description="Learn how to get started" tags="快速入门,入门指南"}
 * ::
 * ```
 */
export interface DocsResourceItemProps {
  /**
   * 链接地址（必需）
   * 支持内部路径如 "/get-started" 或外部 URL 如 "https://example.com"
   */
  to: string;
  /**
   * 链接标题
   * 如果未提供，将使用链接地址作为显示文本
   */
  title?: string;
  /**
   * 链接描述
   */
  description?: string;
  /**
   * 前置图标名称
   * 使用 Iconify 图标格式，如 "i-lucide-book"
   */
  icon?: string;
  /**
   * 是否为外部链接
   * 如果未提供，将根据 to 属性自动检测
   */
  external?: boolean;
  /**
   * 文档内容特点标签
   * 支持逗号分隔的字符串或字符串数组
   * @example "快速入门,API" 或 ['快速入门', 'API']
   */
  tags?: string | string[];
  /**
   * 自定义 class
   */
  class?: string;
}

defineProps<DocsResourceItemProps>();
</script>

<template>
  <!--
    此组件作为数据容器，实际渲染由父组件 DocsResources 处理
    父组件会提取 props 数据并渲染卡片列表
  -->
  <div :class="$props.class">
    <slot />
  </div>
</template>
