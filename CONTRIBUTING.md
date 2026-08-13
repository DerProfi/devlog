# Contributing to Daily DevLog

Thanks for your interest in improving Daily DevLog! This project is open source
and community feature suggestions are very welcome.

## Suggesting features or reporting bugs

The easiest way to contribute is through **GitHub Issues**:

- 💡 **Feature request** — got an idea? [Open a feature request](../../issues/new?template=feature_request.md).
- 🐛 **Bug report** — something broken? [Open a bug report](../../issues/new?template=bug_report.md).

Please search existing issues first to avoid duplicates.

## Contributing code

1. **Fork** the repository and create a branch from `main`.
2. Set up your local environment following [SETUP.md](./SETUP.md).
3. Make your change. Keep it focused — one topic per pull request.
4. Make sure it builds and lints cleanly:
   ```bash
   npm run lint
   npm run build
   ```
5. Commit with a clear message and open a **pull request** describing what you
   changed and why.

## Development notes

- **Stack:** Next.js (App Router), React, TypeScript, Supabase, Tailwind CSS.
- **Structure:** UI in `src/components`, API routes in `src/app/api`, shared
  logic in `src/lib`, translations in `src/i18n/locales`.
- **i18n:** user-facing strings live in `src/i18n/locales/en.json` and
  `de.json` — please update both when adding text.
- **Secrets:** never commit real credentials. Use `.env.local` (git-ignored)
  and keep `.env.example` in sync when you add a new environment variable.

## Code of conduct

Be kind and constructive. We want this to be a welcoming project for developers
of all experience levels.
