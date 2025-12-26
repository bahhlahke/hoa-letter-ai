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

## Supabase setup
1. Run `supabase/schema.sql` in the SQL editor
2. Create a Storage bucket named `logos` (Public is easiest for MVP)
3. Optional: add RLS later; MVP schema keeps it simple.

## Run locally
```bash
npm install
npm run dev
```
