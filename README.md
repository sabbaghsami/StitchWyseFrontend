# StitchWyse Frontend

E-commerce storefront for handmade crochet products with Supabase-backed catalog data and Stripe Checkout.

## Current Stack

- Frontend: React 18, TypeScript, Vite
- UI: Tailwind CSS, shadcn/ui, Radix UI, lucide-react
- Routing: react-router-dom v6
- Data source: Supabase PostgREST (`products`, `product_images`)
- Checkout backend: Supabase Edge Function (`create-checkout-session`)
- Payments: Stripe Checkout (server-side price resolution)
- Testing: Vitest + Testing Library
- Linting: ESLint
- Deployment: Vercel (frontend) + Supabase (database/functions) + Stripe

## Architecture Notes (Important)

- `public.products.stripe_product_id` must store Stripe Product IDs (`prod_...`), not Stripe Price IDs.
- Checkout accepts cart items as `productId` + `quantity` only.
- The edge function resolves the active Stripe Price from `stripe_product_id` server-side.
- The frontend never sends trusted price values to Stripe.
- Each active product should have exactly one active GBP Stripe Price.

## Environment Variables

Create a local `.env` for frontend runtime values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxx
```

Optional if used by your app routes:

```bash
VITE_API_BASE_URL=https://api.example.com
```

If Supabase vars are missing, product loading falls back to `src/data/products.ts`.

## Supabase Edge Function Secrets

Set these in Supabase Dashboard -> Edge Functions -> Secrets:

- `STRIPE_SECRET_KEY=sk_test_...` (or `sk_live_...`)
- `ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com`

Without `STRIPE_SECRET_KEY`, checkout session creation fails.

## Stripe Setup

1. Create Stripe Products and keep one active GBP price per product.
2. Sync each Supabase product row to a Stripe Product ID in `products.stripe_product_id`.
3. Enable Stripe customer emails (receipts) in Dashboard:
   - Settings -> Emails -> Successful payments.
4. Configure Stripe branding (logo/colors) if needed:
   - Settings -> Branding.

### Receipt Email Behavior

- Live mode: receipts send normally when enabled and customer email is present.
- Test mode: receipts are generally not sent to arbitrary customer emails (limited Stripe test exceptions apply).

## Local Development

Install dependencies:

```bash
npm install
```

Run app:

```bash
npm run dev
```

LAN testing:

```bash
npm run dev:lan
```

## Optional: Local Edge Function Testing

Only required if you want to run Supabase functions locally.

1. Install Supabase CLI:

```bash
brew install supabase/tap/supabase
```

2. Create local function env file:

`supabase/functions/.env`

```bash
STRIPE_SECRET_KEY=sk_test_...
ALLOWED_ORIGINS=http://localhost:5173
```

3. Serve function locally:

```bash
supabase functions serve create-checkout-session --env-file supabase/functions/.env --no-verify-jwt
```

Note: local `supabase functions serve` requires Docker. Deploying to Supabase does not.

## Build, Test, Lint

```bash
npm run build
npm run test
npm run lint
```

## Deploy (Recommended)

- Frontend: Vercel
- Backend/data: Supabase
- Payments: Stripe

Required Vercel env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Required Supabase function secrets:

- `STRIPE_SECRET_KEY`
- `ALLOWED_ORIGINS` (must include your Vercel domain)

## Security Baseline

- Keep Stripe secrets only in Supabase function secrets (never in `VITE_*`).
- Restrict CORS with `ALLOWED_ORIGINS`.
- Serve over HTTPS in production.
- Use `src/lib/http.ts` `requestJson` helper for consistent timeout/retry/error handling.

## Project Structure

```text
src/
  components/          Reusable UI components
  pages/               Route pages
  context/             React context state
  lib/                 HTTP, checkout, Supabase product utilities
  data/                Static product fallback data
supabase/
  functions/
    create-checkout-session/
      index.ts         Stripe checkout session creator
```
