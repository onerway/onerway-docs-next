/**
 * Task List Nuxt Content Transformer
 *
 * 将 minimark AST 中的 task list checkbox 转换为 Vue 组件
 *
 * Nuxt Content 3 使用 minimark 格式存储 body:
 * {
 *   type: "minimark",
 *   value: [
 *     ["tagName", {props}, ...children],
 *     ...
 *   ]
 * }
 */

import { defineTransformer } from "@nuxt/content";

// Vue 组件名
const COMPONENT_NAME = "ProseTaskItem";

// minimark 节点类型: ["tagName", {props}, ...children]
type MinimarkNode = [
  string,
  Record<string, unknown>,
  ...(string | MinimarkNode)[],
];

interface MinimarkBody {
  type: string;
  value: (string | MinimarkNode)[];
}

/**
 * 从文件 ID 生成 route path
 */
const filePathToRoutePath = (fileId: string): string => {
  let path = fileId
    .replace(/^docs_/, "")
    .replace(/\.(md|mdx)$/, "")
    .replace(/\/index$/, "");

  path = path.replace(/^[a-z]{2}(_[a-z]{2})?\//, "");

  return path
    .split("/")
    .map((segment) => segment.replace(/^\d+\./, ""))
    .join("-");
};

/**
 * 检查 minimark 节点是否是 task list checkbox
 */
const isTaskListCheckbox = (
  node: MinimarkNode
): boolean => {
  if (!Array.isArray(node) || node.length < 2) return false;
  const [tag, props] = node;
  return (
    tag === "input" &&
    typeof props === "object" &&
    props !== null &&
    props.type === "checkbox" &&
    "disabled" in props
  );
};

/**
 * 递归遍历 minimark AST 并转换 task list checkbox
 *
 * 转换策略：将 li 中的 checkbox 替换为 ProseTaskItem 组件，
 * 并将 checkbox 后面的所有兄弟节点作为组件的 children，
 * 这样点击文字也能触发勾选（通过 label 包装实现）
 */
const visitAndTransform = (
  nodes: (string | MinimarkNode)[],
  routePath: string,
  context: { taskIndex: number }
): void => {
  for (const node of nodes) {
    // 跳过字符串节点
    if (typeof node === "string") continue;

    // 确保节点是有效的数组
    if (!Array.isArray(node) || node.length < 2) continue;

    const [tag] = node;

    // 检查是否是 li 元素（任务列表项的容器）
    if (tag === "li" && node.length > 2) {
      const children = node.slice(2) as (
        | string
        | MinimarkNode
      )[];

      // 查找第一个 checkbox 的索引
      const checkboxIndex = children.findIndex(
        (child) =>
          Array.isArray(child) && isTaskListCheckbox(child)
      );

      if (checkboxIndex !== -1) {
        const checkboxNode = children[
          checkboxIndex
        ] as MinimarkNode;
        const taskId = `${routePath}-${context.taskIndex}`;
        context.taskIndex++;

        const props = checkboxNode[1] as Record<
          string,
          unknown
        >;
        const initialChecked = props.checked === true;

        // 获取 checkbox 后面的所有兄弟节点作为组件 children
        const siblingContent = children.slice(
          checkboxIndex + 1
        );

        // 创建新的 ProseTaskItem 组件节点，包含后续内容
        const taskItemNode: MinimarkNode = [
          COMPONENT_NAME,
          { id: taskId, initialChecked },
          ...siblingContent,
        ];

        // 重建 li 的 children：保留 checkbox 之前的内容 + ProseTaskItem
        const newChildren = [
          ...children.slice(0, checkboxIndex),
          taskItemNode,
        ];

        // 更新 li 节点
        node.length = 2; // 保留 tag 和 props
        node.push(...newChildren);

        // 继续递归处理 ProseTaskItem 内部的内容
        visitAndTransform(
          siblingContent,
          routePath,
          context
        );
        continue;
      }
    }

    // 递归处理子节点（索引 2 及之后的元素）
    if (node.length > 2) {
      const children = node.slice(2) as (
        | string
        | MinimarkNode
      )[];
      visitAndTransform(children, routePath, context);
    }
  }
};

/**
 * Nuxt Content Transformer
 */
export default defineTransformer({
  name: "task-list",
  extensions: [".md"],
  transform(file) {
    const fileId = file.id || "";
    const body = file.body as MinimarkBody | undefined;

    // 只处理 minimark 格式的 body
    if (
      !body ||
      body.type !== "minimark" ||
      !Array.isArray(body.value)
    ) {
      return file;
    }

    const routePath = filePathToRoutePath(fileId);
    const context = { taskIndex: 0 };

    // 遍历并转换 AST
    visitAndTransform(body.value, routePath, context);

    // Debug 输出
    if (fileId.includes("go-live-checklist")) {
      console.log(
        `[task-list] Transformed ${context.taskIndex} checkboxes in ${fileId}`
      );
    }

    return file;
  },
});
