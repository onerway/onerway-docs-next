---
title: 环境配置
description: 设置开发环境的详细指南
order: 3
showToc: true
showNavigation: true
---

# 环境配置

正确配置您的开发环境，以确保与 Onerway 支付平台的顺利集成。

## 环境变量

### 必需变量

在您的应用程序中设置这些环境变量：

```bash
# API 凭证
ONERWAY_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
ONERWAY_SECRET_KEY=sk_test_your_secret_key_here

# Webhook 配置
ONERWAY_WEBHOOK_SECRET=whsec_your_webhook_secret_here
ONERWAY_WEBHOOK_URL=https://yourdomain.com/webhook

# 应用程序设置
NODE_ENV=development
PORT=3000
```

### 可选变量

```bash
# 日志记录
LOG_LEVEL=debug

# 数据库（如果使用）
DATABASE_URL=postgresql://user:pass@localhost:5432/your_db

# SSL 配置（用于生产环境）
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## 框架特定设置

### Node.js 与 Express

```javascript
// app.js
require("dotenv").config();
const express = require("express");
const onerway = require("@onerway/onerway-js")(
  process.env.ONERWAY_SECRET_KEY
);

const app = express();

// 中间件
app.use(express.json());

// 支付端点
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent =
      await onerway.paymentIntents.create({
        amount,
        currency,
        description: "来自您应用的支付",
      });

    res.json({
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000);
```

### React.js 前端

```javascript
// PaymentForm.jsx
import { useState } from "react";
import { loadOnerway } from "@onerway/onerway-js";

const onerway = loadOnerway(
  process.env.REACT_APP_ONERWAY_PUBLISHABLE_KEY
);

function PaymentForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // 在您的服务器上创建支付意图
      const response = await fetch("/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1000,
          currency: "usd",
        }),
      });

      const { client_secret } = await response.json();

      // 使用 Onerway 确认支付
      const result = await onerway.confirmPayment({
        elements, // 您的支付元素
        confirmParams: {
          return_url: "https://yoursite.com/success",
        },
      });

      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error("支付失败：", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 支付表单元素 */}
      <button disabled={loading}>
        {loading ? "处理中..." : "立即支付"}
      </button>
    </form>
  );
}
```

### Python 与 Flask

```python
# app.py
import os
from flask import Flask, request, jsonify
import onerway

app = Flask(__name__)
onerway.api_key = os.environ['ONERWAY_SECRET_KEY']

@app.route('/create-payment', methods=['POST'])
def create_payment():
    try:
        data = request.get_json()

        payment_intent = onerway.PaymentIntent.create(
            amount=data['amount'],
            currency=data['currency'],
            description='来自 Flask 应用的支付'
        )

        return jsonify({'client_secret': payment_intent.client_secret})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=os.environ.get('PORT', 3000))
```

### PHP 与 Laravel

```php
<?php
// config/services.php
return [
    'onerway' => [
        'secret' => env('ONERWAY_SECRET_KEY'),
        'public' => env('ONERWAY_PUBLISHABLE_KEY'),
    ],
];

// app/Http/Controllers/PaymentController.php
use Onerway\Onerway;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        Onerway::setApiKey(config('services.onerway.secret'));

        try {
            $paymentIntent = \Onerway\PaymentIntent::create([
                'amount' => $request->amount,
                'currency' => $request->currency,
                'description' => '来自 Laravel 应用的支付',
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
```

## 开发环境 vs 生产环境

### 测试模式配置

```javascript
// 开发环境
const onerway = require("@onerway/onerway-js")(
  process.env.NODE_ENV === "production"
    ? process.env.ONERWAY_LIVE_SECRET_KEY
    : process.env.ONERWAY_TEST_SECRET_KEY
);
```

### 生产环境清单

上线前：

- [ ] 将测试 API 密钥替换为生产密钥
- [ ] 在所有端点上启用 HTTPS
- [ ] 设置适当的错误日志记录
- [ ] 配置 webhook 端点
- [ ] 使用真实支付方式进行测试
- [ ] 设置监控和警报

## Docker 配置

### Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - ONERWAY_SECRET_KEY=${ONERWAY_SECRET_KEY}
      - ONERWAY_PUBLISHABLE_KEY=${ONERWAY_PUBLISHABLE_KEY}
    volumes:
      - .:/app
      - /app/node_modules
```

## 下一步

环境配置完成？太好了！现在了解：

- [安全最佳实践](./mock/security) - 保护您的集成
- [进行首次支付](./mock/first-payment) - 处理测试支付
