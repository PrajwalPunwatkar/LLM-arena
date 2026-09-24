# PostHog Self-driving setup report

## Summary

PostHog Self-driving has been configured for LLM Arena. Session Replay, Error Tracking, Support, and the arena's custom event funnel are now wired as signal sources, a six-scout troop is active, and two Replay Vision scanners are watching session recordings for visible breakage and user frustration. Findings will start appearing in the [Self-driving inbox](https://us.posthog.com/project/547300/inbox) within ~30 minutes.

---

## AI data processing

**Approved.** Organization-level AI data processing consent was confirmed before this run started.

---

## GitHub

**Connected during this run.** GitHub App installed by Sasuke Uchiha (integration id `206412`, account `PrajwalPunwatkar`). Self-driving can now research findings against the repository and open fix PRs.

---

## Products enabled

The `products-enable` tool was not available on this deploy. The three products below must be confirmed enabled manually. The repo's `posthog.init` call was checked and is already correctly configured (no client-side overrides to remove).

| Product                 | Status              | Notes                                                                                                                                                   |
| ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session Replay          | **Enable manually** | `disable_session_recording: false` in `posthog-provider.tsx` — client is ready. Enable in PostHog → Settings → Session Replay → "Record user sessions". |
| Error Tracking          | **Enable manually** | `capture_exceptions: true` in `posthog-provider.tsx` — client is ready. Enable in PostHog → Settings → Error Tracking → "Enable exception autocapture". |
| Support (Conversations) | **Enable manually** | Enable in PostHog product sidebar → Support. Tickets only arrive once an inbound channel (email / inbox / Slack) is connected — see Follow-ups.         |

> **Follow-up:** Enable all three products from a project-admin account via PostHog settings. Sources are already wired; they become live automatically once the products are on.

---

## Signal sources

| source_product   | source_type                | Action                                                          | Config ID                              |
| ---------------- | -------------------------- | --------------------------------------------------------------- | -------------------------------------- |
| `signals_scout`  | `cross_source_issue`       | **On by default** — no row needed                               | —                                      |
| `health_checks`  | `health_issue`             | **Enabled**                                                     | `019fe02c-da19-7a2e-89b0-b25387aaa7de` |
| `error_tracking` | `issue_created`            | **Enabled**                                                     | `019fe02c-dd3b-71ee-9ade-30e438f6ec72` |
| `error_tracking` | `issue_reopened`           | **Enabled**                                                     | `019fe02c-e074-778c-8a5d-5aba5a538c40` |
| `error_tracking` | `issue_spiking`            | **Enabled**                                                     | `019fe02c-e617-7631-8bdf-1b7695683884` |
| `session_replay` | `session_analysis_cluster` | **Enabled** (10% sample rate)                                   | `019fe02c-f812-7f37-a575-4ccd0149dd51` |
| `conversations`  | `ticket`                   | **Enabled** (dormant until inbound channel connected)           | `019fe02c-e7f0-719a-882b-1897a6756475` |
| `llm_analytics`  | —                          | **Skipped** — internal only, not a user-facing responder        |
| `logs`           | —                          | **Skipped** — not a v1 responder                                |
| `replay_vision`  | —                          | **Skipped** — self-authorizing via scanner `emits_signals` flag |

---

## Connected tools

| Tool          | Status                                       |
| ------------- | -------------------------------------------- |
| GitHub Issues | **Not used** — user selected "None of these" |
| Linear        | **Not used**                                 |
| Jira          | **Not used**                                 |
| Sentry        | **Not used**                                 |
| Zendesk       | **Not used**                                 |

---

## Scout troop

**Run budget:** 100 runs/day max (0 used today). Banner: _"Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."_

### Enabled (6 total)

| Scout                              | Reason                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `signals-scout-general`            | Always on — cross-product correlations and uncovered surfaces                                                 |
| `signals-scout-ai-observability`   | `@posthog/ai` + `captureAiGeneration` is the core of the product; every model call fires LLM trace data       |
| `signals-scout-product-analytics`  | `prompt_sent`, `model_answered`, `vote_cast` form a funnel; watches saved insights for conversion regressions |
| `signals-scout-health-checks`      | Fresh project — instrumentation health worth proactive monitoring                                             |
| `signals-scout-observability-gaps` | Custom events with no insight coverage yet; surfaces what needs dashboards                                    |
| `signals-scout-arena-funnel`       | **Custom** — watches raw arena funnel events directly (see Custom scouts)                                     |

### Disabled

| Scout                              | Reason                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `signals-scout-error-tracking`     | Covered by the native `error_tracking` source (step 4) — would duplicate it |
| `signals-scout-session-replay`     | Covered by the native `session_replay` source (step 4) — would duplicate it |
| `signals-scout-feature-flags`      | Feature flags not in use in this codebase                                   |
| `signals-scout-surveys`            | Surveys not in use                                                          |
| `signals-scout-revenue-analytics`  | No payment SDK found                                                        |
| `signals-scout-web-analytics`      | No UTM/referrer tracking found; not a primary surface                       |
| `signals-scout-csp-violations`     | No CSP reporting configured                                                 |
| `signals-scout-experiments`        | No A/B experiments in use                                                   |
| `signals-scout-customer-analytics` | No group/accounts analytics                                                 |
| `signals-scout-data-pipelines`     | No CDP destinations or batch exports                                        |
| `signals-scout-logs`               | PostHog logs product not in use                                             |
| `signals-scout-apm`                | No OpenTelemetry tracing configured                                         |
| `signals-scout-conversations`      | Conversations product has no traffic yet (inbound channel not connected)    |
| `signals-scout-replay-vision`      | No prior scanner history — enable once observations accumulate              |
| `signals-scout-anomaly-detection`  | No saved dashboards/insights yet to watch                                   |
| `signals-scout-inbox-validation`   | Fresh setup — no resolved reports to validate                               |
| `signals-scout-data-warehouse`     | No warehouse imports configured                                             |
| `signals-scout-skills-store`       | No custom skill hygiene issues identified                                   |
| `signals-scout-tasks`              | Not warranted on initial setup                                              |
| `signals-scout-insight-alerts`     | No alerts configured yet                                                    |
| `signals-scout-mcp-tool-calls`     | No `$mcp_tool_call` telemetry                                               |
| `signals-scout-web-vitals`         | No `$web_vitals` events confirmed                                           |

> **Re-enable follow-ups:** Enable `signals-scout-feature-flags` if feature flags are added; `signals-scout-surveys` if surveys are launched; `signals-scout-revenue-analytics` if a payment SDK is integrated; `signals-scout-web-analytics` if UTM/referrer tracking is added.

---

## Custom scouts

### Created: `signals-scout-arena-funnel`

**Surface:** The `prompt_sent` → `model_answered` → `vote_cast` core arena funnel.

**Discriminator:** Vote rate (`vote_cast / prompt_sent` ratio) falling below baseline; per-model failure rate (`model_answered status=FAILED`) rising for a specific `modelId` while others hold.

**Why no built-in covers it:** `signals-scout-product-analytics` watches _saved funnel insights_ — on a fresh project with none built yet, the raw custom events (`prompt_sent`, `model_answered`, `vote_cast`) get no coverage. This scout watches the raw events directly and fills that gap until insights are created.

**Surfaces considered and ruled out:**

- _Vote distribution drift_ — filtered out at quality bar (product insight, not a bug signal)
- _Model performance latency_ — filtered out as covered by `signals-scout-ai-observability` (`$ai_*` events)
- _Thread sharing / public links_ — filtered out (no PostHog events instrumented for sharing flow)

**Noise escape hatch:** Set `emit: false` on the `signals-scout-arena-funnel` config in PostHog to switch it to dry-run mode if it produces noise.

---

## Replay Vision scanners

Replay Vision scanners are LLMs that watch individual session recordings on a schedule and push what they find directly into the Self-driving inbox (`emits_signals: true`). They catch silent breakage — blank screens, dead buttons, broken layouts — that never throws a JavaScript exception. Findings arrive at half weight; two corroborating signals are needed before they're promoted into a report. The sizing skill (`creating-replay-vision-scanners`) was not available on this deploy; spend was not formally verified, but both scanners use conservative defaults and project 0 monthly credits at current (zero) recording volume.

No recordings exist yet — both scanners are armed and start working the day recordings begin.

| Scanner                | What it watches                                                                                      | Query scope                                                                                                    | Sampling rate | Est. monthly credits  |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------- | --------------------- |
| **Broken experiences** | Visibly broken UI: blank screens, failed loads, spinners that never resolve, buttons that do nothing | Sessions with `$current_url` containing `/t/` — the thread pages where model answers stream and voting happens | 0.5           | 0 (no recordings yet) |
| **User frustration**   | Rage-clicks and stuck flows: repeated clicks, unresponsive buttons, abandoned flows                  | Sessions containing a `$rageclick` event (project-wide; no URL overlap with scanner 1)                         | 1.0           | 0 (no recordings yet) |

**Why `/t/` for scanner 1:** Thread pages (`/t/[threadId]`) are the product's completion flow — where model answers stream in and the user casts their vote. Silent breakage here (a model card that never loads, a vote button that does nothing) directly blocks the core user action and would never surface as a JS exception.

**Query disjoint:** Scanner 1 filters by URL (`/t/`); scanner 2 filters by event (`$rageclick`). They cannot match the same sessions through the same axis, preventing self-corroboration into false reports.

---

## Follow-ups

- [ ] **Enable products manually:** Go to PostHog Settings and enable Session Replay ("Record user sessions"), Error Tracking ("Enable exception autocapture"), and Support (Conversations) from the product sidebar. Use a project-admin account.
- [ ] **Connect a support inbound channel:** After enabling Conversations, connect an inbound channel (email / inbox / Slack) in PostHog so support tickets reach the inbox. Without this, the `conversations/ticket` source is dormant.
- [ ] **Connect a webhook proxy (optional):** The app already routes PostHog through `/ingest` (first-party proxy in `next.config.ts`). No action needed — this is already configured correctly.

---

## What happens next

- The scout coordinator picks up fresh configs within ~30 minutes.
- Each scout runs once per day (daily cadence), drawing from the 100-run daily budget.
- The arena-funnel scout will close out empty until `prompt_sent` events arrive — that's expected.
- Findings cluster into reports in the [Self-driving inbox](https://us.posthog.com/project/547300/inbox). Immediately-actionable ones can start coding tasks automatically.
- The Replay Vision scanners start observing recordings as soon as users generate sessions.
