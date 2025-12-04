---
title: 概览
description: 使用无代码与低代码方案接受支付并管理交易
order: 4
showToc: true
showNavigation: true
---

## 无代码支付方案

无需编写任何代码即可开始接受支付。
Onerway 提供多种无代码方案，帮助你快速、轻松地将支付集成到业务中。

## 快速无代码选项

### **🔗 支付链接（Payment Links）**

几分钟即可生成可分享的支付链接。

#### **创建你的首个支付链接**

1. **登录 Onerway 控制台**
2. **进入 Payment Links**
3. **点击 “Create Payment Link”**
4. **配置支付：**
  - 产品/服务名称
  - 金额（或允许自定义金额）
  - 货币
  - 描述
5. **外观自定义：**
  - Logo 与品牌
  - 颜色与样式
  - 感谢页
6. **分享链接** 到邮箱、社媒或你的网站

#### **支付链接特性**

- ✅ 无需编码
- ✅ 移动端优化结账
- ✅ 多种支付方式
- ✅ 自动回执
- ✅ 实时通知
- ✅ 可定制品牌

**示例支付链接：**

```
https://buy.onerway.com/your-payment-link-id
```

### **📧 发票与账单**

发送可在线支付的专业发票。

#### **创建智能发票**

1. **前往控制台的 Invoices**
2. **创建新发票**
3. **填写客户信息**
4. **添加明细与价格**
5. **设置支付条款与到期日**
6. **通过 Email 或短信发送**

#### **发票自动化**

- 🔄 周期性发票
- ⏰ 自动提醒
- 📊 支付跟踪
- 💳 一键支付
- 📄 PDF 导出

### **🛒 结账页**

托管式结账页，可自定义并嵌入。

```html
<!-- Embed checkout button -->
<button
  onclick="window.open('https://checkout.onerway.com/your-checkout-id')">
  Buy Now - $29.99
</button>
```

## 电商平台集成

### **🏪 Shopify 集成**

几分钟将 Onerway 接入你的 Shopify 商店。

#### **配置步骤：**

1. **从 Shopify 应用商店安装 Onerway 应用**
2. **连接你的 Onerway 账户**
3. **配置支付方式**
4. **测试交易**
5. **上线！**

#### **特性：**

- 无缝结账体验
- 库存同步
- 订单管理
- 自动履约
- 多币种支持

### **🎨 WooCommerce 插件**

WordPress/WooCommerce 集成。

```bash
# Install via WordPress admin or upload plugin
wp plugin install onerway-payments
wp plugin activate onerway-payments
```

#### **配置：**

1. **前往 WooCommerce → Settings → Payments**
2. **启用 Onerway Payments**
3. **填写你的 API 密钥**
4. **配置支付方式**
5. **保存并测试**

### **🔧 Magento 扩展**

面向企业的 Magento 集成。

### **📱 移动电商**

- **Square 集成**
- **Shopify POS**
- **移动支付方案**

## 网站搭建与 CMS

### **📝 WordPress**

WordPress 站点的多种集成选项。

#### **Onerway WordPress 插件**

```php
// Shortcode for payment button
[onerway-payment amount="29.99" description="Premium Course"]

// Membership integration
[onerway-membership plan="monthly"]
```

#### **块编辑器支持**

为 Gutenberg 编辑器提供拖拽式支付区块。

### **⚡ Webflow**

在 Webflow 站点中嵌入支付表单。

```html
<!-- Custom embed code -->
<div
  id="onerway-payment"
  data-amount="2999"
  data-currency="usd"
  data-description="Design Service">
</div>
<script src="https://js.onerway.com/v3/"></script>
```

### **🎯 Squarespace**

支持代码注入。

### **📐 Wix**

应用市场集成。

## 自动化平台

### **⚡ Zapier 集成**

将 Onerway 连接到 5,000+ 应用。

#### **常见工作流：**

- **新支付 → 加入 Google 表格**
- **失败支付 → 发送 Slack 通知**
- **创建订阅 → 加入 Mailchimp**
- **处理退款 → 更新 CRM**

#### **示例配置：**

```yaml
Trigger: New Onerway Payment
Action: Create Google Sheets Row
Fields:
  - Customer Email
  - Amount
  - Payment Method
  - Transaction ID
  - Date
```

### **🔄 Make（原 Integromat）**

可视化构建复杂自动化流程。

### **📊 Microsoft Power Automate**

与 Office 365 深度集成的企业自动化。

## 表单构建器

### **📋 Typeform 集成**

在表单中直接收款。

```javascript
// Embed Onerway checkout after form submission
typeformEmbed.makeWidget({
  url: "https://your-form.typeform.com/to/abc123",
  onSubmit: function () {
    // Redirect to Onerway checkout
    window.location = "https://checkout.onerway.com/xyz789";
  },
});
```

### **📝 Google Forms + Onerway**

使用 Zapier 将 Google Forms 与收款串联。

### **🔧 Gravity Forms**

WordPress 表单构建与支付集成。

## 订阅管理

### **📅 无代码订阅搭建**

#### **控制台配置：**

1. **创建产品目录**
  - 定义订阅计划
  - 设置价格梯度
  - 配置试用期

2. **客户门户**
  - 自助取消
  - 套餐升级/降级
  - 账单历史
  - 支付方式更新

3. **自动化规则**
  - 催收管理
  - 降低流失
  - 升级提示
  - 取消调研

#### **订阅链接示例：**

```
https://subscribe.onerway.com/premium-monthly
```

## 移动方案

### **📱 移动端支付 App**

- **Onerway Mobile POS** —— 移动端受理
- **二维码支付** —— 生成二维码收款
- **短信支付链接** —— 通过短信发送支付请求

### **💳 轻触支付（Tap to Pay）**

在支持的设备上受理非接触式支付。

## 高级无代码能力

### **🎨 可定制结账**

无需编码即可定制你的结账体验。

#### **可定制项：**

- Logo 与主题色
- 自定义 CSS（可选）
- 感谢页
- 邮件模板
- 回执格式

### **📊 分析仪表盘**

无需技术配置即可查看业务指标。

#### **内置报表：**

- 收入跟踪
- 支付方式分析
- 地区分布
- 流失分析
- 增长指标

### **🔔 通知与提醒**

为关键事件设置自动通知。

#### **通知类型：**

- 新支付
- 支付失败
- 订阅事件
- 欺诈告警
- 系统更新

#### **投递方式：**

- 邮件通知
- 短信提醒
- Slack 集成
- Webhook 通知
- 控制台通知

## 无代码测试

### **🧪 测试模式控制台**

无需写代码的完整测试环境。

#### **测试场景：**

- 成功支付
- 拒绝支付
- 网络错误
- 订阅事件
- 退款处理

#### **测试卡：**

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
Declined: 4000 0000 0000 0002
```

## 客服工具

### **💬 帮助中心集成**

- 内嵌知识库
- 带支付支持的聊天组件
- 工单系统集成

### **📞 电话支持**

无需技术集成即可开通电话收款。

## 合规与安全

### **🔒 无代码安全**

所有无代码方案均包含：

- PCI DSS 合规
- 数据加密
- 反欺诈
- 3D Secure 认证
- GDPR 合规工具

### **📋 合规仪表盘**

无需技术背景也能监控合规状态。

## 迁移工具

### **🔄 数据导入**

从其他支付服务商迁移，无需写代码。

#### **支持导入：**

- 客户数据
- 支付方式
- 交易历史
- 订阅数据

#### **迁移向导：**

1. 上传 CSV 文件
2. 字段映射
3. 校验导入
4. 完成迁移
5. 通知客户

## 入门清单

### **✅ 设置清单**

- [ ] 创建 Onerway 账户
- [ ] 完成商户认证
- [ ] 配置税务设置
- [ ] 绑定收款账户
- [ ] 创建首个支付链接
- [ ] 使用示例支付测试
- [ ] 配置通知
- [ ] 检查安全设置

### **📈 增长功能**

- [ ] 配置分析追踪
- [ ] 配置客户门户
- [ ] 启用订阅选项
- [ ] 添加加购/升级项
- [ ] 配置拉新与推荐

## 限制与注意事项

### **🚧 何时需要写代码**

- 复杂业务逻辑
- 自定义集成
- 高级报表
- 多租户应用
- 复杂工作流

### **💡 混合路径**

从无代码起步，按需增加自定义代码：

1. 从支付链接/结账开始
2. 加入 Webhook 通知
3. 与现有系统集成
4. 构建自定义功能

## 下一步

准备开始接受支付了吗？

1. 🚀 [创建支付链接](https://dashboard.onerway.com/payment-links) —— 立即开始
2. 🛒 [电商集成](https://apps.onerway.com) —— 连接你的商店
3. ⚡ [Zapier 自动化](https://zapier.com/apps/onerway) —— 自动化工作流
4. 📚 [开发者文档](../../../payments/) —— 准备写代码时查看

需要更高级的功能？

1. 🔧 [开始开发](../start-developing) —— 自定义集成
2. 🔍 [关于 API](../mock/about-the-apis) —— 技术总览
3. 🤖 [AI 辅助构建](../mock/build-with-llm) —— AI 助力开发

## 支持资源

- 📖 [无代码指南](../../../guides/no-code) —— 全面教程
- 💬 [社区论坛](https://community.onerway.com/no-code) —— 互助交流
- 🎥 [视频教程](https://www.youtube.com/onerway-nocode) —— 步步详解
- 📧 [商务支持](mailto:business@onerway.com) —— 非技术支持

马上开始，无需写代码！


