const express = require('express');
const stripe = require('stripe')(
  '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'
); // Live key
const app = express();

// Serve static files from the current directory
app.use(express.static('.'));
app.use(express.json());

// Route for the sparkles example
app.get('/sparkles', (req, res) => {
  res.sendFile(__dirname + '/sparkles-example.html');
});

// Route for the lamp example
app.get('/lamp', (req, res) => {
  res.sendFile(__dirname + '/lamp-demo.html');
});

app.post('/create-checkout-session', async (req, res) => {
  try {
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

    // Create a checkout session with the price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
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
