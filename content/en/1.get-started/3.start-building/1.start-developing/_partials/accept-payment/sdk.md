Embed a prebuilt payment form on your site using [Onerway SDK](https://demo.onerway.com/sdk-checkout){badge="Demo"}. See how this integration compares to Onerway's [other integration types](#){badge="TODO"}.

::::payment-demo
---
allowedMethods: ["card", "google_pay", "apple_pay"]
---
::::

::::u-page-grid{class="bg-muted border border-default rounded-xl p-6"}

  ::::u-page-feature{title="Integration effort"}

  #description

    ::u-badge{color="primary" variant="subtle" label="Medium code"}
    ::

  ::::

  ::::u-page-feature{title="Integration type" description="Redirect to Onerway-hosted payment page"}
  ::::

  ::::u-page-feature{title="UI customization"}

  #description

    ::u-popover
    ---
    mode: hover
    arrow: true
    class: cursor-pointer
    ---
      :::u-button{variant="link" color="primary" label="Limited customization" class="px-0"}
      :::

    #content

    - 20 preset fonts
    - 3 preset border radius
    - Custom background and border color
    - Custom logo

    ::

  ::::
::::

First, [register](/get-started/start-building/start-developing#create-a-sandbox-account) for a Onerway account.

[Get your API credentials](/get-started/start-building/start-developing#get-your-api-credentials) and access the Onerway API from your application:

::::prose-accordion
---
type: multiple
defaultValue: ["0", "1", "2", "3"]
---

  :::prose-accordion-item{icon="healthicons:1"}

  #label
  ### Set up the server

  #content
    :::callout{color="success" icon="i-lucide:check-circle"}
    **Already familiar with the setup?** <br>

    If you've completed the [Checkout Session setup](#configure-base-settings) above, the Maven dependencies, base configuration, and utility methods are identical. You can jump directly to [Create Payment Intent Handler](#create-payment-intent-handler) to see the key differences.
    :::

  Your server creates a [Payment Intent](https://docs.onerway.com/apis/en/v0.6/sdk-card){badge="API"} that provides the necessary credentials for the client-side SDK to function. The server:

  - **Creates Payment Intent**: Calls Onerway's API to create a transaction and obtain `transactionId` and `redirectUrl`
  - **Returns SDK Credentials**: Sends these credentials to your frontend for SDK initialization

  **Key Difference from Checkout Session**:

  | Integration | Endpoint | Returns | Frontend Action |
  |-------------|----------|---------|-----------------|
  | **Checkout Session** | `/create-checkout-session` | `redirectUrl` | Direct redirect to hosted page |
  | **SDK Integration** | `/create-payment-intent` | `transactionId` + `redirectUrl` | Initialize SDK component |


  ### Server-side Implementation (Java)

    :::steps{level="4"}

    #### Add Maven Dependencies

    First, add the required dependencies to your `pom.xml`:

      ::code-collapse{name="Maven dependencies (same as Checkout Session, expand if needed)"}
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
      ::

    #### Configure Base Settings

    Set up your merchant configuration and constants:

      ::code-collapse{name="Base configuration (same as Checkout Session, expand if needed)"}
      ```java [ServerDemo.java - Configuration]
      import static spark.Spark.*;
      import spark.Request;
      import spark.Response;
      import com.fasterxml.jackson.databind.JsonNode;
      import com.fasterxml.jackson.databind.ObjectMapper;
      // ... other imports

      public class ServerDemo {
        private static final ObjectMapper JSON = new ObjectMapper();
        private static final String PAYMENT_INTENT_URL = "https://sandbox-acq.onerway.com/v1/sdkTxn/doTransaction";
        private static final String MERCHANT_NO = "REPLACE_WITH_YOUR_MERCHANT_NO";
        private static final String DEFAULT_APP_ID = "REPLACE_WITH_YOUR_APP_ID";
        private static final String MERCHANT_SECRET = "REPLACE_WITH_YOUR_MERCHANT_SECRET";
        private static final String DEFAULT_RETURN_URL = "https://merchant.example.com/pay/return";
        private static final String DEFAULT_NOTIFY_URL = "https://merchant.example.com/pay/notify";

        private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        public static void main(String[] args) {
          port(8080);
          get("/create-payment-intent", ServerDemo::handlePaymentIntent);
        }
      }
      ```
      ::

      :::callout{color="neutral" icon="i-lucide:lightbulb"}
      Replace the credentials with your actual merchant number, app ID, and secret from your Onerway dashboard.
      :::

    #### Create Payment Intent Handler

    Implement the Payment Intent endpoint that returns both `transactionId` and `redirectUrl` for SDK initialization:

    ```java [ServerDemo.java - Payment Intent Handler] {16,19-20}
    private static Object handlePaymentIntent(Request req, Response res) {
      res.type("application/json");

      // Build payment request data
      Map<String, String> body = buildPaymentBody(req);

      // Generate signature
      String signBase = buildSignBaseString(body, MERCHANT_SECRET);
      String sign = sha256Hex(signBase);
      body.put("sign", sign);

      try {
        String requestJson = toJson(body);

        // Send request to Onerway Payment Intent API
        String responseJson = postJson(PAYMENT_INTENT_URL, requestJson);

        // Extract transaction ID and redirect URL (both needed for SDK)
        String transactionId = extractTransactionId(responseJson);
        String redirectUrl = extractRedirectUrl(responseJson);

        // Build response JSON
        Map<String, Object> result = new TreeMap<>();
        if (redirectUrl != null && transactionId != null) {
          result.put("success", true);
          result.put("transactionId", transactionId);
          result.put("redirectUrl", redirectUrl);
        } else {
          result.put("success", false);
          result.put("error", "Failed to extract transaction data from response");
          result.put("rawResponse", responseJson);
        }

        return toJson(result);
      } catch (Exception e) {
        Map<String, Object> error = new TreeMap<>();
        error.put("success", false);
        error.put("error", "Failed to create payment intent: " + e.getMessage());
        return toJson(error);
      }
    }
    ```

    #### Build Payment Request Data

    Create the payment request payload with all required fields:

      ::code-collapse{name="Payment body builder (same as Checkout Session, expand if needed)"}
      ```java [ServerDemo.java - Request Builder]
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
      ::

    #### Handle Signatures and API Communication

    Implement signature generation and API communication:

      ::code-collapse{name="Utility methods (same as Checkout Session, expand if needed)"}
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

    :::

    ::callout{color="neutral" icon="i-lucide:lightbulb"}

    **Expected response:**
    ```json
    {
      "success": true,
      "transactionId": "1919259367895859200",
      "redirectUrl": "https://sandbox-checkout-sdk.onerway.com"
    }
    ```

    Your frontend will use these values to initialize the Onerway SDK component.
    ::

  ### Testing

  1. Start your server

  Navigate to `http://localhost:8080`{:copy="true"} in your browser. You should see a simple purchase page with two buttons:

  ![Premium Gadget purchase page](/assets/images/checkout-demo.png)

  2. Create a Payment Intent

  Click the **Payment Intent** button. If everything is configured correctly, you'll receive a JSON response with `success: true`, `transactionId`, and `redirectUrl`. These values will be used to initialize the Onerway SDK in the next step.

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

    Make sure you've set these environment variables or configuration values as described in the [configuration step](#configure-base-settings-1).
    ::

  :::

  :::prose-accordion-item{icon="healthicons:2"}

  #label
  ### Initialize the SDK

  #content
  After creating a Payment Intent, use the returned `transactionId` and `redirectUrl` to initialize the Onerway SDK on your client. The SDK renders a secure payment form, handles customer input, and processes the payment.

  ### Load the Onerway SDK

  Include the Onerway SDK script on your payment page. Always load the SDK directly from the official CDN to remain PCI compliant and ensure you receive security updates.

    :::callout{color="neutral" icon="i-lucide:shield-check"}
    **Security best practice** <br>

    Never bundle or host a copy of the SDK yourself. Always load it from `https://checkout-sdk.onerway.com/v3/` to maintain PCI DSS compliance and receive automatic security updates.
    :::

  #### Option 1: Static loading (recommended)

  Add the script to the head of your HTML file or your application's root template:

    :::code-group
    ```html [HTML]
    <head>
      <title>Checkout</title>
      <script src="https://checkout-sdk.onerway.com/v3/"></script>
    </head>
    ```

    ```vue [Vue (App.vue)]
    <!-- In your root App.vue or index.html -->
    <script setup>
    import { onMounted } from 'vue'

    onMounted(() => {
      // Script will be available globally after loading
      if (!document.querySelector('script[src*="checkout-sdk.onerway.com"]')) {
        const script = document.createElement('script')
        script.src = 'https://checkout-sdk.onerway.com/v3/'
        document.head.appendChild(script)
      }
    })
    </script>
    ```

    ```jsx [React (App.jsx)]
    // In your root App.jsx or index.html
    import { useEffect } from 'react'

    function App() {
      useEffect(() => {
        // Load SDK once globally
        if (!document.querySelector('script[src*="checkout-sdk.onerway.com"]')) {
          const script = document.createElement('script')
          script.src = 'https://checkout-sdk.onerway.com/v3/'
          document.head.appendChild(script)
        }
      }, [])

      return <YourApp />
    }
    ```
    :::

  #### Option 2: Dynamic loading

  If you prefer to load the SDK only when needed, you can load it dynamically in your payment component (shown in the examples below).

  ### Render the payment form

  Create a container element and initialize the SDK with your Payment Intent credentials.

    :::callout{color="neutral" icon="i-lucide:lightbulb"}
    **SDK loading options** <br>

    If you loaded the SDK in your HTML `<head>` or root app component ([Option 1](#option-1-static-loading-recommended)), the `Pacypay` constructor is already globally available. You can initialize it directly without loading the script again.

    If you're loading the SDK dynamically (Option 2), you'll need to load the script first, then initialize once it's loaded.
    :::

    :::code-group
    ```html [HTML] {6,10,15-16,20-37}
    <html>
      <head>
        <title>Checkout</title>
      </head>
      <body>
        <div id="onerway-checkout"></div>

        <script>
          // Load the SDK script
          const script = document.createElement('script')
          script.src = 'https://checkout-sdk.onerway.com/v3/'
          document.body.appendChild(script)

          script.onload = async function() {
            // Get Payment Intent credentials from your server
            const response = await fetch('/create-payment-intent')
            const { transactionId, redirectUrl } = await response.json()

            // Initialize the SDK
            const pacypay = new Pacypay(transactionId, {
              container: 'onerway-checkout',
              locale: 'en',
              environment: 'sandbox',
              mode: 'CARD',
              redirectUrl: redirectUrl,
              config: {
                subProductType: 'DIRECT'
              },
              onPaymentCompleted: function(result) {
                console.log('Payment result:', result)
                // Handle payment result (see next section)
              },
              onError: function(error) {
                console.error('Payment error:', error)
                // Handle errors
              }
            })
          }
        </script>
      </body>
    </html>
    ```

    ```vue [Vue] {8-9,12-13,16-45}
    <template>
      <div>
        <div v-if="isLoading">Loading payment form...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div id="onerway-checkout"></div>
      </div>
    </template>

    <script setup>
    import { ref, onMounted } from 'vue'

    const isLoading = ref(true)
    const error = ref(null)
    const sdkInstance = ref(null)

    onMounted(async () => {
      try {
        // Load SDK script
        const script = document.createElement('script')
        script.src = 'https://checkout-sdk.onerway.com/v3/'
        document.body.appendChild(script)

        script.onload = async () => {
          // Get Payment Intent credentials from your server
          const response = await fetch('/create-payment-intent')
          const data = await response.json()

          // Initialize the SDK
          sdkInstance.value = new Pacypay(data.transactionId, {
            container: 'onerway-checkout',
            locale: 'en',
            environment: 'sandbox',
            mode: 'CARD',
            redirectUrl: data.redirectUrl,
            config: {
              subProductType: 'DIRECT'
            },
            onPaymentCompleted: (result) => {
              console.log('Payment result:', result)
              // Handle payment result (see next section)
            },
            onError: (err) => {
              error.value = err.message
            }
          })

          isLoading.value = false
        }
      } catch (err) {
        error.value = 'Failed to load payment form'
        isLoading.value = false
      }
    })
    </script>
    ```

    ```jsx [React] {5-6,9-10,13-53}
    import { useState, useEffect } from 'react'

    function CheckoutForm() {
      const [isLoading, setIsLoading] = useState(true)
      const [error, setError] = useState(null)
      const [sdkInstance, setSdkInstance] = useState(null)

      useEffect(() => {
        let mounted = true

        const loadSDK = async () => {
          try {
            // Load SDK script
            const script = document.createElement('script')
            script.src = 'https://checkout-sdk.onerway.com/v3/'
            document.body.appendChild(script)

            script.onload = async () => {
              if (!mounted) return

              // Get Payment Intent credentials from your server
              const response = await fetch('/create-payment-intent')
              const data = await response.json()

              // Initialize the SDK
              const instance = new Pacypay(data.transactionId, {
                container: 'onerway-checkout',
                locale: 'en',
                environment: 'sandbox',
                mode: 'CARD',
                redirectUrl: data.redirectUrl,
                config: {
                  subProductType: 'DIRECT'
                },
                onPaymentCompleted: (result) => {
                  console.log('Payment result:', result)
                  // Handle payment result (see next section)
                },
                onError: (err) => {
                  setError(err.message)
                }
              })

              setSdkInstance(instance)
              setIsLoading(false)
            }
          } catch (err) {
            if (mounted) {
              setError('Failed to load payment form')
              setIsLoading(false)
            }
          }
        }

        loadSDK()

        return () => {
          mounted = false
        }
      }, [])

      if (isLoading) return <div>Loading payment form...</div>
      if (error) return <div className="error">{error}</div>

      return <div id="onerway-checkout"></div>
    }

    export default CheckoutForm
    ```
    :::

  ### Handle payment results

  The SDK calls your `onPaymentCompleted` callback when the customer completes the payment form. Handle different payment statuses appropriately:

    :::code-group
    ```javascript [JavaScript] {4,7-10,12-16}
    onPaymentCompleted: function(result) {
      const { respCode, data } = result

      if (respCode === '20000') {
        // API call successful - check payment status
        switch (data.status) {
          case 'S':
            // Payment successful
            alert('Payment completed successfully!')
            window.location.href = '/order-confirmation'
            break

          case 'R':
            // Requires 3DS authentication
            // Redirect to authentication page
            // Customer will return to your returnUrl after completing 3DS
            window.location.href = data.redirectUrl
            break
        }
      } else {
        // Payment failed
        alert('Payment failed: ' + result.respMsg)
      }
    }
    ```

    ```vue [Vue] {4,7-10,12-16}
    const handlePaymentCompleted = (result) => {
      const { respCode, data } = result

      if (respCode === '20000') {
        // API call successful - check payment status
        switch (data.status) {
          case 'S':
            // Payment successful
            alert('Payment completed successfully!')
            window.location.href = '/order-confirmation'
            break

          case 'R':
            // Requires 3DS authentication
            // Redirect to authentication page
            // Customer will return to your returnUrl after completing 3DS
            window.location.href = data.redirectUrl
            break
        }
      } else {
        // Payment failed
        alert('Payment failed: ' + result.respMsg)
      }
    }
    ```

    ```jsx [React] {4,7-10,12-16}
    const handlePaymentCompleted = (result) => {
      const { respCode, data } = result

      if (respCode === '20000') {
        // API call successful - check payment status
        switch (data.status) {
          case 'S':
            // Payment successful
            alert('Payment completed successfully!')
            window.location.href = '/order-confirmation'
            break

          case 'R':
            // Requires 3DS authentication
            // Redirect to authentication page
            // Customer will return to your returnUrl after completing 3DS
            window.location.href = data.redirectUrl
            break
        }
      } else {
        // Payment failed
        alert('Payment failed: ' + result.respMsg)
      }
    }
    ```
    :::

  **Payment status codes:**

  | Status | Description | When it occurs |
  |--------|-------------|----------------|
  | `S` | Success | Payment completed successfully |
  | `F` | Failure | Payment failed (only in `else` branch when `respCode !== '20000'`) |
  | `R` | Requires action | Customer needs to complete 3DS authentication |

    :::callout{color="primary" icon="i-lucide:info"}
    **3D Secure authentication flow** <br>

    When `status` is `R`, redirect your customer to `data.redirectUrl` for [3D Secure (3DS) authentication](#){badge="TODO"}. After completing authentication:

    1. **The `onPaymentCompleted` callback will NOT be triggered again**
    2. The customer is automatically redirected to your `returnUrl` with query parameters appended:

      - `transactionId`: The transaction identifier
      - `status`: Payment status (e.g., `S` for success, `F` for failure)
      - Other order-related information

    **You must handle the return on your `returnUrl` page:**

    ```javascript
    // Example: Extract payment result from URL parameters on your return page
    const urlParams = new URLSearchParams(window.location.search)
    const transactionId = urlParams.get('transactionId')
    const status = urlParams.get('status')

    // Query YOUR backend to verify the final payment status
    // Your backend should check its database (updated by webhook) or query Onerway's API
    async function verifyPayment() {
      const response = await fetch(`/api/payment/status?transactionId=${transactionId}`)
      const data = await response.json()

      if (data.status === 'S') {
        window.location.href = '/order-confirmation'
      } else if (data.status === 'F') {
        window.location.href = '/payment-failed'
      } else {
        // Payment still processing, retry after delay
        setTimeout(verifyPayment, 2000)
      }
    }

    verifyPayment()
    ```

    **Important**: Your frontend queries **your own backend** for verification. Your backend can obtain the payment result via:
    - **Recommended**: Wait for Onerway's webhook notification (covered in the [next step](#handle-post-payment-events-1))
    - **Alternative**: Actively query Onerway's [Transaction Query API](https://docs.onerway.com/apis/en/v0.6/order-query){badge="API"} with `transactionId`
    :::

    :::callout{color="warning" icon="i-lucide:alert-triangle"}
    **Server-side verification is required** <br>

    After 3DS authentication, the SDK callback is **not** triggered. Always verify payment status server-side:

    - **Without 3DS**: SDK callback provides immediate frontend feedback; still verify via webhook server-side
    - **With 3DS**: No SDK callback; frontend polls your backend API, which either:
      - Checks its database (updated by Onerway webhook)
      - Actively queries Onerway's [Transaction Query API](https://docs.onerway.com/apis/en/v0.6/order-query){badge="API"} with `transactionId`

    **Never trust URL parameters alone** - they can be manipulated. Always validate payment status through your backend to prevent fraud.
    :::

  ### Testing

  1. Load your payment page with the SDK initialized
  2. Enter test card information (use cards from the test table in [step 4](#test-your-integration-1))
  3. Submit the payment
  4. For cards requiring 3DS (`4000020951595032`{:copy="true" format="card"}), you'll be redirected to complete authentication
  5. After successful payment or 3DS completion, verify the payment appears in your Dashboard

    ::callout{color="neutral" icon="i-lucide:lightbulb"}
    The SDK automatically handles form validation, error messages, and payment method selection. Your integration only needs to handle the payment result callbacks.
    ::

  :::

  :::prose-accordion-item{icon="healthicons:3"}

  #label
  ### Handle post-payment events

  #content
  Onerway sends a [TXN](https://docs.onerway.com/apis/en/v0.6/transaction-notification#notification-parameters){badge="API"} event when a customer completes a payment. Follow the [webhook guide](https://docs.onerway.com/apis/en/v0.6/transaction-notification){badge="API"} to receive and handle these events, which might trigger you to:

  - Send an order confirmation email to your customer
  - Log the sale in a database
  - Start a shipping workflow
  - Handle transaction status (`status` field) when processing asynchronous notifications. The status indicates the payment result (e.g., `S` for success)

  Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your return page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept different types of payment methods with a single integration.

  :::

  :::prose-accordion-item{icon="healthicons:4"}

  #label
  ### Test your integration

  #content
  To test your SDK integration:

  1. Create a Payment Intent by calling your `/create-payment-intent` endpoint
  2. Initialize the Onerway SDK with the returned `transactionId` and `redirectUrl`
  3. Fill out the payment details with a method from the following table:

    - Enter any future date for card expiry
    - Enter any 3-digit number for CVC
    - Enter cardholder name

  4. Click **Pay**. The SDK will process the payment
  5. Go to the Dashboard and look for the payment on the :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label="Transactions page"}. If your payment succeeded, you'll see it in that list
  6. Click your payment to see more details, like billing information and the list of purchased items. You can use this information to fulfill the order.

  | CARD NUMBER | SCENARIO | HOW TO TEST |
  |-------------|----------|-------------|
  | `4761344136141390`{:copy="true" format="card"} | Payment succeeds (no auth required) | Use any expiry, CVC, and name |
  | `4021937195658141`{:copy="true" format="card"} | Card declined (`insufficient_funds`) | Use any expiry, CVC, and name |
  | `4000020951595032`{:copy="true" format="card"} | Requires [3DS authentication](#){badge="TODO"} | Use any expiry, CVC, and name |

  See [Testing](#){badge="TODO"} for additional information to test your integration.
  :::

::::

