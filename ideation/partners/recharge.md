# Recharge

> Shopify-first subscriptions and retention platform (subscriptions, bundles, customer portal, cancellation prevention, failed-payment recovery, analytics), with an Admin REST API, a Storefront API and JS SDK, and an early-access Analytics MCP. Site: https://getrecharge.com (rechargepayments.com redirects here). Developer docs: https://docs.getrecharge.com. API reference: https://developer.rechargepayments.com/2021-11. Help centre: https://support.getrecharge.com. Changelog: https://changelog.getrecharge.com.

Researched 26 Sep 2026 from the official API reference, developer docs, help centre articles (most updated May to Sep 2026), the pricing page and the Recharge blog. Anything I could not confirm is marked **(unverified)**.

## What it is

Recharge is a subscription app that sits on top of an ecommerce platform, overwhelmingly Shopify (it also supports BigCommerce and a "Custom" API-first mode). It says it has 20,000+ merchants and 100M+ subscribers. It does not replace the store. On Shopify it plugs into Shopify's Subscriptions APIs:

- **Shopify Checkout Integration (SCI)**: the current default for Shopify stores installed after Nov 2020. The **first order goes through Shopify's own checkout**. Recharge then owns the subscription, schedules and processes recurring charges, and pushes orders back to Shopify.
- **Recharge Checkout on Shopify (RCS)**: the older Recharge-hosted checkout. It is now **deprecated**, and stores must convert to SCI to take new checkouts.
- **BigCommerce Checkout Integration**, **Recharge Checkout on BigCommerce** and **Custom**: other platform modes. The Admin API `Checkout` endpoints only work for BigCommerce and Custom, not Shopify.

Core objects in the Admin API:

- **Customer** has one or more **Addresses**.
- **Subscriptions** hang off an address. Each subscription is one product or variant, with a charge frequency and an order frequency.
- **Charges** are the money events, past or upcoming. Subscriptions on the same address with the same next charge date merge into one charge.
- **Orders** are created when a charge succeeds.
- **Onetimes** are one-off add-ons to the next charge.
- **Plans** are selling plans per product.
- Also: **Discounts**, **Payment methods**, **Bundle selections**, **Credits** (store credit), **Metafields**, **Webhooks** and **Async batches** (bulk jobs).

Merchant-facing product areas:

- the customer portal (Affinity 2.0 page builder)
- the subscription widget on product pages
- Bundles
- Cancellation Prevention flows
- Failed Payment Recovery (dunning and retries)
- Win Backs
- Workflows (for example, swap a starter kit for a refill after the first charge)
- dynamic pricing (discounts that change over time)
- prepaid and gift subscriptions
- Loyalty (Rewards and Referrals)
- Concierge SMS (AI agents over text)
- Analytics with benchmarks

## Key products and developer surfaces

| Surface | What it does | When we'd use it |
| --- | --- | --- |
| Admin REST API (`https://api.rechargeapps.com`) | REST plus some RPC-style actions. Auth is the `X-Recharge-Access-Token` header. Version is chosen with the `X-Recharge-Version` header (`2021-11` is the latest; `2021-01` is the base). Uses cursor pagination (`limit` up to 250, `next_cursor`) and `include` to expand related objects. | Backend and agent operations: list, skip, swap, pause, cancel or reactivate subscriptions, apply discounts, reschedule charges. |
| Useful Admin actions (from the 2021-11 reference) | `POST /subscriptions/{id}/cancel` (takes `cancellation_reason`), `/activate`, `/set_next_charge_date`, `/change_address`. `POST /charges/{id}/skip`, `/unskip`, `/apply_discount`, `/add_free_gift`, `/refund`. `POST /orders/{id}/delay`, `/clone`. `GET /customers/{id}/delivery_schedule`. `POST /async_batches`. | The concrete verbs an agent would call. |
| API token scopes | Per-resource read and write scopes, for example `read_subscriptions` / `write_subscriptions`, `read_customers`, `write_orders`, `write_discounts`, `write_payment_methods`, `read_store`, `read_credit_accounts`. Tokens are created in the merchant portal under Tools & apps > API tokens. | Give an agent a least-privilege token, for example read-only subscriptions and charges. |
| Storefront API and JS SDK (`@rechargeapps/storefront-client`, or CDN `recharge-client-*.min.js`) | Browser-safe access scoped to the logged-in customer. `initRecharge({ storeIdentifier, storefrontAccessToken })`, then a login helper such as `loginShopifyAppProxy()`, `loginShopifyApi(...)` or `loginCustomerPortal()`. Storefront tokens start with `strfnt`. **Plus or Custom plans only.** | A custom customer portal, a custom bundle builder, or a Hydrogen / Next.js headless storefront. |
| Webhooks | Topics such as `subscription/created`, `subscription/cancelled`, `subscription/skipped`, `subscription/paused`, `charge/failed`, `charge/max_retries_reached`, `charge/upcoming`, `order/created`, `order/processed`, `customer/activated`. Payload matches the REST object. **New signature scheme**: `X-Recharge-Webhook-Timestamp` and `X-Recharge-Webhook-Signature` (`t=...,v1=...`), where v1 is HMAC-SHA256 over `"{t}.{raw_body}"` keyed with the **API Client Secret**; reject if older than 48 hours. The legacy `X-Recharge-Hmac-Sha256` header is still sent. Recharge waits 5 seconds for a 200, retries otherwise, and duplicates are possible. | Feeding churn and dunning events to a Grok Bot routine or a Supabase function. |
| Customer portal (Affinity 1.0 / 2.0) | Hosted self-service portal: skip, swap, reschedule, cancel. Affinity 2.0 has a drag-and-drop Page Builder, custom extensions, "flow extensions" to intercept actions such as skip or reschedule, custom CSS, and AI auto-translate. The Theme Engine portal was scheduled for deprecation on 31 Dec 2025. | Customising the subscriber experience without building a portal from scratch. |
| Subscription widget / Bundles widget 2.0 | Theme app blocks on the Shopify product page. Bundles widget 2.0 supports custom CSS and JS and pre-filling via query parameters. | Storefront-side subscribe-and-save and build-a-box. |
| Bundles (Plus or Custom) | **Preset** (fixed contents). **Fixed-price customisable** (build-a-box, same price whatever is chosen). **Customisable subscribers-only** (starts preset, editable later). **Dynamically-priced customisable** (price depends on the items). Also add-ons and extras, and nested bundles (rolling out). API: `bundle_selections` endpoints (Plus). | "Build your own box" or "curated box" New Ways to Buy demos. |
| Analytics / AI Reports | 130+ metrics with benchmarks. Monthly AI-generated report emails (sales, payment recovery, cancellations, product performance). | Merchant insights. |
| Analytics MCP (Early Adopter) | Read-only, aggregate-only MCP connector for Claude, ChatGPT and similar. Needs an interest form and login with Recharge credentials. | An analytics copilot, if access is granted in time. |
| Developer Slack and Recharge Bin | Public API Slack channel (found through the in-app support bot). A request bin for testing webhooks. | Getting unblocked on the day. |

## AI and agent features (verified only)

- **Recharge Analytics MCP**: the help centre article is dated 9 Sep 2026 and titled "Recharge Analytics MCP Early Adopter Program".
  - Status: **Early Adopter**. You must fill in an interest form to get access.
  - Works with MCP-capable assistants such as Claude and ChatGPT. You authenticate with Recharge account credentials.
  - **Read-only and aggregate metrics only**: counts, sums, rates and averages across 130+ metrics (subscribers, churn, renewals, upcoming orders, payment recovery, cancellation reasons, cohorts, benchmarks). **It cannot return individual records or change anything.**
  - The article does not publish the endpoint URL.
  - **(unverified)**: whether a hackathon team could get access on the day, or whether it works on a development (test) store.
- **No official read/write MCP server for the Admin API** was found in Recharge docs.
  - Third-party options exist: `ChemicalLuck/recharge-mcp-node` (open source, stdio), and hosted connectors from Pipedream, Zapier, Truto and "usefulapi" (`https://recharge.usefulapi.io/mcp`, listed in the official MCP registry).
  - These are **not Recharge products**. I have not tested them. Treat them as unvetted, especially with write scopes.
  - Writing our own small MCP over the Admin API is straightforward, because it is plain REST with a header token.
- **Concierge SMS AI agents** (blog, Feb and May 2026; https://getrecharge.com/sms/):
  - Support, Sales and Insight agents manage subscribers over SMS: skips, swaps, reschedules, product questions, upsells and micro-surveys.
  - Recharge reports "up to 15%" conversion for sales agents and 67% engagement for surveys. These are vendor figures.
  - Plus plan feature, priced per message segment.
- **Conversational AI inside the merchant portal**: the May 2026 blog describes a system that analyses data, recommends actions and helps execute them. The changelog (about a month ago) announced **Remi**, a chatbot for support and store-performance questions, available to all merchants.
- **AI Reports** (monthly AI-summarised emails) and **AI auto-translate** in the Affinity Portal Builder.
- **"AI-powered retries"** in Failed Payment Recovery (pricing page claim: "recover up to 88% of failed payments").
- **Agentic commerce stance** (blog "What agentic commerce means for subscriptions", June 2026, updated Aug 2026):
  - About 23% of subscription revenue on Recharge is the first order and about 77% is renewals. About 71.5% of renewals process automatically.
  - Recharge argues that agents mostly affect discovery and the first order, while the portal and retention stay with the merchant.
  - It describes Shopify's Spring '26 Edition: the Universal Commerce Protocol (UCP), the Catalog API, Cart and Checkout MCPs, and the "Agentic plan".
  - It does **not** announce a Recharge UCP or MCP integration for purchasing. **(unverified)**: how Recharge subscriptions behave when a first order comes through a Shopify agentic checkout (UCP / Shop Pay in an AI surface). Nothing in the docs covers it.

## Fastest hackathon path

Allow 45 to 90 minutes. The main dependency is a Shopify development store.

1. **Get a Shopify development store.** Use a free Shopify Partner account, then create a development store (optionally "with test data" for demo products).
   - Recharge's help centre (updated 1 Jun 2026) says: "Development stores on a free Shopify and BigCommerce plan are automatically configured as Recharge test stores."
   - A test store flips to live and starts billing if the store upgrades to a paid plan **or Recharge detects real (non-test) orders**.
2. **Set up test payments.**
   - Activate Shopify Payments, then turn on the **Bogus Gateway** (Settings > Payments > test payment provider).
   - Bogus card numbers: `1` approved, `2` declined, `3` gateway failure. Any 3-digit CVV and any future expiry date.
   - Recharge notes that other subscription payment processors on SCI do not support test mode, so stick to Bogus or Shopify Payments test mode.
3. **Install Recharge** from the Shopify App Store listing. Complete the in-app onboarding: store details, add an active product as a subscription product, and install the subscription widget on the theme.
4. **Create an Admin API token.**
   - The store owner must first accept the API Terms of Service.
   - Then go to Tools & apps > API tokens > Admin tokens > Create new, and choose No access, Read, or Read and Write per resource.
   - Note the **API Client Secret** on the token's edit page; you need it for webhook verification.
5. **Place a test subscription order** on the storefront with the Bogus card. That gives you a real customer, subscription and charge to work with through the API.
6. **First API call**: list subscriptions. This is from the 2021-11 reference:

```sh
curl 'https://api.rechargeapps.com/subscriptions' \
  -H 'X-Recharge-Version: 2021-11' \
  -H 'X-Recharge-Access-Token: your_api_token' \
  -d limit=3 -G
```

   Cancel one (also from the reference):

```sh
curl 'https://api.rechargeapps.com/subscriptions/27363808/cancel' \
  -H 'X-Recharge-Version: 2021-11' \
  -H 'Content-Type: application/json' \
  -H 'X-Recharge-Access-Token: your_api_token' \
  -d '{"cancellation_reason": "other reason"}'
```

   Always send `X-Recharge-Version: 2021-11`. The docs disagree about what the default is when the header is left out: the API reference says "the default version on your store", while the versions guide says `2021-01`.

7. **Storefront JS SDK** (only if the store has Plus or Custom features). From the storefront client docs:

```ts
import { initRecharge, loginShopifyAppProxy } from '@rechargeapps/storefront-client'

initRecharge({
  storeIdentifier: 'your-store.myshopify.com',
  storefrontAccessToken: 'strfnt_...',
  appName: 'grokbothack',
  appVersion: '1.0.0',
  loginRetryFn: async () => loginShopifyAppProxy(),
})
```

8. **Fallback if blocked**:
   - Ask the Recharge sponsor team at the venue for a pre-provisioned store or a token, and for Plus features (Bundles, Storefront API) to be enabled on the dev store. **(unverified)**: whether this is possible.
   - The public Recharge API Slack is the other route.
   - Recharge's help centre article pages sit behind a Cloudflare bot check. The Zendesk JSON API (`/api/v2/help_center/en-us/articles/{id}.json`) serves the same content, which is useful if Grok Bot needs to read them.

## Pricing, limits and gotchas

- **Pricing** (pricing page, read 26 Sep 2026):
  - **Starter** is $99 a month + 1.49% + 19¢ per transaction.
  - **Plus** is $499 a month + 1.34% + 19¢, on a 12-month term.
  - **Custom** has volume-based rates.
  - There is a 60-day free trial on Starter.
  - The help centre billing article (updated Jul 2026) quotes Starter at 1.25% + 19¢ and describes a **"25-50" plan** at $25 a month for new stores (installed after 9 Feb 2026) with 50 or fewer lifetime customers. The two pages disagree on Starter's percentage; this does not matter for a test store.
- **Plan gating is the big gotcha for a hackathon.**
  - **Bundles** (and the Bundles SDK and endpoints), the **Storefront API and JS SDK**, **Concierge SMS**, Loyalty, and `bundle_selections` are **Plus or Custom only**.
  - `charges/{id}/process` and `capture_payment` are Plus, and on request or closed beta.
  - Credits endpoints need Retain.
  - The Hydrogen article says "API access is available to merchants on Recharge's Plus or custom pricing plan". This conflicts with the API article, which lets any store owner create Admin tokens. **(unverified)**: what a free development store gets. Test token creation first.
- **Rate limits**: a leaky bucket per token, **2 requests a second with a 40-request bucket** on standard plans. Plus and Custom get 4 a second and an 80-request bucket. A 429 means back off for at least 2 seconds.
  - The docs suggest spreading calls across several tokens and using async batches.
  - On SCI, some 429s come from Shopify's limits, not Recharge's.
- **Shopify-first constraints**:
  - On Shopify, the first checkout must go through Shopify (Admin API `Checkout` endpoints are BigCommerce and Custom only).
  - Subscription products must use Recharge plans (selling plans). Selling plan IDs are not stable; fetch them dynamically.
  - Shopify's own Bundles app is **not compatible** with Recharge subscriptions. Subscription bundles must use Recharge Bundles.
- **Bundle limits**:
  - A maximum of **250 products per bundle collection**.
  - Collections with multiple conditions or certain sources cannot be used.
  - Dynamically-priced bundles are incompatible with prepaid subscriptions, dynamic pricing, Automate, Checkout Cross-Sell, the Shop app and Recharge Cart.
  - No custom line item properties on dynamic bundles.
  - Since 24 Jul 2025, the parent product is excluded from orders for new dynamic-bundle stores.
  - Analytics attribute revenue to the parent bundle only.
- **API behaviour**:
  - Each subscription update regenerates charges. Use `commit_update: false` when batching several PUTs.
  - `2021-11` removed total counts on list endpoints.
  - One subscription per product per address.
- **Webhooks**: verify with the **API Client Secret** (not the token). Use the raw body with no re-serialisation. Make handlers idempotent.
- **Test stores go live automatically** if real orders are detected, so keep payments in test mode.
- **UK DMCC subscription rules**:
  - The UK regime (Digital Markets, Competition and Consumers Act 2024) was pushed back and now applies from **early 2027**, according to the government consultation response of 2 Apr 2026 and CMS's summary.
  - It requires prominent pre-contract information, standalone renewal and trial-end reminder notices, a new 14-day renewal cooling-off period with proportionate refunds, and online cancellation that is as easy as sign-up.
  - **I found no Recharge documentation that mentions DMCC or UK rules.**
  - Recharge's documented compliance work is for **US automatic renewal laws (California ARL)**:
    - a "no restrictions" default for minimum charges before cancelling
    - optional one-click cancellation that bypasses the survey
    - an Upcoming Charge notification (3 days before, configurable) with an itemised total and price-change message
    - a "1+ year Upcoming Charge" notification (30 days before by default)
    - activation records kept for at least 3 years.
  - These overlap with DMCC needs but are not described as DMCC compliance.
  - A UK agency blog (MoreSoda) says it has not seen any Shopify subscription app automate the renewal cooling-off refund calculation yet. That is a genuine gap, not a Recharge feature.

## How it could fit our hack

Neutral mapping to the five tracks. These are options, not a recommendation.

- **Storefront Experience**: a subscribe-and-save widget, and a build-a-box bundle page (Bundles widget 2.0 with query-parameter pre-fill, which needs Plus). A headless Next.js / Hydrogen storefront using the JS SDK (also needs Plus).
- **Buyer Experience**: a subscriber assistant (Grok Bot) that handles "skip next month", "swap flavour", "move my delivery", "pause" or "cancel" through Admin API actions (`charges/{id}/skip`, `subscriptions/{id}/set_next_charge_date`, `onetimes`, `subscriptions/{id}/cancel`). This is the same job Concierge SMS does, but on another channel. Cancellation-save offers could use `charges/{id}/apply_discount`.
- **Merchant Tooling**:
  - A churn and dunning copilot. Grok Bot listens to `charge/failed`, `charge/max_retries_reached` and `subscription/cancelled` webhooks and drafts recovery actions or win-back offers for a human to approve.
  - A daily digest using the Analytics MCP, if early access is granted, or computed from the Admin API plus Supabase.
  - A "UK DMCC readiness checker" is also possible. It would audit notification settings and cancellation friction, and compute renewal cooling-off refunds. Recharge documents none of this for the UK, so we would build it ourselves.
- **New Ways to Buy**: this is the listed fit for Recharge. Options include:
  - Subscriptions, prepaid and gift subscriptions.
  - Dynamic pricing (for example an intro price that steps up). The blog reports a $0.99 intro offer retaining "nearly 4x" better than free; that is a vendor claim.
  - Customisable or nested bundles.
  - Add-ons and one-time extras on the next box.
  - Agent-curated monthly boxes, where Grok Bot updates `bundle_selections` or swaps subscription variants before each charge. This needs Plus for bundle selections; variant swaps via `PUT /subscriptions/{id}` do not.
- **Agentic Commerce**:
  - An agent that manages a buyer's subscriptions within guardrails, for example a spend cap or "never add more than one onetime a month". Every action is logged to Supabase.
  - An agent that runs retention for the merchant: it reads `charge/upcoming` and pre-emptively offers a skip or swap.
  - Note Recharge's own view that agents mainly affect the first order. A hack that shows agents acting on the **77% renewal side** would be a counterpoint to that.
- **Where Grok Bot plugs in**:
  - A small custom MCP server wrapping about 10 Admin API calls with a scoped token. This is safer than third-party connectors.
  - A webhook target (Recharge webhook, then a Supabase Edge Function or Grok Bot routine), verified with the timestamped HMAC.
  - The Analytics MCP for aggregate questions.
  - Its cloud browser for merchant-portal-only settings such as notifications, portal and bundles, which have no API.
- **Commerce depth talking points**:
  - Charge versus order versus subscription.
  - Charges merging per address and date.
  - Shopify selling plans and Shopify Checkout Integration versus the deprecated Recharge checkout.
  - Dunning and retries.
  - Leaky-bucket limits.
  - Webhook replay protection.
  - US ARL versus UK DMCC obligations.

## Sources

Official Recharge (read in full or in part):

- https://developer.rechargepayments.com/ (2021-11 API reference: intro, auth, scopes, versioning, pagination, webhooks, webhook validation, subscriptions, charges, bundle selections, checkouts)
- https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_cancel
- https://docs.getrecharge.com/ and https://docs.getrecharge.com/llms.txt
- https://docs.getrecharge.com/docs/api-versions.md
- https://docs.getrecharge.com/docs/api-rate-limits.md
- https://docs.getrecharge.com/docs/storefront-api-and-js-sdk.md
- https://docs.getrecharge.com/docs/webhooks-overview.md
- https://docs.getrecharge.com/docs/understanding-recharge.md
- https://docs.getrecharge.com/docs/subscriptions (via search extract)
- https://storefront.getrecharge.com/client/docs/getting_started/package_setup/ (via search extract)
- https://storefront.getrecharge.com/client/docs/methods/api/auth/ (via search extract)
- https://storefront.getrecharge.com/client/docs/examples/shopify/initialization/ (via search extract)
- https://storefront.getrecharge.com/client/docs/types/interfaces/InitOptions/ (via search extract)
- https://support.getrecharge.com/hc/en-us/articles/360019959353-Creating-a-developer-account
- https://support.getrecharge.com/hc/en-us/articles/360008829993-Recharge-API
- https://support.getrecharge.com/hc/en-us/articles/43339934359319-Recharge-Analytics-MCP-Early-Adopter-Program
- https://support.getrecharge.com/hc/en-us/articles/35919712556055-Understanding-Recharge-AI-Reports
- https://support.getrecharge.com/hc/en-us/articles/360008682914-Recharge-billing-and-pricing
- https://support.getrecharge.com/hc/en-us/articles/6976348401559-Getting-started-with-Bundles
- https://support.getrecharge.com/hc/en-us/articles/11808240171287-Getting-started-with-dynamically-priced-customizable-bundles
- https://support.getrecharge.com/hc/en-us/articles/360058421513-Shopify-Checkout-Integration-overview
- https://support.getrecharge.com/hc/en-us/articles/360008681834-Identifying-your-store-s-Recharge-checkout-platform
- https://support.getrecharge.com/hc/en-us/articles/21665506011287-Using-Recharge-with-Shopify-Hydrogen
- https://support.getrecharge.com/hc/en-us/articles/6600815298327-Automatic-Renewal-Law-ARL-and-Recharge
- https://support.getrecharge.com/hc/en-us/articles/7292531612823-Installing-Recharge (via search extract)
- https://support.getrecharge.com/hc/en-us/articles/1500001877102-Running-a-test-transaction-with-the-Shopify-Checkout-Integration (via search extract)
- https://getrecharge.com/pricing/
- https://getrecharge.com/blog/agentic-commerce-subscriptions/
- https://getrecharge.com/blog/meet-the-ai-agents-powering-the-next-generation-of-subscriptions/ (via search extract)
- https://getrecharge.com/blog/recharge-releases-the-modern-subscriber-experience/ (via search extract)
- https://getrecharge.com/sms/ (via search extract)
- https://changelog.getrecharge.com/

Secondary:

- https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/outcome/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version (via search extract)
- https://cms.law/en/gbr/legal-updates/cancel-culture-uk-subscription-contracts-regime-takes-shape (via search extract)
- https://moresoda.co.uk/articles/the-uks-new-subscription-rules-start-january-2027-what-it-means-for-shopify-merchants-using-recharge (via search extract)
- https://www.shopify.com/nz/partners/blog/development-stores (via search extract)
- https://help.shopify.com/en/manual/checkout-settings/test-orders (via search extract)
- Third-party MCP listings (not endorsements): https://github.com/ChemicalLuck/recharge-mcp-node, https://mcp.pipedream.com/app/recharge, https://zapier.com/mcp/recharge, https://claudeskills.info/mcp/usefulapi/recharge/, https://truto.one/blog/connect-recharge-to-claude-automate-orders-bundles-and-credits/ (all via search extract)
