<script setup lang="ts">
/**
 * ProseTaskItem - 可交互的任务列表项组件
 *
 * 将 GFM task list checkbox 转换为可交互组件，支持：
 * - 用户勾选/取消勾选
 * - 点击文字触发勾选（通过 label 包装）
 * - localStorage 持久化
 * - SSR 安全
 *
 * 由 task-list transformer 自动注入，无需手动使用
 */

export interface ProseTaskItemProps {
  /** 任务唯一标识符（由 transformer 生成） */
  id: string;
  /** 初始勾选状态（来自 Markdown） */
  initialChecked?: boolean;
}

const props = withDefaults(
  defineProps<ProseTaskItemProps>(),
  {
    initialChecked: false,
  }
);

// 响应式状态 - 使用 Markdown 中的初始值
const isChecked = ref(props.initialChecked);

// localStorage key
const storageKey = computed(() => `task-${props.id}`);

// 客户端初始化 - 从 localStorage 恢复状态
onMounted(() => {
  if (!import.meta.client) return;

  const savedValue = localStorage.getItem(storageKey.value);
  if (savedValue !== null) {
    // localStorage 中有值则优先使用
    isChecked.value = savedValue === "true";
  }

  // 监听变更并持久化
  watch(isChecked, (newValue: boolean) => {
    localStorage.setItem(
      storageKey.value,
      String(newValue)
    );
  });
});
</script>

<template>
  <label
    class="inline-flex items-start gap-1 cursor-pointer select-none">
    <UCheckbox
      v-model="isChecked"
      :ui="{
        root: 'inline-flex items-center translate-y-1',
        base: 'shrink-0 size-4 cursor-pointer',
      }" />
    <span class="flex-1">
      <slot />
    </span>
  </label>
</template>
