# Finance Manager

A modern personal finance management platform: track accounts, transactions, budgets,
recurring bills, savings goals, and investments, with analytics, exportable reports,
role-based admin tools, and a real-time-feeling dashboard.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Shadcn UI ·
Prisma ORM · PostgreSQL (Neon) · Auth.js v5 · Recharts · React Hook Form · Zod ·
Zustand · SWR · Vercel Blob

## Features

- **Auth & RBAC** — email/password (Credentials) + optional Google/GitHub OAuth,
  Admin/User roles enforced in middleware and on every API route.
- **Dashboard** — total balance, income/expenses, savings, investments, cash flow,
  budgets, a computed financial health score, and recent transactions, auto-refreshing
  via SWR.
- **CRUD modules** — transactions (with receipts, transfers, search/sort/filter/
  pagination), accounts, categories, budgets, recurring bills (with "mark paid"),
  goals, investments, and profile settings.
- **Analytics** — line/area/bar/pie charts with custom date ranges.
- **Reports** — export transactions or a financial summary as CSV, Excel, or PDF.
- **Notifications** — budget-threshold alerts, goal-milestone alerts, and recurring
  bill reminders (via a Vercel Cron-triggered endpoint).
- **Admin panel** — user management (roles/suspension), platform analytics, audit
  log, and system settings (maintenance mode, registration toggle, etc.).
- **Security** — Zod validation on every mutation, ownership checks on every
  resource, rate limiting on auth endpoints, an origin-check CSRF guard on all
  mutating API requests, and a locked-down CSP/security-header set.

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `DIRECT_URL` | Yes | Neon direct connection string (same DB, used for schema pushes) |
| `AUTH_SECRET` | Yes | Generate with `openssl rand -base64 33` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` locally |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Enables "Continue with Google" |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | No | Enables "Continue with GitHub" |
| `BLOB_READ_WRITE_TOKEN` | No | Enables receipt uploads (Vercel Blob) |
| `SMTP_*` / `EMAIL_FROM` | No | Enables real password-reset emails; falls back to console logging |
| `CRON_SECRET` | Recommended in prod | Protects `/api/cron/*` routes |

### 3. Set up the database

This project uses **`prisma db push`** (schema sync) rather than migrations, so
there's no migration history to manage in development:

```bash
pnpm db:push   # sync the Prisma schema to your database
pnpm db:seed   # create an admin user, a demo user, and sample data
```

Seeded accounts:

- **Admin:** `admin@example.com` / `ChangeMe123!` (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- **Demo user:** `demo@example.com` / `Demo1234!`

> Change the seeded passwords before deploying anywhere real.

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Generate the Prisma client and build for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Sync the Prisma schema to the database |
| `pnpm db:seed` | Seed the database with an admin, demo user, and sample data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm test` | Run the Vitest unit test suite |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:e2e` | Run the Playwright end-to-end suite (starts its own dev server) |

## Project structure

```
src/
  app/
    (auth)/            # Login, register, forgot/reset password
    (dashboard)/        # Sidebar layout + all user-facing + admin pages
    admin/              # (nested inside the (dashboard) group)
    api/                # REST route handlers
  auth.ts, auth.config.ts   # Auth.js configuration
  components/           # UI components, organized by feature
  hooks/                 # SWR data-fetching hooks
  lib/                   # Validation schemas, query helpers, utilities
  middleware.ts          # Route protection + CSRF origin check
prisma/
  schema.prisma          # Data model
  seed.ts                # Seed script
e2e/                     # Playwright specs
```

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add all required environment variables from the table above in the Vercel
   project settings (use production Neon/Blob credentials).
3. Vercel will run `pnpm build` automatically, which runs `prisma generate`
   before `next build`.
4. After the first deploy, run `pnpm db:push` and `pnpm db:seed` against the
   production database from your local machine (or a one-off script), or via
   `vercel env pull` + running the scripts locally against production env vars.
5. `vercel.json` registers a daily Cron Job that hits `/api/cron/bill-reminders`
   to generate due/overdue bill notifications — set `CRON_SECRET` in your
   Vercel project so Vercel's cron requests authenticate correctly.
6. For receipt uploads, create a Vercel Blob store and add its
   `BLOB_READ_WRITE_TOKEN` to your environment variables.

## Security notes

- All mutating API routes validate input with Zod and verify the requester
  owns the resource being modified.
- Admin routes are gated both in `middleware.ts` (page-level redirect) and in
  each API handler (`requireAdmin()`), so API access can't bypass the UI guard.
- Passwords are hashed with bcrypt (cost factor 12); password hashes are never
  selected into API responses.
- CSRF: the session cookie is `SameSite=Lax` (Auth.js default) and every
  mutating request is additionally checked against the request `Origin` header
  in `auth.config.ts`.
- Rate limiting is applied to login, registration, and password-reset requests
  (in-memory; sufficient as defense-in-depth on a single instance — swap in
  Upstash/Redis if you scale to multiple regions/instances).
