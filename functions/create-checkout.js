const stripe = require('stripe')(
  'sk_test_51QyFMCPRAnMpnSvU4iq7Iorwhbi84onYbrd7TxJlpkU8tTNVMb8fboIqPKHNioTINTvJYq1Hh3xxss2ezTIWikwG00XH7i0qyX'
); // Secret key

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

    // Check if the test100 coupon exists, if not create it
    let coupon;
    try {
      // Try to retrieve the coupon
      coupon = await stripe.coupons.retrieve('test100');
      console.log('Retrieved existing test100 coupon');
    } catch (err) {
      // If the coupon doesn't exist, create it
      if (err.code === 'resource_missing') {
        coupon = await stripe.coupons.create({
          id: 'test100',
          percent_off: 100, // 100% discount
          duration: 'once',
          name: 'Test Discount (100% off)',
        });
        console.log('Created new test100 coupon');
      } else {
        throw err; // Other errors should be thrown
      }
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
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
      // Enable discount codes
      allow_promotion_codes: true,
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
