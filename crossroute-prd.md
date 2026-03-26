# CrossRoute - Product Requirements Document
> **Hackathon:** Interswitch x Enyata  
> **Tagline:** Escrow that adapts. Payments that optimize.  
> **Version:** 1.1 (MVP Realignment)

---

## 1. Product Summary

CrossRoute is a smart escrow and cross-border payment routing platform that facilitates trust between international clients and Nigerian service providers. It combines three product layers:

- a **Provider Identity Layer** so providers can be discovered and invited by a unique handle or provider code
- a **Dynamic Escrow Engine** for milestone funding, delivery, and mid-project scope changes via Change Orders
- a **Financial Routing Dashboard** that compares live USD -> NGN outcomes so providers can maximize payout value

**Primary Corridor:** International client (USD) -> Nigerian freelancer/provider (NGN)  
**Two User Roles:** Client (Buyer) and Provider (Seller)

CrossRoute should feel role-aware from the very first screen. The landing page and signup flow should ask who the user is, then shape the product around that choice.

---

## 2. Core User Personas

### Client (Buyer)
- Based internationally, paying in USD
- Wants assurance that funds are protected and only released on milestone completion
- Needs a simple way to find or invite a provider
- Needs a clear dashboard showing projects awaiting funding, projects in progress, pending approvals, and escrow actions

### Provider (Seller)
- Nigerian freelancer, agency, or contractor
- Needs a public identity inside CrossRoute so clients can locate and invite them
- Paid in USD held in escrow, withdraws in NGN
- Wants maximum NGN on withdrawal and visibility into current FX conditions before payout
- Needs a dashboard showing invites, active projects, pending deliverables, and current market rates

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend + API | Next.js 14 (App Router, API Routes) |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Styling | Tailwind CSS |
| FX Rate Data | Monierate API (live, per-request) |
| FX Fallback | open.er-api.com (no key required) |
| Disbursement | Interswitch API (sandbox) |
| Hosting | Vercel |

**Design Language:** Light, clean, professional - Stripe/Notion aesthetic. Crisp whites, deep neutral grays, a single accent color (recommended: `#1a56db` blue or `#0d9488` teal). Generous whitespace, card-based layouts, clear typographic hierarchy.

---

## 4. Database Schema

### `users`
```sql
id, email, full_name, role (client | provider), created_at
```

### `provider_profiles`
```sql
id, user_id, handle, provider_code, bio,
country, specialty, preferred_payout_channel,
availability_status, created_at, updated_at
```

Notes:
- `handle` must be unique and human-readable, for example `@tunde-design`
- `provider_code` can be a short generated identifier used for quick lookup or invitation
- Only providers have rows in this table

### `projects`
```sql
id, title, description, client_id, provider_id,
total_amount_usd, status (draft | funded | in_progress | change_requested | completed | disputed),
created_at, updated_at
```

### `milestones`
```sql
id, project_id, title, description,
amount_usd, status (pending | funded | released),
due_date, order_index, delivered_at
```

### `change_orders`
```sql
id, project_id, requested_by (user_id),
original_amount_usd, new_amount_usd,
reason, status (pending | approved_client | approved_provider | fully_approved | rejected),
client_approved_at, provider_approved_at, created_at
```

### `transactions`
```sql
id, project_id, milestone_id, type (deposit | release | change_top_up),
amount_usd, status (pending | completed | failed),
interswitch_reference, created_at
```

### `payout_requests`
```sql
id, provider_id, project_id, amount_usd,
selected_platform (interswitch | wise | grey | payoneer | quidax),
rate_at_time_ngn, amount_ngn, status (pending | processing | completed),
created_at
```

### `notifications`
```sql
id, user_id, message, read, link, created_at
```

---

## 5. Escrow State Machine

```text
Draft -> Funded -> In Progress -> Completed
                    |              ^
                    v              |
             Change Requested -----|
                    |
                    v
                 Disputed
```

### State Definitions

| State | Trigger | Who Can Advance |
|---|---|---|
| `draft` | Project created, no deposit yet | Client (by depositing) |
| `funded` | Full upfront deposit made, split across milestones | System |
| `in_progress` | Client confirms work started | Client |
| `change_requested` | Either party submits Change Order | Mutual approval required |
| `completed` | All milestones released | Client |
| `disputed` | Either party raises a dispute flag | Manual resolution |

### Change Order Approval Logic
```text
change_order.status = 'pending'
  -> requested_by = provider -> needs client approval first
  -> requested_by = client  -> needs provider approval first

On first approval:
  status = 'approved_client' OR 'approved_provider'

On second approval:
  status = 'fully_approved'
  -> project.total_amount_usd += delta
  -> new milestone created OR existing milestone updated
  -> project.status returns to 'in_progress'
```

---

## 6. Feature Specifications

### 6.1 Landing Page and Role Selection

**Route:** `/`

Landing page must immediately ask the visitor which type of account they want to create.

Primary CTAs:
- `I am a Client`
- `I am a Provider`

Behavior:
- Selecting a role routes the user into signup with that role preselected
- The landing page should communicate different value propositions for each role
- Client copy should emphasize escrow, milestone control, and protected delivery
- Provider copy should emphasize discoverability, protected scope changes, and NGN optimization

### 6.2 Auth and Onboarding

- Supabase email/password auth
- On signup: user selects or confirms role (Client or Provider)
- Role is stored and drives which dashboard they see
- No role-switching post-signup (for MVP)

**Provider onboarding requires one extra step:**
- provider creates a public profile
- provider chooses a unique `handle`
- system generates a `provider_code`

The provider can now be invited by:
- email
- handle
- provider code

### 6.3 Provider Identity and Discovery

Providers need an identity inside CrossRoute before projects make sense.

Provider profile should show:
- display name
- handle
- specialty/category
- short bio
- availability status
- preferred payout channel

Client project creation should support:
- direct invite by provider email
- provider lookup by handle
- provider lookup by provider code

This identity layer is for relationship and trust, not direct payment settlement. Payment rails stay internal to CrossRoute.

### 6.4 Role-Aware Dashboard Home

**Route:** `/dashboard`

Dashboard content must be meaningfully different by role.

**Client dashboard should show:**
- projects in draft
- projects awaiting funding
- projects in progress
- pending change orders that need approval
- milestones ready for release
- total escrowed USD
- unread notifications

**Provider dashboard should show:**
- project invites awaiting response
- active projects
- milestones awaiting delivery or review
- current USD -> NGN FX snapshot
- best route today
- recent payout requests
- unread notifications

### 6.5 Project Creation (Client)

**Route:** `/dashboard/projects/new`

Fields:
- Project title
- Description
- Provider lookup (`email`, `handle`, or `provider_code`)
- Milestones: add N milestones, each with title + USD amount
- Total auto-calculated from milestone sum

On submit:
- Project created with status `draft`
- Provider invited (email or in-app notification)

### 6.6 Funding (Client)

**Route:** `/dashboard/projects/[id]/fund`

- Shows total USD amount
- `Deposit to Escrow` button (Interswitch sandbox call)
- On success: all milestone statuses -> `funded`, project status -> `funded`
- Transaction record created

> **Interswitch Integration Point #1:** Payment initiation for escrow deposit

### 6.7 Project Dashboard (Both Roles)

**Route:** `/dashboard/projects/[id]`

Shared view - role determines what actions are available.

Displays:
- Project title, status badge (color-coded by state)
- Visual milestone tracker (timeline/stepper UI)
- Each milestone: title | amount | status
- Change Order history panel
- Action buttons (role-specific, see below)

**Client actions:**
- Release milestone funds
- Approve/reject Change Orders
- Raise dispute

**Provider actions:**
- Submit Change Order request
- Mark milestone as delivered (triggers client review)
- Approve Change Orders initiated by client

### 6.8 Change Order Flow

**Initiated by either party from project dashboard**

Form fields:
- Which milestone(s) affected
- New amount (USD)
- Reason / description

Flow:
1. Submitter sees status: `Awaiting other party approval`
2. Other party sees notification badge + approval prompt
3. Both approve -> escrow amount updated -> project resumes `in_progress`
4. Either rejects -> status returns to `in_progress`, Change Order logged as `rejected`

> Change Orders are always logged, even rejected ones. This is an audit trail feature and a core demo talking point.

### 6.9 FX Snapshot on Provider Dashboard

Monierate should appear before payout, not only after payout release.

**On provider dashboard show:**
- current USD -> NGN rate
- current best-value route
- quick summary of estimated NGN outcome for a sample amount or available released balance
- timestamp or freshness indicator for the current rate data

Purpose:
- makes the provider dashboard useful daily
- introduces the payout optimization story earlier in the product flow

### 6.10 Payout / Routing Dashboard (Provider only)

**Route:** `/dashboard/projects/[id]/payout`

Triggered when a milestone is released by the client.

**Layout: visual card grid**

Each card shows one platform:
- Platform logo + name
- Current USD -> NGN rate
- Platform fee (% or flat)
- **`You receive: N X,XXX,XXX`** prominently
- Processing time estimate
- CTA button

**Top card** gets a green `Best Value` badge (highest NGN received).

**Interswitch card** gets a separate `Recommended - Powered by Interswitch` badge.

**Disclaimer** (small text, bottom of page):
> Rates for Wise, Grey, Payoneer, and Quidax are sourced from Monierate and are indicative only. CrossRoute is not liable for discrepancies at time of transfer. Interswitch rates are processed directly when available.

**Rate source logic:**
```text
Monierate API -> fetch live USD -> NGN benchmark
  -> apply each platform fee structure
  -> calculate: (amount_usd x rate) - fees = ngn_received
  -> sort descending by ngn_received
  -> tag index[0] as 'Best Value'

Interswitch -> fetch live rate from Interswitch API when activated
  -> calculate ngn_received same way
  -> always shown, tagged separately
```

**Hardcoded fee structures (fallback if Monierate does not return platform fee data):**

| Platform | Fee |
|---|---|
| Wise | 0.5% + $1.50 |
| Grey | 1% |
| Payoneer | 2% |
| Quidax | 1.5% |
| Interswitch | Per sandbox response |

**On `Withdraw via Interswitch` click:**
- Interswitch payout API call fires (sandbox)
- Payout request record created
- Provider sees confirmation screen with NGN amount + reference

**On other platform clicks:**
- Modal: `To withdraw via [Platform], transfer $X to your [Platform] account. Current rate: N Y/$`
- `Got it` dismiss -> logs the selected platform in `payout_requests` for analytics

> **Interswitch Integration Point #2:** Payout disbursement

### 6.11 Notifications

Minimal in-app notification system:
- Project invite received
- Milestone funded
- Change Order submitted (needs your approval)
- Change Order fully approved
- Milestone released - funds available

Store in a `notifications` table: `id, user_id, message, read, link, created_at`

Display as a bell icon badge in the nav.

---

## 7. Page Structure and Routes

```text
/                          -> Landing page with role selection
/auth/login                -> Login
/auth/signup               -> Signup (role preselected from landing page if applicable)
/auth/provider-profile     -> Provider profile completion step

/dashboard                 -> Role-aware home
/dashboard/projects        -> All projects list
/dashboard/projects/new    -> Create project (Client only)
/dashboard/projects/[id]   -> Project detail (shared, role-aware actions)
/dashboard/projects/[id]/fund     -> Fund escrow (Client only)
/dashboard/projects/[id]/payout   -> Routing dashboard (Provider only)
/dashboard/notifications   -> Notification inbox
/dashboard/profile         -> Profile and identity settings
```

---

## 8. Demo Flow (Hackathon Presentation Script)

> Two browser tabs open - one logged in as Client, one as Provider.

### Step 1 - Provider identity exists (20s)
Provider tab: Provider signs up, completes profile, and gets a handle or provider code.

### Step 2 - Client creates project (30s)
Client tab: Create `Brand Identity Design` project. Search provider by handle or invite by email. Add 3 milestones: Discovery ($500), Design ($1,000), Final Delivery ($500).

### Step 3 - Client funds escrow (20s)
Client tab: Fund project -> Interswitch sandbox payment -> status flips to `Funded`.

### Step 4 - The pivot (Change Order) (45s)
Provider tab: Project is in progress. Client requested an extra revision round. Provider submits Change Order: increase Final Delivery milestone from $500 -> $800. Reason: `Additional revision round requested.`

Client tab: Notification badge appears. Client reviews and approves.

Provider tab: Both parties approved -> escrow updates to $2,300 total. Project status returns to `In Progress`.

### Step 5 - Completion and routing (60s)
Client tab: Release milestone funds.

Provider tab: Dashboard already shows current FX context. Open payout routing page and compare live outcomes. Highlight `Best Value` and the Interswitch recommendation.

### Step 6 - Pitch close (15s)
`CrossRoute does not just hold money - it manages trust before payment, protects changes during work, and optimizes what comes out the other side.`

---

## 9. MVP Scope (Must-Have vs Stretch)

### Must Have
- [ ] Auth (signup with role, login)
- [ ] Landing page role selection
- [ ] Provider profile with unique handle or provider code
- [ ] Project creation with provider lookup and milestones
- [ ] Escrow state machine (all 6 states)
- [ ] Change Order flow (dual approval)
- [ ] Interswitch sandbox deposit
- [ ] Provider dashboard FX snapshot using Monierate
- [ ] Routing dashboard with Monierate live rates
- [ ] Interswitch sandbox payout
- [ ] Basic notifications (in-app)

### Stretch
- [ ] Provider search directory
- [ ] 7-day NGN/USD trend chart on provider dashboard or payout screen
- [ ] Dispute flow UI
- [ ] Email notifications (Resend or Supabase email)
- [ ] Bitnob as second real payout rail
- [ ] Provider earnings history page

---

## 10. API Routes (Next.js)

```text
POST   /api/projects                    -> create project
GET    /api/projects                    -> list projects for current user
GET    /api/projects/[id]               -> get project + milestones
PATCH  /api/projects/[id]/status        -> update project status

POST   /api/projects/[id]/fund          -> initiate Interswitch deposit
POST   /api/projects/[id]/milestones/[mid]/release  -> release milestone

POST   /api/projects/[id]/change-orders           -> submit change order
PATCH  /api/projects/[id]/change-orders/[coid]    -> approve/reject

GET    /api/providers/search            -> find provider by email / handle / provider code
GET    /api/rates                       -> fetch live rates from Monierate
POST   /api/payout                      -> initiate Interswitch payout

GET    /api/notifications               -> get notifications for user
PATCH  /api/notifications/[id]/read     -> mark read
```

---

## 11. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Interswitch
INTERSWITCH_CLIENT_ID=
INTERSWITCH_CLIENT_SECRET=
INTERSWITCH_BASE_URL=https://sandbox.interswitchng.com

# Monierate
MONIERATE_API_KEY=

# FX Fallback
OPEN_ER_API_URL=https://open.er-api.com/v6/latest/USD
```

---

## 12. Key Talking Points for Judges

1. **Not just escrow - a contract state machine.** CrossRoute tracks 6 project states and enforces dual-party approval on scope changes.
2. **The Change Order is the product.** Scope creep kills freelance projects. CrossRoute handles it natively in the payment layer.
3. **Provider identity closes the loop.** Clients can find and invite real providers through handles or provider codes, not just external coordination.
4. **Monierate powers ongoing transparency.** Rate visibility appears on the provider dashboard before payout and deepens on the routing page.
5. **Interswitch is the execution rail, not the entire product.** We use it where fund movement matters while the rest of the product manages trust and intelligence around the transaction.
6. **Built for the Nigeria <-> World corridor.** Every design decision (USD escrow, NGN optimization, Interswitch, provider identity) is intentional for this market.
