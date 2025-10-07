require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use a stable API version
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
        unit_amount: 25900, // 259€ in cents
        currency: 'eur',
      });
      priceId = price.id;
      console.log(`Created new price: ${priceId}`);
    }

    // If no price ID is provided, use the default product key from live mode
    if (!priceId) {
      priceId = 'price_1RmZQcA9aibyk7oc7HnUPblY'; // Live mode product key - Updated to new 259€ offer
    }

    // Construct return URL with clickId if it exists
    const returnUrl = clickId
      ? `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}&cid=${clickId}`
      : `${event.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`;

    // Create a checkout session for embedded mode with coupon support
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card', 'klarna', 'paypal'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: returnUrl,
      locale: 'de',
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'FR', 'IT', 'BE', 'NL', 'LU', 'ES', 'US', 'GB'],
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true, // Enable coupon/discount codes
      metadata: {
        order_id: generatedOrderId,
        ...(clickId && { click_id: clickId }), // Only add if clickId has a value
        dhl_tracking: '-', // Placeholder for easy editing in Dashboard
      },
      // Pass metadata to the payment intent
      payment_intent_data: {
        metadata: {
          order_id: generatedOrderId,
          ...(clickId && { click_id: clickId }), // Only add if clickId has a value
          dhl_tracking: '-', // Placeholder for easy editing in Dashboard
        },
      },
    });

    // Return the client secret
    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: session.client_secret }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};