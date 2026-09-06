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
| App dir | `/var/www/esword` |
| Process | PM2 app name `esword` (`next start -H 127.0.0.1 -p 3000`) |
| Public URL | https://apocryphalwritings.org |
| Health | https://apocryphalwritings.org/api/health |
| DB backup dir | `~/backups/esword/` |

One-shot from a laptop that has the key:

```bash
ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes mi6support@2.29.28.247 \
  'bash -s' < scripts/deploy-production.sh
```

Or on the server after code is present:

```bash
bash /var/www/esword/scripts/deploy-production.sh
```

The script: backs up MySQL + preserves `.env`/`blogs-images`/`logs` → clones `main` → rsyncs into `/var/www/esword` → `npm ci` → `migrate` → `build` → `pm2 restart esword` → health checks.

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
- [ ] PM2 `esword` online
- [ ] Deployed SHA matches intended `main` commit
- [ ] Optional: GitHub CI green for that SHA
