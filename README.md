# Asima Aftab Psychotherapy
Responsive therapy website with a protected practice dashboard, D1 appointment storage and editable website content.

## Development
Run `npm run install:ci`, `npm run db:generate` after schema edits, then `npm run dev`.
Apply checked-in migrations to the local D1 database before using booking or editing. Hosted migrations are applied during deployment. Build with `node /Users/muhammadazhar/.codex/plugins/cache/openai-curated-remote/sites/1.1.2/scripts/build-site.mjs`.

## Administration
Visit `/admin`. The hosted site is owner-private and ChatGPT sign-in protects admin pages and APIs. The platform owner-only access policy is the administrator allowlist. **Before making the website public or sharing access, add an explicit server-side administrator role/allowlist to `lib/admin.ts` and protect the dashboard with the same policy.** Local development uses the starter's mock identity, never production credentials.

The dashboard manages appointment status and deletion, introduction, services, articles, FAQs, and practice details. Appointment dates are preferences, not confirmed slots. There is no payment processing or email delivery; administrators contact requesters via their provided email. Bookings and content are persisted in D1, not browser storage.

Confirm the therapist's name, qualifications, offered services, contact details, fees, privacy/retention policy and session arrangements before public launch. Generic journal reflections are starter content for review. Images use Unsplash remote URLs; replace with your own licensed photography if desired. The website does not collect clinical histories.
