# Security Policy

## Secret Handling

Never commit real secrets. Keep local values in `.env` or `.env*.local`; only placeholders belong in `.env.example`.

Production requires:

- `DATABASE_URL`
- `NEXTAUTH_SECRET` with at least 32 characters, generated for example with `openssl rand -base64 32`
- `NEXTAUTH_URL`
- `ACCOUNT_RECOVERY_SECRET` with at least 16 characters (used by `/forgot-password` when email delivery is not configured)

Optional one-time admin bootstrap variables:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_PASSWORD` with at least 12 characters
- `ALLOW_PRODUCTION_SEED=true` only for an intentional production bootstrap run

Dangerous reset opt-in:

- `ALLOW_FORCE_RESET=true` is required before `npm run migrate-force`
- `ALLOW_PASSWORD_RESET=true` is required before `node scripts/reset-user-password.mjs` in production

## One-Time Admin Creation

1. Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, and a strong `SEED_ADMIN_PASSWORD`.
2. In production, also set `ALLOW_PRODUCTION_SEED=true` for that one command only.
3. Run `npm run seed`.
4. Remove `ALLOW_PRODUCTION_SEED` and seed password variables from the server environment.
5. Sign in and rotate the bootstrap password through the application if the account will remain active.

The seed script must not print passwords or use default credentials.

## Password Recovery

The login page links to `/forgot-password`. Without SMTP, resets require the shared `ACCOUNT_RECOVERY_SECRET` from the server environment.

Ops fallback when the web recovery form is unavailable:

```bash
ALLOW_PASSWORD_RESET=true RESET_USER_EMAIL='admin@example.com' RESET_USER_PASSWORD='...' \
  node scripts/reset-user-password.mjs
```

Then remove `ALLOW_PASSWORD_RESET` and the temporary password from the environment.

## Historical Secret Remediation

Git history contains prior `.env` entries. The known exposed key types are:

- Database connection string: `DATABASE_URL`
- NextAuth signing secret: `NEXTAUTH_SECRET`
- Public application auth URL: `NEXTAUTH_URL`
- Legacy base URL: `BASE_URL`

Affected historical commits identified without printing secret values:

- `44791e8` includes `.env`
- `80647c2` includes `.env`
- `ecb41a4` includes `.env`
- `f3c09a6` includes `.env`
- `d5e520c` deletes `.env`

Rotate immediately:

- Database credentials embedded in historical `DATABASE_URL`
- `NEXTAUTH_SECRET`, because any leaked value can invalidate session integrity

Also review and rotate if they ever existed outside the detected keys:

- Email or SMTP credentials
- Hosting and deployment tokens
- S3 or object storage keys
- Third-party API keys
- OAuth client secrets
- Any private keys or webhook signing secrets

History rewrite is recommended before sharing this repository more broadly, even after rotation, because old secret values remain recoverable from Git history. Do not rewrite history on shared branches without coordination.

Safe cleaning procedure, pending approval:

1. Rotate credentials first so old values are unusable.
2. Notify all collaborators and pause merges.
3. Create a backup mirror of the repository.
4. Use `git filter-repo` or BFG Repo-Cleaner to remove `.env` history.
5. Verify with secret scanning and targeted history checks.
6. Force-push only after approval and collaborator coordination.
7. Require all collaborators to re-clone or hard-reset local branches.

## CI Workflow

GitHub Actions workflow lives at `.github/workflows/ci.yml` and runs:

- `npm ci`
- `npm audit --audit-level=high`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test:security`
- `npm run build` with dummy env values
- gitleaks secret scanning

See `DEPLOY.md` for local run and production cutover steps.
