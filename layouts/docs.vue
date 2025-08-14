<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";
import { mapContentNavigation } from "@nuxt/ui-pro/utils/content";
import { kebabCase } from "scule";
import {
  createLogger,
  useSharedPathInfo,
} from "~/composables/shared/utils";

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

logger.info("docs-layout-navigation", navigation?.value);

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
const menu = mapContentNavigation(
  navigation?.value as ContentNavigationItem[]
);
</script>

<template>
  <div class="min-h-screen">
    <!-- 主内容区域 -->
    <UMain>
      <UContainer class="max-w-8xl">
        <UPage>
          <template
            #left
            v-if="page?.showNavigation">
            <UPageAside
              :ui="{
                root: 'border-r border-default',
              }">
              <DocsNavigation
                :key="`${pathInfo?.module || 'root'}:${navigation && navigation && navigation.length ? 'ready' : 'loading'}`"
                :navigation="navigation || []"
                highlight
                trailing-icon="i-lucide-chevron-right"
                color="primary"
                variant="link" />
              <!-- <UNavigationMenu
                :ui="{
                  linkLabel: 'text-pretty md:text-balance',
                }"
                orientation="vertical"
                :items="menu"
                highlight
                :collapsible="false"
                type="multiple"
                color="primary"
                class="sm:mt-12" /> -->
            </UPageAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped></style>
