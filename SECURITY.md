# Security Policy

Thanks for helping keep Daily DevLog and its users safe.

## Supported versions

Daily DevLog is developed as a rolling release. Security fixes are applied to
the latest state of the `main` branch. There are no separately maintained
older release lines.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or discussions.**

Instead, use one of the following private channels:

1. **GitHub private vulnerability reporting** (preferred) — open the
   repository's **Security** tab and click **"Report a vulnerability"**. This
   creates a private advisory visible only to the maintainers.
2. **Email** — if you cannot use GitHub, contact the operator via the address
   listed in the [Impressum](https://devlog.today/impressum).

Please include as much detail as you can:

- the type of issue (e.g. auth bypass, injection, data exposure, XSS),
- affected file(s), route(s) or component(s),
- steps to reproduce or a proof of concept,
- the potential impact.

## What to expect

- We aim to acknowledge new reports within a few days.
- We will keep you informed while we investigate and work on a fix.
- Please give us a reasonable amount of time to release a fix before any
  public disclosure. We are happy to credit you once the issue is resolved,
  unless you prefer to remain anonymous.

## Scope notes for self-hosters

Daily DevLog is "bring your own backend": every deployment uses its own
Supabase project, GitHub OAuth app and secrets. Because of this:

- No shared credentials ship in this repository — all secrets are supplied via
  environment variables (see [`.env.example`](./.env.example)).
- Keep your `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`, GitHub OAuth
  secret and Upstash token server-side only; never expose them to the client
  or commit them.
- Reports about a *specific self-hosted instance's* misconfiguration should go
  to that instance's operator, not here. Report issues in the **code** through
  the channels above.
