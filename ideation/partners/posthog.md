# PostHog

> An all-in-one product data platform – analytics, session replay, feature flags, A/B experiments, surveys, error tracking, AI (LLM) observability and a data warehouse – behind one SDK, with a hosted MCP server and an in-app AI analyst. Site: https://posthog.com · Docs: https://posthog.com/docs · Pricing: https://posthog.com/pricing · Docs as markdown: https://posthog.com/llms.txt

## What it is

PostHog started as open-source product analytics and has grown into a suite of tools that share one event stream. In 2026 it positions itself as "the platform for self-driving products": your product data (events, errors, logs, replays) plus agents that find problems and ship changes. Practically, for a hackathon it means one `posthog-js` install gives us page views, autocapture, session recordings, feature flags and experiments, and the Node/Python SDKs let the backend and agents send their own events.

Naming change to note: what used to be called **LLM analytics / LLM observability** is now documented as **AI Observability** (docs moved to `/docs/ai-observability`). Some older URLs still use `llm-analytics`.

Hosting: **US Cloud** (`https://us.i.posthog.com`) or **EU Cloud** (`https://eu.i.posthog.com`, AWS eu-central-1, Frankfurt). The region is chosen at signup (`app.posthog.com/signup` vs `eu.posthog.com/signup`) and cannot be self-served later; cross-region migration needs a paid package and PostHog engineers. As a London team, EU is the obvious GDPR-friendly default, but pick once and keep all keys/hosts consistent.

## Key products and developer surfaces

| Surface | What it does | When we'd use it |
| --- | --- | --- |
| Product analytics | Events, funnels, trends, retention, paths, SQL (HogQL) | Measuring the buyer funnel: view → add to cart → checkout |
| Web analytics | Lightweight GA-style dashboard (visitors, sources, pages) | Quick traffic view for the storefront |
| Session replay | Records user sessions; on by default with `posthog-js` | Showing judges exactly how a buyer used the agent UI |
| Feature flags | Boolean/multivariate flags with targeting, payloads, server and client evaluation | Toggling agent features live on stage; staged rollouts |
| Experiments (A/B) | Built on feature flags; statistical results on goal metrics | "Agent-written copy vs human copy" conversion test |
| Surveys | In-app popups configured in the UI, rendered by `posthog-js` | Asking buyers to rate the assistant's recommendation |
| Error tracking | Exceptions with stack traces; `posthog.captureException(error)` | Catching agent/tool failures |
| AI Observability | `$ai_generation`, `$ai_trace`, `$ai_span`, `$ai_embedding` events with tokens, latency, cost; traces view; evaluations | Tracking every Grok/LLM call, its cost and the tools it used |
| Data warehouse | Sync external sources (Stripe, Postgres, Hubspot, S3, etc.) and query with SQL alongside events | Joining Supabase orders with analytics events |
| CDP / data pipelines | Destinations (webhooks, Slack, 50+ tools), incoming webhooks, batch exports | Firing a Grok Bot webhook when an event/threshold occurs |
| Workflows | Automated actions / messages in response to events | Follow-ups (e.g. abandoned cart message) |
| PostHog AI | In-app AI analyst (sidebar chat): answers product questions, builds dashboards, writes SQL, finds replays | Asking live on stage "what changed today?" |
| MCP server | `https://mcp.posthog.com/mcp` exposing flags, insights, SQL, experiments, errors, surveys, AI observability, etc. as tools | Letting Grok Bot/Cursor read metrics and manage flags |
| SDKs | `posthog-js` (+ `@posthog/react`), `posthog-node`, `posthog` (Python), `@posthog/ai` LLM wrappers, plus Go, Ruby, PHP, mobile | Client + server instrumentation |
| Capture API | `POST /i/v0/e/` single event, `POST /batch/` many events; project token, no secret needed | Sending events from Grok Bot or any HTTP-capable routine |
| Wizard | `npx @posthog/wizard@latest` auto-installs PostHog into a project (Next.js supported) | Fastest setup |

## AI and agent features

- **PostHog MCP server** (documented, free to connect)
  - URL: `https://mcp.posthog.com/mcp` (auto-routes to US or EU based on the account).
  - One-command install into Cursor, Claude Code, Claude Desktop, Codex, VS Code, Zed, PostHog Desktop: `npx @posthog/wizard mcp add`
  - OAuth is the default. For headless agents (e.g. a Grok Bot VM), create a **personal API key** with the "MCP Server" preset and send `Authorization: Bearer phx_...`.
  - Useful controls: pin project/org with headers `x-posthog-project-id` / `x-posthog-organization-id`; read-only with `x-posthog-read-only: true` or `?readonly=true`; limit tools with `?features=flags,insights,experiments` or `?tools=dashboard-get,execute-sql`; tool mode `?mode=cli` (single `exec` meta-tool, saves context) or `?mode=tools`.
  - Tools are subject to normal PostHog API rate limits; some AI-powered tools bill as PostHog AI usage and only appear if AI data processing is enabled.
  - Docs warn explicitly about prompt injection; they recommend read-only mode and pinning.
- **AI Observability** (LLM analytics)
  - Wizard: `npx @posthog/wizard ai-observability`.
  - Wrappers in `@posthog/ai` (Node) and `posthog.ai` (Python) for OpenAI, Anthropic, Gemini, LangChain, Vercel AI SDK and others. There is a dedicated **xAI** guide: use PostHog's OpenAI wrapper with `baseURL: 'https://api.x.ai/v1'`; every call auto-captures `$ai_generation` with model, tokens, latency and cost (`$ai_total_cost_usd`). Tool calls should be captured manually as `$ai_span` events linked by `$ai_trace_id`.
  - Manual capture works from any language via the capture API; cost is auto-calculated from model and tokens, or can be passed (`$ai_input_cost_usd`, `$ai_output_cost_usd`, `$ai_total_cost_usd`, `$ai_cost_passthrough`).
  - Links to session replay and error tracking so an LLM trace can be tied to what the user saw.
- **PostHog AI** (in-app analyst): needs an org admin to allow access; `/init` stores product context in memory; can build dashboards, write SQL, find replays. Free tier includes 500 credits (about $5) per month.
- **Other agent surfaces listed in the docs index**: PostHog CLI, Claude Code plugin (`claude plugin install posthog`), Slack app, PostHog Desktop (beta; generates PRs from production signals), Replay Vision (AI watching recordings), agent skills for AI Observability. Not verified in depth.

## Fastest hackathon path

1. Sign up (choose EU or US once), create a project, copy the project token (`phc_...`) and host.
2. In the Next.js app, either run `npx @posthog/wizard@latest` or install manually:

```bash
npm install --save posthog-js posthog-node
```

`.env.local` (and the same in Vercel project settings):

```shell
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<ph_project_token>
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

3. Client-side init in `instrumentation-client.ts` at the app root (from the Next.js guide):

```typescript
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-05-30'
});
```

   Then anywhere in client code: `posthog.capture('add_to_cart', { sku, price })`, and `posthog.identify(userId)` after login.

4. Server-side events (route handlers / server actions on Vercel) – set immediate flushing because functions are short-lived:

```javascript
import { PostHog } from 'posthog-node'

export default function PostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0
  })
}
```

   Call `client.capture({ distinctId, event, properties })` then `await client.shutdown()`.

5. Tracking agent actions (e.g. a Grok Bot routine with only HTTP): post straight to the capture API, no SDK needed:

```bash
curl -v -L --header "Content-Type: application/json" -d '{
  "api_key": "<ph_project_token>",
  "event": "agent_price_check_completed",
  "distinct_id": "grok-bot-merchandiser",
  "properties": { "sku": "JKT-001", "competitors_checked": 5 }
}' https://eu.i.posthog.com/i/v0/e/
```

   A naming convention like `agent_<verb>_<object>` plus properties such as `agent_id`, `task_id`, `tool`, `outcome` would make agent work queryable next to buyer events. For LLM calls, send `$ai_generation` / `$ai_span` events (or use the `@posthog/ai` wrapper) so they appear in AI Observability with cost.

6. Connect the MCP server to Cursor (`npx @posthog/wizard mcp add`) and, for Grok Bot, register `https://mcp.posthog.com/mcp?readonly=true` with a personal API key header.

## Pricing, limits and gotchas

- **Free tier, monthly, no card**: 1M analytics events, 5k session recordings, 1M feature-flag requests (experiments billed with flags), 100k exceptions, 1,500 survey responses, 1M data-warehouse rows, 10k data-pipeline events, 100k AI Observability events, 500 PostHog AI credits, 10 GB logs. Free plan: 1 project, 1-year retention, unlimited team members; usage simply stops at the limit (events dropped, flags return a quota-limited default).
- **Pay-as-you-go**: same free allowance, then per-product usage billing with per-product billing limits; 6 projects; 7-year retention.
- Recordings on free are kept 1 month.
- Region choice is effectively permanent; the MCP server auto-routes, but SDK `api_host` and capture URLs must match (`us.i.posthog.com` vs `eu.i.posthog.com`).
- The capture API returns `200 OK` even when an event is dropped for missing `event` or `distinct_id` – validate on our side.
- Content-Security-Policy and ad blockers can silently block events; docs recommend a reverse proxy (free managed proxy for Cloud users, or Next.js/Vercel rewrites).
- For experiments, only `getFeatureFlag()` / `useFeatureFlagVariantKey()` (or server `evaluateFlags().getFlag()`) record exposures; `getAllFlags()` does not, so users would be missing from results.
- Experiments need traffic to reach significance; in a one-day hack an A/B test will be illustrative, not statistically meaningful. Worth saying so honestly on stage.
- Use a personal API key (`phx_...`) for the REST/MCP APIs; the project token (`phc_...`) is only for capture. Never expose personal keys client-side.

## How it could fit our hack

Neutral mapping; not a recommendation.

- **Storefront Experience**: instrument the storefront funnel and use feature flags to swap layouts or agent-generated content live; session replay to show real interactions.
- **Buyer Experience**: measure whether an AI shopping assistant changes behaviour (assistant opened → product viewed → add to cart), with surveys asking whether the recommendation helped.
- **Merchant Tooling**: a merchant dashboard where Grok Bot reads PostHog via MCP ("which products get views but no add-to-cart?") and proposes actions; experiments for agent-written vs original copy.
- **New Ways to Buy**: track novel flows (conversational checkout, link-drop purchasing) as first-class funnels so we can show numbers, not just a demo.
- **Agentic Commerce**: treat agents as users – give each Grok Bot its own `distinct_id`, capture every tool call and LLM generation with cost, and show a "cost per agent-completed order" or "agent actions per task" metric. AI Observability's xAI support makes Grok model calls first-class.
- **How Grok Bot could use it**: (a) write side – post events to the capture API from routines; (b) read side – MCP server (ideally read-only and pinned to one project) to query insights/SQL and toggle flags; (c) trigger side – PostHog CDP webhook destinations can call a Grok Bot webhook routine when an event or alert fires.
- Validation angle: PostHog is the most direct way to back claims with data during judging ("Commerce depth" and "validatable results"), since dashboards update live.

## Sources

- https://posthog.com/llms.txt
- https://posthog.com/pricing
- https://posthog.com/docs/model-context-protocol
- https://posthog.com/docs/model-context-protocol/faq.md
- https://posthog.com/docs/libraries/next-js.md
- https://posthog.com/docs/api/capture.md
- https://posthog.com/docs/llm-analytics/manual-capture.md (now served as AI Observability manual capture)
- https://posthog.com/docs/ai-observability/installation/xai.md
- https://posthog.com/docs/experiments/adding-experiment-code.md
- https://posthog.com/docs/posthog-ai/start-here.md
- https://posthog.com/ai.md
- https://posthog.com/blog/posthog-cloud-eu (via search summary)
- https://posthog.com/docs/settings/projects (via search summary)
- https://posthog.com/docs/migrate/migrate-to-cloud (via search summary)
