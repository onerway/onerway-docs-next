import { MODULE_CONFIG } from "~/composables/shared/constants";

/**
 * 全局中间件：规范化模块根路径
 *
 * 职责：
 * - 当访问模块根路径（如「/payments」）时，重定向到其规范化的概览路径
 *   （如「/payments/overview」）。
 *
 * 说明：
 * - 在 SSR 与 CSR 中都会运行：SSR 下使用 301（利于 SEO），CSR 下使用
 *   `replace: true` 避免污染浏览历史。
 * - 重定向时会保留查询参数（query）与哈希（hash）。
 * - 可与客户端的 afterEach 插件（如启用）配合：仅在路由规范化后记录最终页面，
 *   避免记录中间态路径。
 */
export default defineNuxtRouteMiddleware((to) => {
  const path = to.path;
  if (import.meta.dev) {
    console.log("to", to);
  }

  if (!path || path === "/") return;

  // 为比较而做的规范化：移除尾部斜杠（根路径除外）。
  // 这不会改变实际跳转目标，仅用于避免「/payments/」与「/payments」等价时的误判。
  const trimmedPath =
    path.endsWith("/") && path !== "/"
      ? path.replace(/\/+$/, "")
      : path;

  // 若已处于规范化的 overview 页面，则直接放行，避免重定向循环。
  // 匹配形如「/{module}/overview」，其中 {module} 可包含字母、数字与短横线。
  if (/^\/[\w-]+\/overview$/.test(trimmedPath)) {
    return;
  }

  const segments = trimmedPath.split("/").filter(Boolean);

  // 仅在访问模块根路径时重定向，例如「/payments」→「/payments/overview」。
  // 嵌套路径如「/payments/foo」应直接放行。
  if (segments.length === 1) {
    const moduleKey = segments[0]!;
    // 仅对集中配置（MODULE_CONFIG）中已知模块生效，避免影响非模块的顶级路由。
    const supportedModules = Object.keys(MODULE_CONFIG);

    if (supportedModules.includes(moduleKey)) {
      // 保留 query/hash；SSR 使用 301（SEO 友好），CSR 使用 replace 以避免额外历史记录。
      return navigateTo(
        {
          path: `/${moduleKey}/overview`,
          query: to.query,
          hash: to.hash,
        },
        { replace: true, redirectCode: 301 }
      );
    }
  }
});
