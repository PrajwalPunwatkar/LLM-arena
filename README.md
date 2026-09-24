# LLM Arena

A Next.js app for comparing AI model responses in real time. Users submit a prompt, race multiple models side by side, stream each answer as it arrives, inspect live metrics, and vote on the best result. The winning responses power a public leaderboard that surfaces the strongest models for real tasks.

## Features

- Real-time multi-model comparison using OpenRouter
- Streaming responses with live token and latency metrics
- Voting flow with persistent leaderboard rankings
- Authentication via Clerk
- Product analytics with PostHog
- API protection with Arcjet
- Prisma + PostgreSQL persistence
- Modern app shell built in Next.js 16 and React 19

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk Auth
- PostHog
- Arcjet
- Tailwind CSS

## Project Structure

```bash
.
├── app/
│   ├── api/
│   ├── (shell)/
│   └── globals.css
├── components/
├── features/
├── infrastructure/
├── prisma/
├── public/
├── generated/
├── docs/
├── .env.local
├── package.json
├── pnpm-lock.yaml
├── prisma.config.ts
├── next.config.ts
├── tsconfig.json
└── README.md
```

## Prerequisites

Before starting, make sure you have:

- Node.js 20+
- pnpm
- PostgreSQL database
- OpenRouter API key
- Clerk keys
- PostHog keys
- Arcjet key

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a local environment file:

```bash
copy .env.local.example .env.local
```

If there is no `.env.local.example`, create `.env.local` manually in the project root and add values like:

```env
OPENROUTER_API_KEY=your_key
DATABASE_URL="postgresql://user:password@localhost:5432/llm_arena"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
ARCJET_KEY=your_arcjet_key
```

3. Sync the Prisma schema with your database:

```bash
pnpm prisma db push
```

4. Generate the Prisma client:

```bash
pnpm prisma generate
```

5. Start the app:

```bash
pnpm dev
```

Then open http://localhost:3000.

## Available Scripts

```bash
pnpm dev          # start the app in development mode
pnpm build        # production build
pnpm start        # run the production build
pnpm lint         # lint the project
pnpm typecheck    # TypeScript type checking
pnpm prisma generate
pnpm prisma db push
pnpm prisma studio
```

## Environment Notes

This project expects environment variables to be present in `.env.local` and fails fast if required values are missing. The app intentionally refuses to boot without its configured external services.

## Notes

- The project uses OpenRouter as the model gateway.
- Prisma is configured for a Postgres database.
- Clerk handles authentication and user identity.
- PostHog is used for analytics/event tracking.
- Arcjet provides bot and abuse protection at the API layer.

## License

This project is for local development and learning purposes unless otherwise specified by the repository owner.
