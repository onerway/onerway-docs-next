Onerway Checkout is a pre-built, hosted payment page that handles the entire payment flow for you. This integration requires minimal code and is ideal for quickly accepting payments without building a custom checkout experience.

Redirect to a Onerway-hosted payment page using [Onerway Checkout](https://demo.onerway.com/standard-checkout). See how this integration compares to Onerway's [other integration types](/mock/integration-types).

::div{class="py-6"}
  :::::img
  ---
  src: /assets/images/onerway-checkout.png
  alt: Onerway Checkout
  class: border border-default rounded-lg
  ---
  :::::
::

::u-page-columns{class="bg-muted block border border-default rounded-xl p-4"}

  ::::::u-page-feature
  ---
  title: Integration effort
  ---

  #description

    ::u-badge{color="success" variant="subtle" label="Low code"}
    ::

  ::::::

  ::::::u-page-feature
  ---
  title: Integration type
  description: Redirect to Onerway-hosted payment page
  ---

  ::::::

  ::::::u-page-feature
  ---
  title: UI customization
  ---

  #description

    ::u-popover
    ---
    mode: hover
    arrow: true
    class: cursor-pointer
    ---
      :::::u-button{variant="link" color="primary" label="Limited customization" class="px-0"}
      :::::

    #content

    - 20 preset fonts
    - 3 preset border radius
    - Custom background and border color
    - Custom logo

    ::

  ::::::

::

First, [register](/get-started/start-building/start-developing#create-a-sandbox-account) for a Onerway account.

[Get your API credentials](/get-started/start-building/start-developing#get-your-api-credentials) and access the Onerway API from your application:

::prose-accordion
---
type: multiple
defaultValue: ["0", "1", "2", "3"]
---

  :::::prose-accordion-item{icon="healthicons:1"}

  #label
  ## Redirect your customer to Onerway Checkout

  #content
  Add a checkout button to your website that calls a server-side endpoint to create a [Checkout Session](https://docs.onerway.com/apis/en/v0.6/checkout){badge="API"}

    :::::code-group
    ```html [HTML] {20}
    <html>
      <head>
        <title>Buy cool new product</title>
      </head>
      <body>
        <button id="checkoutBtn" onclick="handleCheckout()">Checkout</button>

        <script>
          async function handleCheckout() {
            const button = document.getElementById('checkoutBtn')
            button.disabled = true
            button.textContent = 'Processing...'

            try {
              const response = await fetch('/create-checkout-session')
              const data = await response.json()

              if (data.success && data.redirectUrl) {
                // Redirect to Onerway Checkout page
                window.location.href = data.redirectUrl
              } else {
                alert('Checkout failed: ' + (data.error || 'Unknown error'))
                button.disabled = false
                button.textContent = 'Checkout'
              }
            } catch (error) {
              console.error('Error creating checkout session:', error)
              alert('Network error: ' + error.message)
              button.disabled = false
              button.textContent = 'Checkout'
            }
          }
        </script>
      </body>
    </html>
    ```
    ```vue [Vue] {20}
    <template>
      <button @click="createCheckoutSession" :disabled="isLoading">
        {{ isLoading ? 'Processing...' : 'Checkout' }}
      </button>
    </template>

    <script setup>
    import { ref } from 'vue'

    const isLoading = ref(false)

    const createCheckoutSession = async () => {
      isLoading.value = true
      try {
        const response = await fetch('/create-checkout-session')
        const data = await response.json()

        if (data.success && data.redirectUrl) {
          // Redirect to Onerway Checkout page
          window.location.href = data.redirectUrl
        } else {
          console.error('Checkout failed:', data.error)
          alert('Checkout failed: ' + (data.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error creating checkout session:', error)
        alert('Network error: ' + error.message)
      } finally {
        isLoading.value = false
      }
    }
    </script>
    ```
    ```jsx [React] {14}
    import { useState } from 'react'

    function CheckoutButton() {
      const [isLoading, setIsLoading] = useState(false)

      const createCheckoutSession = async () => {
        setIsLoading(true)
        try {
          const response = await fetch('/create-checkout-session')
          const data = await response.json()

          if (data.success && data.redirectUrl) {
            // Redirect to Onerway Checkout page
            window.location.href = data.redirectUrl
          } else {
            console.error('Checkout failed:', data.error)
            alert('Checkout failed: ' + (data.error || 'Unknown error'))
          }
        } catch (error) {
          console.error('Error creating checkout session:', error)
          alert('Network error: ' + error.message)
        } finally {
          setIsLoading(false)
        }
      }

      return (
        <button onClick={createCheckoutSession} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Checkout'}
        </button>
      )
    }

    export default CheckoutButton
    ```

    :::::

  A Checkout Session encapsulates, in code, the entire customer payment journey triggered by a redirect to the hosted checkout form. You can configure it with options such as:

  - Currencies to use
  - Payment methods to offer

  You must configure two important URLs in your Checkout Session:

    :::::note
    Both URLs are critical for a complete integration. The `notifyUrl` webhook is your primary source of payment status updates for order fulfillment.
    :::::

  - **`returnUrl`**: The URL of a page on your website where customers are redirected after they complete the payment (successful or failed). This provides immediate feedback to the customer.
  - **`notifyUrl`**: The webhook URL where Onerway sends payment events to your server. This ensures your server receives payment confirmations even if the customer doesn't return to your site.


  After creating a Checkout Session, redirect your customer to the redirect URL returned in the response. Here's a demo of a server-side implementation:

    :::::callout{color="neutral" icon="i-lucide:lightbulb"}
    Checkout Sessions expire **30 minutes** after creation by default.
    :::::

  ### Server-side Implementation (Java)

    :::::steps{level="4"}

    #### Add Maven Dependencies

    First, add the required dependencies to your `pom.xml`:

    ```xml [pom.xml]
    <dependency>
      <groupId>com.sparkjava</groupId>
      <artifactId>spark-core</artifactId>
      <version>2.9.4</version>
    </dependency>

    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.15.2</version>
    </dependency>
    ```

    #### Configure Base Settings

    Set up your merchant configuration and constants:
    ```java [ServerDemo.java - Configuration] {11-13}
    import static spark.Spark.*;
    import spark.Request;
    import spark.Response;
    import com.fasterxml.jackson.databind.JsonNode;
    import com.fasterxml.jackson.databind.ObjectMapper;
    // ... other imports

    public class ServerDemo {
      private static final ObjectMapper JSON = new ObjectMapper();
      private static final String CHECKOUT_SESSION_URL = "https://sandbox-acq.onerway.com/txn/payment";
      private static final String MERCHANT_NO = "REPLACE_WITH_YOUR_MERCHANT_NO";
      private static final String DEFAULT_APP_ID = "REPLACE_WITH_YOUR_APP_ID";
      private static final String MERCHANT_SECRET = "REPLACE_WITH_YOUR_MERCHANT_SECRET";
      private static final String DEFAULT_RETURN_URL = "https://merchant.example.com/pay/return";
      private static final String DEFAULT_NOTIFY_URL = "https://merchant.example.com/pay/notify";

      private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

      public static void main(String[] args) {
        port(8080);
        get("/create-checkout-session", ServerDemo::handleCheckoutSession);
      }
    }
    ```

      :::::callout{color="neutral" icon="i-lucide:lightbulb"}
      Replace the credentials with your actual merchant number, app ID, and secret from your Onerway dashboard.
      :::::

    #### Create Payment Request Handler

    Implement the main payment processing logic:

    ```java [ServerDemo.java - Request Handler] {16,19}
    private static Object handleCheckoutSession(Request req, Response res) {
      res.type("application/json");

      // Build payment request data
      Map<String, String> body = buildPaymentBody(req);

      // Generate signature
      String signBase = buildSignBaseString(body, MERCHANT_SECRET);
      String sign = sha256Hex(signBase);
      body.put("sign", sign);

      try {
        String requestJson = toJson(body);

        // Send request to Onerway Checkout API
        String responseJson = postJson(CHECKOUT_SESSION_URL, requestJson);

        // Extract redirect URL
        String redirectUrl = extractRedirectUrl(responseJson);

        // Build response JSON
        Map<String, Object> result = new TreeMap<>();
        if (redirectUrl != null) {
          result.put("success", true);
          result.put("redirectUrl", redirectUrl);
        } else {
          result.put("success", false);
          result.put("error", "Failed to extract redirect URL from response");
          result.put("rawResponse", responseJson);
        }

        return toJson(result);
      } catch (Exception e) {
        Map<String, Object> error = new TreeMap<>();
        error.put("success", false);
        error.put("error", "Failed to create checkout session: " + e.getMessage());
        return toJson(error);
      }
    }

    ```

    #### Build Payment Request Data

    Create the payment request payload with all required fields:

      :::::code-collapse
      ```java [ServerDemo.java]
      private static Map<String, String> buildPaymentBody(Request req) {
        String merchantTxnId = String.valueOf(System.currentTimeMillis());
        String merchantTxnTime = LocalDateTime.now().format(DATETIME_FMT);

        String appId = resolveAppId(req);
        String returnUrl = resolveReturnUrl(appId);
        String billingInformation = buildBillingInformation("US", "test@example.com");
        String txnOrderMsg = buildTxnOrderMsg(appId, returnUrl, DEFAULT_NOTIFY_URL, req.ip());

        Map<String, String> body = new TreeMap<>();
        body.put("billingInformation", billingInformation);
        body.put("merchantCustId", "DEMO-CUSTOMER-ID");
        body.put("merchantNo", MERCHANT_NO);
        body.put("merchantTxnId", merchantTxnId);
        body.put("merchantTxnTime", merchantTxnTime);
        body.put("orderAmount", "1");
        body.put("orderCurrency", "USD");
        body.put("productType", "CARD");
        body.put("shippingInformation", billingInformation);
        body.put("subProductType", "DIRECT");
        body.put("txnOrderMsg", txnOrderMsg);
        body.put("txnType", "SALE");
        return body;
      }

      private static String buildBillingInformation(String country, String email) {
        Map<String, Object> billing = new TreeMap<>();
        billing.put("country", country);
        billing.put("email", email);
        return toJson(billing);
      }

      private static String buildTxnOrderMsg(String appId, String returnUrl, String notifyUrl, String transactionIp) {
        List<Map<String, String>> products = new ArrayList<>();
        Map<String, String> product = new TreeMap<>();
        product.put("price", "110.00");
        product.put("num", "1");
        product.put("name", "iphone11");
        product.put("currency", "USD");
        products.add(product);

        String productsJson = toJson(products);

        Map<String, Object> txnOrder = new TreeMap<>();
        txnOrder.put("products", productsJson);
        txnOrder.put("appId", appId);
        txnOrder.put("returnUrl", returnUrl);
        txnOrder.put("notifyUrl", notifyUrl);
        txnOrder.put("transactionIp", transactionIp);
        return toJson(txnOrder);
      }
      ```

      :::::

    #### Handle Signatures and API Communication

    Implement signature generation and API communication:

      ::code-collapse{title="Complete utility methods"}

      ```java [ServerDemo.java - Utilities]
      // Signature generation following Onerway's specification
      private static String buildSignBaseString(Map<String, String> params, String secret) {
        boolean refundRequest = isRefundRequest(params);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : new TreeMap<>(params).entrySet()) {
          String key = entry.getKey();
          String value = entry.getValue();
          if (isNonEmpty(value) && !shouldFilterKey(key, refundRequest)) {
            sb.append(value);
          }
        }
        sb.append(secret);
        return sb.toString();
      }

      private static String sha256Hex(String input) {
        try {
          MessageDigest md = MessageDigest.getInstance("SHA-256");
          byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
          return HexFormat.of().formatHex(digest); // JDK 17+
        } catch (NoSuchAlgorithmException e) {
          throw new RuntimeException("SHA-256 not available", e);
        }
      }

      // HTTP communication
      private static String postJson(String url, String jsonBody) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(url))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
          .build();
        HttpResponse<String> response = client.send(request,
          HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        return response.body();
      }

      // Response parsing - Generic field extraction
      private static String extractJsonField(String responseJson, String path) {
        try {
          JsonNode node = JSON.readTree(responseJson);

          // Navigate through the path (e.g., "data.redirectUrl" -> ["data", "redirectUrl"])
          String[] pathParts = path.split("\\.");
          for (String part : pathParts) {
            node = node.path(part);
            if (node.isMissingNode()) {
              return null;
            }
          }

          // Extract text value
          if (node.isTextual()) {
            String value = node.asText().trim();
            if (isNonEmpty(value)) {
              return value;
            }
          } else if (node.isNumber()) {
            // Support number fields as well
            return node.asText();
          }
        } catch (Exception e) {
          System.err.println("Failed to extract field '" + path + "': " + e.getMessage());
        }
        return null;
      }

      // Extract redirect URL from API response
      private static String extractRedirectUrl(String responseJson) {
        return extractJsonField(responseJson, "data.redirectUrl");
      }

      // Extract transaction ID from API response
      private static String extractTransactionId(String responseJson) {
        return extractJsonField(responseJson, "data.transactionId");
      }

      // JSON utilities
      private static String toJson(Object obj) {
        try {
          return JSON.writeValueAsString(obj);
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }

      // Helper methods
      private static boolean isRefundRequest(Map<String, String> params) {
        return params != null && params.containsKey("refundType");
      }

      private static boolean shouldFilterKey(String key, boolean refundRequest) {
        Set<String> EXCLUDED_KEYS_BASE = Set.of(
          "originMerchantTxnId", "customsDeclarationAmount", "customsDeclarationCurrency",
          "paymentMethod", "walletTypeName", "periodValue", "tokenExpireTime", "sign");
        return EXCLUDED_KEYS_BASE.contains(key) || (!refundRequest && "originTransactionId".equals(key));
      }

      private static String resolveAppId(Request req) {
        if (req == null) return DEFAULT_APP_ID;
        String[] candidates = {
          req.queryParams("appId"), req.queryParams("app_id"),
          req.headers("X-App-Id"), req.headers("appId")
        };
        for (String candidate : candidates) {
          if (candidate != null && !candidate.trim().isEmpty()) {
            return candidate.trim();
          }
        }
        return DEFAULT_APP_ID;
      }

      private static String resolveReturnUrl(String appId) {
        return DEFAULT_RETURN_URL;
      }

      private static boolean isNonEmpty(String value) {
        return value != null && (value.length() > 0 || "0".equals(value));
      }
      ```

      ::

    :::::

    ::callout{color="neutral" icon="i-lucide:lightbulb"}

    You can access the full working implementation:
    - Try it in a ready-to-run environment: :u-button{trailingIcon="mdi:github" variant="outline" color="neutral" label="Open in GitHub Codespaces" to="https://codespaces.new/Abel-Wang777/onerway-payment-demo?quickstart=1" target="_blank"}

    - Download :u-button{trailingIcon="i-lucide-download" variant="outline" color="neutral" label="ServerDemo.java" to="/assets/code/ServerDemo.java" target="_blank" download="ServerDemo.java"}
    ::

  ### Payment methods

  By default, Onerway enables cards and other common payment methods. In Checkout, Onerway evaluates the currency and any restrictions, then dynamically presents the supported payment methods to the customer.

  To see which payment methods you support, access your :prose-link-switch{preset="merchant-dashboard" path="/application/list" label="application list"}. You can sort the payment methods to offer in the :prose-link-switch{preset="merchant-dashboard" path="/checkout/card" label="payment methods"}.

  Checkout's Onerway-hosted pages don't need integration changes to enable Apple Pay or Google Pay. Onerway handles these payments the same way as other card payments.

  #### Testing

  1. Start your server

  Navigate to `http://localhost:8080`{:copy="true"} in your browser. You should see a simple purchase page that redirects your customer to Onerway Checkout:

  ![Premium Gadget purchase page](/assets/images/checkout-demo.png)

  2. Go to the checkout page

  Click the **Checkout** button. If everything is configured correctly, you'll be redirected to the Onerway checkout page where customers can complete their payment.

    ::warning
    **Missing credentials** <br>

    If you see the following response, it means your `MERCHANT_NO`, `DEFAULT_APP_ID`, or `MERCHANT_SECRET` are not configured:

    ```json
    {
      "respCode": "40013",
      "respMsg": "Abnormal parameters (cannot be read)",
      "data": null
    }
    ```

    Make sure you've set these environment variables or configuration values as described in the [previous step](#configure-base-settings).
    ::
  :::::

  :::::prose-accordion-item{icon="healthicons:2"}

  #label

  ## Show a success page

  #content
  It's important for your customer to see a success page after they successfully submit the payment form. Set up the success page URL in your Checkout Session to redirect your customer to this success page.

  Create a minimal success page:

    ::code-collapse
    ```html [HTML]
    <html>
      <head>
        <title>Thanks for your order!</title>
      </head>
      <body>
        <h1>Thanks for your order!</h1>
        <p>We appreciate your business!</p>
        <p>If you have any questions, please email
          <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </body>
    </html>
    ```
    ::

  Next, update the Checkout Session creation endpoint to use this new page:

    ::code-collapse

    ```java [ServerDemo.java] {15}
    private static Map<String, String> buildPaymentBody(Request req) {
        // ... other fields ...
        String returnUrl = resolveReturnUrl(appId);
        String txnOrderMsg = buildTxnOrderMsg(appId, returnUrl, DEFAULT_NOTIFY_URL, req.ip());

        Map<String, String> body = new TreeMap<>();
        // ... other fields ...
        body.put("txnOrderMsg", txnOrderMsg);
        return body;
    }

    private static String buildTxnOrderMsg(String appId, String returnUrl, String notifyUrl, String transactionIp) {
        // ... other fields ...
        Map<String, Object> txnOrder = new TreeMap<>();
        txnOrder.put("returnUrl", returnUrl); // success page URL
        return toJson(txnOrder);
    }
    ```
    ::

  #### Testing

  1. Click your pay button
  2. Fill out the payment form with the test card information:
    - **Card number**: Enter `4000 0209 5159 5032`{:copy="true" format="card"}
    - **Card expiry**: Enter any future date
    - **CVC**: Enter any 3-digit number
    - **Cardholder name**: Enter your first and last name
  3. Click the **Pay** button
  4. You're redirected to the success page

  Next, find the new payment in the Dashboard's :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label=" transactions"}. Successful payments appear in the Dashboard's list of payments. When you click a transaction, it takes you to the payment details page. This section contains billing information and the list of items purchased, which you can use to manually fulfill the order.

  :::::

  :::::prose-accordion-item{icon="healthicons:3"}

  #label
  ## Handle post-payment events

  #content
  Onerway sends a [TXN](https://docs.onerway.com/apis/en/v0.6/transaction-notification#notification-parameters){badge="API"} event when a customer completes a Checkout Session payment. Follow the [webhook guide](https://docs.onerway.com/apis/en/v0.6/transaction-notification){badge="API"} to receive and handle these events, which might trigger you to:

  - Send an order confirmation email to your customer
  - Log the sale in a database
  - Start a shipping workflow
  - Handle transaction status (`status` field) when processing asynchronous notifications. The status indicates the payment result (e.g., `S` for success)

  Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your Checkout landing page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept different types of payment methods with a single integration.

  :::::

  :::::prose-accordion-item{icon="healthicons:4"}

  #label

  ## Test your integration

  #content
  To test your Onerway-hosted payment form integration:

  1. Create a Checkout
  2. Fill out the payment details with a method from the following table:
    - Enter any future date for card expiry
    - Enter any 3-digit number for CVC
    - Enter cardholder name
  3. Click **Pay**. You're redirected to your `returnUrl`
  4. Go to the Dashboard and look for the payment on the :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label=" Transactions page"}. If your payment succeeded, you'll see it in that list
  5. Click your payment to see more details, like a Checkout summary with billing information and the list of purchased items. You can use this information to fulfill the order.

    ::prose-tabs{variant="link" sync="test-cards" :spread="false"}

      :::::prose-tabs-item{label="Card"}
      | CARD NUMBER | SCENARIO | HOW TO TEST |
      |-------------|------------|-----|
      | `4761344136141390`{:copy="true" format="card"} | The card payment succeeds and doesn't require authentication | Fill out the credit card form using the credit card number with any expiration, CVC, and cardholder name |
      | `4021937195658141`{:copy="true" format="card"} | The card is declined with a decline code like `insufficient_funds` | Fill out the credit card form using the credit card number with any expiration, CVC, and cardholder name |
      | `4000020951595032`{:copy="true" format="card"} | The card payment requires [authentication](/mock/authentication) | Fill out the credit card form using the credit card number with any expiration, CVC, and cardholder name |
      :::::

      :::::prose-tabs-item{label="Wallets"}
      | PAYMENT METHOD | SCENARIO | HOW TO TEST |
      |-------------|------------|-----|
      | Alipay+ | Your customer successfully pays with a redirect-based and [immediate notification](/mock/immediate-notification) payment method | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click Complete test payment on the redirect page |
      :::::

      :::::prose-tabs-item{label="Vouchers"}
      | PAYMENT METHOD | SCENARIO | HOW TO TEST |
      |-------------|------------|-----|
      | Boleto, OXXO | Your customer pays with a Boleto or OXXO voucher | Select Boleto or OXXO as the payment method and submit the payment. Close the dialog after it appears. |
      :::::

    ::

  See [Testing](/mock/testing) for additional information to test your integration.

  :::::

::
