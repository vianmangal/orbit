# Daily Orbit

Daily Orbit puts eight external daily games in one responsive dashboard and
keeps each player's launches, completions, streak, ordering, and hidden games
in sync with Supabase Auth and PostgreSQL.

The games always open on their official websites. Daily Orbit does not embed,
proxy, scrape, or reproduce them.

## Why PostgreSQL here

SQLite is an embedded database: the whole database is one local file opened by
one application process. It is ideal for a zero-setup prototype, but that file
does not naturally become shared, cross-device storage when the app runs on
multiple servers.

PostgreSQL is a database server. It adds network setup and a managed service,
but it handles concurrent users, shared remote data, backups, migrations, and
database-level access rules. Those trade-offs fit Daily Orbit because login is
only useful if a player's progress follows them across browsers and devices.

Supabase ties the two pieces together: Auth users live in the project's Auth
schema, application rows reference those users by UUID, and Row Level Security
(RLS) prevents one signed-in player from reading or changing another player's
rows.

## Local setup

Requirements: Node.js 20 or newer, npm, and a Supabase project.

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. Open the project's SQL editor and run
   [`supabase/migrations/202608030001_initial.sql`](supabase/migrations/202608030001_initial.sql).
3. Copy the environment template and fill in the Project URL and publishable
   key from the project's Connect dialog.

```bash
npm install
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

4. In Supabase Auth URL Configuration, set the Site URL to
   `http://localhost:3000` and add `http://localhost:3000/auth/confirm` as an
   allowed redirect URL.
5. Start the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Hosted Supabase projects
require email confirmation by default, so a new account may need to confirm its
email before the first sign-in.

## Verification

```bash
npm test
npm run lint
npm run build
```

## Phase 1 features

- Supabase email/password signup, confirmation, login, persistent sessions,
  and sign-out
- PostgreSQL progress and preference storage protected by RLS
- Eight official daily-game launch cards
- Per-account started/completed tracking
- Daily and all-time completion statistics
- Consecutive-day activity streak
- Category filters and a continue-next-game action
- Account-specific game ordering and visibility
- Responsive mobile/desktop layouts and light/dark themes
- Accessible controls, loading states, errors, and an independence disclaimer

## Deployment

This repository is not configured or deployed to any hosting provider. Before
a public release, configure the production Site URL and confirmation redirect,
use custom SMTP, enable abuse protections, and review the game names and linking
presentation with counsel.
