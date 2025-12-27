# Launch Checklist

## DNS and Email
- [ ] Configure SendGrid domain authentication for the From domain.
- [ ] Publish SPF record (or include SendGrid in existing SPF) and DKIM CNAMEs.
- [ ] Add DMARC policy with a monitored rua address.
- [ ] Verify FROM_EMAIL and SUPPORT_EMAIL environment variables use the authenticated domain.

## Stripe
- [ ] Set STRIPE_SECRET_KEY, STRIPE_SINGLE_PRICE_ID, STRIPE_SUBSCRIPTION_PRICE_ID for production.
- [ ] Confirm webhook endpoint is active and secrets configured for subscription updates.
- [ ] Test checkout success and cancellation flows on production URLs.

## Supabase
- [ ] Apply migrations (including guidelines_text) and run `supabase/schema.sql`.
- [ ] Verify storage bucket `logos` exists with correct public/read policies or RLS.
- [ ] Confirm service role key is only used server-side and RLS policies are correct for production data.

## Analytics & Rate Limits
- [ ] Set NEXT_PUBLIC_ANALYTICS_PROVIDER (e.g., `plausible` or `console`).
- [ ] Validate analytics events are received on key flows (draft, export, checkout, email).
- [ ] Review rate limit thresholds (generate/export/email) in `src/lib/rateLimit.ts` and tune for production.

## App URLs & SEO
- [ ] Set APP_URL to the production hostname for canonical URLs and metadata.
- [ ] Verify robots.txt and sitemap.xml are accessible at the root.

## QA
- [ ] Generate a notice with guideline text to confirm citations behave.
- [ ] Attempt export/email without payment to ensure paywall shows.
- [ ] Confirm accessibility of modals and form labels in key flows.
