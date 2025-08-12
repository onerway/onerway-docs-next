---
title: Overview
description:
  Get your development environment ready for Onerway
  integration
order: 1
showToc: true
showNavigation: true
---

## Prerequisites

Before you begin, ensure you have:

- [ ] **API Credentials** - Sign up for a developer account
- [ ] **Development Environment** - Your preferred
      programming language
- [ ] **HTTPS Support** - Required for webhook endpoints
- [ ] **Basic Knowledge** - Understanding of REST APIs and
      HTTP

## Setup Steps

### 1. Create Your Account

1. Visit the
   [Onerway Developer Portal](https://developers.onerway.com)
2. Sign up for a free developer account
3. Verify your email address
4. Complete your profile information

### 2. Get Your API Keys

1. Navigate to the **API Keys** section
2. Generate your **Test Mode** credentials:
   - **Publishable Key** - Used in your frontend code
   - **Secret Key** - Used in your backend code (keep
     secure!)
3. Save these keys securely

### 3. Environment Configuration

#### For Web Applications

```javascript
// Example environment variables
ONERWAY_PUBLISHABLE_KEY = pk_test_your_key_here;
ONERWAY_SECRET_KEY = sk_test_your_secret_key_here;
ONERWAY_WEBHOOK_SECRET = whsec_your_webhook_secret;
```

#### For Mobile Applications

```javascript
// iOS (Swift)
let publishableKey = "pk_test_your_key_here"

// Android (Kotlin)
val publishableKey = "pk_test_your_key_here"
```

### 4. Install SDK (Optional)

Choose your preferred integration method:

#### JavaScript/Node.js

```bash
npm install @onerway/onerway-js
```

#### Python

```bash
pip install onerway
```

#### PHP

```bash
composer require onerway/onerway-php
```

#### Mobile SDKs

- [iOS SDK Documentation](../../../payments/mobile/ios)
- [Android SDK Documentation](../../../payments/mobile/android)

## Quick Test

Let's make your first API call to verify everything is
working:

```javascript
const onerway = require("@onerway/onerway-js")(
  "sk_test_..."
);

// Create a simple payment intent
async function createPayment() {
  try {
    const paymentIntent =
      await onerway.paymentIntents.create({
        amount: 1000, // $10.00 in cents
        currency: "usd",
        description: "Test payment",
      });

    console.log("Success!", paymentIntent.id);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

createPayment();
```

## What's Next?

Now that you have everything set up:

1. 📖 [Read the API Overview](./api-overview) - Understand
   our API structure
2. 🔧 [Environment Configuration](./environment-config) -
   Detailed environment setup
3. 🔒 [Security Best Practices](./security) - Keep your
   integration secure
4. 🚀 [Make Your First Payment](./first-payment) - Process a
   real payment

## Need Help?

- 📚 [API Documentation](../../../payments/) - Complete API
  reference
- 💬 [Developer Support](mailto:dev-support@onerway.com) -
  Get technical help
- 🐛 [Report Issues](https://github.com/onerway/issues) -
  Bug reports and feature requests

Ready to dive deeper? Continue to
[API Overview](./api-overview).
