# Deployment Checklist

Use this after Phases 1–4 are complete and before production cutover.

## Agent quick path

When an agent is asked to **deploy**:

1. Read and follow `.cursor/skills/deploy/SKILL.md`.
2. **Production server (default when host is known):**
   - SSH: `ssh -i ~/.ssh/id_ed25519 mi6support@2.29.28.247`
   - Run: `esword-deploy`
     (or pipe `scripts/deploy-production.sh` over SSH from the repo; never run the copy in `/var/www/esword`)
3. Verify https://apocryphalwritings.org/api/health returns ok.

## Accounts on the production server

The website runs as `esword`, an account with no password, no login and no admin rights, so a
break-in through the site or a bad npm package stays inside that account. You log in as
`mi6support`, which has admin rights and keeps the database backups in `~/backups/esword`, out of
the site's reach.

- `/var/www/esword` belongs to `esword`, except `.env`, which belongs to root and is locked with
  `chattr +i` so the site can read it but not change or replace it. To edit it:
  `sudo chattr -i /var/www/esword/.env && sudo nano /var/www/esword/.env && sudo chattr +i /var/www/esword/.env`,
  then `sudo -u esword -H pm2 restart esword --update-env`.
- PM2 runs under `esword` and starts on boot through the systemd unit `pm2-esword`:
  `sudo -u esword -H pm2 status`, `sudo -u esword -H pm2 logs esword`.
- `mi6support` must never run a file that `esword` can edit, which is everything in `/var/www/esword`,
  or a break-in through the site could gain admin rights at the next deploy. The deploy script refuses
  to run from there. Run `esword-deploy`, a root-owned copy in `/usr/local/sbin`, or pipe the script
  from a checkout. After changing the script, update that copy from a reviewed checkout:
  `ssh -i ~/.ssh/id_ed25519 mi6support@2.29.28.247 'sudo install -o root -g root -m 755 /dev/stdin /usr/local/sbin/esword-deploy' < scripts/deploy-production.sh`
- If PM2's saved process list is ever lost, start the site again with:
  ```bash
  sudo -u esword -H bash -c 'cd /var/www/esword && set -a && . ./.env && set +a &&
    pm2 start node_modules/next/dist/bin/next --name esword -i 1 --merge-logs --time \
      --log-date-format "YYYY-MM-DDTHH:mm:ss" --max-memory-restart 512M \
      --output /var/www/esword/logs/out-0.log --error /var/www/esword/logs/error-0.log \
      -- start -H 127.0.0.1 -p 3000 && pm2 save'
  ```

## Malware check during deploy

`scripts/deploy-production.sh` checks the fresh clone of `main` before copying or running any of it,
and stops with "Refusing to deploy" if it finds signs of the worm force-pushed to our GitHub repos on
2026-11-02 or of a similar implant:

- an `api.js` file, or a `package.json` install/migrate/build/start script that runs `node`, `bun`,
  `curl`, `wget` or a shell pipe
- code hidden at the end of a `*.config.*` file (a line over 400 characters or a long run of tabs)
- known payload markers or attacker addresses anywhere in the code
- a `.vscode/tasks.json` that runs on folder open, or a font file that contains text
- a dependency fetched from anywhere but registry.npmjs.org, or one with an install script that is not
  on the script's allowlist

The running site is left untouched when it refuses. A new dependency with an install script must be
reviewed and then approved for that run: `ALLOW_INSTALL_SCRIPTS="package-name" esword-deploy`.

`esword-deploy` is a copy installed on the server, so a push can't switch the check off. A change to
the check takes effect once that copy is updated (see "Accounts on the production server"), or right
away when you pipe the script from a trusted checkout (`ssh … 'bash -s' < scripts/deploy-production.sh`).

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
3. After editing `.env` on the server (it is locked; see "Accounts on the production server"):
   `sudo -u esword -H pm2 restart esword --update-env`.
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
