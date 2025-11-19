<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { NAVIGATION_KEY } from "~/types/injection-keys";

const { header } = useAppConfig();
const { locale, locales, setLocale } = useI18n();

// 使用类型安全的 injection key 获取导航树
const navigation = inject(NAVIGATION_KEY);

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
</script>

<template>
  <UHeader
    mode="slideover"
    toggle-side="left"
    :menu="{
      side: 'left',
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
      <AppHeaderMobileNav :navigation="navigation" />
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

    <!-- Bottom 插槽 - 水平导航菜单 -->
    <template #bottom>
      <!-- <USeparator class="hidden lg:flex" />
      <UNavigationMenu
        :items="navigation"
        variant="link"
        class="w-full" /> -->
    </template>
  </UHeader>
</template>
