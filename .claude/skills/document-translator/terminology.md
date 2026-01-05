# Onerway 文档专业术语表

本术语表用于 Onerway 双语文档翻译，确保术语使用的一致性和专业性。

## 使用方式
- 翻译前先查此表；缺少的术语先补充再翻译。
- “保持英文/翻译”策略优先级高于个人习惯，保持全文一致。
- 首次出现可加注释，后续保持简洁。

## 使用原则

1. **保持英文的术语**：技术通用术语、品牌名、已成为行业标准的缩写
2. **翻译的术语**：业务概念、用户界面、流程描述
3. **首次出现规则**：保持英文的术语在中文文档中首次出现时可加注释，如 `API（应用程序接口）`

---

## 一、保持英文（技术术语）

### 通用技术术语
  - API
  - REST API
  - GraphQL API
  - webhook
  - callback
  - OAuth
  - JWT
  - token
  - JSON
  - XML
  - YAML
  - HTTP
  - HTTPS
  - URL
  - URI
  - SDK
  - CLI

### 开发工具和技术栈
  - Git
  - GitHub
  - npm
  - pnpm
  - yarn
  - Node.js
  - TypeScript
  - JavaScript
  - Vue.js
  - Nuxt
  - Nuxt Content
  - Nuxt UI
  - React
  - Docker
  - Kubernetes

### 数据库和缓存
  - MongoDB
  - PostgreSQL
  - MySQL
  - Redis
  - Elasticsearch

### 前端技术
  - HTML
  - CSS
  - Markdown
  - MDC (Markdown Components)
  - SSR (Server-Side Rendering)
  - CSR (Client-Side Rendering)
  - SSG (Static Site Generation)

---

## 二、需要翻译的术语

### 身份验证和授权
| English | 中文 | 备注 |
|---------|------|------|
| Authentication | 身份验证 | |
| Authorization | 授权 | |
| Login | 登录 | |
| Logout | 登出 | |
| Sign in | 登录 | |
| Sign up | 注册 | |
| Sign out | 登出 | |
| Password | 密码 | |
| Username | 用户名 | |
| Email | 邮箱 | |
| Two-factor authentication | 双因素认证 | 可简写为 2FA |
| Access control | 访问控制 | |
| Permission | 权限 | |
| Role | 角色 | |
| Session | 会话 | |
| Checkout Session | 收银台会话 | Onerway 托管支付页面的会话对象 |
| Credential | 凭证 | |

### 支付和交易
| English | 中文 | 备注 |
|---------|------|------|
| Payment | 支付 | |
| Payment Gateway | 支付网关 | |
| Transaction | 交易 | |
| Order | 订单 | |
| Invoice | 发票 | |
| Receipt | 收据 | |
| Refund | 退款 | |
| Capture | 扣款 | 预授权场景下使用，不翻译为"捕获" |
| Chargeback | 拒付 | |
| Payout | 打款/转账 | 商户收款场景用"打款"，资金转移场景用"转账" |
| Balance | 余额 | |
| Amount | 金额 | |
| Currency | 币种 | |
| Exchange rate | 汇率 | |
| Fee | 费用 | |
| Commission | 佣金 | |
| Settlement | 结算 | |
| Recurring payment | 循环支付 | |
| Subscription | 订阅 | |

### 商户和客户
| English | 中文 | 备注 |
|---------|------|------|
| Merchant | 商户 | |
| Customer | 客户 | |
| User | 用户 | |
| Account | 账户 | |
| Profile | 个人资料 | |
| Dashboard | 控制台/仪表板 | 根据上下文选择 |
| Billing | 账单 | |
| Shipping | 配送 | |
| Address | 地址 | |

### 数据和 API
| English | 中文 | 备注 |
|---------|------|------|
| Request | 请求 | |
| Response | 响应 | |
| Endpoint | 端点 | |
| Parameter | 参数 | |
| Query parameter | 查询参数 | |
| Path parameter | 路径参数 | |
| Header | 请求头/响应头 | 根据上下文 |
| Body | 请求体/响应体 | 根据上下文 |
| Payload | 载荷 | |
| Metadata | 元数据 | |
| Field | 字段 | |
| Attribute | 属性 | |
| Property | 属性 | |
| Key | 键 | |
| Value | 值 | |
| Format | 格式 | |
| Schema | 模式 | |
| Validation | 验证 | |
| Error | 错误 | |
| Exception | 异常 | |
| Status code | 状态码 | |

### 数据类型
| English | 中文 | 备注 |
|---------|------|------|
| String | 字符串 | |
| Integer | 整数 | |
| Float | 浮点数 | |
| Boolean | 布尔值 | |
| Array | 数组 | |
| Object | 对象 | |
| Null | 空值 | |
| Undefined | 未定义 | |
| Date | 日期 | |
| Timestamp | 时间戳 | |
| Enum | 枚举 | |

### 环境和配置
| English | 中文 | 备注 |
|---------|------|------|
| Environment | 环境 | |
| Production | 生产环境 | |
| Development | 开发环境 | |
| Staging | 预发布环境 | |
| Sandbox | 沙盒环境 | |
| Test | 测试 | |
| Debug | 调试 | |
| Configuration | 配置 | |
| Settings | 设置 | |
| Option | 选项 | |
| Default | 默认 | |

### 状态和操作
| English | 中文 | 备注 |
|---------|------|------|
| Status | 状态 | |
| Active | 活跃/激活 | 根据上下文 |
| Inactive | 未激活 | |
| Pending | 待处理 | |
| Processing | 处理中 | |
| Completed | 已完成 | |
| Failed | 失败 | |
| Cancelled | 已取消 | |
| Expired | 已过期 | |
| Create | 创建 | |
| Read | 读取 | |
| Update | 更新 | |
| Delete | 删除 | |
| Retrieve | 获取 | |
| List | 列出/列表 | 根据上下文 |
| Search | 搜索 | |
| Filter | 筛选 | |
| Sort | 排序 | |
| Paginate | 分页 | |

### 通用概念
| English | 中文 | 备注 |
|---------|------|------|
| Required | 必需 | |
| Optional | 可选 | |
| Deprecated | 已弃用 | |
| Legacy | 旧版 | |
| Version | 版本 | |
| Release | 发布 | |
| Update | 更新 | |
| Upgrade | 升级 | |
| Migration | 迁移 | |
| Integration | 集成 | |
| Plugin | 插件 | |
| Extension | 扩展 | |
| Module | 模块 | |
| Component | 组件 | |
| Service | 服务 | |
| Feature | 功能 | |
| Functionality | 功能性 | |
| Capability | 能力 | |
| Limitation | 限制 | |
| Constraint | 约束 | |
| Prerequisite | 先决条件 | |
| Requirement | 要求 | |
| Specification | 规范 | |
| Standard | 标准 | |
| Best practice | 最佳实践 | |
| Example | 示例 | |
| Demo | 演示 | |
| Tutorial | 教程 | |
| Guide | 指南 | |
| Documentation | 文档 | |
| Reference | 参考 | |

---

## 三、品牌和产品（保持原文）

### Onerway 相关
  - Onerway
  - Onerway API
  - Onerway Dashboard
  - Onerway Checkout
  - Onerway Elements

### 第三方品牌
  - Stripe
  - PayPal
  - Visa
  - Mastercard
  - American Express
  - Alipay
  - WeChat Pay

### 技术品牌
  - Apple
  - Google
  - Microsoft
  - Amazon
  - Cloudflare
  - Vercel
  - Netlify

---

## 四、特殊场景说明

### 1. 上下文相关翻译

某些术语的翻译需要根据上下文决定：

- **Dashboard**
  - 商户后台界面 → "控制台" 或 "商户后台"
  - 数据展示面板 → "仪表板"

- **List**
  - 动词：列出、获取列表
  - 名词：列表

- **Active**
  - 用户状态 → "活跃"
  - 开关状态 → "激活"

### 2. 缩写处理

首次出现时提供完整说明：

```markdown
<!-- 中文文档 -->
使用 API（Application Programming Interface，应用程序接口）...
使用 2FA（Two-Factor Authentication，双因素认证）...

<!-- 后续出现 -->
调用 API 时...
启用 2FA 后...
```

### 3. 复合词翻译

优先使用简洁的中文表达：

- ❌ "API 的端点" → ✅ "API 端点"
- ❌ "支付的网关" → ✅ "支付网关"
- ❌ "订单的状态" → ✅ "订单状态"

---

## 五、术语表维护指南

### 添加新术语

  当遇到新的专业术语时，请按以下步骤添加：

  1. **确定分类**：技术术语/业务术语/品牌名
  2. **确定翻译策略**：保持英文/翻译为中文
  3. **添加到对应表格**：包含英文、中文、备注
  4. **提交 commit**：说明添加的术语和原因

### 修改现有术语

  如需修改已有术语翻译：

  1. **确认影响范围**：搜索项目中的使用情况
  2. **更新术语表**：修改对应条目
  3. **更新所有文档**：确保一致性
  4. **提交 commit**：说明修改原因

---

## 六、快速查询索引

### 最常用术语（Top 20）

1. API → API（保持）
2. Payment → 支付
3. Order → 订单
4. Authentication → 身份验证
5. webhook → webhook（保持）
6. Request → 请求
7. Response → 响应
8. Merchant → 商户
9. Customer → 客户
10. Transaction → 交易
11. Refund → 退款
12. Endpoint → 端点
13. Parameter → 参数
14. token → token（保持）
15. Metadata → 元数据
16. Status → 状态
17. Required → 必需
18. Optional → 可选
19. Dashboard → 控制台/仪表板
20. Integration → 集成

---

  **最后更新**: 2025-12-23
  **维护者**: Onerway 文档团队
