# Partners: what each one does

Research on the hackathon partners from the [official page](https://gb-ecommerce-hackathon-09-2026.teamdeel.workers.dev/hackathon), read from their own docs on 26 Sep 2026. Cursor, Supabase, Vercel and Grok Bot are left out because we already know them (see `../tech-stack.md`).

The page has two partner lists:
- **Technology Partners (7 logos):** Cursor, Supabase, Wassist, Huge, Fleek, Vercel, Tavily
- **Tech Partners, credits and resources (10 cards):** Cursor, Grok Bot, Supabase, Shopify, Commerce Layer, Recharge, Sanity, PostHog, Tavily, Vercel

## Sponsor tools we can build on

| Partner | What it is | Agent / MCP surface | Free access for the day | Biggest gotcha | File |
| --- | --- | --- | --- | --- | --- |
| **Shopify** | Commerce platform; storefront, admin, checkout APIs | UCP hosted MCP at `https://{shop}/api/ucp/mcp`; Global Catalog at `https://catalog.shopify.com/api/ucp/mcp` (anonymous search works); Dev MCP for coding | Free dev stores (`shopify store create dev --plan plus --demo-data --country GB`), Test payment gateway | Dev stores keep a password page, which blocks their UCP endpoint; agentic checkout is US-only; admin tokens now come from the Dev Dashboard | [shopify.md](./shopify.md) |
| **Commerce Layer** | Headless commerce API (markets, price lists, SKUs, orders) | Official hosted Core MCP (read and write), Metrics MCP, Docs MCP, launched June 2026 | Free developer plan: 1 org, 2 markets, 1,000 SKUs, unlimited test orders | Free-plan integrations are full admin or read-only; Metrics API may be paid only; tight test-mode rate limits | [commerce-layer.md](./commerce-layer.md) |
| **Recharge** | Shopify subscriptions and bundles | Only a read-only Analytics MCP (early-adopter form); Admin API has skip, reschedule, cancel, discount | Shopify dev store becomes a Recharge test store | Bundles, Storefront API and JS SDK are Plus-only; allow 45–90 min setup; ask the sponsor to enable Plus | [recharge.md](./recharge.md) |
| **Sanity** | Structured content platform (Content Lake, Studio, GROQ) | Read/write MCP at `https://mcp.sanity.io`; read-only Sanity Context for shopping assistants; Content Agent | Free plan: 10k documents, 2 webhooks, 1,000 AI credits a month | Free datasets are public only; Shopify sync counts every variant as a document | [sanity.md](./sanity.md) |
| **PostHog** | Analytics, session replay, flags, A/B tests, surveys, AI observability | MCP at `https://mcp.posthog.com/mcp`; xAI/Grok call tracking guide | 1M events, 5k recordings, 100k AI events a month, no card | EU/US region fixed at signup; a one-day A/B test won't reach significance | [posthog.md](./posthog.md) |
| **Tavily** | Web search, extract, crawl, map and research API for agents | Remote MCP `https://mcp.tavily.com/mcp/?tavilyApiKey=<key>`; keyless mode; x402 pay-per-search endpoint | 1,000 credits a month (plus sponsor credits via Greta) | No shopping/price endpoint; `research` pro calls can burn 250 credits | [tavily.md](./tavily.md) |

## Companies behind the event (co-hosts and judges)

| Partner | What it does | Developer surface | Who's here | File |
| --- | --- | --- | --- | --- |
| **Wassist** | AI sales and support agents on a brand's WhatsApp, mainly for Shopify fashion and lifestyle brands | Yes: REST API, TypeScript SDK `@wassist/sdk`, CLI, signed webhooks, test number, can call our MCP server as tools | Josh Warwick, founder (co-host and judge) | [wassist.md](./wassist.md) |
| **Huge** | Design and technology agency; bought Rotate° (London Shopify Plus and Commerce Layer agency) in June 2026 | None (agency) | Jim Tattersall (judge, founded Rotate°), Tamas Zoltan Palecian (co-host, technical lead) | [huge.md](./huge.md) |
| **Fleek** | B2B wholesale marketplace for secondhand clothing; venue | No public API; in-house Fleek Sort vision model | Alex Nikityuk, Head of AI (judge and venue host) | [fleek.md](./fleek.md) |

## Things worth knowing before choosing

- **The sponsor stack is the judges' own stack.** Huge's Rotate° team builds on Shopify, Commerce Layer, Recharge and Sanity, and Jim Tattersall judges "Commerce depth".
- **Fleek ran its own a16z hackathon in July.** Winners were live-video grading with garment fingerprinting, an AI auctioneer, and buyer–supplier matching. Ideas close to those may look less original to Fleek.
- **Four partners have official MCP servers our agent can use today:** Commerce Layer (read and write), Sanity (read and write), PostHog and Tavily. Shopify's is UCP-shaped and needs an agent profile in each call; Recharge's is read-only analytics behind a form.
- **Wassist can put any of this on WhatsApp** through its SDK and MCP-as-tools support.
- Verified vs unverified claims are marked inside each file, with every source listed.
