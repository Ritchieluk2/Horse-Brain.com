# Deploying horse-brain.com

The site runs on **Cloudflare Workers** (Nitro preset `cloudflare-module`) with a
**D1** database named `horsebrain`. Config: `wrangler.jsonc`. Schema: `migrations/`.

## Settings

| Name | Where | What |
|---|---|---|
| `NUXT_SESSION_SECRET` | Cloudflare secret | Seals the sign-in cookie (32+ random chars). Changing it signs everyone out. |
| `NUXT_RESEND_API_KEY` | Cloudflare secret | Resend sending-only key for `mail.horse-brain.com` |
| `NUXT_SITE_URL`, `NUXT_EMAIL_FROM`, `NUXT_EMAIL_REPLY_TO` | `wrangler.jsonc` → `vars` | Not secret |

Set or rotate a secret: `npx wrangler secret put NUXT_SESSION_SECRET` (paste when asked).
Check which exist (names only): `npx wrangler secret list`.

## Deploy by hand

```
npx wrangler d1 migrations apply horsebrain --remote   # only when migrations/ changed
npm run build
npx wrangler deploy
```

## Deploy automatically

`.github/workflows/deploy-cloudflare.yml` runs the same steps on every push to `main`.
It needs two GitHub Actions secrets: `CLOUDFLARE_API_TOKEN` (Workers + D1 edit) and
`CLOUDFLARE_ACCOUNT_ID`.

Note: `.github/workflows/NuxtDeploy.yml` still publishes a *static* copy to GitHub Pages on
pushes to `staging`. Accounts don't work there (no server). Retire it once Cloudflare is live.

## Local development

```
npx wrangler d1 migrations apply horsebrain --local   # once, and after new migrations
npm run dev
```
`server/plugins/cloudflare-dev-bindings.ts` connects `npm run dev` to the local D1 copy in
`.wrangler/state/v3` (look for "[dev] Cloudflare bindings ready: horsebrain").
Dev-only tools: `/api/dev/env-check`, `/api/dev/email-check`, `/api/dev/seed-programs`.

## Changing the database

Add a new numbered file, e.g. `migrations/0002_add_bet_mode.sql`. Never edit one that has
already been applied. Apply locally, test, then the deploy applies it to production.

## Gotchas we've hit

- `.env` lines must be `KEY=value`. `RESEND_API_KEY==re_…` (double `=`) breaks sending.
- `compatibilityDate` must stay `2025-07-15` or later in both `nuxt.config.ts` and
  `wrangler.jsonc`; older Worker dates don't pass secrets to the app.
- New files in `server/utils/` aren't always auto-imported until a restart; import them
  explicitly.
