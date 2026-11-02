# Deployment Checklist

Use this after Phases 1–4 are complete and before production cutover.

## Agent quick path

When an agent is asked to **deploy**:

1. Read and follow `.cursor/skills/deploy/SKILL.md`.
2. **Production server (default when host is known):**
   - SSH: `ssh -i ~/.ssh/id_ed25519 mi6support@2.29.28.247`
   - Run: `bash /var/www/esword/scripts/deploy-production.sh`
     (or pipe that script over SSH from the repo)
3. Verify https://apocryphalwritings.org/api/health returns ok.

## Before first local run

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a disposable local/dev MySQL database.
3. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
4. Set `NEXTAUTH_URL` to `http://localhost:3000`.
5. Optional admin bootstrap:
   - `SEED_ADMIN_EMAIL`
   - `SEED_ADMIN_NAME`
   - `SEED_ADMIN_PASSWORD` (minimum 12 characters)
6. Run `npm ci`
7. Run `npm run migrate`
8. Run `npm run seed` only if bootstrap variables are set
9. Run `npm run dev`
10. Confirm `/api/health` returns `{ "status": "ok" }`

## Required production environment variables

- `DATABASE_URL`
- `NEXTAUTH_SECRET` (at least 32 characters)
- `NEXTAUTH_URL` (public HTTPS origin)

## Stripe donations (optional)

Without `STRIPE_SECRET_KEY` the Donate page shows only the PayPal button.

1. **API key** (`STRIPE_SECRET_KEY`): Stripe Dashboard → Developers → API keys → Create restricted key,
   with only these permissions:
   - Checkout Sessions: **Write** (start a donation, read it back on the thank-you page)
   - Invoices: **Read** (match refunds of monthly payments to their donation)
   - Events: **Read** (the webhook re-reads each event in the API version the code expects)
2. **Webhook** (`STRIPE_WEBHOOK_SECRET`): Developers → Webhooks → Add destination
   - URL: `https://apocryphalwritings.org/api/donate/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`,
     `charge.refunded`, `customer.subscription.deleted`
   - Copy the destination's signing secret (`whsec_…`).
   - Without it, monthly renewals, refunds and cancellations are never recorded (the dashboard warns).
3. After editing `.env` on the server: `pm2 restart esword --update-env`.
4. **Donor self-service**: Settings → Billing → Customer portal → allow cancelling subscriptions and
   updating payment methods → Activate link. Paste the link into Dashboard → Donations → Page & popup →
   "Manage monthly donation link".
5. **Receipts**: Settings → Customer emails → turn on "Successful payments".

Donations show under Dashboard → Donations. Test and live payments are listed separately,
matching whichever key is set.

## Production blockers that still need human action

1. Rotate credentials exposed in Git history (`DATABASE_URL`, `NEXTAUTH_SECRET`).
2. Decide whether to rewrite Git history after rotation.
3. Configure HTTPS, reverse proxy, process manager, and persistent `public/blogs-images` storage.
4. Prefer Prisma migrations over repeated `db push` for production schema changes.
5. Back up the production database before first deploy and after schema updates.

## Safe production deploy sequence

1. Provision MySQL and set production env vars on the server.
2. Deploy code without seeding by default.
3. Run `npm ci`
4. Run `npm run build`
5. Apply schema with an approved migration strategy.
6. Bootstrap one admin only with `ALLOW_PRODUCTION_SEED=true` and then remove that flag.
7. Start the app with `npm run start` or the process manager equivalent.
8. Verify:
   - `/api/health`
   - login
   - dashboard access for admin/editor
   - public reading pages
   - blog/image upload
   - rich text save/display

## Rollback

1. Keep the previous build artifact or git tag available.
2. Restore the previous app release.
3. Restore the database from the pre-deploy backup if schema or data changed.
4. Re-check `/api/health` and login.
