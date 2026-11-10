# Deploy through GitHub to Hostinger

This guide targets **Hostinger Node.js Web Apps (Business/Cloud)**. The application is a server-rendered Next.js app with API routes; uploading static files into `public_html` will not run bookings or the admin dashboard.

## Deployment checklist

The GitHub repository root must be this `asima-aftab` folder (the folder containing `package.json`). Choose **Node.js Web App → Import Git Repository → Next.js** in Hostinger, then use:

- **Node:** 22.x
- **Install:** `npm ci --include=dev`
- **Build:** `npm run build`
- **Output:** `.next`
- **Start:** `npm start`
- **Environment:** configure all variables in section 4 before deploying.

Wait for the GitHub **Production checks** workflow to pass before deploying. It checks TypeScript, lint, production dependencies, the build, and login/bookings/content/image persistence against an isolated test database.

**Local content is separate from GitHub.** Uploading code does not upload saved website text, accounts, appointments or images. Follow section 6 to transfer existing local data, or configure the public content through the hosted admin dashboard. The current local database contains no uploaded images; add your practice images before launch. Use a fresh production admin password rather than the local development password.

## 1. Create the production database

Create a Turso account and a database in a region suitable for your practice. From its dashboard, copy the database URL (`libsql://...turso.io`) and generate a database auth token with read/write access. Use a dedicated database for this application. Keep its token private.

This project uses SQLite/libSQL through Drizzle. Hostinger's MySQL credentials are not interchangeable with these settings. A remote database keeps users, bookings, content and uploaded images outside Hostinger's replaceable deployment files. A VPS can instead use a SQLite file on a backed-up persistent volume, with an absolute `file:/.../app.db` URL.

References: [Turso TypeScript client](https://docs.turso.tech/sdk/ts/reference), [Drizzle libSQL](https://orm.drizzle.team/docs/get-started/turso-new).

## 2. Put the project on GitHub

Create a **private, empty repository** on GitHub, for example `asima-aftab-psychotherapy`. Upload the contents of the `asima-aftab` directory so `package.json`, `package-lock.json`, `app/`, `migrations/` and `next.config.ts` are at the repository root.

With GitHub Desktop, add the existing `asima-aftab` repository, review the changed files, commit them and choose **Publish repository**, keeping it private. Alternatively, after committing through your Git client, add your GitHub remote and push:

```bash
git remote add github https://github.com/YOUR_USERNAME/asima-aftab-psychotherapy.git
git push github HEAD:main
```

Do not upload `.env.local`, `.env.production.local`, `.data/`, `.wrangler/`, database backups, `node_modules/`, `.next/` or `dist/`. `.gitignore` excludes these. `.env.example` is safe to commit; it contains no password or token. If the whole parent directory is the repository, select `asima-aftab` as Hostinger's root directory instead.

GitHub CI checks this repository on pushes and pull requests. It does not deploy or modify your production database.

## 3. Connect Hostinger to GitHub

In Hostinger's dashboard:

1. Open **Websites → Create site → Web App**.
2. Select **Import Git Repository**.
3. Authorize Hostinger for the private repository you created.
4. Select the repository and branch `main`.
5. Select framework **Next.js** and configure:

| Setting | Value |
| --- | --- |
| Node version | **22.x** |
| Package manager | npm |
| Root directory | `.` when `package.json` is at the repository root |
| Install command, if editable | `npm ci --include=dev` |
| Build command/script | `npm run build` / `build` |
| Output directory | `.next` |
| Start command, if shown | `npm start` |

Keep the framework set to Next.js rather than Vite or a static React app. The build script includes database initialization; do not replace it with only `next build`. Build tools such as TypeScript and Tailwind must be installed, so do not set `NPM_CONFIG_OMIT=dev` during builds. Hostinger manages the server port; do not set `PORT=5173` in production.

Hostinger's interface may automatically fill or hide some framework-specific fields. Its official flow is documented in [Deploy a Node.js web app](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

## 4. Add environment variables before the first deploy

Add these in Hostinger's deployment settings, available to the build and runtime:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `APP_URL` | Exact HTTPS origin, e.g. `https://yourdomain.com` |
| `DATABASE_URL` | Turso's `libsql://...` database URL |
| `DATABASE_AUTH_TOKEN` | Private database token |
| `ADMIN_EMAIL` | `asimaftabtherapy@gmail.com` |
| `ADMIN_NAME` | `Asima Aftab` |
| `ADMIN_PASSWORD` | A new private password, 12–256 characters |

Use the temporary Hostinger HTTPS origin for `APP_URL` if the custom domain is not ready. When you connect the real domain, update `APP_URL` to that origin and redeploy. Redirect `www` to your chosen canonical host, or use the same host as `APP_URL` for logins and forms. The origin contains no page path, query or fragment.

Choose a fresh production password. There is no hardcoded production login. Do not prefix secrets with `NEXT_PUBLIC_`, add them to GitHub files, or paste them into commit messages.

## 5. Deploy and verify

Click **Deploy**. The build applies schema migrations to the configured database, creates the first admin when no admin exists, and builds Next.js. On later deployments it preserves accounts, bookings and content. Check the deployment logs for `Database migrations complete` and a successful Next.js build.

After deployment:

1. Open the HTTPS homepage and `/login`.
2. Sign in using `ADMIN_EMAIL` and your production password.
3. Open **Users** and create a Manager account if needed.
4. Submit a test booking on `/booking`; verify the success popup and the new row in Appointments.
5. Confirm and cancel the test booking; verify Manager access and sign-out.
6. Edit a small piece of website text, save it and reload the public page.

After successful setup you can remove `ADMIN_PASSWORD` from Hostinger's environment and restart/redeploy. Existing database accounts remain; builds do not require the bootstrap password when an admin already exists. Keep the database variables and `APP_URL` configured.

## 6. Bring over existing local data (optional)

Your previous local data was copied into the ignored `.data/app.db` during this preparation. It is not included in GitHub. The new hosted database starts empty unless you import records.

First deploy the hosted app so its production admin is created with your new password. Then, on your own computer, temporarily configure the **destination** production `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in a private `.env.local` file. Run from the project directory:

```bash
SOURCE_DATABASE_URL=file:.data/app.db npm run db:import
```

The importer copies content, appointments, images and users in a transaction. Existing destination records are preserved, including an administrator with the same email and its new password. Sessions are not copied; users sign in again. Imported additional accounts retain their existing roles and password hashes. Restore your local development database settings afterward. Back up the destination before importing into a database that already contains live practice data.

## 7. Future updates and database care

Push commits to the connected GitHub branch and use Hostinger's auto-deployment or Redeploy control. Data remains in the remote database. Check GitHub CI and Hostinger deployment logs after each update. Only deploy reviewed migrations; take a database backup before destructive schema changes.

Configure backups/recovery through your database provider. GitHub stores code, not your booking database or uploaded images. Keep database tokens current and update Hostinger's environment when rotating them.

## Troubleshooting

- **No Node.js/Web App option:** confirm your Hostinger plan supports Node.js Web Apps; a static-only hosting flow cannot serve this application.
- **Build says DATABASE_URL / APP_URL is missing:** add the variables to the build environment as well as runtime settings, then redeploy.
- **Build asks for ADMIN_EMAIL / ADMIN_PASSWORD:** the database has no administrator yet; set initial credentials and redeploy.
- **403 on login or booking:** check that the browser origin exactly matches `APP_URL`, including `www`, scheme and port. Use HTTPS in production.
- **Redirected to login repeatedly:** use HTTPS so the browser can save the Secure session cookie. Do not use a static export.
- **Database errors:** check the Turso URL, token, access and connectivity. A MySQL URL is unsupported by this configured driver.
- **New deployment loses data:** check that `DATABASE_URL` is remote, not a relative SQLite file in the build directory.
- **Password recovery:** from a trusted machine, configure the intended database URL/token and the new `ADMIN_EMAIL`/`ADMIN_PASSWORD` in a private environment, then run `npm run admin:password`. It resets only an existing admin and revokes its sessions.

This project has no automatic booking emails, payment processing or external calendar synchronization. Confirmations are handled through the practice workspace and direct contact with the client.
