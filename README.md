# Asima Aftab Psychotherapy

A Next.js website and practice workspace, prepared for Node.js hosting on Hostinger with GitHub deployments. Includes appointment requests, service reviews with admin approval, Admin/Manager/User roles, account management, editable website content and image uploads.

## Hostinger deployment

Follow [DEPLOYMENT.md](./DEPLOYMENT.md). Use Hostinger **Node.js Web Apps**, framework **Next.js**, Node **22**, build **npm run build**, output **.next**, start **npm start**. Managed hosting uses Hostinger MySQL; configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME as described in the deployment guide.

The previous Cloudflare/Vinext runtime is no longer used. Files under `drizzle/`, `worker/`, `.openai/` and the old Sites helper scripts are legacy references. The production app uses **`migrations/mysql/`** and the scripts documented here. Do not run the old Cloudflare deployment helpers for Hostinger.

## Local development

Use Node 22 (`nvm use` if nvm is installed).

```bash
npm ci --include=dev
cp .env.example .env.local
```

Edit `.env.local`: set `ADMIN_PASSWORD` to a private password of at least 12 characters. Configure a local MySQL database using the DB_* fields and keep `APP_URL=http://127.0.0.1:5173` for local development. SQLite is only supported as an import source.

```bash
npm run dev
```

Open http://127.0.0.1:5173. The first startup applies migrations and creates an administrator only if none exists. Existing accounts and passwords are preserved. `.data/`, environment files and database exports are ignored by Git.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Apply local migrations and start development on port 5173 |
| `npm run build` | Build production output (database initialization runs at server startup) |
| `npm start` | Apply migrations, bootstrap a first administrator if needed and serve production; respects Hostinger's `PORT` |
| `npm run db:setup` | Apply migrations and bootstrap a first administrator |
| `npm run db:generate` | Generate migrations after schema edits |
| `npm run db:import` | Import local SQLite records; see deployment guide |
| `npm run admin:password` | Reset the selected admin password from private environment variables; revoke its sessions |
| `npm run typecheck` | Check TypeScript |
| `npm run test:production` | Exercise a production build with a temporary MySQL database and randomly generated credentials; requires MYSQL_TEST_URL |

## Data and authentication

Users, bookings, images, content, sessions and login-attempt counters live in SQL. Production migrations contain schema only, with no default account or password. `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` configure the first administrator. Later builds do not reset accounts. To intentionally reset an admin's password, set the new credentials in a private environment and run `npm run admin:password` against the intended database.

- **Admin:** bookings, website content and users.
- **Manager:** booking workspace, confirmation, cancellation and deletion.
- **User:** no dashboard access.

Authentication uses database-backed sessions, hashed passwords and HttpOnly cookies. Production cookies require HTTPS. ChatGPT headers are not accepted as authentication. Mutations check the request origin against `APP_URL`. Login attempts are limited per email. New passwords use PBKDF2-SHA256 with 600,000 iterations; older imported hashes remain compatible.

Booking dates are requests, not reserved calendar slots. No email, SMS, payment or external calendar integration is configured. The practice contacts clients to confirm sessions.

GitHub Actions runs type checking, a lint, production dependency audit, production build and end-to-end server checks using an isolated database.
# asimaaftabtherapy
# asimaaftabtherapy

## Service reviews

Open `/reviews` to browse approved feedback by service or rating and submit a review through the popup. Rating summaries contain approved reviews only. Administrators moderate submissions under **Admin → Reviews**; pending and rejected submissions stay private. New installations start with no reviews. The shared homepage/FAQ testimonial carousel shows the six latest approved reviews, including their actual ratings and services, and links to the full reviews page.

## Booking on WhatsApp

After a booking request is saved, its confirmation popup offers **Send booking on WhatsApp** when a practice phone number is marked for WhatsApp. The link prepares the submitted details (including optional notes); the visitor reviews the draft and taps Send in WhatsApp. The request remains saved regardless of whether the visitor sends it. Configure the number under **Practice details**. No WhatsApp Business API credentials are required for this handoff.
