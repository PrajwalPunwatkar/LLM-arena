# LLM Arena System Design

```mermaid
flowchart TD
    subgraph Client
        U[User]
        UI[Next.js Frontend
- Arena page
- Thread history
- Leaderboard
- Voting UI]
    end

    subgraph AppLayer
        API[Next.js API Layer
/app/api/chat
- Auth validation
- Rate limiting
- Request validation]
        SEC[Arcjet Security
Bot protection / abuse prevention]
        CAT[Model Catalog Service
Fetch free OpenRouter models]
        STREAM[Streaming Response Engine
Parallel model calls]
        METRICS[Metrics Collector
TTFT / TPS / tokens / cost]
    end

    subgraph AIProviders
        OR[OpenRouter API]
    end

    subgraph DataLayer
        DB[(PostgreSQL)]
        PRISMA[Prisma ORM]
        TH[Thread]
        TN[Turn]
        MR[ModelResponse]
        V[Vote]
    end

    subgraph PlatformServices
        AUTH[Clerk Auth]
        PH[PostHog Analytics]
    end

    U --> UI
    UI --> API
    API --> AUTH
    API --> SEC
    API --> CAT
    API --> STREAM
    STREAM --> OR
    STREAM --> METRICS
    METRICS --> PRISMA
    PRISMA --> DB

    DB --> TH
    DB --> TN
    DB --> MR
    DB --> V

    UI --> PH
    API --> PH
```

## Flow

1. User submits a prompt from the UI.
2. API validates the authenticated user and checks for abuse.
3. The app fetches the active free model catalog.
4. The backend starts parallel streaming requests to multiple models.
5. Each response is measured for latency, token throughput, and cost.
6. Results are stored in PostgreSQL via Prisma.
7. The user votes on the best answer, and the leaderboard updates from persisted data.
8. PostHog collects analytics for product and monitoring insights.

## Design Highlights

- Real-time multi-model comparison
- Scalable stateless API layer with persistent relational storage
- Clean separation between frontend, backend, AI providers, and data persistence
- Security and observability built into the request pipeline
