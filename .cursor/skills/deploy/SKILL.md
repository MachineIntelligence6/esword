---
name: deploy
description: >-
  Ship esword to GitHub main and/or production host apocryphalwritings.org.
  Use when the user says deploy, release, push to production, ship it, or asks
  another agent to deploy.
---

# Deploy esword

## Production host (preferred when user says "deploy to the server")

| Item | Value |
|------|-------|
| SSH | `ssh -i ~/.ssh/id_ed25519 mi6support@2.29.28.247` |
| App dir | `/var/www/esword` (owned by the app account `esword`: no login, no sudo) |
| Process | PM2 app `esword` under the account `esword` (`sudo -u esword -H pm2 status`) |
| Public URL | https://apocryphalwritings.org |
| Health | https://apocryphalwritings.org/api/health |
| DB backup dir | `~/backups/esword/` |

One-shot from a laptop that has the key:

```bash
ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes mi6support@2.29.28.247 \
  'bash -s' < scripts/deploy-production.sh
```

Or on the server, as `mi6support`:

```bash
esword-deploy
```

That is a root-owned copy in `/usr/local/sbin`. Never run the copy in `/var/www/esword` (the script refuses): the website's account can edit it.

The script: backs up MySQL into `mi6support`'s `~/backups/esword` → then as `esword`: clones `main` → checks the clone for malware (stops with "Refusing to deploy" if it looks infected; see `DEPLOY.md`) → rsyncs into `/var/www/esword` → `npm ci` → `migrate` → `build` → `pm2 restart esword` → health checks.

If it refuses, do not override it: report what it listed to the user. `ALLOW_INSTALL_SCRIPTS` is only for a dependency install script the user has reviewed.

Rules:
- Never print or commit `.env` / DB passwords.
- Do **not** seed production unless asked.
- Do **not** run `migrate-force` / `ALLOW_FORCE_RESET` unless explicitly requested.

## GitHub-only ship (no SSH)

If the user only wants code on GitHub:

1. Commit safe changes (never `.env` / `.idea` / secrets).
2. `git push origin main`
3. `gh run watch $(gh run list --workflow=ci.yml --branch main --limit 1 --json databaseId -q '.[0].databaseId') --exit-status`

`.npmrc` has `legacy-peer-deps=true` (required for `npm ci` on React 19).

## Smoke after production deploy

- `curl -fsS https://apocryphalwritings.org/api/health` → `{"status":"ok",...}`
- Logged-in dashboard → Books → ⋯ → Export (remedies / csv / json)
- Unauthenticated `GET /api/books/1/export?format=remedies` should redirect to login (middleware)

## Done criteria

- [ ] Production health OK on https://apocryphalwritings.org/api/health
- [ ] `sudo -u esword -H pm2 status` shows `esword` online
- [ ] Deployed SHA matches intended `main` commit
- [ ] Optional: GitHub CI green for that SHA
