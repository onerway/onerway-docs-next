#!/usr/bin/env node

/**
 * 清理 Nuxt 项目缓存脚本
 *
 * 使用方法：
 * npm run clear-cache
 * 或
 * node scripts/clear-cache.js
 */

import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const __dirname = fileURLToPath(
  new URL(".", import.meta.url)
);
const rootDir = resolve(__dirname, "..");

// 需要清理的缓存目录和文件
const CACHE_PATHS = [
  // Nuxt 缓存
  ".nuxt",
  ".output",

  // Node.js 缓存
  "node_modules/.cache",
  "node_modules/.vite",

  // Vite 缓存
  "node_modules/.vite",

  // @nuxt/content 缓存
  ".nuxt/content-cache",
  ".nuxt/content",

  // i18n 缓存
  ".nuxt/i18n",

  // 其他可能的缓存
  "dist",
  ".turbo",
  ".cache",

  // SQLite 数据库文件
  "*.db",
  "*.sqlite",
  "*.sqlite3",

  // 临时文件
  "tmp",
  ".tmp",

  // TypeScript 缓存
  ".tsbuildinfo",
  "tsconfig.tsbuildinfo",
];

// 颜色输出函数
const colors = {
  reset: "\x1B[0m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 清理指定路径
async function clearPath(path) {
  const fullPath = join(rootDir, path);

  try {
    if (existsSync(fullPath)) {
      await rm(fullPath, { recursive: true, force: true });
      colorLog("green", `✓ 已清理: ${path}`);
      return true;
    } else {
      colorLog("yellow", `⚠ 路径不存在: ${path}`);
      return false;
    }
  } catch (error) {
    colorLog("red", `✗ 清理失败 ${path}: ${error.message}`);
    return false;
  }
}

// 清理 glob 模式的文件
async function clearGlobPattern(pattern) {
  try {
    const { stdout } = await execAsync(
      `find ${rootDir} -name "${pattern}" -type f`
    );
    const files = stdout.trim().split("\n").filter(Boolean);

    for (const file of files) {
      try {
        await rm(file, { force: true });
        colorLog(
          "green",
          `✓ 已清理文件: ${file.replace(`${rootDir}/`, "")}`
        );
      } catch (error) {
        colorLog(
          "red",
          `✗ 清理文件失败 ${file}: ${error.message}`
        );
      }
    }

    return files.length;
  } catch {
    return 0;
  }
}

// 清理 npm/pnpm 缓存
async function clearPackageManagerCache() {
  colorLog("blue", "\n🧹 清理包管理器缓存...");

  try {
    // 检测使用的包管理器
    if (existsSync(join(rootDir, "pnpm-lock.yaml"))) {
      await execAsync("pnpm store prune", { cwd: rootDir });
      colorLog("green", "✓ pnpm 缓存已清理");
    } else if (existsSync(join(rootDir, "yarn.lock"))) {
      await execAsync("yarn cache clean", { cwd: rootDir });
      colorLog("green", "✓ Yarn 缓存已清理");
    } else {
      await execAsync("npm cache clean --force", {
        cwd: rootDir,
      });
      colorLog("green", "✓ npm 缓存已清理");
    }
  } catch (error) {
    colorLog(
      "red",
      `✗ 包管理器缓存清理失败: ${error.message}`
    );
  }
}

// 主函数
async function main() {
  colorLog("cyan", "🚀 开始清理 Nuxt 项目缓存...");
  colorLog("magenta", `📁 项目目录: ${rootDir}`);

  let clearedCount = 0;

  // 清理缓存目录
  colorLog("blue", "\n📂 清理缓存目录...");
  for (const path of CACHE_PATHS) {
    if (path.includes("*")) {
      // 处理 glob 模式
      const count = await clearGlobPattern(path);
      clearedCount += count;
    } else {
      const cleared = await clearPath(path);
      if (cleared) clearedCount++;
    }
  }

  // 清理包管理器缓存
  await clearPackageManagerCache();

  // 清理 Node.js require 缓存（如果在 Node.js 环境中运行）
  if (typeof require !== "undefined" && require.cache) {
    colorLog("blue", "\n🔄 清理 Node.js require 缓存...");
    Object.keys(require.cache).forEach((key) => {
      delete require.cache[key];
    });
    colorLog("green", "✓ Node.js require 缓存已清理");
  }

  colorLog(
    "cyan",
    `\n🎉 缓存清理完成! 共清理了 ${clearedCount} 个项目`
  );
  colorLog("yellow", "\n💡 提示:");
  colorLog(
    "yellow",
    "  - 如果问题仍然存在，请尝试重启开发服务器"
  );
  colorLog(
    "yellow",
    "  - 可能需要清理浏览器缓存 (Ctrl+Shift+R 或 Cmd+Shift+R)"
  );
  colorLog(
    "yellow",
    "  - 对于持续的缓存问题，考虑删除 node_modules 并重新安装"
  );
}

// 错误处理
process.on("uncaughtException", (error) => {
  colorLog("red", `❌ 未捕获的错误: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  colorLog("red", `❌ 未处理的 Promise 拒绝: ${reason}`);
  process.exit(1);
});

// 运行脚本
main().catch((error) => {
  colorLog("red", `❌ 脚本执行失败: ${error.message}`);
  process.exit(1);
});
