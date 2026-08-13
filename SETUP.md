# Setup Guide

This guide walks you through running your own Daily DevLog instance from
scratch. It takes ~15 minutes and only uses free tiers.

## Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) account
- A GitHub account (for the OAuth app)

## 1. Supabase database

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** → **New Query**.
3. Paste the full contents of [`supabase-schema-simple.sql`](./supabase-schema-simple.sql) and run it.

This creates the tables (`users`, `dev_logs`, `rate_limits`, `user_usage`),
the update triggers, and the Row Level Security policies.

You can verify under **Table Editor** that the tables exist.

## 2. GitHub OAuth app

1. Go to <https://github.com/settings/developers> → **New OAuth App**.
2. Set:
   - **Homepage URL**: `http://localhost:3000` (or your deployment URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. After creating it, note the **Client ID** and generate a **Client Secret**.

The app only requests `read:user` and `user:email` scopes — it reads public
profile data, never private repositories.

## 3. GitHub server token (optional but recommended)

A classic personal access token raises GitHub API rate limits and lets the app
fetch public contribution data.

1. Go to <https://github.com/settings/tokens> → **Generate new token (classic)**.
2. Name it e.g. `DevLog Server Token`.
3. **Leave all scopes unchecked** — no permissions are required for public data.
4. Copy the token (starts with `ghp_...`).

## 4. Environment variables

Copy the template and fill in the values you gathered above:

```bash
cp .env.example .env.local
```

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

See [`.env.example`](./.env.example) for the full list of variables and what
each one is for. **Never commit `.env.local`** — it is git-ignored.

## 5. Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with GitHub.

## Deploying to production

1. Push your fork to GitHub and import it into [Vercel](https://vercel.com/new).
2. Add all environment variables from `.env.example` in the Vercel project settings.
3. Update your GitHub OAuth app's Homepage and callback URLs to your production
   domain (e.g. `https://your-app.vercel.app/api/auth/github/callback`).
4. Set `NEXTAUTH_URL` to your production URL.

## Troubleshooting

- **"Missing Supabase environment variables"** — restart the dev server after
  editing `.env.local`.
- **GitHub OAuth fails** — the callback URL must match exactly, including the
  scheme and path `/api/auth/github/callback`.
- **"NEXTAUTH_SECRET is not defined"** — set it in `.env.local`; it signs the
  session cookies.

For the CLI / REST API, see [CLI_API_DOCUMENTATION.md](./CLI_API_DOCUMENTATION.md)
and [CLI_QUICK_REFERENCE.md](./CLI_QUICK_REFERENCE.md).
