# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BPER System is a German-language medical device ecommerce website with integrated blood pressure testing functionality. The site combines product sales with health services, offering users personalized blood pressure analysis and medical device recommendations.

## Common Development Commands

### Installation & Setup
```bash
# Install dependencies
npm install

# Create .env file with required keys
# Required environment variables:
# - STRIPE_SECRET_KEY (for payment processing)
```

### Development
```bash
# Start local development server (default port 3005)
npm start
# or
npm run dev
# or
node server.js

# The site will be available at http://localhost:3005

# To use a different port, set the PORT environment variable:
PORT=3006 node server.js
```

### Build & Deployment
```bash
# No build step required - static HTML files served directly
# Deploy to Netlify via git push (automatic deployment configured)
```

### Testing
```bash
# No test scripts configured in package.json
# Manual testing recommended for:
# - Form validation
# - Stripe checkout flow
# - Blood pressure calculation logic
```

## High-Level Architecture

### Technology Stack
- **Frontend**: Plain HTML with embedded JavaScript, Tailwind CSS (CDN)
- **Backend**: Node.js with Express.js server
- **Payment**: Stripe integration (checkout sessions API)
- **Deployment**: Netlify (static hosting + serverless functions)
- **Form Handling**: Netlify Forms (production) for email submissions

### Directory Structure
```
ecommerce test/
├── index.html                    # Main landing page
├── blutdruck-test-merged.html    # Combined blood pressure test & diagnosis
├── blutdruck-test.html          # Legacy blood pressure test form
├── blutdruck-analyse.html       # Legacy diagnosis page
├── lamp-demo.html               # Product demonstration page
├── success.html                 # Stripe payment success page
├── cancel.html                  # Stripe payment cancelled page
├── server.js                    # Express server for local development
├── functions/                   # Netlify serverless functions
│   └── create-checkout.js       # Stripe checkout session creation
├── components/                  # UI components (React/JSX files)
│   ├── Lamp.jsx                # Lamp effect component
│   ├── avatar.js               # Avatar display component
│   ├── testimonials-marquee.js # Testimonials carousel
│   └── ui/                     # UI primitives
├── images/                      # Static assets
├── wissen/                      # Knowledge base pages
│   ├── blutdruck.html          # Blood pressure information
│   ├── messmethoden.html       # Measurement methods
│   ├── gesundheitstipps.html   # Health tips
│   └── studien.html            # Studies and research
└── stripe-js/                   # Stripe JS SDK (vendored)
```

### Core Features Architecture

#### 1. Blood Pressure Test System
- **Data Collection**: Multi-step form with client-side validation
- **Storage**: localStorage for data persistence between pages
- **Submission**: Netlify Forms integration (production) for email delivery
- **Analysis**: Client-side calculation based on medical guidelines
- **Flow**: blutdruck-test-merged.html handles both input and results

#### 2. Ecommerce System
- **Product Display**: Static HTML with Tailwind CSS styling
- **Checkout**: Stripe Checkout Sessions API
- **Payment Methods**: Card, Klarna, PayPal
- **Order Management**: Order IDs generated with Berlin timezone (LPBPYYYYMMDDHHMMSS)
- **Pricing**: Dynamic price creation or default to configured price IDs

#### 3. Server Architecture
- **Local Development**: Express server on port 3005 (configurable via PORT env)
- **Production**: Netlify static hosting with serverless functions
- **API Routes**:
  - `/create-checkout-session` - Stripe checkout creation
  - `/save-form-data` - Form data logging (local dev only)
  - Static file serving for all HTML pages

#### 4. Deployment Configuration
- **Netlify Config** (netlify.toml):
  - Functions directory: `functions/`
  - API redirects: `/api/*` → `/.netlify/functions/*`
  - URL redirects for clean paths (e.g., `/blutdruck-test` → `/blutdruck-test-merged.html`)

### Key Technical Decisions

1. **No Build Process**: Static HTML files with CDN dependencies for simplicity
2. **Vanilla JavaScript**: No framework for the main site (React components unused)
3. **Tailwind via CDN**: Quick styling without build step
4. **Serverless Functions**: Minimal backend for Stripe integration
5. **localStorage**: Client-side state management for form data

### Environment Variables
```bash
STRIPE_SECRET_KEY=sk_live_...  # Stripe API key for payment processing
PORT=3005                      # Optional: Server port (default: 3005)
```

### API Integration Points

1. **Stripe Payment**:
   - Endpoint: `/api/create-checkout` (production) or `/create-checkout-session` (local)
   - Creates checkout sessions with German locale
   - Supports multiple payment methods
   - Automatic tax calculation enabled

2. **Netlify Forms**:
   - Form handling: Built-in Netlify Forms with `data-netlify="true"`
   - Handles blood pressure test submissions
   - Sends email notifications
   - Bot protection with honeypot field

### Security Considerations
- Stripe keys stored in environment variables
- CORS enabled for local development
- Client-side validation supplemented by server validation
- No sensitive data stored in localStorage

### Performance Optimizations
- CDN usage for dependencies
- Lazy loading for images
- Minimal JavaScript execution
- Static file serving

### Development Workflow
1. Run `npm start` for local development
2. Make changes to HTML/JS files
3. Test locally at http://localhost:3005
4. Commit and push to trigger Netlify deployment
5. Monitor Netlify dashboard for deployment status

### Important Implementation Details

#### Form Handling Differences
- **Local Development**: Forms submit to `/save-form-data` endpoint for console logging
- **Production (Netlify)**: Forms use Netlify's built-in form handling with `data-netlify="true"`
- **Bot Protection**: Hidden honeypot field `bot-field` for spam prevention

#### Stripe Integration
- **Live Mode**: Uses live Stripe keys in production
- **Price IDs**: Default price ID: `price_1RmZQcA9aibyk7oc7HnUPblY` (259€ offer)
- **Payment Methods**: Card, Klarna, PayPal
- **Shipping**: Collects shipping addresses for DE, AT, CH, FR, IT, BE, NL, LU, ES, US, GB
- **Order IDs**: Format `LPBPYYYYMMDDHHMMSS` using Berlin timezone

#### FAQ Section Structure
- Desktop: Split-panel navigation with scrollable content area
- Mobile: Accordion-style collapsible sections
- Navigation: Smooth scroll with active state tracking
- Custom scrollbar styling for better UX

#### Component Notes
- React components in `/components` are currently unused (legacy)
- All functionality implemented in vanilla JavaScript
- Tailwind CSS loaded via CDN (no build step)

### Common Gotchas
- Local development checkout shows warning message (expected behavior)
- Form submissions work differently in local vs production environments
- No automated tests or linting configured
- Images should be optimized before upload (no build-time optimization)