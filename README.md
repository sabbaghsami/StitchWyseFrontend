# StitchWyse - Handmade Crochet Shop

A modern e-commerce frontend for handmade crochet items built with React, TypeScript, and Tailwind CSS.

## Features

- Product catalog with filtering by category
- Product detail pages with image gallery
- Shopping cart management
- Contact page with social media links
- Custom orders page
- Responsive design
- Modern UI with smooth animations

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Vitest
- **Linting**: ESLint
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start dev server
npm run dev
# or
bun run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

For LAN testing only, run:

```bash
npm run dev:lan
```

### Building

```bash
# Build for production
npm run build
# or
bun run build
```

### Testing

```bash
# Run tests
npm run test
# or
bun run test
```

## Security Baseline

- Frontend includes a restrictive Content Security Policy in `/index.html`.
- Runtime env validation blocks invalid `VITE_API_BASE_URL` values and enforces HTTPS in production.
- `.env` files are gitignored by default; keep secrets only in environment variables.
- Use `requestJson` from `/src/lib/http.ts` for backend calls to get centralized handling for `400/404/500`, timeouts, bounded retries, and client-side request throttling.

### Deployment Hardening Checklist

- Serve the app over HTTPS only.
- Set security headers at the edge/reverse proxy (`Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`).
- Restrict backend CORS to your production frontend origin only.
- Use HttpOnly, Secure, SameSite cookies for auth/session state (from backend).
- Update CSP before enabling Stripe (`https://js.stripe.com`, Stripe API endpoints, and Stripe frame sources).

## Project Structure

```
src/
├── components/        # Reusable React components
├── pages/            # Page components for routes
├── context/          # React Context for state management
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── data/             # Static data and product information
├── assets/           # Images and other static assets
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## License

MIT
