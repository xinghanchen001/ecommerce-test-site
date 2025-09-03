require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use a stable API version
}); // Live key
const app = express();

// Add CORS and iframe-friendly headers middleware
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Remove X-Frame-Options restriction to allow iframe embedding
  res.removeHeader('X-Frame-Options');
  
  // Set Content-Security-Policy to allow iframe embedding from any domain
  // You can restrict this to specific domains if needed
  res.header('Content-Security-Policy', "frame-ancestors *");
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from the current directory
app.use(express.static('.'));
app.use(express.json());

// Endpoint to handle form data from the blood pressure test
app.post('/save-form-data', (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData);

  // Here you would typically send an email with this data
  // For local testing, we'll just log it to the console
  console.log('-------------------------------------');
  console.log('BLOOD PRESSURE TEST SUBMISSION');
  console.log('-------------------------------------');
  console.log('Age:', formData.age);
  console.log('Systolic:', formData.systolic);
  console.log('Diastolic:', formData.diastolic);
  console.log('Email:', formData.email);
  console.log('-------------------------------------');

  // Send a success response
  res.json({ success: true, message: 'Form data received successfully' });
});

// Route for the sparkles example
app.get('/sparkles', (req, res) => {
  res.sendFile(__dirname + '/sparkles-example.html');
});

// Route for the lamp example
app.get('/lamp', (req, res) => {
  res.sendFile(__dirname + '/lamp-demo.html');
});

// Routes for impressum and datenschutz pages
app.get('/impressum', (req, res) => {
  res.sendFile(__dirname + '/impressum.html');
});

app.get('/datenschutz', (req, res) => {
  res.sendFile(__dirname + '/datenschutz.html');
});

app.get('/widerrufsrecht', (req, res) => {
  res.sendFile(__dirname + '/widerrufsrecht.html');
});

app.get('/agb', (req, res) => {
  res.sendFile(__dirname + '/agb.html');
});

// Routes for wissen pages
app.get('/wissen/blutdruck', (req, res) => {
  res.sendFile(__dirname + '/wissen/blutdruck.html');
});

app.get('/wissen/messmethoden', (req, res) => {
  res.sendFile(__dirname + '/wissen/messmethoden.html');
});

app.get('/wissen/gesundheitstipps', (req, res) => {
  res.sendFile(__dirname + '/wissen/gesundheitstipps.html');
});

app.get('/wissen/studien', (req, res) => {
  res.sendFile(__dirname + '/wissen/studien.html');
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    // Extract priceId and check if it exists
    const { priceId: requestedPriceId } = req.body;

    if (!requestedPriceId) {
      res
        .status(400)
        .json({ error: { message: 'Missing required parameter: priceId' } });
      return;
    }

    // Extract click ID if present
    const clickId = req.body.clickId || '';
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

    // Determine which price ID to use
    let finalPriceId = requestedPriceId;

    if (req.body.productId && !finalPriceId) {
      // Create a new price for the product
      const price = await stripe.prices.create({
        product: req.body.productId,
        unit_amount: 4999, // $49.99 in cents
        currency: 'usd',
      });
      finalPriceId = price.id;
      console.log(`Created new price: ${finalPriceId}`);
    }

    // If no price ID is provided, use the default product key from live mode
    if (!finalPriceId) {
      finalPriceId = 'price_1QyfHoA9aibyk7ocoy9gcOsX'; // Live mode product key
    }

    // Construct success URL with clickId if it exists
    const successUrl = clickId
      ? `${req.headers.origin}/success.html?cid=${clickId}`
      : `${req.headers.origin}/success.html`;

    // Create a checkout session with the price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${req.headers.origin}/cancel.html`,
      locale: 'de', // Set language to German
      automatic_tax: { enabled: true }, // Enable automatic tax calculation
      metadata: {
        // Add generated order ID and click ID to metadata
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

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for embedded checkout sessions
app.post('/create-checkout-session-embedded', async (req, res) => {
  console.log('Embedded checkout request received:', req.body);
  
  try {
    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured in .env file');
      res.status(500).json({ error: { message: 'Payment system not configured. Please check server configuration.' } });
      return;
    }

    // Extract priceId and check if it exists
    const { priceId: requestedPriceId } = req.body;

    if (!requestedPriceId) {
      res
        .status(400)
        .json({ error: { message: 'Missing required parameter: priceId' } });
      return;
    }

    // Extract click ID if present
    const clickId = req.body.clickId || '';
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

    // Determine which price ID to use
    let finalPriceId = requestedPriceId;

    if (req.body.productId && !finalPriceId) {
      // Create a new price for the product
      const price = await stripe.prices.create({
        product: req.body.productId,
        unit_amount: 25900, // €259 in cents
        currency: 'eur',
      });
      finalPriceId = price.id;
      console.log(`Created new price: ${finalPriceId}`);
    }

    // If no price ID is provided, use the default product key from live mode
    if (!finalPriceId) {
      finalPriceId = 'price_1RmZQcA9aibyk7oc7HnUPblY'; // Live mode product key - 259€ offer
    }

    // Construct return URL with clickId if it exists
    const returnUrl = clickId
      ? `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}&cid=${clickId}`
      : `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`;

    // Create a checkout session for embedded mode with minimal configuration
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
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
      metadata: {
        order_id: generatedOrderId,
        click_id: clickId,
      },
    });

    console.log('Checkout session created successfully:', session.id);
    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Detailed error creating embedded checkout session:');
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    // Send more detailed error to client
    res.status(500).json({ 
      error: {
        message: error.message || 'Failed to create checkout session',
        type: error.type,
        code: error.code
      }
    });
  }
});

const port = process.env.PORT || 3005; // Use PORT from env or default to 3005
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
