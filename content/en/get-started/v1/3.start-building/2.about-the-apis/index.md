---
title: Overview
description: Learn about Onerway's API architecture, design principles, and how to effectively use our REST APIs
order: 2
showToc: true
showNavigation: true
---

## API Overview

Onerway's APIs are designed with simplicity, security, and
scalability in mind. Our REST APIs use predictable URLs,
accept JSON requests, return JSON responses, and use
standard HTTP response codes.

## Core API Principles

### **RESTful Design**

- Clear, resource-based URLs
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response formats
- Proper HTTP status codes

### **Developer-Friendly**

- Comprehensive documentation with examples
- SDKs for popular programming languages
- Interactive API explorer
- Detailed error messages

### **Security First**

- TLS encryption for all communications
- API key authentication
- Webhook signature verification
- PCI DSS compliance

## API Architecture

### Base URL

All API requests are made to:

```
https://api.onerway.com/v1/
```

### Authentication

Authenticate using your secret API key in the Authorization
header:

```bash
curl -H "Authorization: Bearer sk_test_..." \
  https://api.onerway.com/v1/payment_intents
```

### Request Format

Send requests with JSON payloads:

```javascript
const response = await fetch(
  "https://api.onerway.com/v1/payment_intents",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer sk_test_...",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 2000,
      currency: "usd",
    }),
  }
);
```

## Core API Resources

### **Payment Intents**

Create and manage payment transactions.

```javascript
// Create a payment intent
POST /v1/payment_intents
{
  "amount": 2000,
  "currency": "usd",
  "payment_method_types": ["card"]
}

// Retrieve a payment intent
GET /v1/payment_intents/pi_1234567890
```

### **Payment Methods**

Store and manage customer payment information.

```javascript
// Create a payment method
POST /v1/payment_methods
{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123"
  }
}
```

### **Customers**

Manage customer information and relationships.

```javascript
// Create a customer
POST /v1/customers
{
  "email": "customer@example.com",
  "name": "John Doe"
}

// List customer payment methods
GET /v1/customers/cus_1234567890/payment_methods
```

### **Transfers**

Move money between accounts and external destinations.

```javascript
// Create a transfer
POST /v1/transfers
{
  "amount": 1000,
  "currency": "usd",
  "destination": "acct_1234567890"
}
```

## API Design Patterns

### **Idempotency**

Safely retry requests using idempotency keys:

```javascript
const response = await fetch(
  "https://api.onerway.com/v1/payment_intents",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer sk_test_...",
      "Content-Type": "application/json",
      "Idempotency-Key": "unique-key-123",
    },
    body: JSON.stringify(paymentData),
  }
);
```

### **Pagination**

Navigate through large result sets:

```javascript
// Request with pagination
GET /v1/payment_intents?limit=10&starting_after=pi_1234567890

// Response includes pagination info
{
  "object": "list",
  "data": [...],
  "has_more": true,
  "url": "/v1/payment_intents"
}
```

### **Filtering & Sorting**

Filter and sort resources:

```javascript
// Filter by date range and status
GET /v1/payment_intents?created[gte]=1609459200&status=succeeded

// Sort by creation date
GET /v1/payment_intents?created[gte]=1609459200&limit=10
```

## Error Handling

### HTTP Status Codes

- `200` - OK: Request succeeded
- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Invalid API key
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource doesn't exist
- `429` - Rate Limited: Too many requests
- `500` - Server Error: Something went wrong

### Error Response Format

```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "Your card was declined.",
    "param": "card",
    "decline_code": "generic_decline"
  }
}
```

### Common Error Types

- `api_error` - Server-side issues
- `card_error` - Card-related problems
- `invalid_request_error` - Invalid parameters
- `rate_limit_error` - Too many requests

## Webhooks

### Event-Driven Architecture

Receive real-time notifications about important events:

```javascript
// Example webhook payload
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      // PaymentIntent object
    }
  },
  "created": 1609459200
}
```

### Webhook Security

Verify webhook signatures to ensure authenticity:

```javascript
const onerway = require("@onerway/onerway-js");

const verifyWebhook = (payload, signature, secret) => {
  try {
    const event = onerway.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
    return event;
  } catch (err) {
    throw new Error(
      "Webhook signature verification failed"
    );
  }
};
```

## Rate Limiting

### Limits

- **Test Mode**: 100 requests per second
- **Live Mode**: 1000 requests per second per API key
- **Burst**: Up to 1000 requests in a 1-second window

### Headers

Monitor your rate limit status:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459260
```

### Best Practices

- Implement exponential backoff for rate limit errors
- Cache responses when possible
- Use batch operations when available

## API Versioning

### Current Version

All requests use API version `2024-11-01` by default.

### Version Override

Specify a different version in requests:

```bash
curl -H "Onerway-Version: 2024-06-01" \
  https://api.onerway.com/v1/payment_intents
```

### Changelog

Stay updated with [API changes](../../../changelog/) and
migration guides.

## Testing & Development

### Test Mode

Use test API keys for safe development:

- Test keys start with `pk_test_` or `sk_test_`
- No real money is moved
- Use test card numbers for different scenarios

### Test Cards

```javascript
const testCards = {
  visa: "4242424242424242", // Succeeds
  declined: "4000000000000002", // Declined
  insufficient: "4000000000009995", // Insufficient funds
  expired: "4000000000000069", // Expired card
  processing: "4000000000000119", // Processing error
};
```

### Sandbox Environment

- Full API functionality
- Simulated payment processing
- Webhook testing capabilities

## SDKs and Libraries

### Official SDKs

- **JavaScript/Node.js**: `@onerway/onerway-js`
- **Python**: `onerway`
- **PHP**: `onerway/onerway-php`
- **Ruby**: `onerway`
- **Go**: `github.com/onerway/onerway-go`

### Community Libraries

- **Java**: Community-maintained
- **C#**: Community-maintained
- **Swift**: Community-maintained

## API Limits & Quotas

### Object Limits

- **Customer**: 50,000 per account
- **Payment Methods**: 500 per customer
- **Payment Intents**: No limit

### Request Size

- Maximum payload size: 16MB
- Maximum URL length: 8KB

### Data Retention

- API logs: 90 days
- Webhook attempts: 30 days
- Object data: Indefinite (unless deleted)

## Next Steps

Ready to start building with our APIs?

1. 🚀 [Start Developing](../start-developing) - Set up your
development environment
2. 🤖 [Build with an LLM](../mock/build-with-llm) - AI-assisted
development
3. 🎯 [Use Without Code](../use-stripe-without-code) -
No-code integrations
4. 📚 [Explore Payments API](../../../payments/) - Deep dive
into payments
5. 💸 [Explore Transfers API](../../../transfers/) - Learn
about transfers

## Resources

- 📖 [API Reference](../../../mock/payments/api-reference) -
Complete API documentation
- 🔧 [API Status](https://status.onerway.com) - Service
status and uptime
- 📊 [Rate Limit Guide](../../../guides/rate-limits) -
Detailed rate limiting info
- 🔒 [Security Guide](../../../guides/security) - Security
best practices

Questions about our APIs?
[Contact our developer support team](mailto:dev-support@onerway.com).
