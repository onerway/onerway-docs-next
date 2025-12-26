::::callout{color="neutral" icon="i-lucide:shield-alert"}

**[PCI DSS](https://www.pcisecuritystandards.org/about_us/){external: true} Compliance Required** <br>

This integration method requires you to handle sensitive card data directly, which means you must:
- Maintain a valid PCI DSS certification
- Implement proper encryption and security measures
- Never store sensitive authentication data (CVV codes)

If you don't have PCI certification, use Onerway-hosted page or Embedded components instead.

::::

Build a custom payment form with complete control over UI and payment flow using the [Direct Payment](https://docs.onerway.com/apis/en/v0.6/api-card){badge="API"}.

::::payment-demo

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
  ### Create a Payment Intent

  #content
  A Payment Intent represents your intent to collect payment from a customer. Your server creates the Payment Intent with payment details and card information, then returns the transaction status or a 3DS redirect URL to the client.

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

    Set up your merchant configuration with the Direct Payment API endpoint:

      ::code-collapse{name="Base configuration (expand to view)"}
      ```java [ServerDemo.java - Configuration]
      import static spark.Spark.*;
      import spark.Request;
      import spark.Response;
      import com.fasterxml.jackson.databind.JsonNode;
      import com.fasterxml.jackson.databind.ObjectMapper;
      // ... other imports

      public class ServerDemo {
        private static final ObjectMapper JSON = new ObjectMapper();
        private static final String DIRECT_PAYMENT_URL = "https://sandbox-acq.onerway.com/v1/txn/doTransaction";
        private static final String MERCHANT_NO = "REPLACE_WITH_YOUR_MERCHANT_NO";
        private static final String DEFAULT_APP_ID = "REPLACE_WITH_YOUR_APP_ID";
        private static final String MERCHANT_SECRET = "REPLACE_WITH_YOUR_MERCHANT_SECRET";
        private static final String DEFAULT_RETURN_URL = "https://merchant.example.com/pay/return";
        private static final String DEFAULT_NOTIFY_URL = "https://merchant.example.com/pay/notify";

        private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        public static void main(String[] args) {
          port(8080);
          post("/create-direct-payment", ServerDemo::handleDirectPayment);
        }
      }
      ```
      ::

      :::callout{color="neutral" icon="i-lucide:lightbulb"}
      Replace the credentials with your actual merchant number, app ID, and secret from your Onerway dashboard.
      :::

    #### Create Direct Payment Handler

    Implement the payment endpoint that processes card data and returns the transaction result:

    ```java [ServerDemo.java - Direct Payment Handler] {9,20-21,27-31}
    private static Object handleDirectPayment(Request req, Response res) {
      res.type("application/json");

      // Parse card information from client request
      String requestBody = req.body();
      Map<String, String> clientData = JSON.readValue(requestBody,
        new TypeReference<Map<String, String>>() {});

      // Build payment request with card information
      Map<String, String> body = buildPaymentBodyWithCardInfo(clientData);

      // Generate signature
      String signBase = buildSignBaseString(body, MERCHANT_SECRET);
      String sign = sha256Hex(signBase);
      body.put("sign", sign);

      try {
        String requestJson = toJson(body);

        // Send request to Onerway Direct Payment API
        String responseJson = postJson(DIRECT_PAYMENT_URL, requestJson);

        // Parse response
        JsonNode responseNode = JSON.readTree(responseJson);
        String respCode = responseNode.path("respCode").asText();

        // Build client response
        Map<String, Object> result = new TreeMap<>();
        if ("20000".equals(respCode)) {
          result.put("success", true);
          result.put("data", responseNode.path("data"));
        } else {
          result.put("success", false);
          result.put("error", responseNode.path("respMsg").asText());
        }

        return toJson(result);
      } catch (Exception e) {
        Map<String, Object> error = new TreeMap<>();
        error.put("success", false);
        error.put("error", "Failed to process payment: " + e.getMessage());
        return toJson(error);
      }
    }
    ```

      :::callout{color="warning" icon="i-lucide:shield-alert"}
      **Critical Security Requirements**

      - Never log or store the complete card number or CVV
      - Always validate card data on the server side
      - Use HTTPS for all communication
      - Implement rate limiting to prevent abuse
      :::

    #### Build Payment Request with Card Info

    Create the payment request payload including sensitive card data:

      ::code-collapse
      ```java [ServerDemo.java - Request Builder with Card Info]
      private static Map<String, String> buildPaymentBodyWithCardInfo(
          Map<String, String> clientData) {
        String merchantTxnId = String.valueOf(System.currentTimeMillis());
        String merchantTxnTime = LocalDateTime.now().format(DATETIME_FMT);

        String appId = DEFAULT_APP_ID;
        String billingInformation = buildBillingInformation(
          clientData.getOrDefault("country", "US"),
          clientData.getOrDefault("email", "customer@example.com")
        );

        // Build card information JSON
        String cardInfo = buildCardInfo(
          clientData.get("cardNumber"),
          clientData.get("cvv"),
          clientData.get("month"),
          clientData.get("year"),
          clientData.get("holderName")
        );

        String txnOrderMsg = buildTxnOrderMsg(
          appId,
          DEFAULT_RETURN_URL,
          DEFAULT_NOTIFY_URL,
          clientData.getOrDefault("ip", "127.0.0.1")
        );

        Map<String, String> body = new TreeMap<>();
        body.put("billingInformation", billingInformation);
        body.put("cardInfo", cardInfo);
        body.put("merchantCustId", "DEMO-CUSTOMER-ID");
        body.put("merchantNo", MERCHANT_NO);
        body.put("merchantTxnId", merchantTxnId);
        body.put("merchantTxnTime", merchantTxnTime);
        body.put("orderAmount", clientData.getOrDefault("amount", "100.00"));
        body.put("orderCurrency", clientData.getOrDefault("currency", "USD"));
        body.put("productType", "CARD");
        body.put("shippingInformation", billingInformation);
        body.put("subProductType", "DIRECT");
        body.put("txnOrderMsg", txnOrderMsg);
        body.put("txnType", "SALE");
        return body;
      }

      private static String buildCardInfo(String cardNumber, String cvv,
          String month, String year, String holderName) {
        Map<String, String> cardInfo = new TreeMap<>();
        cardInfo.put("cardNumber", cardNumber);
        cardInfo.put("cvv", cvv);
        cardInfo.put("month", month);
        cardInfo.put("year", year);
        cardInfo.put("holderName", holderName);
        return toJson(cardInfo);
      }

      private static String buildBillingInformation(String country, String email) {
        Map<String, Object> billing = new TreeMap<>();
        billing.put("country", country);
        billing.put("email", email);
        billing.put("firstName", "John");
        billing.put("lastName", "Doe");
        return toJson(billing);
      }

      private static String buildTxnOrderMsg(String appId, String returnUrl,
          String notifyUrl, String transactionIp) {
        List<Map<String, String>> products = new ArrayList<>();
        Map<String, String> product = new TreeMap<>();
        product.put("price", "100.00");
        product.put("num", "1");
        product.put("name", "Premium Product");
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
      private static String postJson(String url, String jsonBody)
          throws IOException, InterruptedException {
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
          "originMerchantTxnId", "customsDeclarationAmount",
          "customsDeclarationCurrency", "paymentMethod", "walletTypeName",
          "periodValue", "tokenExpireTime", "sign", "cardInfo");
        return EXCLUDED_KEYS_BASE.contains(key) ||
          (!refundRequest && "originTransactionId".equals(key));
      }

      private static boolean isNonEmpty(String value) {
        return value != null && (value.length() > 0 || "0".equals(value));
      }
      ```
      ::

    :::

    ::callout{color="primary" icon="i-lucide:info"}
    **Key Differences from Checkout Session**

    - **API Endpoint**: Uses `/v1/txn/doTransaction` instead of `/txn/payment`
    - **Card Data**: Includes `cardInfo` parameter with sensitive card details
    - **PCI Scope**: Your server handles raw card data (requires PCI compliance)
    - **Response Handling**: May return `status=R` for 3DS authentication
    ::

  ### Understanding the Response

  The API returns a response with the transaction status:

  ```json
  {
    "respCode": "20000",
    "respMsg": "Success",
    "data": {
      "transactionId": "1919652333131005952",
      "status": "S",  // or "R" for 3DS required
      "redirectUrl": null,  // populated when status is "R"
      "actionType": null,  // "RedirectURL" when 3DS required
      // ... other fields
    }
  }
  ```

  **Response status values:**

  | Status | Description | Client Action |
  |--------|-------------|---------------|
  | `S` | Payment succeeded | Show confirmation page |
  | `R` | Requires 3DS authentication | Redirect to `redirectUrl` |
  | `F` | Payment failed | Show error, allow retry |

  :::


  :::prose-accordion-item{icon="healthicons:2"}

  #label
  ### Build your payment form

  #content
  Create a custom payment form to collect card information from your customers. You have complete control over the design and user experience, but you're responsible for implementing security best practices.

    :::callout{color="warning" icon="i-lucide:shield-alert"}
    **Security Requirements**

    - Always use HTTPS in production
    - Never log or store complete card numbers or CVV codes
    - Validate card data on the server, not just the client
    - Implement CSRF protection
    - Use Content Security Policy (CSP) headers
    :::

  ### HTML Payment Form

  Create a payment form that collects the necessary card information:

    :::code-group
    ```html [HTML] {6-7,9-10,12-13,15-16,18-19,21}
    <!DOCTYPE html>
    <html>
      <head>
        <title>Checkout</title>
        <style>
          .form-group { margin-bottom: 15px; }
          .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .form-group input { width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; }
          .error { color: red; margin-top: 5px; font-size: 14px; }
          button { background: #5469d4; color: white; padding: 12px 24px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; width: 100%; }
          button:disabled { background: #ccc; cursor: not-allowed; }
          .card-row { display: flex; gap: 10px; }
          .card-row .form-group { flex: 1; }
        </style>
      </head>
      <body>
        <h1>Complete Your Payment</h1>
        <form id="payment-form">
          <div class="form-group">
            <label for="card-number">Card Number</label>
            <input
              type="text"
              id="card-number"
              placeholder="4111 1111 1111 1111"
              maxlength="19"
              required
            />
            <div class="error" id="card-number-error"></div>
          </div>

          <div class="card-row">
            <div class="form-group">
              <label for="expiry-month">Expiry Month</label>
              <input
                type="text"
                id="expiry-month"
                placeholder="MM"
                maxlength="2"
                required
              />
            </div>
            <div class="form-group">
              <label for="expiry-year">Expiry Year</label>
              <input
                type="text"
                id="expiry-year"
                placeholder="YYYY"
                maxlength="4"
                required
              />
            </div>
            <div class="form-group">
              <label for="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                placeholder="123"
                maxlength="4"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="cardholder-name">Cardholder Name</label>
            <input
              type="text"
              id="cardholder-name"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="customer@example.com"
              required
            />
          </div>

          <button type="submit" id="submit-button">Pay $100.00</button>
          <div class="error" id="form-error"></div>
        </form>

        <script>
          document.getElementById('payment-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = document.getElementById('submit-button');
            const formError = document.getElementById('form-error');

            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            formError.textContent = '';

            // Format card number (remove spaces)
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');

            // Collect payment data
            const paymentData = {
              cardNumber: cardNumber,
              cvv: document.getElementById('cvv').value,
              month: document.getElementById('expiry-month').value.padStart(2, '0'),
              year: document.getElementById('expiry-year').value,
              holderName: document.getElementById('cardholder-name').value,
              email: document.getElementById('email').value,
              amount: '100.00',
              currency: 'USD',
              ip: '' // Server will add the actual IP
            };

            try {
              // Send payment data to your server
              const response = await fetch('/create-direct-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
              });

              const result = await response.json();

              if (result.success && result.data) {
                const status = result.data.status;
                const actionType = result.data.actionType;

                if (status === 'S') {
                  // Payment succeeded
                  window.location.href = '/order-confirmation?txn=' + result.data.transactionId;
                } else if (status === 'R' && actionType === 'RedirectURL') {
                  // 3DS authentication required
                  window.location.href = result.data.redirectUrl;
                } else {
                  // Payment failed
                  formError.textContent = result.data.respMsg || 'Payment failed. Please try again.';
                  submitButton.disabled = false;
                  submitButton.textContent = 'Pay $100.00';
                }
              } else {
                formError.textContent = result.error || 'An error occurred. Please try again.';
                submitButton.disabled = false;
                submitButton.textContent = 'Pay $100.00';
              }
            } catch (error) {
              console.error('Payment error:', error);
              formError.textContent = 'Network error. Please check your connection and try again.';
              submitButton.disabled = false;
              submitButton.textContent = 'Pay $100.00';
            }
          });

          // Format card number with spaces as user types
          document.getElementById('card-number').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
          });

          // Only allow numbers in card number field
          document.getElementById('card-number').addEventListener('keypress', (e) => {
            if (!/[0-9\s]/.test(e.key)) {
              e.preventDefault();
            }
          });

          // Only allow numbers in CVV and expiry fields
          ['cvv', 'expiry-month', 'expiry-year'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            });
          });
        </script>
      </body>
    </html>
    ```
    :::

    :::callout{color="neutral" icon="i-lucide:lightbulb"}
    **Best Practices**

    - **Input formatting**: Format card numbers with spaces for better readability
    - **Input validation**: Validate on both client and server side
    - **Error handling**: Provide clear, actionable error messages
    - **Loading states**: Disable the submit button during processing
    - **Mobile optimization**: Use `font-size: 16px` to prevent zoom on iOS
    :::

  ### Framework Examples (Optional)

  If you're using a JavaScript framework, here are equivalent implementations:

    ::code-collapse{name="Vue.js example (optional)"}
    ```vue [Vue]
    <template>
      <div>
        <h1>Complete Your Payment</h1>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="card-number">Card Number</label>
            <input
              v-model="cardNumber"
              type="text"
              id="card-number"
              placeholder="4111 1111 1111 1111"
              maxlength="19"
              @input="formatCardNumber"
              required
            />
          </div>

          <div class="card-row">
            <div class="form-group">
              <label>Expiry Month</label>
              <input v-model="expiryMonth" placeholder="MM" maxlength="2" required />
            </div>
            <div class="form-group">
              <label>Expiry Year</label>
              <input v-model="expiryYear" placeholder="YYYY" maxlength="4" required />
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input v-model="cvv" placeholder="123" maxlength="4" required />
            </div>
          </div>

          <div class="form-group">
            <label>Cardholder Name</label>
            <input v-model="cardholderName" placeholder="John Doe" required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="customer@example.com" required />
          </div>

          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Processing...' : 'Pay $100.00' }}
          </button>
          <div v-if="error" class="error">{{ error }}</div>
        </form>
      </div>
    </template>

    <script setup>
    import { ref } from 'vue'

    const cardNumber = ref('')
    const expiryMonth = ref('')
    const expiryYear = ref('')
    const cvv = ref('')
    const cardholderName = ref('')
    const email = ref('')
    const isLoading = ref(false)
    const error = ref('')

    const formatCardNumber = (e) => {
      let value = e.target.value.replace(/\s/g, '')
      cardNumber.value = value.match(/.{1,4}/g)?.join(' ') || value
    }

    const handleSubmit = async () => {
      isLoading.value = true
      error.value = ''

      try {
        const response = await fetch('/create-direct-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardNumber: cardNumber.value.replace(/\s/g, ''),
            cvv: cvv.value,
            month: expiryMonth.value.padStart(2, '0'),
            year: expiryYear.value,
            holderName: cardholderName.value,
            email: email.value,
            amount: '100.00',
            currency: 'USD'
          })
        })

        const result = await response.json()

        if (result.success && result.data) {
          if (result.data.status === 'S') {
            window.location.href = '/order-confirmation?txn=' + result.data.transactionId
          } else if (result.data.status === 'R' && result.data.actionType === 'RedirectURL') {
            window.location.href = result.data.redirectUrl
          } else {
            error.value = result.data.respMsg || 'Payment failed. Please try again.'
          }
        } else {
          error.value = result.error || 'An error occurred. Please try again.'
        }
      } catch (err) {
        console.error('Payment error:', err)
        error.value = 'Network error. Please check your connection and try again.'
      } finally {
        isLoading.value = false
      }
    }
    </script>

    <style scoped>
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
    .form-group input { width: 100%; padding: 8px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; }
    .error { color: red; margin-top: 10px; }
    button { background: #5469d4; color: white; padding: 12px 24px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; width: 100%; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .card-row { display: flex; gap: 10px; }
    </style>
    ```
    ::

    ::code-collapse{name="React example (optional)"}
    ```jsx [React]
    import { useState } from 'react'

    function PaymentForm() {
      const [cardNumber, setCardNumber] = useState('')
      const [expiryMonth, setExpiryMonth] = useState('')
      const [expiryYear, setExpiryYear] = useState('')
      const [cvv, setCvv] = useState('')
      const [cardholderName, setCardholderName] = useState('')
      const [email, setEmail] = useState('')
      const [isLoading, setIsLoading] = useState(false)
      const [error, setError] = useState('')

      const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '')
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
        setCardNumber(formatted)
      }

      const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
          const response = await fetch('/create-direct-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardNumber: cardNumber.replace(/\s/g, ''),
              cvv,
              month: expiryMonth.padStart(2, '0'),
              year: expiryYear,
              holderName: cardholderName,
              email,
              amount: '100.00',
              currency: 'USD'
            })
          })

          const result = await response.json()

          if (result.success && result.data) {
            if (result.data.status === 'S') {
              window.location.href = '/order-confirmation?txn=' + result.data.transactionId
            } else if (result.data.status === 'R' && result.data.actionType === 'RedirectURL') {
              window.location.href = result.data.redirectUrl
            } else {
              setError(result.data.respMsg || 'Payment failed. Please try again.')
            }
          } else {
            setError(result.error || 'An error occurred. Please try again.')
          }
        } catch (err) {
          console.error('Payment error:', err)
          setError('Network error. Please check your connection and try again.')
        } finally {
          setIsLoading(false)
        }
      }

      return (
        <div>
          <h1>Complete Your Payment</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                placeholder="4111 1111 1111 1111"
                maxLength="19"
                required
              />
            </div>

            <div className="card-row">
              <div className="form-group">
                <label>Expiry Month</label>
                <input
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  placeholder="MM"
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Year</label>
                <input
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  placeholder="YYYY"
                  maxLength="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength="4"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                required
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Pay $100.00'}
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      )
    }

    export default PaymentForm
    ```
    ::

  :::

  :::prose-accordion-item{icon="healthicons:3"}

  #label
  ### Handle post-payment events

  #content
  After the customer submits the payment form, handle the response based on the transaction status. Onerway may require additional authentication (3DS) or notify you of the payment result via webhook.

  ### Handle 3DS Authentication

  When the payment response contains `status=R` and `actionType=RedirectURL`, you must redirect the customer to complete 3D Secure authentication:

    :::callout{color="primary" icon="i-lucide:info"}
    **3D Secure authentication flow**

    When `status` is `R`, redirect your customer to `redirectUrl` for [3D Secure authentication](/mock/3d-secure). After completing authentication:

    1. **The payment form will NOT be notified again**
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
    - **Recommended**: Wait for Onerway's webhook notification (covered below)
    - **Alternative**: Actively query Onerway's [Transaction Query API](https://docs.onerway.com/apis/en/v0.6/order-query){badge="API"} with `transactionId`
    :::

    :::callout{color="warning" icon="i-lucide:alert-triangle"}
    **Server-side verification is required**

    Always verify payment status server-side:

    - **Without 3DS**: Immediate response provides frontend feedback; still verify via webhook server-side
    - **With 3DS**: No immediate feedback; frontend polls your backend API, which either:
      - Checks its database (updated by Onerway webhook)
      - Actively queries Onerway's [Transaction Query API](https://docs.onerway.com/apis/en/v0.6/order-query){badge="API"} with `transactionId`

    **Never trust URL parameters alone** - they can be manipulated. Always validate payment status through your backend to prevent fraud.
    :::

  ### Payment Status Codes

  The API returns different status codes based on the payment result:

  | Status | Description | When it occurs | Next action |
  |--------|-------------|----------------|-------------|
  | `S` | Success | Payment completed successfully | Show order confirmation |
  | `F` | Failure | Payment failed | Show error, allow retry |
  | `R` | Requires action | Customer needs to complete 3D Secure authentication | Redirect to `redirectUrl` |

  ### Handle Webhook Notifications

  Onerway sends a [TXN](https://docs.onerway.com/apis/en/v0.6/transaction-notification#notification-parameters){badge="API"} event when a customer completes a payment. Follow the [webhook guide](https://docs.onerway.com/apis/en/v0.6/transaction-notification){badge="API"} to receive and handle these events, which might trigger you to:

  - Send an order confirmation email to your customer
  - Log the sale in a database
  - Start a shipping workflow
  - Handle transaction status (`status` field) when processing asynchronous notifications. The status indicates the payment result (e.g., `S` for success)

  Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your return page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept different types of payment methods with a single integration.

  **Example webhook payload:**

  ```json
  {
    "notifyType": "TXN",
    "transactionId": "1919652333131005952",
    "txnType": "SALE",
    "merchantNo": "800209",
    "merchantTxnId": "2ce8fca1-f380-4c60-85ef-68a3a0c76ece",
    "responseTime": "2025-05-06 15:16:00",
    "txnTime": "2025-05-06 15:15:56",
    "txnTimeZone": "+08:00",
    "orderAmount": "100.00",
    "orderCurrency": "USD",
    "status": "S",
    "cardBinCountry": "US",
    "reason": "{\"respCode\":\"20000\",\"respMsg\":\"Success\"}",
    "sign": "ff999833f72c5a5875af7fa797020cfb83f9ca1f7408b2a4c85c039f835e6c62",
    "paymentMethod": "VISA",
    "channelRequestId": "8002091919652333131005952"
  }
  ```

  **Your webhook endpoint must:**

  1. Verify the signature to ensure the request is from Onerway
  2. Check the `status` field to determine the payment result
  3. Update your database with the transaction status
  4. Respond with the `transactionId` to acknowledge receipt
  5. Handle duplicate notifications idempotently

  Example webhook handler:

    :::code-group
    ```java [Java]
    @Post("/webhook")
    public String handleWebhook(Request req, Response res) {
      String body = req.body();

      // Parse webhook data
      Map<String, String> webhookData = JSON.readValue(body,
        new TypeReference<Map<String, String>>() {});

      // Verify signature
      String receivedSign = webhookData.remove("sign");
      String calculatedSign = generateSignature(webhookData, MERCHANT_SECRET);

      if (!calculatedSign.equals(receivedSign)) {
        return "Invalid signature";
      }

      // Process the webhook
      String transactionId = webhookData.get("transactionId");
      String status = webhookData.get("status");
      String merchantTxnId = webhookData.get("merchantTxnId");

      // Update your database
      updateOrderStatus(merchantTxnId, status, webhookData);

      // Send confirmation email if successful
      if ("S".equals(status)) {
        sendOrderConfirmation(merchantTxnId);
      }

      // Acknowledge receipt
      return transactionId;
    }
    ```

    ```javascript [Node.js]
    app.post('/webhook', (req, res) => {
      const webhookData = { ...req.body };

      // Verify signature
      const receivedSign = webhookData.sign;
      delete webhookData.sign;
      const calculatedSign = generateSignature(webhookData, MERCHANT_SECRET);

      if (calculatedSign !== receivedSign) {
        return res.status(400).send('Invalid signature');
      }

      // Process the webhook
      const { transactionId, status, merchantTxnId } = webhookData;

      // Update your database
      updateOrderStatus(merchantTxnId, status, webhookData);

      // Send confirmation email if successful
      if (status === 'S') {
        sendOrderConfirmation(merchantTxnId);
      }

      // Acknowledge receipt
      res.send(transactionId);
    });
    ```
    :::

    :::callout{color="neutral" icon="i-lucide:lightbulb"}
    **Webhook Best Practices**

    - Always verify the webhook signature before processing
    - Process webhooks idempotently (handle duplicate notifications)
    - Respond quickly (within 5 seconds) to avoid retries
    - Log all webhook data for debugging and reconciliation
    - If no response is received, Onerway will retry up to 3 times at 30-minute intervals
    :::

  :::

  :::prose-accordion-item{icon="healthicons:4"}

  #label
  ### Test your integration

  #content
  To test your Direct Payment integration:

  1. Start your server and navigate to your payment form
  2. Fill out the form with test card details from the table below
  3. Submit the form and verify the response
  4. For 3DS cards, complete authentication on the redirect page
  5. Check the Dashboard :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label="Transactions page"} to verify the payment
  6. Verify that you receive the webhook notification at your `notifyUrl`

  ### Test Cards

  Use these test card numbers to simulate different payment scenarios:

    ::prose-tabs{variant="link" sync="test-cards-advanced" :spread="false"}

      :::prose-tabs-item{label="Card"}
      | CARD NUMBER | SCENARIO | HOW TO TEST |
      |-------------|----------|-------------|
      | `4761344136141390`{:copy="true" format="card"} | The card payment succeeds and doesn't require authentication | Fill out the form with any future expiry date, any 3-digit CVV, and any cardholder name |
      | `4021937195658141`{:copy="true" format="card"} | The card is declined with a decline code like `insufficient_funds` | Fill out the form with any future expiry date, any 3-digit CVV, and any cardholder name |
      | `4000020951595032`{:copy="true" format="card"} | The card payment requires [authentication](/mock/authentication) | Fill out the form with any future expiry date, any 3-digit CVV, and any cardholder name. Complete the 3DS challenge on the redirect page |
      :::

      :::prose-tabs-item{label="Additional Scenarios"}
      | SCENARIO | DESCRIPTION | HOW TO TEST |
      |----------|-------------|-------------|
      | Invalid card number | Test client-side validation | Enter `4111 1111 1111 1112` (invalid Luhn check) |
      | Expired card | Test expiry validation | Enter an expiry date in the past |
      | Invalid CVV | Test CVV validation | Enter only 2 digits or leave empty |
      | Network error | Test error handling | Stop your server and submit the form |
      | 3DS timeout | Test 3DS abandonment | Close the 3DS page without completing authentication |
      :::

    ::

  ### Verification Checklist

  After testing, verify that your integration:

  - [ ] **Collects card data securely** over HTTPS
  - [ ] **Validates input** on both client and server side
  - [ ] **Handles successful payments** and redirects to confirmation page
  - [ ] **Handles failed payments** with clear error messages
  - [ ] **Handles 3DS authentication** by redirecting to the authentication page
  - [ ] **Processes webhooks** correctly and updates order status
  - [ ] **Verifies webhook signatures** before processing
  - [ ] **Handles duplicate webhooks** idempotently
  - [ ] **Logs payment data** for debugging and reconciliation (without logging sensitive card data)
  - [ ] **Responds to webhooks** within 5 seconds

    :::callout{color="success" icon="i-lucide:check-circle"}
    **Testing Checklist Complete?**

    Once you've verified all scenarios work correctly:

    1. Review your PCI DSS compliance documentation
    2. Ensure all security measures are in place
    3. Test with real small-value transactions before going live
    4. Set up monitoring for payment failures and webhook errors
    5. Document your payment flow for your team
    :::

  See [Testing](/mock/testing) for additional information to test your integration.

  :::

::::

