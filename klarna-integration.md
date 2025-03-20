# Klarna Integration with Stripe Checkout

This document explains how Klarna was integrated as a payment method in the ecommerce test website using Stripe's payment gateway.

## Overview

The integration was accomplished by:

1. Adding Klarna as a payment method in the Stripe checkout session creation
2. Updating both the server-side and serverless function code
3. Adding Klarna payment information in the UI
4. Creating a dedicated page for Klarna payment options

## Implementation Details

### 1. Adding Klarna to the Server-Side Code

The main change was to update the Stripe checkout session creation to include Klarna as a payment method. This was done in two places:

#### A. In `server.js` for local development:

```javascript
// Create a checkout session with the price
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'klarna'], // Added 'klarna' here
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${req.headers.origin}/success.html`,
  cancel_url: `${req.headers.origin}/cancel.html`,
});
```

#### B. In the serverless function `functions/create-checkout.js`:

```javascript
// Create a checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'klarna'], // Added 'klarna' here
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${event.headers.origin}/success.html`,
  cancel_url: `${event.headers.origin}/cancel.html`,
  // Add shipping address collection
  shipping_address_collection: {
    allowed_countries: [
      'DE',
      'AT',
      'CH',
      'FR',
      'IT',
      'BE',
      'NL',
      'LU',
      'ES',
      'US',
      'GB',
    ],
  },
  // Collect billing address
  billing_address_collection: 'required',
  // Collect additional information
  custom_fields: [
    {
      key: 'delivery_notes',
      label: {
        type: 'custom',
        custom: 'Delivery Instructions (Optional)',
      },
      type: 'text',
      optional: true,
    },
  ],
  // Enable promotion/discount codes
  allow_promotion_codes: true,
});
```

### 2. Client-Side Integration

The client-side implementation remains simple because Stripe handles the UI for displaying and processing the Klarna payment option. Since we are using Stripe's hosted checkout page, we didn't need to implement any custom UI for Klarna payment processing.

The existing checkout flow code in `index.html` and `blutdruck-analyse.html` already handled redirecting to Stripe's checkout page:

```javascript
// Redirect to Stripe Checkout
const result = await stripe.redirectToCheckout({
  sessionId: session.id,
});
```

### 3. UI Updates to Show Klarna as a Payment Option

We updated the UI to inform users that Klarna is available as a payment option:

#### A. In `index.html`, we added Klarna to the product benefit list:

```html
<li class="flex items-start">
  <svg
    class="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
  <span>Zahlung per Kreditkarte oder Klarna</span>
</li>
<li class="flex items-start">
  <svg
    class="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
  <span>Flexible Zahlungsoptionen mit Klarna verfügbar</span>
</li>
```

#### B. In `blutdruck-analyse.html`, we added similar information:

```html
<div class="flex items-center mt-4 space-x-2 text-gray-700">
  <svg
    class="w-5 h-5 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
  <span>Zahlung per Kreditkarte oder Klarna</span>
</div>
<div class="flex items-center mt-2 space-x-2 text-gray-700">
  <svg
    class="w-5 h-5 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
  <span>Flexible Zahlungsoptionen mit Klarna verfügbar</span>
</div>
```

#### C. We added links to a dedicated Klarna information page:

```html
<a
  href="klarna-payment-info.html"
  class="text-blue-600 hover:underline text-sm block mb-4"
>
  Mehr zu Klarna Zahlungsoptionen →
</a>
```

### 4. Creating a Dedicated Klarna Information Page

We created a new page `klarna-payment-info.html` to explain the Klarna payment options in detail. This page includes:

- Information about Klarna as a payment provider
- Different payment options offered by Klarna (Pay Now, Pay Later, Pay in Installments)
- FAQ section addressing common questions about Klarna
- Responsive design that matches the rest of the website

## How It Works Behind the Scenes

When a customer proceeds to checkout:

1. Our server creates a Stripe checkout session with Klarna enabled as a payment method
2. The customer is redirected to Stripe's hosted checkout page
3. If the customer selects Klarna, they will be redirected to Klarna to complete their payment
4. After payment authorization through Klarna, the customer is redirected back to our success page
5. The payment is processed by Stripe, with Klarna handling the payment collection from the customer

## Benefits of Adding Klarna

- **Increased conversion**: Offering more payment options can increase checkout completion rates
- **Flexible payment options**: Customers can choose to pay later or in installments
- **Upfront payment**: The merchant (you) receives the full payment amount (minus fees) upfront
- **Reduced risk**: Klarna takes on the payment collection and fraud risk

## Requirements and Limitations

- The store must comply with Klarna's terms of service and branding guidelines
- Available payment options depend on the customer's location and the transaction amount
- Certain business categories (charities, political organizations, B2B) are not allowed to use Klarna

## Testing

To test the Klarna integration, create a test order and select Klarna as the payment method at checkout. You should be redirected to Klarna to complete the payment process.

Note: In Stripe's test mode, you can use [Stripe's test cards and payment methods](https://stripe.com/docs/testing) to simulate different scenarios.
