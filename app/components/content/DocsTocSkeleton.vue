<script setup lang="ts">
/**
 * DocsTocSkeleton 组件
 * 目录（TOC）骨架屏，模拟目录结构
 *
 * 用于：
 * - SSR fallback：在 ClientOnly 组件服务端渲染时占位
 * - 首屏加载时的 TOC 占位
 * - 页面切换时的 TOC 加载状态
 *
 * 注意：外层容器需要匹配 DocsToc 的布局样式
 */
</script>

<template>
  <nav>
    <!-- 移动端：不显示骨架屏（移动端 TOC 是浮动按钮，占位意义不大） -->
    <!-- 桌面端：显示骨架屏占位 -->
    <div
      class="hidden lg:block sticky top-0 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <!-- 标题 -->
      <USkeleton class="h-4 w-16 mb-3" />

      <!-- 目录项（模拟层级结构） -->
      <div class="border-l border-default pl-4 space-y-2">
        <USkeleton class="h-3 w-28" />
        <USkeleton class="h-3 w-20 ml-3" />
        <USkeleton class="h-3 w-24 ml-3" />
        <USkeleton class="h-3 w-32" />
        <USkeleton class="h-3 w-20 ml-3" />
        <USkeleton class="h-3 w-28" />
        <USkeleton class="h-3 w-24" />
        <USkeleton class="h-3 w-20 ml-3" />
      </div>
    </div>
  </nav>
</template>
