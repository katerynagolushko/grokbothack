# Shopify

> The commerce platform most of the hackathon's tracks assume. Free dev stores, GraphQL APIs (Admin and Storefront, current version `2026-07`), and since 2026 a public, no-approval agent layer built on the Universal Commerce Protocol (UCP) with hosted MCP endpoints. Official links: [shopify.dev](https://shopify.dev/), [agents docs](https://shopify.dev/docs/agents), [Dev Dashboard](https://dev.shopify.com/dashboard), [changelog](https://shopify.dev/changelog), [UCP spec](https://ucp.dev/).

Researched 26 Sep 2026. Items marked **(verified live)** were tested today with `curl` against real endpoints. Items marked **(unverified)** are inferences or secondary-source claims.

## What it is

Shopify is a hosted commerce platform: a merchant gets a store with a product catalogue, inventory, a checkout, payments, orders, customers and fulfilment in one admin. Developers extend it in three ways: apps that read and write store data through the GraphQL Admin API; custom storefronts (headless, mobile, or AI agents) that read products and build carts through the Storefront API; and extensions and Functions that run inside Shopify's own checkout, admin and POS. In 2026 Shopify added a fourth surface aimed at AI agents: UCP, an open protocol co-developed with Google, exposed as MCP servers on every public store and on a global catalogue covering products from millions of merchants.

## Key products and developer surfaces

| Surface | What it does | When we'd use it |
| --- | --- | --- |
| **GraphQL Admin API** (`https://{shop}.myshopify.com/admin/api/2026-07/graphql.json`, header `X-Shopify-Access-Token`) | Full read/write of store data: products, inventory, orders, customers, discounts, metafields, B2B companies, webhooks. | Merchant tooling: an agent that edits listings, creates draft orders, reads sales, tags orders. |
| **Storefront API** (`https://{shop}.myshopify.com/api/2026-07/graphql.json`) | Buyer-facing reads plus cart. **Tokenless access** covers products, collections, search, selling plans, pages and cart read/write (query cost cap 1,000). A token is needed for product tags, metafields/metaobjects, menus and customers. | Any custom storefront or buyer agent that needs products and a `checkoutUrl`. |
| **Hydrogen / Oxygen** | Hydrogen is Shopify's React Router-based headless framework; Oxygen is Shopify's free hosting for it. `npm create @shopify/hydrogen@latest -- --quickstart` runs against `mock.shop` sample data with no store. | A polished storefront fast, if we don't want to build one on Vercel. |
| **Checkout** (checkout UI extensions, branding) | Shopify owns checkout; you extend it with UI extensions and branding. Checkout UI extensions and branding **require Shopify Plus**. | Rarely worth it in a day, unless the idea is about checkout itself. |
| **Checkout Kit** | Open-source SDK that shows Shopify checkout inside your surface from a `checkoutUrl`. The new version (Web, iOS, Android, React Native; runs on the Embedded Checkout Protocol) is in **early preview, alpha**. The web package is `@shopify/checkout-kit` (npm `next` tag), a `<shopify-checkout>` element that opens in a new tab, popup, or inline (inline needs a server-issued JWT). The older Checkout Sheet Kit is the stable mobile SDK. | Handing a buyer from our agent UI to a real checkout without a hard redirect. |
| **Shopify Functions** | Custom backend logic compiled to WebAssembly (Rust preferred, JavaScript supported) that runs inside checkout: discounts, delivery and payment customisation, cart transforms, validation, order routing. Custom apps with Functions need a Plus store (public App Store apps work on any plan). Network access ("fetch target") is not available on dev stores. | Rule enforcement at checkout, e.g. "block this cart if it breaks the buyer's mandate". |
| **Webhooks** | Push events (for example `orders/create`) to HTTPS, Google Pub/Sub or Amazon EventBridge, signed with `X-Shopify-Hmac-Sha256`. No ordering guarantee, delivery not guaranteed, so pair with reconciliation. "Events", the next-generation version with field-level filters and custom GraphQL payloads, is in developer preview. | Waking a Grok Bot routine when an order or inventory change happens. |
| **App development** (Shopify CLI, App Bridge, Polaris, Dev Dashboard) | `shopify app init` scaffolds a React Router app; App Bridge embeds it in the admin; Dev Dashboard (`dev.shopify.com`) now holds apps, dev stores, logs and credentials. New in 2026: static apps (no server, Shopify hosts), App Events API, App Pricing. | Only if the demo needs to live inside the Shopify admin. |
| **Metafields / metaobjects** | Typed custom data stored in Shopify. Metafields extend existing objects (a "condition grade" on a product); metaobjects are new record types (a "supplier" or "bale"). Readable from Admin API, Storefront API (with a token), Liquid, Functions and extensions. | Storing our own fields (grades, provenance, agent notes) without a separate table. |
| **B2B** | Companies, company locations and contacts, catalogues with negotiated prices, payment terms, draft orders for approval. The Admin API B2B resources are available on dev stores (and to Plus partners in a sandbox). B2B doesn't support subscriptions or pre-orders. | Wholesale ideas (Fleek's market): per-buyer price lists, purchase approvals. |
| **Shopify Flow** | No-code automation app (trigger, condition, action) on any paid plan. Apps can add their own triggers and actions; for a custom app these only work on a Plus store. | A merchant-visible "when X, call our agent" automation. |
| **Test payments** | "Test payment gateway" (formerly called Bogus Gateway): card number `1` approves, `2` declines, `3` simulates gateway failure; any future expiry, any CVV. Shopify Payments test mode uses cards such as `4242424242424242`. The test gateway doesn't work with subscription products. | Placing end-to-end test orders on a dev store. |

**Auth, in short.** Since 1 January 2026 you can no longer create "custom apps" in the Shopify admin (the old way to copy a static `shpat_` token). Existing ones still work. The new fastest path is a Dev Dashboard app plus the **client credentials grant**: POST `client_id`, `client_secret`, `grant_type=client_credentials` to `https://{shop}.myshopify.com/admin/oauth/access_token` and get a token that lasts 24 hours. This only works when the app and store are in the same organisation, so create the dev store from the Dev Dashboard. Apps for other merchants use token exchange (embedded) or the authorisation code grant; Shopify CLI handles those. Public apps must use expiring offline tokens (enforced for existing apps from 1 January 2027).

## AI and agent features

### UCP and Shopify's MCP servers

UCP was announced by Shopify and Google on 11 January 2026 and is supported by Etsy, Target, Walmart, Wayfair and others. At Spring '26 Edition (17 June 2026) Shopify made UCP and the Catalog API **self-serve with no approval**: register an agent profile in the Dev Dashboard and call the public endpoint.

Every UCP call is JSON-RPC 2.0 over HTTP POST, and every call must carry an **agent profile URL** inside the tool arguments at `meta["ucp-agent"].profile`. Shopify fetches the profile, negotiates the protocol version and capabilities with the shop, and returns only the tools both sides support. Current UCP version is `2026-08-25`. Shopify hosts test profiles, for example `https://shopify.dev/ucp/agent-profiles/2026-08-25/valid-with-capabilities.json` **(verified live)**. Some doc pages show the same file under `/ucp/agent-profiles/examples/...`; the path without `examples` is the one we tested. For production you host your own profile over HTTPS. Each shop publishes its own business profile at `https://{shop}/.well-known/ucp` **(verified live)**.

| Server | Endpoint | Tools | Auth |
| --- | --- | --- | --- |
| Storefront Catalog MCP (one merchant) | `https://{shop-domain}/api/ucp/mcp` | `search_catalog`, `lookup_catalog` (up to 10 IDs), `get_product` | Anonymous works **(verified live on a public store)** |
| Global Catalog MCP (all Shopify merchants) | `https://catalog.shopify.com/api/ucp/mcp` | Same three tools; results grouped by Universal Product ID with offers from several merchants; search by text, image or similar-product IDs | Anonymous works **(verified live, UK context returned GBP prices)** |
| Cart MCP | `https://{shop-domain}/api/ucp/mcp` | `create_cart`, `get_cart`, `update_cart` (replaces the whole cart), `cancel_cart` (needs `meta["idempotency-key"]`) | No auth needed. Returns a `continue_url` the buyer opens to check out. |
| Checkout MCP | `https://{shop-domain}/api/ucp/mcp` | `create_checkout`, `get_checkout`, `update_checkout`, `complete_checkout`, `cancel_checkout` | The carts page says checkout needs a token or signed request; the auth page says anonymous agents can build and edit checkouts. **The docs disagree; assume a token is needed.** `complete_checkout` needs a Token-tier agent with purchase permission. |
| Order MCP | `https://{shop-domain}/api/ucp/mcp` | `get_order` | Token tier with `read_global_api_orders`, and your profile must declare `dev.ucp.shopping.order`. Only sees orders placed through your agent. |
| Customer Accounts MCP | Discovered from `https://{shop}/.well-known/customer-account-api` (field `mcp_api`, usually `https://{shop}/customer/api/mcp`) | Customer's orders and account | OAuth 2.0 authorisation code with PKCE, scope `customer-account-mcp-api:full`. |
| Policies tool (legacy Storefront MCP) | `https://{shop}/api/mcp` | `search_shop_policies_and_faqs` | No auth. UCP has no replacement yet. |
| Dev MCP (for coding tools) | Local: `npx -y @shopify/dev-mcp@latest` | Docs search, schema introspection, GraphQL/Liquid/extension validation | None. Runs on your machine. |

**Trust tiers** decide rate limits and which tools you get. Token (a JWT from the Dev Dashboard's Catalog section, fetched at `https://api.shopify.com/auth/access_token` with the client credentials grant, 60-minute TTL): highest limits, `complete_checkout` if permitted, orders. Signed (RFC 9421 HTTP message signatures with ECDSA P-256, key published in your profile): lower limits, no complete or orders. Anonymous: lowest limits. Checkout is throttled harder than cart at every tier, so iterate on carts. Shopify doesn't publish the numbers. Rate-limited calls return JSON-RPC error `-32000` with a `Retry-After` header.

**What was removed.** The old Storefront MCP catalogue and cart tools on `https://{shop}/api/mcp` (`search_shop_catalog`, `get_cart`, `update_cart`) were removed in favour of `/api/ucp/mcp`; forum posts put the cut-off around 15 June 2026. The `shop-chat-agent` sample app is deprecated. Older tutorials and blog posts still show the removed tools.

**Tooling.** The Shopify AI Toolkit (GA at Spring '26) bundles skills, the Dev MCP and the CLI. Install it in Cursor with `/add-plugin shopify`. The UCP CLI (`npm install -g @shopify/ucp-cli`) gives commands such as `ucp catalog search --business https://{shop} --set /query='...'`; omit `--business` to search the global catalogue.

**Also announced, not yet usable:** Universal Cart API (one cart across merchants, on or off Shopify) is waitlist only. Personalised global search with buyer-linked Shop tokens is "coming soon". UCP order webhooks are not self-serve; Shopify registers the endpoint for you via a partner manager.

### Agentic Storefronts (merchant side)

A sales channel in the admin (Sales channels > Agentic), on by default for eligible stores, that syndicates products through Shopify Catalog to ChatGPT, Microsoft Copilot, Google AI Mode and Gemini, and Meta. ChatGPT is discovery only: the buyer checks out on the merchant's own checkout in an in-app browser. Copilot, Google and Meta can offer Shopify-powered direct checkout inside the channel.

**Availability is effectively US-buyer-only.** Shopify's own blog says purchasing across all AI channels is currently available to US buyers only; ChatGPT and Copilot need a store that sells to US buyers (the store can be based anywhere); Google AI Mode and Gemini is for "select US-based shops selling to US buyers". A secondary source (kn8) says Google direct checkout also accepts stores in the UK, Australia and Canada **(unverified; conflicts with Shopify's blog)**. A dev store can't take real transactions and keeps its password page, so we shouldn't expect to demo a dev store appearing in ChatGPT **(unverified, but follows from the dev store limits)**.

### Sidekick and Shopify Magic

Sidekick is the AI assistant in the Shopify admin, included on every plan with plan-dependent usage limits. Since 17 June 2026 any developer can build **Sidekick app extensions**: data extensions (Sidekick searches your app's data) and action extensions (Sidekick opens your app's page with changes staged for the merchant to confirm). They're scaffolded with Shopify CLI and need an `extensions_summary` in `shopify.app.toml`. Shopify Magic is the umbrella for built-in generative features (descriptions, images, email copy). It's free on all plans; general-availability features work in all languages, early-access ones vary. Neither has a public API to call Sidekick from outside the admin **(no API found in docs)**.

## Fastest hackathon path

**Big gotcha first:** dev stores always keep their storefront password page, and the UCP MCP endpoint (`/api/ucp/mcp`) sits behind that password. Shopify staff confirmed on the developer forum (20 May 2026) that there's no bypass. So on a dev store, UCP catalogue and cart calls return a redirect to `/password`. Options: (a) use the Storefront and Admin GraphQL APIs on our dev store; (b) use UCP read-only against the Global Catalog or any public live Shopify store; (c) put our own MCP server in front of our dev store's GraphQL APIs.

### 1. Get a dev store (about 5 minutes)

1. Sign in to the [Dev Dashboard](https://dev.shopify.com/dashboard) with a Shopify Partner account (free).
2. Stores > Create store > Dev. Pick the **Plus** plan (unlocks Flow, Functions in custom apps, checkout extensions, B2B) and add demo data. Or with the CLI:

```bash
shopify store create dev --name "grokbot-hack" --plan plus --demo-data --country GB
```

3. In the store admin: Settings > Payments > activate **Test payment gateway**.

### 2. Get tokens

- **Storefront API:** none needed for products, search and cart (tokenless). For metafields or customers, add the Headless channel, which issues public and private tokens.
- **Admin API:** Dev Dashboard > Apps > create app > choose scopes on a version (for example `read_products`, `write_products`, `read_orders`) > install on the dev store > Settings > copy Client ID and secret. Exchange them for a 24-hour token:

```javascript
const res = await fetch(`https://${SHOP}.myshopify.com/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.SHOPIFY_CLIENT_ID,
    client_secret: process.env.SHOPIFY_CLIENT_SECRET,
  }),
});
const { access_token } = await res.json(); // expires_in: 86399
```

(From the [Dev Dashboard token tutorial](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens). The tutorial's GraphQL URL uses `2025-01`; use `2026-07`.)

### 3. First API calls

Storefront API, tokenless, adapted from the docs' cURL example **(verified live on a public store)**:

```javascript
const res = await fetch(`https://${SHOP}.myshopify.com/api/2026-07/graphql.json`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `{ products(first: 3) { edges { node { id title } } } }`,
  }),
});
console.log((await res.json()).data.products.edges);
```

Whether tokenless Storefront API calls pass a dev store's password page isn't stated in the docs **(unverified; test with one curl before relying on it)**. If they don't, use the Headless channel's private token with the `Shopify-Storefront-Private-Token` header.

Admin API:

```bash
curl -X POST https://$SHOP.myshopify.com/admin/api/2026-07/graphql.json \
  -H 'Content-Type: application/json' \
  -H "X-Shopify-Access-Token: $TOKEN" \
  -d '{"query":"{ shop { name } products(first: 3) { edges { node { id title } } } }"}'
```

UCP Global Catalog search, anonymous **(verified live)**:

```bash
curl -X POST https://catalog.shopify.com/api/ucp/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"tools/call","id":1,"params":{"name":"search_catalog",
       "arguments":{"meta":{"ucp-agent":{"profile":"https://shopify.dev/ucp/agent-profiles/2026-08-25/valid-with-capabilities.json"}},
       "catalog":{"query":"vintage denim jacket","context":{"address_country":"GB"},"pagination":{"limit":5}}}}}'
```

Swap the host for `https://{public-shop-domain}/api/ucp/mcp` to search one merchant, then call `create_cart` with a variant ID to get a `continue_url`.

### 4. Connect a Shopify MCP server

- **Into Cursor (for building):** `/add-plugin shopify` in Cursor chat, or add to MCP settings:

```json
{ "mcpServers": { "shopify-dev-mcp": { "command": "npx", "args": ["-y", "@shopify/dev-mcp@latest"] } } }
```

- **Into Grok Bot (for the demo):** the UCP servers speak MCP over HTTP, but each tool call needs the `meta["ucp-agent"].profile` field inside its arguments. A general-purpose MCP client may not add that on its own **(unverified for Grok Bot)**. Two safer routes: let the Bot run `ucp` CLI commands from its cloud terminal, or have our own MCP server wrap the UCP calls (and our dev store's GraphQL APIs) and expose simpler tools.

## Pricing, limits and gotchas

- **Cost:** Partner account and dev stores are free, up to 250 dev stores per organisation. Dev stores can pick any plan, including Plus, at no charge. They can't take real payments, can't remove the password page, and can't be turned into live stores.
- **Admin API rate limits:** leaky bucket per app per store. 100 points/second on Standard, 200 on Advanced, 1,000 on Plus, 2,000 on Commerce Components. A single query can't exceed 1,000 points. Read `extensions.cost.throttleStatus` in each response instead of hardcoding. Arrays in inputs max 250 items.
- **Storefront API:** buyer traffic isn't rate-limited, but bot protection applies. From a server, send `Shopify-Storefront-Buyer-IP` or requests may be throttled.
- **UCP:** limits by trust tier, numbers unpublished. Carts are anonymous; checkout completion and orders need a Token-tier agent. The password gate blocks UCP on dev stores.
- **US-only:** buying through Agentic Storefronts channels (ChatGPT, Copilot, Gemini/AI Mode) is for US buyers. Many 2026 examples in the docs default to `address_country: "US"`; the Global Catalog did return GBP for `GB` in our test.
- **Plus-only on custom apps:** Functions, checkout UI extensions and branding, Flow extensions. Dev stores on the Plus plan should cover this for testing **(unverified per feature)**.
- **Approvals:** UCP and Catalog API need no approval since Spring '26. Some Admin API scopes and protected customer data need Shopify's approval for public apps (custom apps get customer data automatically). UCP order webhooks need Shopify to register the endpoint.
- **Deprecations to watch:** old tutorials still show admin-created custom app tokens (gone since 1 Jan 2026) and `search_shop_catalog` on `/api/mcp` (removed). Checkout Kit is alpha.
- **Test gateway:** order total must be over the equivalent of US$1; it doesn't support subscription products (use Shopify Payments test mode for those).

## How it could fit our hack

| Track | Where Shopify fits | Grok Bot role |
| --- | --- | --- |
| Storefront Experience | Storefront API or Hydrogen for a storefront; Storefront Catalog MCP for an AI shopping assistant on a public store; metaobjects for rich content (grading guides, provenance). | Bot uses its browser to QA the storefront, or answers buyer questions through our MCP server. |
| Buyer Experience | Cart via Storefront API or Cart MCP, `checkoutUrl`/`continue_url` handoff, Checkout Kit web component for an in-page checkout, Customer Accounts MCP for "where's my order". | Bot as a buyer's agent: search, compare, build a cart, stop before payment. |
| Merchant Tooling | Admin API writes (listings, prices, inventory, draft orders), metafields for our own fields, webhooks, Flow triggers, Sidekick app extensions. | Bot woken by an `orders/create` or low-stock webhook via a routine, then acts through Admin API tools we expose. |
| New Ways to Buy | B2B catalogues and draft orders for wholesale, selling plans for subscriptions (Storefront API exposes them), Functions to enforce spending rules at checkout. | Bot negotiates or restocks, with hard limits enforced in code or a Function. |
| Agentic Commerce | UCP end to end: Global Catalog discovery across merchants, carts, checkout handoff, trust tiers, agent profiles. The most "current stack" story Shopify has in 2026. | Bot is the UCP agent, via the `ucp` CLI in its terminal or our wrapper MCP server. |

Things to weigh, not a recommendation: UCP is the strongest "commerce depth" signal but can't run against our own dev store, so any demo that needs our own catalogue plus UCP must use a real public store or a wrapper. The GraphQL APIs on a dev store are the most controllable option for a reliable stage demo. Test orders through the Test payment gateway let us show a real order ID without real money.

## Sources

Official (shopify.dev, help.shopify.com, shopify.com, shopify.engineering):

- https://shopify.dev/docs/agents
- https://shopify.dev/docs/apps/build/storefront-mcp
- https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront (via search excerpt)
- https://shopify.dev/docs/apps/build/storefront-mcp/servers/customer-account (via search excerpt)
- https://shopify.dev/docs/agents/catalog/storefront-catalog
- https://shopify.dev/docs/agents/catalog/global-catalog
- https://shopify.dev/docs/agents/profiles
- https://shopify.dev/docs/agents/profiles/auth-and-rate-limiting
- https://shopify.dev/docs/agents/checkout/mcp (same content as /docs/agents/carts-and-checkout/checkout-mcp)
- https://shopify.dev/docs/agents/carts-and-checkout (via search excerpt)
- https://shopify.dev/docs/agents/carts-and-checkout/cart-mcp
- https://shopify.dev/docs/agents/carts-and-checkout/checkout-kit
- https://shopify.dev/docs/agents/carts-and-checkout/ecp (via search excerpt)
- https://shopify.dev/docs/agents/get-started/monitor-orders (via search excerpt)
- https://shopify.dev/docs/apps/build/devmcp
- https://shopify.dev/docs/api/storefront
- https://shopify.dev/docs/api/admin-graphql
- https://shopify.dev/docs/api/usage/limits
- https://shopify.dev/docs/apps/build/apis/graphql-admin/rate-limits (via search excerpt)
- https://shopify.dev/docs/api/customer/2026-07 (via search excerpt)
- https://shopify.dev/docs/apps/build/authentication-authorization
- https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens
- https://shopify.dev/docs/apps/build/authentication-authorization/legacy/admin-custom-apps (via search excerpt)
- https://shopify.dev/docs/apps/build/authentication-authorization/migrate-to-expiring-offline-access-tokens (via search excerpt)
- https://shopify.dev/docs/apps/build/dev-dashboard/development-stores
- https://shopify.dev/docs/storefronts/mobile/checkout-kit
- https://shopify.dev/docs/storefronts/mobile/checkout-kit/web (via search excerpt)
- https://shopify.dev/docs/api/functions
- https://shopify.dev/docs/storefronts/headless/hydrogen
- https://shopify.dev/docs/apps/build/webhooks
- https://shopify.dev/docs/apps/build/b2b
- https://shopify.dev/docs/apps/build/flow
- https://shopify.dev/docs/apps/build/custom-data
- https://shopify.dev/docs/apps/build/sidekick (via search excerpt)
- https://shopify.dev/changelog/sidekick-app-extensions-available-today (via search excerpt)
- https://changelog.shopify.com/posts/legacy-custom-apps-can-t-be-created-after-january-1-2026 (via search excerpt)
- https://help.shopify.com/en/manual/checkout-settings/test-orders/payments-test-mode
- https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements (via search excerpt)
- https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt (via search excerpt)
- https://help.shopify.com/en/manual/shopify-admin/productivity-tools/shopify-magic (via search excerpt)
- https://www.shopify.com/news/spring-26-edition-dev
- https://www.shopify.com/news/spring-26-edition-merchant (via search excerpt)
- https://www.shopify.com/news/ai-commerce-at-scale (via search excerpt)
- https://www.shopify.com/blog/how-agentic-commerce-works (via search excerpt)
- https://www.shopify.com/sidekick (via search excerpt)
- https://shopify.engineering/ucp (via search excerpt)
- https://community.shopify.dev/t/storefront-ucp-access-for-password-protected-store/34499 (Shopify staff answer, via search excerpt)
- https://community.shopify.dev/t/search-shop-catalog-tool-vanished-without-notice/33190?page=2 (via search excerpt)

Secondary:

- https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/ (via search excerpt)
- https://blog.google/company-news/inside-google/message-ceo/nrf-2026-remarks/ (via search excerpt)
- https://github.com/Shopify/checkout-kit/blob/main/README.md (via search excerpt)
- https://www.kn8.ai/blog/shopify-agentic-storefronts-setup (via search excerpt)
- https://stellagent.ai/insights/shopify-spring-26-agentic-commerce-developers (via search excerpt)
- https://no7software.co.uk/blog/shopify-graphql-admin-api-rate-limits-production (via search excerpt)

Live checks run today: `GET https://allbirds.com/.well-known/ucp`, `search_catalog` on `https://allbirds.com/api/ucp/mcp`, tokenless Storefront API on `weareallbirds.myshopify.com/api/2026-07/graphql.json`, and `search_catalog` on `https://catalog.shopify.com/api/ucp/mcp`. All succeeded with no credentials.
