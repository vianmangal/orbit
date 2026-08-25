# Orbit

Orbit puts ten external daily games in one responsive dashboard and
keeps launches, completions, and streaks in the browser's local storage.

The games always open on their official websites. Orbit does not embed,
proxy, scrape, or reproduce them.

## Local setup

Requirements: Node.js 22 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No account or environment
variables are required. Progress stays in the current browser and does not sync
between browsers or devices.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

## Features

- No signup or login
- Browser-local progress storage
- Ten official daily-game launch cards
- Started/completed tracking by day
- Daily and all-time completion statistics
- Consecutive-day activity streak
- Category filters and a continue-next-game action
- Responsive mobile and desktop layouts
- Accessible controls, loading states, errors, and an independence disclaimer

Lineup ordering and hiding, the theme switcher, estimated game times, and card
icons were intentionally removed after UX review because they added complexity
without improving the core daily-game experience.

## Deployment

[Open Orbit](https://orbit.vian1.tech)
