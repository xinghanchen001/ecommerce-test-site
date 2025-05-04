const stripe = require('stripe')(
  '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',
  {
    apiVersion: '2023-08-16', // Specify the API version to allow zero-amount orders
  }
); // Live key

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
    // We no longer expect orderId from the client
    // const orderId = data.orderId;

    // --- Generate Order ID Server-Side ---
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

    const generatedOrderId = `LPBP${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
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
      success_url: `${event.headers.origin}/success.html`,
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
      // Add generated order ID to metadata
      metadata: {
        order_id: generatedOrderId,
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
