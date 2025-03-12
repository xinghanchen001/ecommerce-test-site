# BPER System Ecommerce & Blutdruck-Test Website

This is a multi-purpose website featuring both an ecommerce platform for BPER System medical devices and a blood pressure testing service. The site is built primarily in German with HTML, CSS, and JavaScript, with Node.js backend support.

## Features

### Blood Pressure Test System

- Interactive form for collecting blood pressure data
- Client-side validation with real-time feedback
- Personalized diagnosis based on user input
- Email submission via Formspree
- Data persistence between pages using localStorage

### Ecommerce Functionality

- Product showcase and demonstrations
- Stripe payment integration
- Secure checkout process
- Order confirmation and cancellation flows

### Technical Features

- Responsive design for all device sizes
- Modern UI with Tailwind CSS
- Form validation and character counting
- Loading animations and visual feedback
- Background effects and visual enhancements

## Technical Structure

### Frontend

- HTML with embedded JavaScript
- Tailwind CSS (via CDN)
- Custom CSS for specific components

### Backend

- Node.js with Express
- Stripe API integration
- Netlify serverless functions

## Dependencies

```json
{
  "dependencies": {
    "@tsparticles/react": "^3.0.0",
    "@tsparticles/slim": "^3.8.1",
    "clsx": "^2.1.1",
    "express": "^4.21.2",
    "stripe": "^12.18.0",
    "tailwind-merge": "^3.0.2"
  }
}
```

## Setup and Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with your Stripe API keys
4. Run `node server.js` to start the local server
5. Access the site at `http://localhost:3002`

## Deployment

This site is deployed using Netlify with the following configuration:

- Static files served from the root directory
- Serverless functions in the `/functions` directory
- Custom redirects for clean URLs (see `netlify.toml`)

## Key Pages

- `index.html` - Main landing page
- `blutdruck-test.html` - Blood pressure data collection form
- `blutdruck-diagnose.html` - Diagnosis results page
- `lamp-demo.html` - Product demonstration
- `success.html` & `cancel.html` - Stripe checkout result pages

## Data Flow

1. User enters blood pressure data
2. Data is validated and submitted
3. User receives personalized diagnosis
4. Optional product purchase via Stripe checkout
