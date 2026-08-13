# Daily DevLog

> The DevLog for motivated developers. Document your daily work, track your
> progress, and recognize your achievements. Your personal tool against
> self-doubt and imposter syndrome.

Daily DevLog is a free, open-source web app that helps developers keep a simple
daily journal of what they worked on, visualize their momentum with
GitHub-style contribution charts, and stay motivated through streaks and mood
tracking.

**Live instance:** [devlog.today](https://devlog.today) free to use, all
features included. You can also self-host your own instance (see below).

## Features

- **Daily DevLog** - capture tasks, learnings, time entries and a short daily
  reflection.
- **Goals** — set daily/weekly goals and track your progress against them.
- **Deep Work** — built-in Pomodoro timer to help you focus.
- **Progress visualization** — contribution charts and GitHub-style heatmaps.
- **Mood tracking** — an activity-calendar view of how your days felt.
- **Streak system** — keep your streak alive with motivating milestones.
- **GitHub integration** — sign in with GitHub, pull in your public activity.
- **CLI / REST API** — script your logs from the terminal
  (see [CLI_API_DOCUMENTATION.md](./CLI_API_DOCUMENTATION.md)).
- **i18n** — English and German out of the box.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Supabase](https://supabase.com) — Postgres database, auth storage, Row Level Security
- GitHub OAuth for authentication
- Tailwind CSS
- [Recharts](https://recharts.org) for charts
- Deployable on [Vercel](https://vercel.com) (or any Node host)

## Getting Started

Everything is "bring your own backend" There is no central service you depend
on. To run your own instance you need a free Supabase project and a GitHub
OAuth app.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in the values (see SETUP.md)

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

👉 Full step-by-step instructions (Supabase schema, GitHub OAuth, tokens) are in
**[SETUP.md](./SETUP.md)**.

## Self-Hosting

Because the app carries no shared secrets in its source, anyone can run their
own copy:

1. Fork / clone this repository.
2. Create your own free Supabase project and run `supabase-schema-simple.sql`.
3. Create your own GitHub OAuth app.
4. Set the environment variables from `.env.example`.
5. Deploy to Vercel (or run `npm run build && npm start` anywhere).

Your instance uses your own database and your own users — it is completely
independent from any other deployment.


### ⚖️ Legal pages (Impressum / Datenschutz)

This project ships German **Impressum** and **Datenschutzerklärung** pages
(`/impressum`, `/datenschutz`). The operator details shown there are **not**
hardcoded — they are read from `NEXT_PUBLIC_OPERATOR_*` environment variables
(see `.env.example`). If you run a public instance you **must** set these to
your own details:

```env
NEXT_PUBLIC_OPERATOR_NAME=Your Name
NEXT_PUBLIC_OPERATOR_CO=
NEXT_PUBLIC_OPERATOR_STREET=Your Street 1
NEXT_PUBLIC_OPERATOR_CITY=12345 Your City
NEXT_PUBLIC_OPERATOR_COUNTRY=Germany
NEXT_PUBLIC_OPERATOR_EMAIL=you@example.com
```

The legal text itself is provided as-is and reflects the original operator's
setup. **You are responsible** for ensuring the Impressum and privacy policy
are correct and complete for your own jurisdiction and deployment.

## Contributing

Contributions and feature ideas are very welcome! Please open an issue to
propose a feature or report a bug, or send a pull request. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

[MIT](./LICENSE) © Leon Nothegger
