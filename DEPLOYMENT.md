# Deploy MySQL + Next.js through GitHub to Hostinger

This app uses Hostinger MySQL through `mysql2` and Drizzle. Turso and `DATABASE_AUTH_TOKEN` are no longer used. Use Hostinger **Node.js Web Apps**, not a static upload to `public_html`.

## Quick connection setup

In your production hosting environment, set `DB_NAME`, `DB_USER` and `DB_PASSWORD` using the complete names from your hosting panel. The host and port default to `127.0.0.1:3306`; set `DB_HOST` explicitly if your database is on another server. Keep passwords private and enter values without surrounding quotes.

Run `npm run db:check` from the app directory to test the connection without changing data. It explains common connection failures without printing credentials. Then redeploy using `npm start` to initialize tables. First-time setup also requires `APP_URL`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` as described below.

## 1. Create your Hostinger database

In hPanel, open your website's **Databases → Management** and create a dedicated MySQL database and user. Copy the complete names, including Hostinger's account prefix, and keep the password private. Use a fresh database for this app.

For a Node.js app running on the same Hostinger hosting account, Hostinger documents host **127.0.0.1**, port **3306**. Do not use `localhost` (which can resolve to IPv6) or the remote MySQL hostname for the hosted app. See [Hostinger's MySQL connection guide](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/).

## 2. Publish the project to GitHub

Publish the contents of `asima-aftab` as a private GitHub repository, with `package.json`, `app/`, `db/`, `migrations/mysql/`, and `next.config.mjs` at the root. In GitHub Desktop, add this folder, review the changes, commit and Publish repository. Future updates are commits pushed to the connected branch.

Do not upload `.env.local`, `.data/`, `.wrangler/`, `node_modules/`, `.next/`, backups or database exports. They are ignored by Git. Never include credentials in a commit. Wait for **Actions → Production checks** to pass; CI uses its own disposable MySQL service and tests authentication, permissions, booking lifecycle, uploaded images, content saving and repeat initialization.

## 3. Connect Hostinger

Choose **Websites → Add website → Node.js Web App → Import Git Repository**, authorize your GitHub repository and select branch `main`.

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Node version | 22.x |
| Root directory | `.` if package.json is at repository root; otherwise `asima-aftab` |
| Install | `npm ci --include=dev` |
| Build | `npm run build` |
| Output | `.next` |
| Start | `npm start` |

Some fields may be filled automatically. Keep the start command as `npm start`: its `prestart` script applies migrations and initializes the first admin before serving requests. The build itself does not need database access. Keep `npm ci --include=dev` for full tooling, and do not set a production `PORT`; Hostinger supplies the server port. Packages required to build CSS and TypeScript are in `dependencies` so production-only installs can also build.

## 4. Configure environment variables

Replace the old Turso variables with these. Values are entered individually in Hostinger, without surrounding quotes:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `APP_URL` | `https://asimaaftabtherapy.com` |
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_NAME` | Complete MySQL database name from hPanel |
| `DB_USER` | Complete MySQL username from hPanel |
| `DB_PASSWORD` | That MySQL user's private password |
| `ADMIN_EMAIL` | `asimaftabtherapy@gmail.com` |
| `ADMIN_NAME` | `Asima Aftab` |
| `ADMIN_PASSWORD` | A fresh private password, 12–256 characters |

**Remove `DATABASE_AUTH_TOKEN` and any old `DATABASE_URL=file:...` or `libsql://...`.** When any of `DB_USER`, `DB_PASSWORD` or `DB_NAME` is set, the individual `DB_*` settings take precedence over `DATABASE_URL`. Set all three together. `DB_HOST` defaults to `127.0.0.1` and `DB_PORT` defaults to `3306`. For URL-only configuration, remove those three fields. Individual `DB_*` fields avoid URL-encoding passwords. Alternatively, use `DATABASE_URL=mysql://USER:ENCODED_PASSWORD@127.0.0.1:3306/DATABASE` instead of the five `DB_*` fields; username/password must be percent-encoded.

Use the temporary Hostinger HTTPS address for `APP_URL` if the real domain is not connected yet. When connecting the domain, update `APP_URL` and redeploy. Use the exact browser origin, with no page path, query or fragment. Redirect `www` to the canonical host.

## 5. Deploy and verify

Click **Deploy**. Startup creates the MySQL tables and bootstraps an administrator only when none exists. Future startups preserve accounts, passwords and content. Look for `Database migrations complete` in runtime logs, then test:

1. Open your HTTPS homepage and `/login`.
2. Sign in with the production admin email/password above.
3. Upload images and save a small text edit in the admin dashboard; reload the public page.
4. Submit a test booking and confirm/cancel/delete it in Appointments.
5. Create a Manager and verify that it can manage bookings but cannot edit users or site content.
6. Sign out and sign in again.

After initialization, you can remove `ADMIN_PASSWORD` from the hosting environment. Existing administrators are preserved. This app does not send booking email/SMS, collect payments or synchronize external calendars; the practice confirms appointments directly.

## 6. Transfer previous local SQLite data (optional)

### Transfer website content from a local MySQL database

Start the existing local MySQL server and run `npm run db:export-site` in the app directory. The command reads the local `.env.local` connection and writes a private `.data/live-site-data.sql` file containing saved content, images and reviews. It does not copy accounts, sessions or appointments. Reviews retain their moderation status; only approved reviews appear publicly.

Back up the destination database, then use phpMyAdmin **Import** in the live database matching the app's `DB_NAME`. Import `.data/live-site-data.sql` after the schema has been initialized. Existing destination rows are preserved, including content with the same ID. Schema-only files under `exports/` do not contain local website data. Keep data exports private and out of Git.

For an existing administrator's password recovery without a remote connection, run `npm run admin:sql` locally, enter the email and a new private password, then run all generated SQL statements in the intended live database. Check the final result reports `password_updated = 1`. This also revokes old sessions and clears login lockouts.

GitHub transfers code, not saved content or images. Your existing `.data/app.db` is preserved locally. Deploy first so the production admin and schema exist. Back up your MySQL database before importing.

On your computer, install dependencies with `npm ci --include=dev`. Configure the destination MySQL connection in a private `.env.local` (or process environment). For remote access from your computer, allow your IP in Hostinger's **Remote MySQL** section and use the remote MySQL hostname shown there, rather than `127.0.0.1`. See [Hostinger remote access](https://www.hostinger.com/support/1583546-how-to-set-up-remote-mysql-access-in-hostinger/).

Run:

```bash
SOURCE_DATABASE_URL=file:.data/app.db npm run db:import
```

The import is transactional. It preserves existing records and the production admin's password when the email already exists. It copies content, images, appointments and other users, but never sessions or SQLite migration history. Validation errors roll back the import. Existing destination content takes precedence. Remove the temporary remote-access rule afterward and restore your local database configuration.

## 7. Local development and database care

Use Node 22 and your own local MySQL database. Copy `.env.example` to `.env.local`, fill in MySQL credentials and an initial admin password, then run `npm run dev`. SQLite is now only an import source; the app requires MySQL for development too.

Commands:

- `npm run db:setup`: apply MySQL migrations and bootstrap the first admin.
- `npm run db:generate`: generate a migration after editing `db/schema.ts`.
- `npm run admin:password`: reset the existing admin selected by `ADMIN_EMAIL` using `ADMIN_PASSWORD`; revoke sessions and clear login lockout.
- `npm run typecheck` and `npm run lint`: static checks.
- `MYSQL_TEST_URL=mysql://USER:PASSWORD@127.0.0.1:3306 npm run test:production`: after a build, create a temporary database, run tests, and drop it. Use a local/CI account permitted to create/drop databases, never production credentials.

Active migrations live in `migrations/mysql/`. Earlier SQLite migrations and `drizzle/`, `worker/`, `.openai/`, and Sites helpers are legacy references; do not use their deployment scripts. MySQL DDL implicitly commits: back up before schema changes, review generated migrations and investigate any interrupted migration before retrying. Configure backups through Hostinger and test restoration. Keep users, bookings and images in the MySQL database outside the deployment directory.

## Troubleshooting

- **Access denied:** verify full database/user names, password and permissions; the user must be assigned to the database.
- **Access denied for …@::1:** use `DB_HOST=127.0.0.1` for the hosted app.
- **Cannot connect:** verify `DB_HOST`, port and database availability. From your own computer use Hostinger's remote hostname and allow your IP.
- **SQLite/libSQL URL error:** remove the old `DATABASE_URL`; configure `DB_*` for MySQL instead.
- **Tables missing:** ensure Hostinger runs `npm start`, including `prestart`, and inspect runtime migration logs.
- **403 on login or booking:** browser origin must exactly match `APP_URL`; update it and restart/redeploy.
- **Repeated login redirects:** use HTTPS for production session cookies.
- **Missing content:** import local data in section 6 or edit content in the hosted dashboard; it does not travel in GitHub.

## Older Hostinger build systems (GLIBC / SWC)

The project uses `next.config.mjs` so loading configuration does not require compiling TypeScript. The matching `@next/swc-wasm-nodejs` package is installed explicitly and staged by `scripts/prepare-swc.mjs` before build/start so Next.js can fall back to WebAssembly when Hostinger cannot load its Linux native compiler (for example, GLIBC_2.29 missing). Keep the build command `npm run build`, which uses webpack; Turbopack requires native bindings. Keep Next.js and the WASM package on the same version when upgrading.

After pulling this change, run a fresh install (`npm ci --include=dev`) and redeploy. Do not set `NEXT_DISABLE_SWC_WASM`. If logs still reference `next.config.ts`, Hostinger is building an older commit or the wrong project directory.

## Empty response / JSON error during admin login

An empty HTTP 500 response is a server error, not evidence of an incorrect password. Ensure `APP_URL=https://asimaaftabtherapy.com` includes `https://`, remove stale SQLite/Turso `DATABASE_URL` values, and verify all five `DB_*` fields. Keep start command `npm start` so `prestart` creates the tables and initial administrator. Look for `Database migrations complete` in Runtime Logs.

Login failures now log `[login] Sign-in failed` with a reference and error code, without logging credentials or submitted personal data. Common codes: `DB_CONFIG_MISSING_DB_*` means a required MySQL environment variable is missing; `ERR_INVALID_URL` means an invalid APP_URL or DATABASE_URL; `ER_ACCESS_DENIED_ERROR` indicates MySQL credentials/permissions; `ER_BAD_DB_ERROR` means the database name is incorrect; `ER_NO_SUCH_TABLE` means migrations have not completed; `ECONNREFUSED` or `ETIMEDOUT` means the database connection could not be established. Fix the cause and restart/redeploy. Password recovery uses `npm run admin:password` after configuring the intended MySQL database privately.

## Service reviews

The public `/reviews` page includes service/rating filters, rating-distribution bars, sorting and pagination. Visitors submit a service, 1–5 star rating, optional display name and review text in a popup, with explicit publication consent. New reviews are pending and are excluded from all public lists and rating summaries. No sample reviews are inserted.

Administrators approve, reject, return to pending or delete submissions under **Admin → Reviews**. Managers do not have moderation access. The shared homepage/FAQ testimonial carousel uses the six latest approved service reviews, with actual ratings and service labels. Use Admin → Reviews to manage the shared review content; the legacy Testimonials editor has been removed. Deleting, rejecting or returning a review to pending removes it from public lists and statistics.

Include `migrations/mysql/0001_busy_layla_miller.sql` and its migration metadata when pushing to GitHub. `npm start` applies this additive migration before serving the app; it creates the reviews table and indexes without replacing existing content or accounts. The production smoke suite tests review privacy, role checks, validation, aggregation, filters, sorting, pagination and moderation in an isolated database.

## WhatsApp booking handoff

Under **Admin → Practice details**, mark the intended practice phone number as WhatsApp and save it. The first enabled WhatsApp number receives drafts prepared by the booking confirmation popup. This is a visitor-controlled WhatsApp link after successful database storage, not automatic server messaging. Visitors must review the draft and press Send; optional booking notes are included in the draft. If no WhatsApp number is configured, the standard booking confirmation remains available.

## Missing @tailwindcss/postcss during build

The build needs `@tailwindcss/postcss`, `tailwindcss`, `tw-animate-css`, TypeScript and its type declarations. They are listed in `dependencies` so Hostinger retains them even with `NODE_ENV=production` and development dependencies omitted. `postcss.config.mjs` uses the exact plugin name `@tailwindcss/postcss`.

Push both `package.json` and `package-lock.json`, then redeploy with a clean install. Prefer `npm ci --include=dev` when the install command is editable. A stale installation or older commit can still produce a missing-module error. SWC native warnings are separate; the build uses the prepared WASM fallback where needed.
