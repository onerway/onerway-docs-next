<!--
  Home 首页布局
  适用于首页和其他营销页面（无侧边栏的全宽布局）

  与 docs.vue 的区别：
  - 无左侧导航侧边栏
  - 全宽内容区域
  - 适合展示型页面（首页、产品介绍、定价等）
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div>
    <AppHeader />

    <main :aria-label="t('a11y.mainContent')">
      <slot />
    </main>
  </div>
</template>
