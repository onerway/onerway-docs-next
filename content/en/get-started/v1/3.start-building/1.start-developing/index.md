---
title: Overview
description:
  Begin your journey with Onerway development tools and get
  your first integration running
order: 1
showToc: true
showNavigation: true
---

## Get Started with Development

Ready to build with Onerway? This guide will help you set up
your development environment and create your first
integration.

## Prerequisites

Before you start developing, make sure you have:

- [ ] **Onerway Account** -
      [Create an account](../set-up-onerway/create-an-account)
      if you haven't already
- [ ] **API Keys** - Retrieved from your developer dashboard
- [ ] **Development Environment** - Your preferred IDE and
      programming language
- [ ] **Basic HTTP Knowledge** - Understanding of REST APIs
      and JSON

## Choose Your Development Path

### Quick Start Options

#### 🚀 **Express Integration**

Perfect for getting started quickly with minimal setup.

```javascript
// Install the Onerway SDK
npm install @onerway/onerway-js

// Basic payment setup
const onerway = require('@onerway/onerway-js')('sk_test_...');

const payment = await onerway.paymentIntents.create({
  amount: 2000,
  currency: 'usd'
});
```

#### 🔧 **Custom Integration**

Build a tailored solution using our REST APIs directly.

```bash
curl -X POST https://api.onerway.com/v1/payment_intents \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 2000, "currency": "usd"}'
```

## Development Workflow

### 1. Setup Your Project

Choose your preferred language and framework:

::code-group

```javascript [Node.js]
mkdir my-onerway-app
cd my-onerway-app
npm init -y
npm install @onerway/onerway-js express
```

```python [Python]
mkdir my-onerway-app
cd my-onerway-app
pip install onerway flask
```

```php [PHP]
composer require onerway/onerway-php
```

::

### 2. Configure Environment

Create your environment configuration:

```bash
# .env file
ONERWAY_SECRET_KEY=sk_test_your_secret_key
ONERWAY_PUBLISHABLE_KEY=pk_test_your_publishable_key
ONERWAY_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Create Your First Payment

::code-group

```javascript [Node.js]
const express = require("express");
const onerway = require("@onerway/onerway-js")(
  process.env.ONERWAY_SECRET_KEY
);

const app = express();
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent =
      await onerway.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(3000, () =>
  console.log("Server running on port 3000")
);
```

```python [Python]
import onerway
from flask import Flask, request, jsonify

app = Flask(__name__)
onerway.api_key = "sk_test_..."

@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        data = request.get_json()

        intent = onerway.PaymentIntent.create(
            amount=data['amount'],
            currency=data['currency'],
            automatic_payment_methods={
                'enabled': True,
            },
        )

        return jsonify({
            'client_secret': intent.client_secret,
        })
    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(debug=True)
```

::

### 4. Test Your Integration

Use Onerway's test mode to verify your implementation:

```javascript
// Test with sample data
const testPayment = {
  amount: 1000, // $10.00
  currency: "usd",
};

// Use test card numbers
const testCards = {
  visa: "4242424242424242",
  mastercard: "5555555555554444",
  amex: "378282246310005",
};
```

## Development Tools

### **Onerway CLI** (Coming Soon)

Command-line tools for rapid development and testing.

### **Webhook Testing**

Use tools like ngrok to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the HTTPS URL in your webhook settings
```

### **API Explorer**

Test API endpoints directly in your browser:

- [Payments API Explorer](../../../payments/api-reference)
- [Transfers API Explorer](../../../transfers/api-reference)

## Common Development Patterns

### Error Handling

```javascript
try {
  const payment =
    await onerway.paymentIntents.create(paymentData);
  // Handle success
} catch (error) {
  switch (error.type) {
    case "card_error":
      // Handle card-related errors
      break;
    case "rate_limit_error":
      // Handle rate limiting
      break;
    case "api_error":
      // Handle API errors
      break;
    default:
      // Handle other errors
      break;
  }
}
```

### Webhook Verification

```javascript
const express = require("express");
const onerway = require("@onerway/onerway-js");

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["onerway-signature"];
    let event;

    try {
      event = onerway.webhooks.constructEvent(
        req.body,
        sig,
        process.env.ONERWAY_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(
        `Webhook signature verification failed.`,
        err.message
      );
      return res
        .status(400)
        .send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        // Handle successful payment
        break;
      case "payment_intent.payment_failed":
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);
```

## Next Steps

Now that you've started developing:

1. 🔍 [Learn About the APIs](../about-the-apis) - Understand
   our API architecture
2. 🤖 [Build with an LLM](../build-with-llm) - AI-powered
   development
3. 🎯 [Use Without Code](../use-stripe-without-code) -
   No-code solutions
4. 📚 [Explore Payment Methods](../../../payments/) - Accept
   various payment types

## Need Help?

- 📖 [API Documentation](../../../payments/) - Complete
  reference
- 💬 [Developer Community](https://community.onerway.com) -
  Connect with other developers
- 🐛 [GitHub Issues](https://github.com/onerway/issues) -
  Report bugs or request features
- 📧 [Developer Support](mailto:dev-support@onerway.com) -
  Direct technical support

Ready to dive deeper? Continue to
[About the APIs](../about-the-apis).
