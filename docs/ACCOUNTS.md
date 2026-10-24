# June & Bloom: Service Accounts Checklist (`docs/ACCOUNTS.md`)

> **Security Note:** Record account names, regions, and verified free-tier limits only. **Never** commit API keys or secrets to this file.

| Service | Purpose | Status | Notes / Tier Limits |
|---|---|---|---|
| **Vercel** | Hosting & Preview URLs (`june-and-bloom-lifestyle`) | Pending link | Preview per branch; production on `juneandbloomlifestyle.com` |
| **GitHub** | Source repository & CI (`[self-hosted, linux, x64]`) | Ready | Self-hosted runner on MS02 VM 700 |
| **Neon Postgres** | Primary relational database | Local / Seed ready | Set `DATABASE_URL` in `.env.local` and Vercel |
| **Stripe (Canada)** | Hosted Checkout, retainers, balances, webhooks | Test mode ready | Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Resend** | Transactional emails (`juneandbloomlifestyle.com`) | Pending DNS | SPF, DKIM, DMARC required |
| **Vercel Blob** | Product & inquiry photo storage | Pending token | Set `BLOB_READ_WRITE_TOKEN` |
| **Cloudflare Turnstile** | Spam protection on forms | Test keys ready | Set `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| **Web Push (VAPID)** | Phone push notifications for installed admin PWA | Ready | Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
