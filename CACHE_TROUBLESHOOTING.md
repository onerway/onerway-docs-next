# 缓存问题故障排除指南

## 🚨 常见缓存问题

如果您遇到以下情况，通常是缓存问题导致的：

- ✅ 代码修改后页面没有更新
- ✅ 内容文件修改后没有生效
- ✅ 翻译文件更新后没有反映
- ✅ 组件样式修改后没有应用
- ✅ 路由变化后出现 404 错误
- ✅ 数据内容显示过期信息
- ✅ 需要重启服务器才能看到改变

## 🛠️ 解决方案

### 1. 快速清理缓存 (推荐)

```bash
# 清理所有缓存
pnpm run clear-cache

# 清理缓存并启动开发服务器
pnpm run dev:fresh

# 清理缓存并构建
pnpm run build:fresh
```

### 2. 手动清理特定缓存

#### 清理 Nuxt 缓存
```bash
rm -rf .nuxt .output
```

#### 清理内容缓存 (@nuxt/content)
```bash
rm -rf .nuxt/content-cache .nuxt/content
rm -f *.db *.sqlite *.sqlite3
```

#### 清理 Node.js 缓存
```bash
rm -rf node_modules/.cache node_modules/.vite
```

#### 清理包管理器缓存
```bash
# pnpm
pnpm store prune

# npm
npm cache clean --force

# yarn
yarn cache clean
```

### 3. 浏览器缓存

#### 清理浏览器缓存
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)
- **Safari**: `Cmd+Option+R` (Mac)

#### 开发者工具设置
1. 打开开发者工具 (F12)
2. 右键刷新按钮
3. 选择 "清空缓存并硬性重新加载"

### 4. 完全重置 (终极方案)

```bash
# 删除所有缓存和依赖
rm -rf node_modules .nuxt .output *.db *.sqlite
pnpm install
pnpm run dev
```

## ⚙️ 开发环境配置优化

本项目已经配置了开发环境缓存优化：

### 自动缓存控制
- **HTTP 缓存头**: 开发环境禁用所有 HTTP 缓存
- **内容缓存**: 开发环境禁用 SQLite 数据库缓存
- **Vite 缓存**: 开发环境强制重新优化依赖
- **Nitro 缓存**: 开发环境使用内存存储

### 相关配置文件
- `nuxt.config.ts` - 主要缓存配置
- `scripts/clear-cache.js` - 自动缓存清理脚本

## 🔍 诊断缓存问题

### 检查缓存文件
```bash
# 查看哪些缓存文件存在
ls -la .nuxt/
ls -la node_modules/.cache/
ls -la *.db *.sqlite

# 检查缓存文件大小
du -sh .nuxt node_modules/.cache
```

### 开发服务器日志
启动开发服务器时注意观察日志：
```bash
pnpm run dev
```

查找以下关键信息：
- `[content]` 内容缓存相关消息
- `[vite]` 依赖预构建信息
- `[nuxt]` 路由和组件热重载信息

## 🚀 预防缓存问题

### 1. 使用版本化资源
```vue
<!-- 为关键资源添加版本参数 -->
<img src="/image.jpg?v=1.0.0" alt="图片">
```

### 2. 开发时使用无缓存模式
```bash
# 始终使用清理缓存的开发模式
pnpm run dev:fresh
```

### 3. 定期清理缓存
建议每天开始开发前运行：
```bash
pnpm run clear-cache
```

## 🆘 仍然有问题？

如果上述方法都无法解决问题，请尝试：

1. **检查环境变量**
```bash
echo $NODE_ENV
```

2. **验证 Node.js 版本**
```bash
node --version
npm --version
```

3. **重新安装依赖**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

4. **检查磁盘空间**
```bash
df -h
```

5. **查看详细错误日志**
```bash
DEBUG=nuxt:* pnpm run dev
```

## 📞 获取帮助

如果问题持续存在：
- 📋 检查 Nuxt.js 官方文档
- 🐛 在项目仓库创建 issue
- 💬 在开发团队群组询问
- 📖 查看 Nuxt 4.x 更新日志

---
  *最后更新: 2024年*
