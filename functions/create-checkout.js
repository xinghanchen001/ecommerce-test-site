require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16', // Specify the API version to allow zero-amount orders
}); // Live key

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    // Extract click ID if present
    const clickId = data.clickId || '';
    console.log('Click ID received:', clickId);

    // --- Generate Order ID Server-Side (Berlin Time) ---
    const now = new Date();
    const options = {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
    };

    // Format the date and time parts according to Berlin time
    const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD format
    const parts = formatter.formatToParts(now);
    const dateParts = {};
    parts.forEach(({ type, value }) => {
      dateParts[type] = value;
    });

    const year = dateParts.year;
    const month = dateParts.month;
    const day = dateParts.day;
    const hours = dateParts.hour;
    const minutes = dateParts.minute;
    const seconds = dateParts.second;

    // Construct the ID: LPBPYYYYMMDDHHMMSS
    const generatedOrderId = `LPBP${year}${month}${day}${hours}${minutes}${seconds}`;
    // --- End Order ID Generation ---

    // Get the price ID from the request
    let priceId = data.priceId;

    if (data.productId && !priceId) {
      // Create a new price for the product
      const price = await stripe.prices.create({
        product: data.productId,
        unit_amount: 29999, // 299.99 € in cents
        currency: 'eur',
      });
      priceId = price.id;
      console.log(`Created new price: ${priceId}`);
    }

    // If no price ID is provided, use the default product key from live mode
    if (!priceId) {
      priceId = 'price_1QyfHoA9aibyk7ocoy9gcOsX'; // Live mode product key
    }

    // Construct success URL with clickId if it exists
    const successUrl = clickId
      ? `${event.headers.origin}/success.html?cid=${clickId}`
      : `${event.headers.origin}/success.html`;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna', 'paypal'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${event.headers.origin}/cancel.html`,
      locale: 'de', // Set language to German
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
        ], // Add countries you want to support
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
      automatic_tax: { enabled: true }, // Enable automatic tax calculation
      // Add generated order ID and click ID to metadata
      metadata: {
        order_id: generatedOrderId,
        click_id: clickId,
      },
      // Pass metadata to the payment intent
      payment_intent_data: {
        metadata: {
          order_id: generatedOrderId,
          click_id: clickId,
        },
      },
    });

    // Return the session ID
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
