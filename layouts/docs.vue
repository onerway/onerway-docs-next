<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { kebabCase } from "scule";
import { createLogger } from "~/composables/shared/logger";
import { useSharedPathInfo } from "~/composables/shared/path";

const route = useRoute();
const logger = createLogger("docs-layout");

// 使用共享的路径解析工具
const { pathInfo } = useSharedPathInfo();

logger.info("module信息", pathInfo.value.module);
// 获取页面内容
const { data: page } = await useAsyncData(
  kebabCase(route.path),
  async () => {
    const info = pathInfo.value;

    // 根据路径信息获取集合名称
    if (!info.collectionName) {
      throw createError({
        statusCode: 404,
        statusMessage: "Collection not found",
      });
    }

    return queryCollection(info.collectionName as any)
      .path(info.contentPath)
      .first();
  }
);

// 从 app.vue 注入的导航数据
const navigation =
  inject<Ref<ContentNavigationItem[]>>("navigation");

const navKey = computed(() => {
  const module = pathInfo.value.module || "root";
  const ready =
    navigation?.value && navigation.value.length
      ? "ready"
      : "loading";
  return `${module}:${ready}`;
});

const safeNavigation = computed(
  () => (navigation?.value as ContentNavigationItem[]) || []
);

logger.info("safeNavigation", safeNavigation.value);

const asideUi = {
  root: "border-r border-default max-w-3xs",
} as const;
</script>

<template>
  <div class="min-h-screen">
    <!-- 主内容区域 -->
    <UMain>
      <UContainer class="max-w-8xl px-4 sm:px-4 lg:px-4">
        <UPage>
          <template #left>
            <UPageAside
              v-if="
                page?.showNavigation &&
                safeNavigation.length > 0
              "
              :ui="asideUi"
              class="-translate-y-6">
              <DocsNavigation
                :key="navKey"
                :navigation="safeNavigation"
                highlight
                color="primary"
                orientation="vertical"
                type="multiple"
                class="sm:mt-12" />
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped></style>
