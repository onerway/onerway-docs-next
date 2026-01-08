<script setup lang="ts">
/**
 * DocsPageSkeleton 组件
 * 主内容区骨架屏，模拟文档页面的结构
 *
 * 包含：
 * - 面包屑导航
 * - 页面标题和描述
 * - 文章内容段落
 * - 上下页导航
 */
</script>

<template>
  <div class="space-y-6">
    <!-- 面包屑导航 -->
    <div class="flex items-center gap-2">
      <USkeleton class="h-4 w-16" />
      <USkeleton class="h-4 w-4 rounded-full" />
      <USkeleton class="h-4 w-20" />
      <USkeleton class="h-4 w-4 rounded-full" />
      <USkeleton class="h-4 w-28" />
    </div>

    <!-- 页面标题 -->
    <div class="py-2 sm:py-4 space-y-4">
      <USkeleton class="h-10 sm:h-12 w-3/4" />
      <!-- 描述 -->
      <div class="space-y-2">
        <USkeleton class="h-5 w-full" />
        <USkeleton class="h-5 w-4/5" />
      </div>
    </div>

    <!-- 分隔线 -->
    <USkeleton class="h-px w-full" />

    <!-- 文章内容 -->
    <div class="space-y-4 pt-4">
      <!-- 段落 1 -->
      <div class="space-y-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-11/12" />
        <USkeleton class="h-4 w-4/5" />
      </div>

      <!-- 小标题 -->
      <USkeleton class="h-7 w-1/3 mt-6" />

      <!-- 段落 2 -->
      <div class="space-y-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-10/12" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
      </div>

      <!-- 代码块占位 -->
      <USkeleton class="h-32 w-full rounded-lg mt-4" />

      <!-- 段落 3 -->
      <div class="space-y-2 mt-4">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
      </div>
    </div>

    <!-- 分隔线 -->
    <USkeleton class="h-px w-full mt-8" />

    <!-- 上下页导航 -->
    <div class="flex justify-between gap-4 pt-4">
      <div class="flex-1 space-y-2">
        <USkeleton class="h-3 w-16" />
        <USkeleton class="h-5 w-32" />
      </div>
      <div class="flex-1 space-y-2 items-end flex flex-col">
        <USkeleton class="h-3 w-16" />
        <USkeleton class="h-5 w-36" />
      </div>
    </div>
  </div>
</template>
