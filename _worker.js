// Cloudflare Worker for handling Stripe checkout and serving static files

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname === '/api/create-checkout' || url.pathname === '/create-checkout-session') {
      return handleStripeCheckout(request, env);
    }
    
    // Serve static assets
    return env.ASSETS.fetch(request);
  }
};

async function handleStripeCheckout(request, env) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { 
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }

  try {
    // Dynamic import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });

    // Parse request
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

    const orderId = `LPBP${dateParts.year}${dateParts.month}${dateParts.day}${dateParts.hour}${dateParts.minute}${dateParts.second}`;

    // Get price ID
    let priceId = data.priceId;
    
    if (!priceId) {
      priceId = 'price_1RmZQcA9aibyk7oc7HnUPblY'; // Default 259€ offer
    }

    // Get origin
    const origin = request.headers.get('origin') || new URL(request.url).origin;
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna', 'paypal'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: clickId ? `${origin}/success.html?cid=${clickId}` : `${origin}/success.html`,
      cancel_url: `${origin}/cancel.html`,
      locale: 'de',
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'FR', 'IT', 'BE', 'NL', 'LU', 'ES', 'US', 'GB'],
      },
      billing_address_collection: 'required',
      custom_fields: [{
        key: 'delivery_notes',
        label: {
          type: 'custom',
          custom: 'Delivery Instructions (Optional)',
        },
        type: 'text',
        optional: true,
      }],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: {
        order_id: orderId,
        click_id: clickId,
      },
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          click_id: clickId,
        },
      },
    });

    return new Response(
      JSON.stringify({ id: session.id }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Stripe error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
}