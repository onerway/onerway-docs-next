Onerway Checkout 是一个预构建的托管支付页面，可处理完整的支付流程。此集成方式只需少量代码，非常适合快速接入支付而无需构建自定义结账体验。

使用 [Onerway Checkout](https://demo.onerway.com/standard-checkout) 将客户重定向到 Onerway 托管的支付页面。了解此集成方式与 Onerway [其他集成方式](/mock/integration-types)的对比。

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
  title: 集成难度
  ---

  #description

    ::u-badge{color="success" variant="subtle" label="低代码"}
    ::

  ::::::

  ::::::u-page-feature
  ---
  title: 集成类型
  description: 重定向到 Onerway 托管支付页面
  ---

  ::::::

  ::::::u-page-feature
  ---
  title: UI 自定义
  ---

  #description

    ::u-popover
    ---
    mode: hover
    arrow: true
    class: cursor-pointer
    ---
      :::::u-button{variant="link" color="primary" label="有限自定义" class="px-0"}
      :::::

    #content

    - 20 种预设字体
    - 3 种预设圆角
    - 自定义背景色和边框颜色
    - 自定义 Logo

    ::

  ::::::

::

首先，[注册](/get-started/start-building/start-developing#create-a-sandbox-account) Onerway 账户。

[获取 API 凭证](/get-started/start-building/start-developing#get-your-api-credentials)，然后从应用程序访问 Onerway API：

::prose-accordion
---
type: multiple
defaultValue: ["0", "1", "2", "3"]
---

  :::::prose-accordion-item{icon="healthicons:1"}

  #label
  ## 将客户重定向到 Onerway Checkout

  #content
  在网站上添加结账按钮，调用服务端端点创建[收银台会话](https://docs.onerway.com/apis/zh/v0.6/checkout){badge="API"}

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

  收银台会话在代码中封装了由重定向到托管结账表单触发的完整客户支付流程。可配置的选项包括：

  - 使用的币种
  - 提供的支付方式

  收银台会话中需要配置两个重要的 URL：

    :::::note
    这两个 URL 对于完整集成至关重要。`notifyUrl` webhook 是获取支付状态更新和订单履行的主要来源。
    :::::

  - **`returnUrl`**：客户完成支付后（成功或失败）重定向到的网站页面 URL。用于向客户提供即时反馈。
  - **`notifyUrl`**：Onerway 向服务器发送支付事件的 webhook URL。即使客户未返回网站，也能确保服务器收到支付确认。


  创建收银台会话后，将客户重定向到响应中返回的重定向 URL。以下是服务端实现示例：

    :::::callout{color="neutral" icon="i-lucide:lightbulb"}
    收银台会话默认在创建后 **30 分钟**过期。
    :::::

  ### 服务端实现（Java）

    :::::steps{level="4"}

    #### 添加 Maven 依赖

    首先，在 `pom.xml` 中添加所需依赖：

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

    #### 配置基础设置

    设置商户配置和常量：
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
      将凭证替换为 Onerway 控制台中的实际商户号、应用 ID 和密钥。
      :::::

    #### 创建支付请求处理器

    实现主要的支付处理逻辑：

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

    #### 构建支付请求数据

    创建包含所有必需字段的支付请求载荷：

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

    #### 处理签名和 API 通信

    实现签名生成和 API 通信：

      ::code-collapse{title="完整工具方法"}

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

    获取完整的可运行实现：
    - 在即用环境中体验: :u-button{trailingIcon="mdi:github" variant="outline" color="neutral" label="在 GitHub Codespaces 中打开" to="https://codespaces.new/Abel-Wang777/onerway-payment-demo?quickstart=1" target="_blank"}

    - 下载 :u-button{trailingIcon="i-lucide-download" variant="outline" color="neutral" label="ServerDemo.java" to="/assets/code/ServerDemo.java" target="_blank" download="ServerDemo.java"}
    ::

  ### 支付方式

  Onerway 默认启用银行卡和其他常用支付方式。在 Checkout 中，Onerway 根据币种和相关限制动态展示支持的支付方式。

  查看支持的支付方式，请访问 :prose-link-switch{preset="merchant-dashboard" path="/application/list" label="应用列表"}。在 :prose-link-switch{preset="merchant-dashboard" path="/checkout/card" label="支付方式"}中可以调整提供的支付方式排序。

  Onerway 托管页面无需修改集成即可启用 Apple Pay 或 Google Pay。Onerway 以与其他银行卡支付相同的方式处理这些支付。

  #### 测试

  1. 启动服务器

  在浏览器中访问 `http://localhost:8080`{:copy="true"}。将看到一个简单的购买页面，可将客户重定向到 Onerway Checkout：

  ![Premium Gadget 购买页面](/assets/images/checkout-demo.png)

  2. 进入结账页面

  点击 **Checkout** 按钮。如果配置正确，将被重定向到 Onerway 结账页面，客户可在此完成支付。

    ::warning
    **凭证缺失** <br>

    如果看到以下响应，表示 `MERCHANT_NO`、`DEFAULT_APP_ID` 或 `MERCHANT_SECRET` 未配置：

    ```json
    {
      "respCode": "40013",
      "respMsg": "Abnormal parameters (cannot be read)",
      "data": null
    }
    ```

    请按照[上一步](#配置基础设置)中的说明设置这些环境变量或配置值。
    ::
  :::::

  :::::prose-accordion-item{icon="healthicons:2"}

  #label

  ## 显示成功页面

  #content
  客户成功提交支付表单后，显示成功页面非常重要。在收银台会话中设置成功页面 URL，以便将客户重定向到此页面。

  创建一个简单的成功页面：

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

  接下来，更新收银台会话创建端点以使用这个新页面：

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

  #### 测试

  1. 点击支付按钮
  2. 使用测试卡信息填写支付表单：
    - **卡号**：输入 `4000 0209 5159 5032`{:copy="true" format="card"}
    - **有效期**：输入任意未来日期
    - **CVC**：输入任意 3 位数字
    - **持卡人姓名**：输入名字和姓氏
  3. 点击 **Pay** 按钮
  4. 将被重定向到成功页面

  接下来，在控制台的 :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label="交易记录"}中查找新支付。成功的支付会出现在支付列表中。点击某笔交易会进入支付详情页面，其中包含账单信息和购买商品列表，可用于手动履行订单。

  :::::

  :::::prose-accordion-item{icon="healthicons:3"}

  #label
  ## 处理支付后事件

  #content
  客户完成收银台会话支付后，Onerway 会发送 [TXN](https://docs.onerway.com/apis/zh/v0.6/transaction-notification#notification-parameters){badge="API"} 事件。按照 [webhook 指南](https://docs.onerway.com/apis/zh/v0.6/transaction-notification){badge="API"}接收和处理这些事件，可触发以下操作：

  - 向客户发送订单确认邮件
  - 在数据库中记录销售
  - 启动配送流程
  - 处理异步通知时检查交易状态（`status` 字段）。状态表示支付结果（如 `S` 表示成功）

  监听这些事件，而不是等待客户重定向回网站。仅从 Checkout 落地页触发履行是不可靠的。设置集成以监听异步事件，可以通过单一集成接受不同类型的支付方式。

  :::::

  :::::prose-accordion-item{icon="healthicons:4"}

  #label

  ## 测试集成

  #content
  测试 Onerway 托管支付表单集成：

  1. 创建 Checkout
  2. 使用下表中的方法填写支付详情：
    - 有效期输入任意未来日期
    - CVC 输入任意 3 位数字
    - 输入持卡人姓名
  3. 点击 **Pay**。将被重定向到 `returnUrl`
  4. 进入控制台，在 :prose-link-switch{preset="merchant-dashboard" path="/transaction/query" label="交易记录页面"}查找支付。如果支付成功，会在列表中看到
  5. 点击支付查看更多详情，如包含账单信息和购买商品列表的 Checkout 摘要。可使用这些信息履行订单。

    ::prose-tabs{variant="link" sync="test-cards" :spread="false"}

      :::::prose-tabs-item{label="银行卡"}
      | 卡号 | 场景 | 测试方法 |
      |-------------|------------|-----|
      | `4761344136141390`{:copy="true" format="card"} | 银行卡支付成功，无需身份验证 | 使用该卡号填写信用卡表单，有效期、CVC 和持卡人姓名可任意填写 |
      | `4021937195658141`{:copy="true" format="card"} | 银行卡被拒绝，返回 `insufficient_funds` 等拒绝码 | 使用该卡号填写信用卡表单，有效期、CVC 和持卡人姓名可任意填写 |
      | `4000020951595032`{:copy="true" format="card"} | 银行卡支付需要[身份验证](/mock/authentication) | 使用该卡号填写信用卡表单，有效期、CVC 和持卡人姓名可任意填写 |
      :::::

      :::::prose-tabs-item{label="钱包"}
      | 支付方式 | 场景 | 测试方法 |
      |-------------|------------|-----|
      | Alipay+ | 客户使用重定向类型和[即时通知](/mock/immediate-notification)支付方式成功支付 | 选择任意重定向类型支付方式，填写必要信息并确认支付。然后在重定向页面点击完成测试支付 |
      :::::

      :::::prose-tabs-item{label="凭证"}
      | 支付方式 | 场景 | 测试方法 |
      |-------------|------------|-----|
      | Boleto、OXXO | 客户使用 Boleto 或 OXXO 凭证支付 | 选择 Boleto 或 OXXO 作为支付方式并提交支付。弹窗出现后关闭即可。 |
      :::::

    ::

  更多集成测试信息，请参阅[测试](/mock/testing)。

  :::::

::
