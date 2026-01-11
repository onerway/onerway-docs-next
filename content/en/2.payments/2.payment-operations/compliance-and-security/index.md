---
title: Strong Customer Authentication readiness
description: Learn how the Strong Customer Authentication regulation affects your business and how to update your integration to support it.
navigation:
  title: SCA Readiness
---

Strong Customer Authentication (SCA), a rule in effect as of September 14, 2019, as part of PSD2 regulation in Europe, requires changes to how your European customers authenticate online payments. Card payments require you to use [3D Secure](#){badge="TODO"} to meet SCA requirements. Your customers' banks might decline transactions that don't follow the new authentication guidelines.

To support SCA:

1. Determine if SCA impacts your business.
2. Decide which SCA-ready product is right for your business.
3. Make changes now to avoid declined payments.

## Impacted businesses and payments

Update your Onerway integration to support SCA if all of the following apply:

- Your business is based in the :prose-annotation[European Economic Area]{annotation="The European Economic Area is a regional single market with free movement of labor, goods, and capital. It encompasses the European Union member states and three additional states that are part of the European Free Trade Association."} (EEA)
- You serve customers in the EEA
- You accept cards (credit or debit)

Although certain low-risk transactions (based on fraud rates related to the payment service provider or bank) don't require authentication, banks can still require customers to complete authentication. Even if you primarily process low-risk transactions, update your integration so customers can complete authentication when banks request it. Learn about [SCA exemptions](#){badge="TODO"}.

## SCA-ready products and APIs

Whether you charge one-time payments or save card information for later use, Onerway provides prebuilt and customizable products to help you meet SCA requirements.

::warning
Integrations that aren't SCA-ready, like those using hosted checkout or legacy JS SDK, might see high rates of declines from banks that enforce SCA.
::

### One-time payments

Accept card payments with the [Payments API](#){badge="TODO"} and [Checkout](#){badge="TODO"}. Both products allow merchants to customize 3D Secure authentication policies based on their risk management needs.

- **Checkout**: A prebuilt, Onerway-hosted checkout flow that automatically handles SCA requirements. Merchants can customize 3DS policies.
- **Payments API**: Allows merchants to customize SCA authentication and build custom payment flows with full control over 3DS policies.

### Reusing cards

Save a card for later reuse with the [Payments API](#){badge="TODO"} and the [Setup Intents API](#){badge="TODO"}. You can also use Checkout to automatically handle SCA requirements, or use [Billing](#){badge="TODO"} to handle SCA for [subscriptions](#){badge="TODO"}.

::note
For subscription payments, Onerway enforces 3D Secure authentication on the first payment to ensure compliance with SCA requirements. Subsequent recurring payments can use exemptions.
::

## Custom 3D Secure integration

If your business already has complete risk control capabilities and PCI DSS compliance qualifications, Onerway supports custom 3D Secure (3DS) integration. You can:

- Integrate 3DS services yourself
- Pass the authentication results to Onerway through the [API](#){badge="TODO"}
- Complete transactions using your own risk assessment

Learn more about [custom 3DS integration](#){badge="TODO"}.
