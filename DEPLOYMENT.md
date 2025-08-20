# Deployment Guide - BPER System

This project supports deployment to both **Netlify** and **Cloudflare Pages**.

## Current Setup

- **Netlify Functions**: Located in `/functions/` directory
- **Cloudflare Functions**: Located in `/functions-cloudflare/` directory
- Both platforms use the same frontend code

## Netlify Deployment (Original/Primary)

### Setup
1. Connect your GitHub repository to Netlify
2. No build command needed (static site)
3. Publish directory: `.`

### Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_KEY_HERE
```

### Files Used
- `/functions/create-checkout.js` - Stripe checkout handler
- `netlify.toml` - Configuration file
- All HTML/CSS/JS files in root directory

### API Endpoint
- Production: `/api/create-checkout` (redirects to Netlify function)
- Local dev: `/create-checkout-session` (Express server)

## Cloudflare Pages Deployment (Alternative)

### Setup
1. Connect your GitHub repository to Cloudflare Pages
2. Build command: Leave empty or `echo "No build needed"`
3. Build output directory: `.`
4. Functions directory: Automatically detected from `wrangler.json`

### Environment Variables
In Cloudflare Dashboard → Workers & Pages → Your Project → Settings → Environment Variables:
```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_KEY_HERE
```

### Files Used
- `/_worker.js` - Cloudflare Worker handling Stripe checkout and static files
- `wrangler.json` - Cloudflare configuration

### API Endpoints
Both endpoints work on Cloudflare:
- `/api/create-checkout` - Recommended
- `/create-checkout-session` - For compatibility

## Local Development

### Setup
```bash
npm install
```

### Create `.env` file:
```
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
PORT=3005  # Optional, defaults to 3005
```

### Run Development Server
```bash
npm start
# or
node server.js
```

Access at: http://localhost:3005

## Key Differences Between Platforms

### Netlify
- Uses `exports.handler` syntax
- Functions in `/functions/` directory
- Automatic routing via `netlify.toml`
- Built-in form handling

### Cloudflare
- Uses `_worker.js` with fetch handler
- Single Worker file handles all routes
- Routing via URL path matching
- No built-in form handling (uses custom endpoint)

## Testing Checkout

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Test Flow
1. Click "Jetzt bestellen" button
2. Fill checkout form
3. Use test card for development
4. Verify success page redirect

## Troubleshooting

### "Problem mit der Weiterleitung zum Checkout" Error
- Check if `STRIPE_SECRET_KEY` is set correctly
- Verify you're using the right key (live vs test)
- Check browser console for detailed errors
- Ensure the correct API endpoint is being called

### Cloudflare Deployment Fails
- Ensure `wrangler.json` exists
- Check that Stripe key is set in environment variables
- Verify functions are in `/functions-cloudflare/` directory

### Netlify Deployment Issues
- Check `netlify.toml` configuration
- Verify functions are in `/functions/` directory
- Ensure environment variables are set

## Switching Between Platforms

The frontend code automatically uses the correct endpoint:
- Netlify: Uses `/api/create-checkout`
- Cloudflare: Both `/api/create-checkout` and `/create-checkout-session` work
- Local: Uses `/create-checkout-session`

No code changes needed when switching platforms!