const express = require('express');
const stripe = require('stripe')(
  'sk_test_51QyFMCPRAnMpnSvU4iq7Iorwhbi84onYbrd7TxJlpkU8tTNVMb8fboIqPKHNioTINTvJYq1Hh3xxss2ezTIWikwG00XH7i0qyX'
); // Secret key
const app = express();

// Serve static files from the current directory
app.use(express.static('.'));
app.use(express.json());

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

const port = 3000;
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
