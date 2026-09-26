# Sanity

> A hosted structured-content backend (Content Lake), an open-source React editing app (Studio) and a query language (GROQ), now marketed as a "Content Operating System for the AI era" with built-in agents and MCP servers. Site: https://www.sanity.io · Docs: https://www.sanity.io/docs · Pricing: https://www.sanity.io/pricing · Docs as markdown: https://www.sanity.io/docs/llms.txt

## What it is

Sanity stores content as JSON documents in a hosted, real-time database called the **Content Lake**. You describe document types in code (schemas), edit them in **Sanity Studio** (a customisable React app you run locally or host free at `*.sanity.studio`), and read them from any frontend with **GROQ** (Sanity's query language) or GraphQL. It is a headless CMS in the traditional sense, but the pitch has moved on.

In March 2026 Sanity relaunched its positioning as the **Content Operating System for the AI era**, around three pillars: "model your business, automate everything, power anything". In practice that means:

- structured content and schemas (the foundation);
- automation: Sanity Functions (serverless handlers triggered by content changes), Agent Actions (schema-aware AI edits), Blueprints (infrastructure-as-code for those resources);
- agent access: Content Agent (an in-product AI assistant, GA January 2026), the Sanity MCP server (read/write for coding agents), and Sanity Context (formerly "Agent Context", launched 3 March 2026; a read-only MCP endpoint for production agents like shopping assistants).

For ecommerce, the relevant piece is that Sanity sits alongside a commerce engine (typically Shopify) and owns the storytelling: editorial copy, lookbooks, landing pages, product enrichments, and merchandising. Shopify owns price, stock and checkout.

## Key products and developer surfaces

| Surface | What it does | When we'd use it |
| --- | --- | --- |
| Content Lake | Hosted JSON document store with CDN, image pipeline, real-time listeners, mutations and patches | Storing product stories, drops, lookbooks, curated collections |
| Sanity Studio | Open-source React editor configured from schema code; free hosting via `sanity deploy` | Giving a "merchant" a real editing UI in the demo |
| Schemas (`defineType`, `defineField`) | Code-defined document/field types with validation | Modelling products, stories, collections, agent outputs |
| GROQ | Query language: `*[_type == "post"]{title, slug}[0...10]` (filter, projection, slice) | Fetching content for the storefront or for an agent |
| `@sanity/client` | JS client for queries, mutations, assets, Agent Actions | Server-side reads/writes from Vercel or Supabase functions |
| `next-sanity` | Next.js toolkit: `defineQuery`, `defineLive` (`sanityFetch` + `<SanityLive>`), visual editing, `parseBody` webhook validation | A Next.js storefront on Vercel with live-updating content |
| Live Content API | Push-based "sync tags" so pages update when content changes; all plans | Showing an agent's edit appear live on the storefront during the demo |
| Visual Editing / Presentation tool | Click-to-edit overlays on the live site via Content Source Maps (stega) | Merchant-facing demo polish |
| GROQ-powered webhooks | HTTP calls on create/update/delete, filtered and shaped with GROQ; HMAC-signed (`sanity-webhook-signature`) | Triggering a Grok Bot routine or a Supabase function when content changes |
| Sanity Functions | Serverless handlers deployed to Sanity, triggered by document events or schedules | Auto-enrich a product doc when it is published |
| Agent Actions | `generate`, `transform`, `translate`, `prompt`, `patch` – schema-aware AI operations via `client.agent.action.*` | Generating product copy, translating a catalogue, rewriting tone |
| Sanity Connect for Shopify | Shopify app that syncs products, variants and collections into Sanity (and can push Sanity fields back as Shopify metafields/metaobjects) | Grounding editorial content in a real Shopify catalogue |
| Shopify Studio template | `npm create sanity@latest -- --template shopify ...` pre-built Studio for Shopify stores | Fast start if we have a Shopify dev store |
| Hydrogen / Next.js | Documented headless routes for Sanity + Shopify frontends | Frontend choice; Next.js fits our Vercel stack |
| Dataset embeddings / semantic search | Embeddings stored natively in datasets (the older Embeddings Index API is deprecated) | Semantic product/story search for an agent |
| Media Library, Canvas, App SDK, Dashboard | Asset management, AI-assisted writing canvas, custom apps inside Sanity's dashboard | Probably out of scope for a one-day build |

## AI and agent features

All verified in Sanity's docs unless marked.

- **Sanity MCP server** (read and write, for coding/ops agents)
  - URL: `https://mcp.sanity.io` (hosted by Sanity, HTTP transport).
  - Quick install: `npx sanity@latest mcp configure` (detects Cursor, VS Code, Claude Code; uses your logged-in CLI user).
  - Claude Code: `claude mcp add Sanity -t http https://mcp.sanity.io --scope user`
  - Cursor `mcp.json`: `{"mcpServers": {"Sanity": {"type": "http", "url": "https://mcp.sanity.io"}}}`
  - Auth: OAuth by default; for headless agents set header `Authorization: Bearer <sanity API token>` and the server skips OAuth and uses the token's role.
  - Clients without remote MCP: `npx mcp-remote https://mcp.sanity.io --transport http-only`.
  - Tools include GROQ query execution, schema fetch (`get_schema`), document patching, releases, dataset and API-token management, and asset upload from URL (`dataset_assets_upload_from_url`).
- **Sanity Context** (read-only MCP for production agents, formerly Agent Context)
  - Endpoint shape: `https://api.sanity.io/v1/context/organizations/YOUR_ORGANIZATION_ID/mcp/YOUR_ENDPOINT_NAME`, called with an **organisation** API token (Context Viewer role).
  - Two modes: GROQ mode (live dataset, tools such as `initial_context` and `groq_query`) and Knowledge Base mode (pre-built index; beta).
  - Explicitly pitched for "recommend from your catalog – give a shopping assistant schema-aware access to products".
  - Requirements: an org admin must enable Context on the org **Labs** page; Studio v5.1+; deployed schema (`sanity schema deploy`).
  - Setup skill: `npx skills add sanity-io/context --all`, then ask a coding agent to use `create-agent-with-sanity-context`. Example code uses `@ai-sdk/mcp` (`createMCPClient`), pinned to `@ai-sdk/mcp@^1` to match `ai@6`.
  - Changelog (via docs search snippet): v1.0.0 on 11 August 2026 (Studio v6 support); "Agent Context Insights" conversation tracking added May 2026.
- **Content Agent**: conversational assistant in the Sanity Dashboard (also on Slack and via API). Finds, audits, creates, bulk-edits and translates content, can do web research, and stages all changes for human review. GA on all plans since January 2026. Needs Studio v5.1+ (v6 recommended), opened once so it registers the schema.
  - **Content Agent API**: npm package `content-agent` is a Vercel AI SDK provider (`createContentAgent`), with `.agent()` threads and `.prompt()` one-shots. Needs a project token with Editor role and the organisation ID.
- **Agent Actions**: flagged **experimental**; requires API version `vX` and `@sanity/client` 7.4.0+ (Generate/Transform/Translate from 7.1.0). Each call uses AI credits. Example from the docs:

```javascript
client.agent.action.generate({
  schemaId: 'your-schema-id',
  documentId: 'your-document-id',
  instruction: 'Write a summary for the following topic: $topic',
  instructionParams: {
    topic: 'Grapefruit',
  },
  target: {path: ['body']},
})
```

- **AI Assist**: Studio plugin for field-level AI instructions. The pricing page lists it under **Growth** (not Free); new projects get a time-limited Growth trial.
- **Agent skills**: `npx skills add sanity-io/agent-toolkit` (general Sanity best practice, schema design, GROQ); also bundles MCP config for Claude Code and Cursor.

## Fastest hackathon path

1. Create a Studio and project (logs you in, creates a project and `production` dataset):

```shell
npm create sanity@latest -- --dataset production --template clean --typescript --output-path studio-hello-world
cd studio-hello-world
npm run dev
```

   Studio runs at http://localhost:3333. If we have a Shopify dev store, use `--template shopify` instead and install Sanity Connect from the Shopify App Store.

2. Define a schema in `schemaTypes/postType.ts` (adapt to `product` / `story`):

```typescript
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString()}),
    defineField({name: 'image', type: 'image'}),
    defineField({name: 'body', type: 'array', of: [defineArrayMember({type: 'block'})]}),
  ],
})
```

   Register it in `schemaTypes/index.ts` (`export const schemaTypes = [postType]`), publish a document, and test in the Vision tab:

```groq
*[_type == "post"]{ _id, title, slug, publishedAt }[0...10]
```

3. Deploy Studio (and schema, needed for MCP/Content Agent): `npm run deploy` (prompts for a `*.sanity.studio` hostname).

4. Read from Next.js on Vercel with `next-sanity`:

```typescript
import {createClient} from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: true,
  apiVersion: '2026-02-27',
  perspective: 'published',
})
```

   For live updates, wrap with `defineLive` from `next-sanity/live` and render `<SanityLive />` in the layout (snippet in the Next.js guide).

5. Connect agents: `npx sanity@latest mcp configure` for Cursor; for Grok Bot, register `https://mcp.sanity.io` with an `Authorization: Bearer <token>` header (create a token at sanity.io/manage → API → Tokens).

6. Add a GROQ-powered webhook in sanity.io/manage → API → Webhooks pointing at a Vercel route or Grok Bot webhook routine; verify with `parseBody` from `next-sanity/webhook` or the `@sanity/webhook` toolkit.

## Pricing, limits and gotchas

- **Free plan** ($0): 20 seats, 2 roles (Administrator, Viewer), 2 **public-only** datasets, 10k documents, 2k unique attributes per dataset, 2 GROQ webhooks, 1M API CDN requests + 250k API requests per month, 100 GB assets, 100 GB bandwidth, 1k live connections per dataset, 1,000 AI credits/month, 500k Functions invocations, 5 scheduled Functions (daily), Content Agent, Agent Actions and Agent Context included. Usage above Free limits is not purchasable (you must upgrade).
- **Growth**: $15/seat/month; private datasets, 25k documents, 4 webhooks, Comments/Tasks, AI Assist, pay-as-you-go overages ($0.05 per extra AI credit).
- **Content Agent credit costs**: 4 credits per message plus 2 per tool action (e.g. "analyse 10 articles" ≈ 28 credits). 1,000 free credits go quickly on bulk operations; test on a few documents first.
- **Public datasets on Free**: anyone with the project ID can read published content. Do not store secrets, PII or buyer data there; keep that in Supabase.
- Sanity Connect creates one document per product, variant and collection, which counts towards the 10k document limit. Use a non-production dataset for the first sync.
- Sanity Context needs an org admin to enable it in Labs and an organisation-level token (not a project token).
- Agent Actions are experimental and require `apiVersion: 'vX'`.
- Live Content API and Sanity Context do not support dataset aliases; use the real dataset name.
- Several AI features need Studio v5.1+ and a **deployed** schema; a local-only Studio will not work with MCP/Content Agent.
- Functions have rate limits and recursion guards; triggering on drafts can hit limits quickly.

## How it could fit our hack

Neutral mapping; not a recommendation.

- **Storefront Experience**: Sanity as the content layer for a Next.js storefront – product storytelling, lookbooks, drop pages – with live updates so an agent's edit appears on stage in seconds.
- **Buyer Experience**: a shopping assistant grounded in the catalogue via Sanity Context (read-only, schema-aware GROQ plus semantic search), which Sanity explicitly markets for this.
- **Merchant Tooling**: agents that do merchandising work – generate/translate product copy with Agent Actions, audit catalogue gaps ("products missing size guides") with Content Agent, and stage changes for human approval. Content Releases/drafts give a natural human-in-the-loop story.
- **New Ways to Buy**: content-led commerce (shoppable stories, curated edits) where each story document references products synced from Shopify.
- **Agentic Commerce**: structured, typed product content is what agents need to read reliably; a Sanity Context endpoint could be the "agent-readable catalogue" for external buying agents.
- **How Grok Bot could use it**: (a) as an MCP client of `https://mcp.sanity.io` with a scoped token to read/patch documents; (b) as a subscriber to GROQ-powered webhooks (e.g. "new product published" → bot writes copy, sources images, patches draft); (c) via Content Agent API calls from our backend. Supabase would hold transactional/buyer data; Sanity would hold editorial/merchandising data.
- Commerce depth angle: showing we understand the split between commerce engine (price, stock, checkout in Shopify) and content system (story, merchandising in Sanity), and how Sanity Connect syncs the two, directly addresses the "real understanding of the stack" criterion.

## Sources

- https://www.sanity.io/docs/llms.txt
- https://www.sanity.io/docs/llms-full.txt (full docs dump; sections read: MCP setup and introduction, Agent Skills, Get to know Sanity Context, Sanity Context quick start, Agent Actions introduction, Content Agent get started, Content Agent API, Live Content API, Webhooks, Sanity Connect for Shopify, Setting up your studio, Defining a schema, Query content with GROQ, Deploying the Studio, next-sanity live content guide)
  - Canonical pages referenced there: https://www.sanity.io/docs/ai/mcp-server, https://www.sanity.io/docs/ai/sanity-context, https://www.sanity.io/docs/ai/sanity-context-quick-start, https://www.sanity.io/docs/agent-actions/introduction, https://www.sanity.io/docs/content-agent/introduction, https://www.sanity.io/docs/apis-and-sdks/content-agent-api, https://www.sanity.io/docs/content-lake/webhooks, https://www.sanity.io/docs/developer-guides/live-content-guide
- https://www.sanity.io/pricing
- https://www.sanity.io/docs/ai/sanity-context (fetched page, incl. changelog)
- https://www.sanity.io/blog/content-agent-days-of-work-in-one-conversation (13 Jan 2026, via search summary)
- https://www.sanity.io/blog/introducing-agent-context (3 Mar 2026, via search summary)
- https://www.sanity.io/context (via search summary)
- https://aijourn.com/sanity-launches-the-ai-content-operating-system-for-the-ai-era/ (4 Mar 2026 press release, via search summary)
