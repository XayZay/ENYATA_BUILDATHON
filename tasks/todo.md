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

## Progress Notes

- Verified the initial Supabase schema exists in the live project.
- Added and verified the `provider_profiles` table via a second migration.
- Provider accounts can now be routed into profile completion before dashboard use.
- Project creation now targets provider identity instead of email-only coupling.
- Provider dashboard now shows identity, live FX context, best route snapshot, and delivery pressure.

## Review

- This slice makes the product model more coherent before any UI polish work.
- The app now better reflects the PRD direction: discoverable providers, role-first onboarding, and provider-specific home value.
- Verification completed successfully with `cmd /c npm run lint`, `cmd /c npm run build`, and a live query confirming `provider_profiles` exists.
- Remaining major blocker: Interswitch funding and payout execution still need live credentials and integration details.
