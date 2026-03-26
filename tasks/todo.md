# CrossRoute Realignment Tracker

## Understanding

- CrossRoute is now being built as a real product, not a demo scaffold.
- The current implementation slice focuses on provider identity, role-first onboarding, and role-aware dashboards before any visual polish pass.
- Real Supabase auth, persisted data, and live Monierate support are already in place; Interswitch execution remains blocked until account activation details arrive.

## Current Slice

- [x] Realign the PRD around provider identity, role-first entry, and Monierate placement.
- [x] Add provider profile schema support and database-backed provider identity.
- [x] Make landing page and signup flow start from role selection.
- [x] Redirect provider onboarding into provider profile completion.
- [x] Update project creation to support provider email, handle, or provider code lookup.
- [x] Restructure dashboard home so provider and client views feel meaningfully different.
- [x] Surface Monierate-driven FX context on the provider dashboard.
- [x] Verify the slice with lint, production build, and live Supabase table checks.

## Next Slice

- [x] Make provider profile reads fail soft when the schema cache is stale or the table is temporarily unavailable.
- [x] Add provider search and selection so clients can discover providers by handle, code, or name before creating projects.
- [x] Refresh landing, auth, dashboard, and project creation UI to a cleaner white-and-blue Stripe-like direction.
- [x] Verify the slice with lint and a production build.

## Progress Notes

- Verified the initial Supabase schema exists in the live project.
- Added and verified the `provider_profiles` table via a second migration.
- Provider accounts can now be routed into profile completion before dashboard use.
- Project creation now targets provider identity instead of email-only coupling.
- Provider dashboard now shows identity, live FX context, best route snapshot, and delivery pressure.
- Provider profile reads now fail soft when `provider_profiles` is temporarily unavailable in the Supabase schema cache.
- Clients can now search providers from the project creation flow through a dedicated provider search API route.
- The public entry screens and dashboard surfaces now follow a cleaner white-and-blue product direction.

## Review

- This slice closes the reported `provider_profiles` crash path by degrading provider-profile reads safely until the schema cache is ready.
- Clients now have a real in-product provider discovery flow instead of relying on exact manual identifiers only.
- The public entry screens, dashboard shell, project creation flow, project detail surface, and payout comparison page now align better with the intended Stripe-like white-and-blue product direction.
- Verification completed successfully with `cmd /c npm run lint` and `cmd /c npm run build` on March 26, 2026.
- Remaining major blocker: Interswitch funding and payout execution still need live credentials and integration details.
