---
name: deploy
description: >-
  Ship esword to GitHub main and/or a production host. Use when the user says
  deploy, release, push to production, ship it, or asks another agent to deploy.
---

# Deploy esword

## Default meaning of "deploy"

Unless the user names a host/SSH target, **deploy = ship `main` to GitHub and wait for CI green**.

Remote: `https://github.com/MachineIntelligence6/esword.git`  
Branch: `main`  
CI: `.github/workflows/ci.yml` (npm ci → audit → lint → tsc → security tests → build)

There is **no** Vercel/Fly/server hook in-repo. Production cutover needs explicit host/SSH details from the user.

## Ship to GitHub (do this first)

1. Confirm clean intent: only commit deployable app changes. Never commit `.env`, `.idea/`, or secrets.
2. Optional local gate:
   ```bash
   npm ci
   npm run lint
   npx tsc --noEmit
   npm run test:security
   npm run build
   ```
   Build needs `DATABASE_URL`, `NEXTAUTH_SECRET` (≥32 chars), `NEXTAUTH_URL` (dummy values OK for compile).
3. Commit with a why-focused message (HEREDOC).
4. Push:
   ```bash
   git push -u origin HEAD
   ```
5. Watch CI and fix failures before claiming deploy done:
   ```bash
   gh run list --workflow=ci.yml --branch main --limit 1
   gh run watch <id> --exit-status
   ```
6. Report: commit SHAs, CI URL, and that production host still needs a pull if applicable.

`.npmrc` sets `legacy-peer-deps=true` — required for `npm ci` on React 19.

## Production host (only if user provides access)

Follow `DEPLOY.md`. Short sequence on the server after env is set:

```bash
git fetch origin && git checkout main && git pull --ff-only
npm ci
npm run build
npm run migrate   # prisma db push — back up DB first
npm run start     # or process manager restart
curl -fsS "$NEXTAUTH_URL/api/health"
```

Rules:
- Do **not** seed production unless asked (`ALLOW_PRODUCTION_SEED=true` one-shot only).
- Do **not** run `migrate-force` / `ALLOW_FORCE_RESET` unless explicitly requested.
- Keep `public/blogs-images` persistent across releases.
- If schema changed, back up MySQL before `npm run migrate`.

## Book export smoke (after app is up)

Dashboard → Books → row ⋯ → Export → Remedies text / CSV / JSON.  
API: `GET /api/books/{id}/export?format=remedies|csv|json` (ADMIN/EDITOR).

## Done criteria

- [ ] Changes on `origin/main`
- [ ] Latest CI run on that SHA is **success**
- [ ] If a host was provided: health check passes and export menu works
