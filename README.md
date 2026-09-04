# Mission Control

Nehemias Maldonado's daily-operations dashboard for Tyler Standish Group ·
KW Innovation — a real implementation of the "Mission Control" design
(originally mocked up in Claude Design).

Built with Next.js (App Router, TypeScript, Tailwind CSS v4), NextAuth.js
(Google OAuth) and Prisma.

## Status

Every panel in the original design is now real, not a mockup:

- **Email Desk** — live via Gmail (unread, drafts, a "needs my voice"
  flagged-thread heuristic).
- **Calendar & Time** — live via Google Calendar (today's timeline,
  overlap/conflict detection).
- **Rate Desk** — manual rate logging + history chart + payment
  calculator, with an "Export history to Sheets" button.
- **Market Desk + Area Explorer** — manual market stats + listings
  (active / closed-last-6-months), with an "Export to Sheets" button.
- **Content Studio** — log content ideas (Reel/Carousel/Caption); click
  one to read its full script, update status, or delete it.
- **Marketing Production** — a real Flyer Library (the team's 13 actual
  flyer designs) with live "Send to client" via Gmail; 15 Presentation +
  15 CMA premade templates (6 layouts × 30 palettes); a Canva-style
  Studio editor (drag/resize/select/delete text, shape, photo and logo
  elements, palette + custom colors, page management) with client-side
  PNG/PDF export, Gmail send, and an optional one-click export to a real
  Google Slides deck (presentations) or Google Doc (CMA).

**Mock buttons still carried over from the design, not wired to
anything real:** Download PDF / Share link on the Market Desk area
report, "Send buyer a rate sheet" on Rate Desk. Everything else is live.

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

The app requests `gmail.readonly`, `gmail.modify` (so it can send email
on your behalf for "Send to client" and, eventually, approved drafts),
`calendar.readonly`, `drive.file` (so it can only see files it creates
itself, not your whole Drive), `spreadsheets`, `presentations` and
`documents` (for the optional "Export to Sheets/Slides/Docs" buttons).
While the OAuth consent screen is in "Testing" mode, only accounts you
add as test users can sign in — publish the app (or keep it in testing,
since this is a single-user tool) once you're happy with it.

If you already signed in before these scopes were added, sign out and
back in once — the consent screen will show the new permissions.

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
