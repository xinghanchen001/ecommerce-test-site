// Cloudflare Pages Functions version - alternative endpoint
// Path: /create-checkout-session (for compatibility with local dev)

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Dynamic import of Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });

    const data = await request.json();
    const clickId = data.clickId || '';

    // Generate Order ID (Berlin Time)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const dateParts = {};
    parts.forEach(({ type, value }) => {
      dateParts[type] = value;
    });

    const generatedOrderId = `LPBP${dateParts.year}${dateParts.month}${dateParts.day}${dateParts.hour}${dateParts.minute}${dateParts.second}`;

    let priceId = data.priceId || 'price_1RmZQcA9aibyk7oc7HnUPblY';

    const origin = request.headers.get('origin') || 'https://your-domain.com';
    const successUrl = clickId ? `${origin}/success.html?cid=${clickId}` : `${origin}/success.html`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna', 'paypal'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${origin}/cancel.html`,
      locale: 'de',
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'FR', 'IT', 'BE', 'NL', 'LU', 'ES', 'US', 'GB'],
      },
      billing_address_collection: 'required',
      custom_fields: [
        {
          key: 'delivery_notes',
          label: { type: 'custom', custom: 'Delivery Instructions (Optional)' },
          type: 'text',
          optional: true,
        },
      ],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: { order_id: generatedOrderId, click_id: clickId },
      payment_intent_data: {
        metadata: { order_id: generatedOrderId, click_id: clickId },
      },
    });

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