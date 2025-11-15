---
title: Overview
description: Accept payments and manage transactions using no-code and low-code solutions with Onerway
order: 4
showToc: true
showNavigation: true
---

## No-Code Payment Solutions

Start accepting payments without writing a single line of
code. Onerway offers multiple no-code solutions that let you
integrate payments into your business quickly and easily.

## Quick No-Code Options

### **🔗 Payment Links**

Create shareable payment links in minutes.

#### **Create Your First Payment Link**

1. **Log into your Onerway Dashboard**
2. **Navigate to Payment Links**
3. **Click "Create Payment Link"**
4. **Configure your payment:**
  - Product/service name
  - Amount (or allow custom amounts)
  - Currency
  - Description
5. **Customize appearance:**
  - Logo and branding
  - Colors and styling
  - Thank you page
6. **Share your link** via email, social media, or embed on
your website

#### **Payment Link Features**

- ✅ No coding required
- ✅ Mobile-optimized checkout
- ✅ Multiple payment methods
- ✅ Automatic receipts
- ✅ Real-time notifications
- ✅ Customizable branding

**Example Payment Link:**

```
https://buy.onerway.com/your-payment-link-id
```

### **📧 Invoice & Billing**

Send professional invoices that customers can pay online.

#### **Create Smart Invoices**

1. **Go to Invoices in your dashboard**
2. **Create new invoice**
3. **Add customer details**
4. **Line items and pricing**
5. **Payment terms and due dates**
6. **Send via email or SMS**

#### **Invoice Automation**

- 🔄 Recurring invoices
- ⏰ Automatic reminders
- 📊 Payment tracking
- 💳 One-click payments
- 📄 PDF generation

### **🛒 Checkout Pages**

Hosted checkout pages that you can customize and embed.

```html
<!-- Embed checkout button -->
<button
  onclick="window.open('https://checkout.onerway.com/your-checkout-id')">
  Buy Now - $29.99
</button>
```

## E-commerce Platform Integrations

### **🏪 Shopify Integration**

Connect Onerway to your Shopify store in minutes.

#### **Setup Steps:**

1. **Install Onerway app** from Shopify App Store
2. **Connect your Onerway account**
3. **Configure payment methods**
4. **Test transactions**
5. **Go live!**

#### **Features:**

- Seamless checkout experience
- Inventory sync
- Order management
- Automatic fulfillment
- Multi-currency support

### **🎨 WooCommerce Plugin**

WordPress/WooCommerce integration.

```bash
# Install via WordPress admin or upload plugin
wp plugin install onerway-payments
wp plugin activate onerway-payments
```

#### **Configuration:**

1. **Navigate to WooCommerce → Settings → Payments**
2. **Enable Onerway Payments**
3. **Add your API keys**
4. **Configure payment methods**
5. **Save and test**

### **🔧 Magento Extension**

Enterprise-grade integration for Magento stores.

### **📱 Mobile Commerce**

- **Square integration**
- **Shopify POS**
- **Mobile payment solutions**

## Website Builders & CMS

### **📝 WordPress**

Multiple integration options for WordPress sites.

#### **Onerway WordPress Plugin**

```php
// Shortcode for payment button
[onerway-payment amount="29.99" description="Premium Course"]

// Membership integration
[onerway-membership plan="monthly"]
```

#### **Block Editor Support**

Drag-and-drop payment blocks for Gutenberg editor.

### **⚡ Webflow**

Embed payment forms in your Webflow sites.

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

Code injection for Squarespace sites.

### **📐 Wix**

App marketplace integration.

## Automation Platforms

### **⚡ Zapier Integration**

Connect Onerway to 5,000+ apps with Zapier.

#### **Popular Workflows:**

- **New payment → Add to Google Sheets**
- **Failed payment → Send Slack notification**
- **Subscription created → Add to Mailchimp**
- **Refund processed → Update CRM**

#### **Setup Example:**

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

### **🔄 Make (formerly Integromat)**

Visual automation builder for complex workflows.

### **📊 Microsoft Power Automate**

Enterprise automation with Office 365 integration.

## Form Builders

### **📋 Typeform Integration**

Collect payments directly in your forms.

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

Use Zapier to connect Google Forms to payment collection.

### **🔧 Gravity Forms**

WordPress form builder with payment integration.

## Subscription Management

### **📅 No-Code Subscription Setup**

#### **Dashboard Configuration:**

1. **Create Product Catalog**
  - Define subscription plans
  - Set pricing tiers
  - Configure trial periods

2. **Customer Portal**
  - Self-service cancellation
  - Plan upgrades/downgrades
  - Billing history
  - Payment method updates

3. **Automation Rules**
  - Dunning management
  - Churn prevention
  - Upgrade prompts
  - Cancellation surveys

#### **Subscription Link Example:**

```
https://subscribe.onerway.com/premium-monthly
```

## Mobile Solutions

### **📱 Mobile Payment Apps**

- **Onerway Mobile POS** - Accept payments on mobile
- **QR Code Payments** - Generate QR codes for payments
- **SMS Payment Links** - Send payment requests via text

### **💳 Tap to Pay**

Accept contactless payments with supported devices.

## Advanced No-Code Features

### **🎨 Customizable Checkout**

Brand your checkout experience without code.

#### **Customization Options:**

- Logo and colors
- Custom CSS (optional)
- Thank you pages
- Email templates
- Receipt formatting

### **📊 Analytics Dashboard**

Track your business metrics without technical setup.

#### **Built-in Reports:**

- Revenue tracking
- Payment method analysis
- Geographic distribution
- Churn analysis
- Growth metrics

### **🔔 Notifications & Alerts**

Set up automatic notifications for important events.

#### **Notification Types:**

- New payments
- Failed payments
- Subscription events
- Fraud alerts
- System updates

#### **Delivery Methods:**

- Email notifications
- SMS alerts
- Slack integration
- Webhook notifications
- Dashboard notifications

## Testing Without Code

### **🧪 Test Mode Dashboard**

Full testing environment without writing code.

#### **Test Scenarios:**

- Successful payments
- Declined cards
- Network errors
- Subscription events
- Refund processing

#### **Test Cards:**

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
Declined: 4000 0000 0000 0002
```

## Customer Support Tools

### **💬 Help Center Integration**

- Knowledge base embedding
- Chat widget with payment support
- Ticket system integration

### **📞 Phone Support**

Set up phone payments without technical integration.

## Compliance & Security

### **🔒 No-Code Security**

All no-code solutions include:

- PCI DSS compliance
- Data encryption
- Fraud detection
- 3D Secure authentication
- GDPR compliance tools

### **📋 Compliance Dashboard**

Monitor compliance status without technical knowledge.

## Migration Tools

### **🔄 Data Import**

Move from other payment processors without code.

#### **Supported Imports:**

- Customer data
- Payment methods
- Transaction history
- Subscription data

#### **Migration Wizard:**

1. Upload CSV files
2. Map data fields
3. Validate import
4. Complete migration
5. Notify customers

## Getting Started Checklist

### **✅ Setup Checklist**

- [ ] Create Onerway account
- [ ] Verify business information
- [ ] Configure tax settings
- [ ] Set up bank account
- [ ] Create first payment link
- [ ] Test with sample payment
- [ ] Configure notifications
- [ ] Review security settings

### **📈 Growth Features**

- [ ] Set up analytics tracking
- [ ] Configure customer portal
- [ ] Enable subscription options
- [ ] Add upsell opportunities
- [ ] Set up referral programs

## Limitations & Considerations

### **🚧 When You Might Need Code**

- Complex business logic
- Custom integrations
- Advanced reporting
- Multi-tenant applications
- Sophisticated workflows

### **💡 Hybrid Approach**

Start with no-code solutions and add custom code as needed:

1. Begin with payment links/checkout
2. Add webhook notifications
3. Integrate with existing systems
4. Build custom features

## Next Steps

Ready to start accepting payments?

1. 🚀
[Create Payment Links](https://dashboard.onerway.com/payment-links) -
Start immediately
2. 🛒 [E-commerce Integration](https://apps.onerway.com) -
Connect your store
3. ⚡ [Zapier Automation](https://zapier.com/apps/onerway) -
Automate workflows
4. 📚 [Developer Docs](../../../payments/) - When ready to
code

Need more advanced features?

1. 🔧 [Start Developing](../start-developing) - Custom
integration
2. 🔍 [About the APIs](../mock/about-the-apis) - Technical
overview
3. 🤖 [Build with AI](../mock/build-with-llm) - AI-assisted
development

## Support Resources

- 📖 [No-Code Guide](../../../guides/no-code) -
Comprehensive tutorials
- 💬
[Community Forum](https://community.onerway.com/no-code) -
Get help from others
- 🎥
[Video Tutorials](https://www.youtube.com/onerway-nocode) -
Step-by-step guides
- 📧 [Business Support](mailto:business@onerway.com) -
Non-technical assistance

Start accepting payments today - no coding required!
