# Commerce Layer

> Headless, API-first commerce backend (catalogue pricing, inventory, carts, checkout, orders, subscriptions, promotions) with a free developer plan and three hosted MCP servers for AI agents. Site: https://commercelayer.io. Docs: https://docs.commercelayer.io. Machine-readable docs index: https://docs.commercelayer.io/llms.txt.

Researched 26 Sep 2026 from official docs, the 2026 changelog and Commerce Layer's blog. Anything I could not confirm is marked **(unverified)**.

## What it is

Commerce Layer is the transactional half of an online shop, delivered as an API. It has no storefront or CMS of its own. You bring the frontend (Next.js on Vercel, a chat interface, an agent), and Commerce Layer handles prices per market, stock per location, carts, checkout, payments, shipping, tax, promotions, orders, returns and subscriptions. The team describes it as "multi-market by design": most things (price lists, inventory models, payment gateways, promotions) hang off a **market**.

Core data model (from the Data model section of the docs):

- **Organisation**: the tenant. The Developer plan allows one. You pick the data region when you create it, and you cannot change it later.
- **Market**: ties together a merchant, a price list and an inventory model. It can optionally have a customer group (which makes it a private market), a geocoder and a tax calculator. The Developer plan allows two active markets.
- **SKU**: a sellable variant (for example, a size and colour combination). An SKU is only "sellable" in a market if it has a price in that market's price list **and** at least one stock item in one of the market's stock locations (quantity can be zero).
- **Price list / prices**: prices per currency, with support for tiers, schedulers and external price calculation.
- **Stock location / inventory model / stock items**: stock per location. The inventory model sets priorities and the fulfilment strategy per market. Stock reservations are handled through the order lifecycle.
- **Bundles, SKU lists, SKU options**: bundles group SKUs at a special price per market. SKU options are paid add-ons such as engraving.
- **Customers and customer groups**: customer groups are used for B2B and private sales.
- **Orders**: a draft order is the cart. It moves through `pending`, then `placed` (by PATCHing `_place: true`), then `approved` and on to fulfilment. Payment status and fulfilment status are tracked separately.
- **Promotions**: percentage, fixed amount, fixed price, free shipping, free gift, buy X pay Y and external promotions. "Flex promotions" run on a Rules Engine DSL (the Rules Engine is for Enterprise customers).
- **Payment gateways**: there are three kinds:
  - PSD2-ready gateways: Adyen, Axerve, Braintree, Checkout.com, Klarna, PayPal, Satispay and Stripe.
  - **External gateways**: your own endpoints for authorise, capture, void, refund and customer token.
  - **Manual gateways**: for wire transfer, cash and similar. These are "always authorized", which makes them the quickest way to place test orders without a PSP.
- **Subscriptions**: these are native. A market can have a subscription model. Line items with a frequency on a source order generate order subscriptions, and recurring order copies then create the target orders. Promotions are not recalculated on recurring orders.
- **Returns, shipments, carriers, stock transfers**: a full order management system.

Environments: each organisation has **test mode** (the default, free forever) and **live mode**. They are completely separate: different credentials and different IDs. You can export resources from test and import them into live.

## Key products and developer surfaces

| Surface | What it does | When we'd use it |
| --- | --- | --- |
| Core API (`https://{org}.commercelayer.io/api/...`) | JSON:API 1.0 REST API with 400+ endpoints. Supports includes, sparse fieldsets, filters (`field_matcher`, e.g. `status_eq`), sorting and pagination. Content type is `application/vnd.api+json`. | Every read and write: catalogue, cart, checkout, orders. |
| Auth API (`POST https://auth.commercelayer.io/oauth/token`) | OAuth 2.0 grants: client credentials, password, authorisation code, refresh token and JWT bearer. | Getting tokens for the frontend (sales channel) or the backend and agent (integration). |
| API credential types | **Sales channel**: public, needs only a client ID, requires a market in scope, can see one order at a time. **Integration**: confidential (ID and secret), Admin or Read-only role. **Webapp**: authorisation code flow, acts with the logged-in user's permissions. | Sales channel for the browser storefront. Integration for Supabase Edge Functions and for Grok Bot. |
| Core MCP server (`https://core-mcp.commercelayer.io/mcp`) | Hosted HTTP MCP. Tools: `load_core_mcp_setup`, `list_resource_types`, `get_resource_schema`, `list_resources`, `get_resource`, `list_related_resources`, `create_resource`, `update_resource`, `delete_resource`, `search_documentation`, `get_doc_page`. Checks read queries against the schema before calling the API. Accepts a bearer token or OAuth. | Plugging Grok Bot (or Cursor) straight into the store without writing an API wrapper. |
| Metrics MCP server (`https://metrics-mcp.commercelayer.io/mcp`) | Hosted, read-only analytics over orders, carts and returns (breakdowns, date breakdowns, stats, search, frequently bought together). An open-source local version also exists: `commercelayer/mcp-server-metrics`. | "What sold best this afternoon?" style merchant assistants. |
| Documentation MCP (`https://docs.commercelayer.io/~gitbook/mcp`) | Hosted, no auth. Live docs search. | Coding in Cursor while we build. |
| JS SDK (`@commercelayer/sdk`) | Typed TypeScript wrapper over the Core API. Recommended import: `CommerceLayer` from `@commercelayer/sdk/bundle`. | Next.js / Vercel / Supabase Edge code. |
| JS Auth (`@commercelayer/js-auth`) | Token helper. `authenticate('client_credentials', {...})`, plus caching helpers (`makeSalesChannel`, `makeIntegration`). | Token handling in serverless functions. |
| CLI (`npm i -g @commercelayer/cli`, also `cl` / `clayer`) | Login, resources plugin (`commercelayer list skus --doc` prints the equivalent cURL or Node code), seeder plugin (sample data), checkout plugin (hosted checkout URL), webhooks and more. | Seeding a demo catalogue in minutes and debugging. |
| drop-in.js micro frontends | Web components for price, availability, add to cart, cart, checkout (hosted, PCI-compliant), identity and my account. You embed them in plain HTML. | A shoppable page with almost no frontend code. |
| React components, hosted Cart / Checkout / My Account apps | Open-source React components and hosted apps. | Quick checkout for a Next.js demo. |
| Links | Shareable links that render a microstore or go straight to checkout. The Developer plan includes 10. | "Agent sends the buyer a checkout link" flows. |
| Webhooks | 100+ `resource.event` topics (e.g. `orders.place`, `orders.approve`, `orders.create_subscriptions`, `recurring_order_copies.fail`, `returns.approve`, `customers.create`). Payload is JSON:API with configurable includes. Signed with HMAC-SHA256 in `X-CommerceLayer-Signature`; the topic is in `X-CommerceLayer-Topic`. | Pushing events to a Grok Bot webhook routine or a Supabase function. |
| Event stream hub | SSE stream of Core API lifecycle events, with replay by time or by resource. | Live dashboards (uses a single connection instead of many webhooks). |
| External resources | Your serverless endpoints for order validation, prices, shipping costs, payment gateways, promotions and tax calculators. | Letting an agent or a custom rule set price, validate or approve orders. |
| Public endpoints (no auth) | `https://core.commercelayer.io/api/public/resources`, OpenAPI at `https://data.commercelayer.app/schemas/openapi.json`. | Code generation and giving agents schema context. |
| Metrics API, Provisioning API, Rules Engine | Analytics, programmatic organisation and credential management, and a promotions DSL. | Mostly Enterprise; see gotchas. |

## AI and agent features (verified only)

- **Three official MCP servers**, announced in the changelog on **19 June 2026** ("Start building with AI") and in the blog post "Meet the Commerce Layer Core MCP" (17 June 2026):
  - **Core MCP** (`https://core-mcp.commercelayer.io/mcp`): read **and write**, over streamable HTTP, with nothing to install.
    - Auth is a bearer token (sales channel, integration or OAuth token) or OAuth 2.0 discovery in clients that support it.
    - It checks filter key shape, `include` and `sort` against public resource metadata before read calls, and strips non-fetchable sparse fields with a warning.
    - Before writes, it reads the official Create or Update doc page.
    - It documents config for Claude Desktop, Cursor and VS Code, and says any MCP client works.
  - **Metrics MCP** (`https://metrics-mcp.commercelayer.io/mcp`): read-only analytics. Bearer token or OAuth.
  - **Documentation MCP** (`https://docs.commercelayer.io/~gitbook/mcp`): read-only, no auth.
- **MCP security guidance** from the docs:
  - Use a dedicated credential for the agent.
  - Prefer OAuth over static tokens.
  - Do not enable auto-approve for write tools.
  - Scope access with roles.
  - **Caveat:** granular custom roles on integrations are an Enterprise feature. On the free plan an integration is either Admin (full CRUD) or Read-only.
- **Agentic commerce positioning** (marketing pages https://commercelayer.io/agentic-commerce and https://commercelayer.io/universal-checkout):
  - "Universal Checkout" is described as API-first and stateless, able to "support any agent protocol including MCP, UCP, and A2A".
  - **(unverified)**: I found no developer docs showing a UCP or A2A endpoint or configuration. Treat this as positioning, not a documented API.
- **Payments API redesign "for humans and agents"**:
  - Blog post of 7 July 2026. The "Upcoming changes" page lists it for 15 Sep 2026 **as a beta**.
  - What changes: payments are decoupled from orders, with multiple authorisations, captures and refunds per order, gift cards as a first-class payment method, and wallets.
  - It ships with **date-stamped API versioning** (`/api/{version}/...`). `2017-08` stays the default, and the new resources need `2026-05` or later.
  - **(unverified)**: whether the beta is enabled on free developer organisations today. Check the docs or ask the sponsor.
- **Anomaly detection** on order workflows (changelog, 4 May 2026) is **Enterprise only**.
- **The docs themselves are LLM-ready**: `llms.txt`, `.md` versions of every page, and a GitBook `?ask=` query parameter on pages.

## Fastest hackathon path

Estimated 20 to 40 minutes to a first test order, based on the onboarding docs ("less than 5 minutes" for their tutorial).

1. **Sign up** at https://dashboard.commercelayer.io/sign_up (free Developer plan, no card mentioned). Confirm your email.
2. **Create an organisation** and choose the data region (EU is sensible for London). This cannot be changed later.
3. **Seed test data**. Either:
   - follow the in-dashboard onboarding, which uses the CLI seeder plugin and the checkout plugin to place a first order through the hosted checkout, or
   - use the Dashboard setup wizard.
4. **Create API credentials** in the Dashboard (Developers > API credentials):
   - one **Sales channel** for the storefront (client ID only)
   - one **Integration** with the Admin role for backend and agent work (client ID and secret). Consider a separate Read-only integration for the agent if writes are not needed.
5. **Add a payment method** to the market:
   - A **manual gateway** is the fastest, because payments are "always authorized".
   - Or use a Stripe gateway with Stripe test keys if the demo needs a real card form.
6. **First API call**: get a token, then list SKUs.

Token (integration), from the docs:

```sh
curl -g -X POST \
  'https://auth.commercelayer.io/oauth/token' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "grant_type": "client_credentials",
  "client_id": "{{your_client_id}}",
  "client_secret": "{{your_client_secret}}"
}'
```

For a sales channel, drop `client_secret` and add `"scope": "market:code:<your_market_code>"` (or `market:id:...`). The market scope is required.

List SKUs:

```sh
curl -g -X GET \
  'https://yourdomain.commercelayer.io/api/skus' \
  -H 'Accept: application/vnd.api+json' \
  -H 'Authorization: Bearer your-access-token'
```

Same thing in Node (TypeScript), combining the JS Auth and JS SDK READMEs:

```ts
import { authenticate } from "@commercelayer/js-auth"
import { CommerceLayer } from "@commercelayer/sdk/bundle"

const auth = await authenticate("client_credentials", {
  clientId: process.env.CL_CLIENT_ID!,
  clientSecret: process.env.CL_CLIENT_SECRET!,
})

const cl = CommerceLayer({ organization: "your-org-slug", accessToken: auth.accessToken })
const skus = await cl.skus.list()
```

Placing an order: PATCH `/api/orders/{id}` with `{"data":{"type":"orders","id":"...","attributes":{"_place":true}}}`. Before that, the order needs a customer email, addresses, a shipping method, a payment method and a payment source (see the Checkout how-tos).

7. **Connect Grok Bot or Cursor to the Core MCP**. The Cursor config from the docs:

```json
{
  "mcpServers": {
    "Commerce Layer Core MCP": {
      "url": "https://core-mcp.commercelayer.io/mcp",
      "headers": { "Authorization": "Bearer {{your_access_token}}" }
    }
  }
}
```

   Integration tokens last 2 hours by default. You can set a lifetime between 2 hours and 15 days on the credential. A token that is refreshed or long-lived avoids the MCP connection dying mid-demo.

8. **Webhooks**: create them in the Dashboard (Webhooks app) or via `POST /api/webhooks`. Verify the `X-CommerceLayer-Signature` HMAC with the shared secret.

## Pricing, limits and gotchas

- **Developer plan (free)**:
  - 1 organisation, 2 users, 2 markets, 1,000 SKUs, 10 links
  - unlimited test orders, 100 free live orders a month
  - Core API access and community support
  - Everything else is "Custom" (Enterprise): Metrics API, Provisioning API, custom roles, custom identity provider, SLAs. Add-ons are Distributed OMS, promotion engine and metrics dashboard. There is no trial; the free plan has no time limit.
- **Metrics API and Metrics MCP may not work on the free plan.** The pricing page lists "Metrics API access" only under Custom. **(unverified)**: whether the Metrics MCP returns data for a Developer organisation. Test early.
- **Rate limits** (per IP, sliding window, never reset, so plan for them):
  - Auth endpoint: **30 requests a minute** in both test and live. Cache tokens. Do not fetch a new token for every request.
  - Test mode reads of cacheable resources (SKUs, prices, markets, stock items, promotions, bundles): 500 a minute on average across all endpoints, and 125 per endpoint per 10 seconds in bursts.
  - Test mode uncacheable reads (such as orders) and **all writes**: **100 a minute** on average, and **25 per endpoint per 10 seconds** in bursts. An agent looping over orders can hit this quickly.
  - Headers: `X-Ratelimit-Limit`, `-Interval`, `-Remaining` (average limit only).
- **Token lifetimes**: sales channel 4 hours, integration and webapp 2 hours. They can be customised between 2 hours and 15 days. A new token is issued 15 minutes before expiry, with an overlap window.
- **Sales channel tokens must have a market in scope.** SKUs only appear if they have a price and a stock item in that market. This is the classic "why is my SKU list empty?" problem.
- **Scopes are ignored for Admin and Read-only integrations.** Only custom roles (Enterprise) are filtered by scope.
- **Test and live are separate worlds** with different IDs. Use `market:code:...` scopes to keep code portable.
- **Webhooks**: up to 10 retries per failure. After 30 consecutive failures the webhook stops and has to be reset.
- **Recurring order copies do not apply promotions or gift cards.** Use price frequency tiers or negative adjustments for subscription discounts.
- **Breaking and upcoming changes around this date** (Upcoming changes page, 15 Sep 2026):
  - Resource-level `meta` is being reduced to `created_with_version`.
  - `mode`, `organization_id` and `trace_id` move to document-level `meta`.
  - API versioning is being introduced. The default `2017-08` is unchanged, so old tutorials still work, but check `meta` if you parse it.
- **Organisation deletion** requires emailing support. Name the demo organisation carefully.
- Secondary sources on Commerce Layer are thin. Most material outside the docs is Commerce Layer's own marketing, so treat performance claims ("<90ms", "99.99% uptime") as vendor claims.

## How it could fit our hack

Neutral mapping to the five tracks. These are options, not a recommendation.

- **Storefront Experience**: a Next.js storefront on Vercel using a sales channel token, drop-in.js or React components, and the hosted checkout. Multi-market pricing (for example GBP and EUR price lists) is easy to show on stage. Grok Bot could curate or merchandise the storefront by editing SKU metadata or tags through the Core MCP.
- **Buyer Experience**: a conversational shopping assistant. Grok Bot reads catalogue and stock through the Core MCP (or a sales-channel-scoped tool), builds a draft order, and hands the buyer a checkout link. Order status and returns lookups ("where is my order?") map onto `orders`, `shipments` and `returns`.
- **Merchant Tooling**: an operations copilot. Grok Bot subscribes to webhooks (`orders.place`, `orders.tax_calculation_failed`, `recurring_order_copies.fail`, `returns.request`) and triages them, or answers "orders authorised but not fulfilled in the last 24 hours" through the Core MCP. The docs use that exact query as an example. The Metrics MCP could add analytics if it works on the free plan.
- **New Ways to Buy**:
  - Native subscriptions (subscription models, frequencies, recurring order copies).
  - Bundles and SKU options.
  - Links as a shareable micro-checkout.
  - External prices or promotions endpoints for dynamic, agent-set pricing, such as negotiated or time-boxed offers.
- **Agentic Commerce**:
  - An agent acting as a buyer: a sales channel token, a manual gateway, and placing a test order end to end.
  - An agent acting as a merchant: an integration token doing Core MCP writes, with a human approving each write.
  - External order validation as a policy gate for agent-placed orders, for example spend limits or allow-listed SKUs.
  - The Payments API beta (multiple authorisations, decoupled payments) is directly relevant if it is enabled for us. Verify before relying on it.
- **Where Grok Bot plugs in**:
  - As an MCP client of the Core, Metrics and Docs MCPs.
  - As a webhook target: Commerce Layer webhook, then a Supabase Edge Function or Grok Bot routine.
  - As a periodic job using its cloud computer to run CLI commands (`cl list orders ...`).
  - Supabase can hold agent memory, audit logs of MCP writes, and the webhook event store.
- **Commerce depth talking points**:
  - Market / price list / inventory model scoping.
  - The order state machine (`_place`, payment status and fulfilment status tracked separately).
  - PSD2 and SCA gateways versus manual gateways.
  - Idempotent payments.
  - Stock reservations.
  - HMAC-verified webhooks.
  - Rate-limit-aware agent design.

## Sources

Official (read in full or in part):

- https://docs.commercelayer.io/llms.txt
- https://docs.commercelayer.io/core/getting-started
- https://docs.commercelayer.io/core/api-specification.md
- https://docs.commercelayer.io/core/authentication
- https://docs.commercelayer.io/core/authentication/client-credentials.md
- https://docs.commercelayer.io/core/api-credentials.md
- https://docs.commercelayer.io/core/rate-limits.md
- https://docs.commercelayer.io/core/real-time-webhooks.md
- https://docs.commercelayer.io/core/callbacks-security.md
- https://docs.commercelayer.io/core/event-stream-hub.md
- https://docs.commercelayer.io/core/onboarding/onboarding-with-the-cli.md
- https://docs.commercelayer.io/core-api-reference/skus/list.md
- https://docs.commercelayer.io/core-api-reference/manual_gateways.md
- https://docs.commercelayer.io/data-model/payments-and-tax/payment-gateways.md
- https://docs.commercelayer.io/data-model/orders/subscriptions-and-order-copies.md
- https://docs.commercelayer.io/how-tos/placing-orders/checkout/placing-the-order.md
- https://docs.commercelayer.io/public-endpoints.md
- https://docs.commercelayer.io/ai/build-with-ai.md
- https://docs.commercelayer.io/ai/mcp/servers
- https://docs.commercelayer.io/ai/mcp/servers/core.md
- https://docs.commercelayer.io/ai/mcp/servers/metrics.md
- https://docs.commercelayer.io/ai/mcp/servers/docs.md
- https://docs.commercelayer.io/ai/mcp/security.md
- https://docs.commercelayer.io/changelog/readme.md (2026)
- https://docs.commercelayer.io/changelog/upcoming.md
- https://docs.commercelayer.io/changelog/archive/2025.md (skimmed)
- https://commercelayer.io/pricing
- https://commercelayer.io/agentic-commerce
- https://commercelayer.io/universal-checkout (via search extract)
- https://commercelayer.io/blog/core-mcp-server
- https://commercelayer.io/blog/payment-api-redesigned
- https://commercelayer.io/headless-commerce and https://commercelayer.io/composable-commerce (via search extract)
- https://github.com/commercelayer/commercelayer-sdk (README)
- https://github.com/commercelayer/commercelayer-js-auth (packages/js-auth README)
- https://github.com/commercelayer/drop-in.js (packages/drop-in README)
- https://github.com/commercelayer/commercelayer-cli (README)
- https://github.com/commercelayer/mcp-server-metrics (via search extract)

Secondary (context on agent protocols, not about Commerce Layer specifically):

- https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/ (via search extract)
- https://rye.com/blog/agentic-checkout (via search extract)
