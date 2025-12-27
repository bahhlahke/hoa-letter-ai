# HOA Letter AI — Production Repo

This repo contains the full working app:
- High-conversion landing + letter drafting UX
- Guideline paste + guideline URL fetch
- Auto-cite guideline sections (when present)
- Community profiles in Supabase (selector UI + save)
- Optional letterhead + logo upload (Supabase Storage)
- Exports: TXT / DOCX / PDF (PDF styled like HOA templates)
- Stripe checkout (one-time + subscription) + success verification
- Real email delivery via SendGrid (server-side)
- Authority pricing page

## Environment variables (Vercel → Production)

### Core
- OPENAI_API_KEY=
- APP_URL= (https://yourdomain.com)
- ENTITLEMENTS_SECRET= (signs access cookies)
- PAYWALL_ENFORCED=true
- NEXT_PUBLIC_SUPPORT_EMAIL=support@hoa-letter-ai.com
- NEXT_PUBLIC_ANALYTICS_PROVIDER=console|plausible
- SUPPORT_EMAIL= (reply-to for outgoing mail)

### Stripe
- STRIPE_SECRET_KEY=
- STRIPE_SINGLE_PRICE_ID= (price_...)
- STRIPE_SUBSCRIPTION_PRICE_ID= (price_...)

### Supabase
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY= (only used by server routes; keep secret)

### SendGrid
- SENDGRID_API_KEY=
- FROM_EMAIL= (verified sender)

### Optional analytics
- NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible|console

## Supabase setup
1. Run `supabase/schema.sql` in the SQL editor
2. Apply migrations in `supabase/migrations` (adds `guidelines_text`).
2. Create a Storage bucket named `logos` (Public is easiest for MVP)
3. Optional: add RLS later; MVP schema keeps it simple.

## Rate limits
- Draft generation: 10 requests per minute per IP
- Exports: 10 requests per minute per IP
- Email delivery: 3 requests per minute per IP + per recipient

## Billing & entitlements
- Entitlements are set via Stripe checkout success and stored in a signed, httpOnly cookie.
- One-time purchases grant a single export/email credit for 24 hours; subscriptions unlock exports/email for 30 days.
- Server endpoints enforce export/email access; paywall is not client-only.

## Analytics
- Client-side `track` helper in `src/lib/analytics.ts` supports a no-op/console fallback or Plausible (`window.plausible`).
- Server endpoint `/api/analytics` logs events when sendBeacon is used.

## Run locally
```bash
npm install
npm run dev
```
