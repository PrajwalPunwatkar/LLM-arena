# LLM Arena Architecture

```mermaid
flowchart LR
    U[User] --> UI[Next.js UI / App Router]
    UI --> A[Arena Page]
    UI --> T[Thread History / Sidebar]
    UI --> L[Leaderboard]

    A --> API[API Route: /api/chat]
    API --> AUTH[Clerk Auth]
    API --> SAFE[Arcjet Protection]
    API --> CAT[Fetch Free Model Catalog]
    API --> DB[(PostgreSQL via Prisma)]
    API --> O[OpenRouter AI Models]

    DB --> TH[Thread]
    DB --> TN[Turn]
    DB --> MR[ModelResponse]
    DB --> V[Vote]

    O --> RES[Streaming model responses]
    RES --> METRICS[Tokens / latency / cost]
    METRICS --> DB

    L --> DB
    UI --> PH[PostHog Analytics]
    API --> PH
```

This diagram shows the overall architecture of the project:

- browser UI
- server-side chat handling
- Prisma/PostgreSQL persistence
- external AI and analytics services
- voting and leaderboard flow
