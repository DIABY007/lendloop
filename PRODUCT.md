# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Aceternity UI, Clerk Auth, Convex BaaS, n8n Automation Engine.

## Users

- **Lenders (Neighbors)**: Residents willing to share tools with neighbors. They need frictionless listing, clear request management (approve/decline), and peace of mind regarding return status.
- **Borrowers (Neighbors)**: Residents needing specific tools for short-term projects (gardening, DIY, repairs). They need clear availability discovery, easy date-range booking, and prompt status updates.
- **Admins**: Neighborhood community moderators/managers who oversee all listings and loans, enforce community safety, and designate "Trusted Lender" badges.

## Product Purpose

LendLoop is a neighborhood tool-lending board with automated workflows. It brings trust, simplicity, and modern reliability to the local sharing economy.
Success means neighbors can easily discover, borrow, and lend tools with zero friction and automated peace of mind (prompt notifications, timely reminders, transparent statuses).

## Positioning

Unlike cluttered, insecure classified boards or ad-heavy neighborhood apps, LendLoop combines:
1. **Privacy & Data Minimization by Default**: Public catalog strictly hides owner identities and personal data.
2. **Automated Lifecycle Intelligence**: Real-time status transitions and reminders powered by secure, HMAC-verified n8n automations.
3. **High Craft & Trust**: Server-enforced role-based access control (RBAC), "Trusted Lender" verification badges, and a refined, premium interface that builds immediate confidence.

## Operating Context

- Used on desktop and mobile web in household, workshop, and garage contexts.
- High emphasis on readability, clear status indicators (Available, Requested, In Loan, Overdue, Returned), and immediate actionability (one-click approvals, intuitive date-range pickers).

## Capabilities and Constraints

- **Public Experience**:
  - Hero with tagline: *"Borrow what you need. Lend what you don't."*
  - Read-only tools catalog showing tool name and category only (zero owner data leakage).
  - Prominent Clerk sign-in / sign-up CTA.
- **Authenticated Experience**:
  - Tool creation form: Name, Category (power tools, garden, kitchen, camping, hand tools), Condition (Like New, Good, Fair), Short description, optional image.
  - Borrow requests with explicit date range.
  - Owner request review: 1-click Approve or Decline.
  - Return workflow: Mark loan as returned.
  - Dedicated views: All Tools (filterable by category & availability), "My Listings", "My Requests", "Incoming Requests".
  - Automation Activity trail: Real-time visibility on automated notifications and reminders sent.
- **Roles & RBAC**:
  - `user`: Can only mutate their own listings and act on loans where they are borrower or lender.
  - `admin`: Can view all loans, remove any listing, and award the "Trusted Lender" status.
  - **Hard constraint**: All authorization rules must be strictly enforced server-side inside Convex functions, not solely in UI conditionals.
- **Automations (n8n)**:
  - Webhook: Real-time borrow request created / status changed notification.
  - Daily Cron: Overdue loans detection, automated reminder dispatch, and idempotent write-back to Convex.
  - Security: Cryptographic HMAC signature verification with shared secrets in both directions, zero credentials leaked in code or JSON exports, and dedicated failure/retry error workflows.

## Brand Commitments

- **Name**: LendLoop
- **Tagline**: *"Borrow what you need. Lend what you don't."*
- **Tone & Aesthetic**: Warm community spirit meets high-precision digital craft. Utilitarian elegance, tactile feedback, crisp typography, earthy yet modern tones, and deliberate micro-interactions that feel reliable and satisfying.

## Evidence on Hand

- Official project brief and take-home requirements from Fluence International, Inc.
- Strict evaluation rubric: Code structure, security thinking (OWASP, RBAC, data minimization), UX & practicality, n8n reliability/error handling, and comprehensive documentation.

## Product Principles

1. **Craft Without Clutter**: High-end typography, refined micro-animations, and intentional contrast—never looking cheap or like a generic bootstrap template.
2. **Privacy as a Foundation**: Public views strictly minimize exposed data; user contacts are shared only when a loan is actively approved.
3. **Ironclad Server-Side Security**: UI mirrors permissions, but Convex functions independently validate and enforce RBAC and HMAC integrity.
4. **Reliable, Resilient Automation**: Workflows are idempotent, retry-ready, cryptographically authenticated, and failure-observable.
5. **Frictionless Local Exchange**: Instant clarity on tool condition, availability dates, and status transitions.

## Accessibility & Inclusion

- WCAG AA compliant contrast ratios across light/dark palettes.
- Fully accessible keyboard navigation and ARIA attributes for modals, date pickers, and interactive cards.
- Mobile-responsive touch targets (minimum 44x44px).
