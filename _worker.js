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
    
    // Create checkout session using Stripe API directly
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'payment_method_types[1]': 'klarna', 
        'payment_method_types[2]': 'paypal',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': clickId ? `${origin}/success.html?cid=${clickId}` : `${origin}/success.html`,
        'cancel_url': `${origin}/cancel.html`,
        'locale': 'de',
        'shipping_address_collection[allowed_countries][0]': 'DE',
        'shipping_address_collection[allowed_countries][1]': 'AT',
        'shipping_address_collection[allowed_countries][2]': 'CH',
        'shipping_address_collection[allowed_countries][3]': 'FR',
        'shipping_address_collection[allowed_countries][4]': 'IT',
        'shipping_address_collection[allowed_countries][5]': 'BE',
        'shipping_address_collection[allowed_countries][6]': 'NL',
        'shipping_address_collection[allowed_countries][7]': 'LU',
        'shipping_address_collection[allowed_countries][8]': 'ES',
        'shipping_address_collection[allowed_countries][9]': 'US',
        'shipping_address_collection[allowed_countries][10]': 'GB',
        'billing_address_collection': 'required',
        'custom_fields[0][key]': 'delivery_notes',
        'custom_fields[0][label][type]': 'custom',
        'custom_fields[0][label][custom]': 'Delivery Instructions (Optional)',
        'custom_fields[0][type]': 'text',
        'custom_fields[0][optional]': 'true',
        'allow_promotion_codes': 'true',
        'automatic_tax[enabled]': 'true',
        'metadata[order_id]': orderId,
        'metadata[click_id]': clickId,
        'payment_intent_data[metadata][order_id]': orderId,
        'payment_intent_data[metadata][click_id]': clickId,
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.json();
      throw new Error(error.error?.message || 'Stripe API error');
    }

    const session = await stripeResponse.json();

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