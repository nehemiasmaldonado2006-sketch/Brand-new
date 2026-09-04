# Mission Control

Nehemias Maldonado's daily-operations dashboard for Tyler Standish Group ·
KW Innovation — a real implementation of the "Mission Control" design
(originally mocked up in Claude Design).

Built with Next.js (App Router, TypeScript, Tailwind CSS v4), NextAuth.js
(Google OAuth) and Prisma.

## Status

- **Live:** Dashboard shell, Email Desk (Gmail), Calendar & Time (Google
  Calendar), Rate Desk (manual entry + payment calculator), Market Desk +
  Area Explorer (manual entry, listings, active/closed tabs).
- **Placeholder, building next:** Content Studio (no data source chosen
  yet), Marketing Production (flyer/presentation/CMA library + Canva-style
  editor).
- **Mock buttons carried over from the design, not wired yet:** Download
  PDF, Share link with client, Send to Marketing Production, Send buyer a
  rate sheet.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — leave as the default SQLite file for local dev.
   - `AUTH_SECRET` — generate with `npx auth secret` or
     `openssl rand -base64 33`.
   - `AUTH_URL` — `http://localhost:3000` for local dev.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — see below.
3. `npx prisma migrate dev` — creates the local SQLite database.
4. `npm run dev` — starts the app at http://localhost:3000.

## Google Cloud OAuth setup (required for Email Desk & Calendar)

Email Desk and Calendar & Time sign in with your own Google account and
read Gmail + Calendar directly — no third-party service sits in between.
To enable that you need a Google Cloud OAuth client:

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a project (or pick an existing one).
2. **APIs & Services → Library** — enable **Gmail API** and
   **Google Calendar API**.
3. **APIs & Services → OAuth consent screen** — set it up as **External**
   (unless you have a Google Workspace org to restrict it to), add your
   own Google account as a test user while it's in testing mode.
4. **APIs & Services → Credentials → Create credentials → OAuth client
   ID** — Application type **Web application**.
   - Authorized redirect URI (local dev):
     `http://localhost:3000/api/auth/callback/google`
   - Authorized redirect URI (production, once deployed):
     `https://<your-vercel-domain>/api/auth/callback/google`
5. Copy the generated **Client ID** and **Client secret** into
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (in `.env` locally, and in
   Vercel's Environment Variables for production).

The app requests `gmail.readonly`, `gmail.modify` (so approved drafts can
eventually be sent from Email Desk) and `calendar.readonly` scopes. While
the OAuth consent screen is in "Testing" mode, only accounts you add as
test users can sign in — publish the app (or keep it in testing, since
this is a single-user tool) once you're happy with it.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this there).
2. Import the repo in Vercel.
3. Add a Postgres database (Vercel Postgres or Neon both work) and set
   `DATABASE_URL` to its connection string in Vercel's Environment
   Variables.
4. In `prisma/schema.prisma`, change the datasource `provider` from
   `sqlite` to `postgresql`, commit, and push — the schema itself doesn't
   need to change.
5. Add `AUTH_SECRET`, `AUTH_URL` (your production URL), and the Google
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from the OAuth setup above
   as Environment Variables.
6. Add the production redirect URI to the Google OAuth client (step 4
   above).
7. Deploy. Vercel runs `prisma generate` automatically via the `postinstall`
   script; run `npx prisma migrate deploy` once (via `vercel env pull` +
   local run, or a one-off Vercel deployment hook) to apply migrations to
   the production database.

## Data model

Rate Desk and Market Desk have no live feed connected (per design) — you
log rates and market stats by hand, and the app keeps history for the
trend charts. Email Desk and Calendar & Time are live via your signed-in
Google account. See `prisma/schema.prisma` for the full data model.
