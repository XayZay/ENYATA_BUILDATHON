# CrossRoute

CrossRoute is a Next.js 14 MVP foundation for a dynamic escrow and cross-border settlement timing platform built for the Interswitch x Enyata hackathon.

## What is included

- Landing page and demo auth flow with role-aware sessions
- Dashboard overview for client and provider journeys
- Project list, project creation, project detail, funding, payout timing, and notifications pages
- In-memory mock domain layer for projects, milestones, change orders, transactions, payouts, and notifications
- Next.js API route handlers that mirror the PRD endpoints
- Tailwind-based light UI aligned to the product brief

## Tech choices in this scaffold

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Server actions for demo workflows
- Mock persistence to keep the product flows working locally without third-party credentials

## Run locally

1. Install dependencies with `cmd /c npm install`
2. Start the app with `cmd /c npm run dev`
3. Open `http://localhost:3000`
4. Use `/auth/login` or `/auth/signup` to switch between client and provider roles

## Environment variables

Copy `.env.example` to `.env.local` when you start wiring real integrations.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERSWITCH_CLIENT_ID`
- `INTERSWITCH_CLIENT_SECRET`
- `INTERSWITCH_BASE_URL`
- `MONIERATE_API_KEY`
- `OPEN_ER_API_URL`

## Architecture notes

### Demo auth

This scaffold uses a cookie-backed demo session instead of Supabase auth so the product can be explored immediately. The auth boundary is isolated in `lib/auth.ts`, which is the right place to swap in real session handling next.

### Data layer

`lib/mock-db.ts` contains an in-memory store plus reusable domain operations for:

- project creation
- escrow funding
- milestone delivery and release
- change order submission and approval
- payout timing logging
- notifications

Those functions are shared by both server actions and API routes so the product rules stay consistent.

### Integration boundaries

The current implementation is intentionally mock-backed. The next integration steps are:

1. Replace demo auth with Supabase Auth.
2. Replace the in-memory store with Supabase tables from the PRD schema.
3. Swap `getRoutingOptions` to call Monierate and the FX fallback.
4. Replace demo funding and payout references with Interswitch sandbox calls.
5. Add validation and optimistic UX around forms and notifications.

## Known limits

- Data resets when the server restarts because persistence is in memory.
- External APIs are represented by stubs and deterministic demo values.
- Signup does not create persistent users yet; it selects a demo identity for the chosen role.
