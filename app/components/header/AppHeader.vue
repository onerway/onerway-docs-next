<script setup lang="ts">
/**
 * AppHeader 组件
 * 应用顶部导航栏，包含 Logo、搜索、语言切换和主题切换
 *
 * 特点：
 * - 基于 UHeader 封装
 * - 桌面端：水平导航菜单 + 搜索框
 * - 移动端：侧边抽屉导航（通过 AppHeaderMobileNav 实现）
 * - 集成 i18n 语言切换
 * - 集成颜色模式切换
 * - 从 injection 获取导航数据
 */
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ContentNavigationItem } from "@nuxt/content";
import type { Ref } from "vue";
import { NAVIGATION_KEY } from "~/types/injection-keys";

const { header } = useAppConfig();
const { t, locale, locales, setLocale } = useI18n();

// 使用类型安全的 injection key 获取导航树
// NAVIGATION_KEY 已定义正确的泛型类型，inject 返回 Ref<ContentNavigationItem[]>
const navigation = inject(NAVIGATION_KEY);

// 为移动端导航提供类型安全的 ref
const navigationForMobile = computed(
  () => navigation as Ref<ContentNavigationItem[]>
);

const { topLevelModuleLinks } = useDocsNav(
  navigation as Ref<ContentNavigationItem[]>,
  {
    includeModules: true,
  }
);

// 语言切换菜单项
const languageItems = computed<DropdownMenuItem[][]>(() => [
  locales.value.map((l) => ({
    label: l.name || l.code.toUpperCase(),
    icon:
      locale.value === l.code
        ? "i-lucide-check"
        : undefined,
    onSelect: () => setLocale(l.code),
  })),
]);

// API 链接菜单项
const apis = computed<DropdownMenuItem[][]>(() => [
  (header.apiLinks || []).map((link) => ({
    label: t(link.labelKey),
    ...(link.icon && { icon: link.icon }),
    to: link.to,
    color: "primary",
    target: "_blank",
  })),
]);
</script>

<template>
  <UHeader
    mode="slideover"
    toggle-side="right"
    :toggle="{
      color: 'neutral',
      variant: 'ghost',
    }"
    :menu="{
      side: 'right',
    }">
    <!-- Left 插槽 - Logo 区域 -->
    <template #left>
      <ULink
        :to="header?.to || '/'"
        class="flex items-center gap-2">
        <UIcon
          name="i-custom-onerway"
          class="sm:size-10" />
        <AppLogo class="max-sm:hidden h-5 w-auto" />
      </ULink>
    </template>

    <!-- Default 插槽 - 搜索框（桌面端可见） -->
    <UContentSearchButton
      :collapsed="false"
      class="hidden lg:flex" />

    <template #body>
      <!-- 移动端导航组件 -->
      <AppHeaderMobileNav
        v-if="navigation"
        :navigation="navigationForMobile" />
    </template>

    <!-- Right 插槽 - 操作按钮 -->
    <template #right>
      <!-- 移动端搜索按钮 -->
      <UContentSearchButton class="lg:hidden" />

      <!-- 语言切换下拉菜单 -->
      <UDropdownMenu
        :items="languageItems"
        :ui="{ content: 'min-w-32' }">
        <UButton
          :label="locale.toUpperCase()"
          icon="i-lucide-languages"
          color="neutral"
          variant="ghost"
          size="sm" />
      </UDropdownMenu>

      <!-- 颜色模式切换按钮 -->
      <UColorModeButton />
    </template>

    <!-- Bottom 插槽 - 水平导航菜单 + API 入口 -->
    <template #bottom>
      <div
        class="hidden lg:flex w-full bg-default/75 backdrop-blur h-header-nav items-center justify-between border-b border-default px-2">
        <!-- 左侧：模块导航链接（无子菜单） -->
        <UNavigationMenu
          :items="topLevelModuleLinks"
          highlight
          orientation="horizontal"
          variant="link" />

        <!-- 右侧：API 入口下拉菜单 -->
        <UDropdownMenu :items="apis">
          <UButton
            :label="t('header.api.title')"
            trailing-icon="i-lucide-chevron-down"
            color="neutral"
            variant="link" />
        </UDropdownMenu>
      </div>
    </template>
  </UHeader>
</template>
