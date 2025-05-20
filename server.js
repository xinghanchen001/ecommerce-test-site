require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Live key
const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    // Extract click ID if present
    const clickId = req.body.clickId || '';

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

    // Option 1: If you have a productId but no priceId, create a price on the fly
    let priceId = req.body.priceId;

    if (req.body.productId && !priceId) {
      // Create a new price for the product
      const price = await stripe.prices.create({
        product: req.body.productId,
        unit_amount: 4999, // $49.99 in cents
        currency: 'usd',
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
      ? `${req.headers.origin}/success.html?cid=${clickId}`
      : `${req.headers.origin}/success.html`;

    // Create a checkout session with the price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price: priceId,
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
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = 3002; // Changed from 3001 to 3002
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
