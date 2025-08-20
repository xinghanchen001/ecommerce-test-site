// Cloudflare Pages Functions version of the Stripe checkout
// Path: /api/create-checkout

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Dynamic import of Stripe to work with Cloudflare Workers
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });

    // Parse the request body
    const data = await request.json();
    
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
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options);
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

    const generatedOrderId = `LPBP${year}${month}${day}${hours}${minutes}${seconds}`;

    // Get the price ID from the request
    let priceId = data.priceId;

    if (data.productId && !priceId) {
      const price = await stripe.prices.create({
        product: data.productId,
        unit_amount: 29999, // 299.99 € in cents
        currency: 'eur',
      });
      priceId = price.id;
      console.log(`Created new price: ${priceId}`);
    }

    // Default price ID if none provided
    if (!priceId) {
      priceId = 'price_1RmZQcA9aibyk7oc7HnUPblY'; // 259€ offer
    }

    // Get the origin from the request
    const origin = request.headers.get('origin') || 'https://your-domain.com';
    
    // Construct URLs
    const successUrl = clickId
      ? `${origin}/success.html?cid=${clickId}`
      : `${origin}/success.html`;

    // Create checkout session
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
      cancel_url: `${origin}/cancel.html`,
      locale: 'de',
      shipping_address_collection: {
        allowed_countries: [
          'DE', 'AT', 'CH', 'FR', 'IT', 'BE', 
          'NL', 'LU', 'ES', 'US', 'GB',
        ],
      },
      billing_address_collection: 'required',
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
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: {
        order_id: generatedOrderId,
        click_id: clickId,
      },
      payment_intent_data: {
        metadata: {
          order_id: generatedOrderId,
          click_id: clickId,
        },
      },
    });

    // Return the session ID
    return new Response(
      JSON.stringify({ id: session.id }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}