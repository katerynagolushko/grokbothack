# Wassist

> London start-up that lets brands (mainly Shopify merchants) run an AI sales and support agent on WhatsApp, with a public REST API, TypeScript SDK, CLI and webhooks. Site: [wassist.app](https://wassist.app) · Docs: [docs.wassist.app](https://docs.wassist.app/) · Shopify app: [apps.shopify.com/wassist](https://apps.shopify.com/wassist) · SDK: [github.com/Wassist/sdk](https://github.com/Wassist/sdk) · LinkedIn: [company/wassist](https://www.linkedin.com/company/wassist)

Research date: 26 Sep 2026.

## What it is

Wassist is a platform for putting an AI agent ("AI ambassador" in their wording) on a brand's WhatsApp number. It started with e-commerce. A merchant enters their store URL or connects Shopify, and Wassist generates an agent that knows the catalogue, policies and orders.

What the agent does, per the homepage and press release:

- **Pre-purchase:** answers product and sizing questions in the brand's voice and recommends products.
- **Checkout "in the chat":** the shopper adds to cart in WhatsApp. Payment runs through the store's own website checkout, shown in-app (press release wording). It is not a separate WhatsApp payment rail.
- **Post-purchase:** order status, delivery changes and returns. The customer's WhatsApp number acts as their login, matched to their store account.
- **Retention:** cart recovery ("what did you think?" rather than "buy now"), restock and new-drop messages based on history, and pulling Instagram/TikTok engagement into WhatsApp.
- **Intent data:** every conversation is structured into "intent data" (for example, top pre-purchase questions) that the brand can feed into content, SEO and "GEO" (visibility in AI search).
- **Human handoff:** to Gorgias, eDesk or the WhatsApp Business app.

The positioning is explicitly against ChatGPT/Google owning shopping conversations. The founder's pitch is that brands should own the conversation in a channel customers already use. The homepage also says customers should always start the chat ("no popups, no spam"). Entry points are a footer link, a floating button or a QR code on packaging.

**Business model:** SaaS subscription plus usage credits. One credit is one agent message.

- **Pricing on wassist.app** (page partly rendered): a £0 tier, Starter at £30/month ex VAT, a £300/month ex VAT tier (name not visible), and Business at custom pricing. Messages cost £0.0025–£0.004 each.
- **Pricing on the Shopify App Store:** Free at $0/month with 10 free conversations a month and 1,000 free credits, then $0.01 per credit. Pro at $299/month with 10,000 free credits, then $0.004 per credit. A phone line uses 1,000 credits a month.

**Named customers:** Hollywood Browzer (beauty) and Round Treasury, both quoted in the funding release. The homepage mixes real customers with "interactive demos generated from public store data" of brands that are not affiliated. Wide Fit Shoes appears there, but it is unclear which group it belongs to.

## Key facts

| Item | Detail |
|---|---|
| Founded | 2025 per the press release. LinkedIn company data says 2026, and the founder's LinkedIn shows "Founder, Jan 2026 – present". Treat 2025 as the build start and 2026 as the formal start (uncertain). |
| HQ | London |
| Founder / CEO | Josh Warwick (solo founder) |
| Legal entity | Wassist Technology Limited (from the Shopify listing) |
| Funding | $1.1M pre-seed, announced 8 June 2026, led by Playfair. Angels include Paul Forster (Indeed founder), Charlie Songhurst (Meta board member) and Barney Hussey-Yeo (Cleo founder), plus angels from Balderton and Dawn |
| Programmes | Balderton "Launched" programme |
| Team size | 1–10. First hire made around June 2026 |
| Traction | 80,000+ end-user conversations (June 2026), up from 2,000 during the first ten months, with no paid marketing |
| Customer segment | Shopify brands in fashion, lifestyle and homeware (founder's LinkedIn). Playfair also describes SMEs more broadly: bookings, appointments, remarketing |
| Status with Meta | Meta Business Partner (self-described) |
| Shopify app | "Wassist: AI WhatsApp Concierge", launched 21 Aug 2026, 0 reviews at time of reading |
| Competitors named in press | Charles (Berlin, $20M Series A), Wati ($35M total) |

## Products and developer surface

Wassist has a real, public developer surface, and it is well documented. The homepage says "Build on the same APIs we use internally."

**Three ways to put your own code into a WhatsApp conversation** ([Build on Wassist](https://docs.wassist.app/llms.txt)):

1. **Webhook routing.** Every inbound message goes to your HTTPS endpoint as a signed `subscription.message.received` event. You reply with `POST /conversations/{id}/messages/` (header `X-API-Key`). Wassist runs no agent. This suits bringing your own agent (their docs mention LangChain, the OpenAI Agents SDK and Vercel eve).
2. **Managed agent with tools.** Wassist runs the LLM agent, and you give it tools:
   - **API tools:** one HTTP request each, described in a JSON schema. Parameters are either filled by the model or fixed values. Template variables are `%PHONE_NUMBER%`, `%IMAGE_URL%` and `%CALLBACK_URL%`. Requests carry `X-Wassist-Conversation-Id` and `X-Wassist-Contact-Id` headers, and your endpoint has 60 seconds to respond.
   - **Connector tools:** any MCP server over Streamable HTTP, with no auth or with OAuth. The agent gets all the server's tools, filtered by you. Connectors receive no Wassist context.
   - **Website tools, agent handoffs, Shopify stores and support handoff.**
3. **Apps (alpha).** You package an MCP server as a Wassist App. Unlike connectors, its tools receive signed conversation context.

**Bring Your Own Agent (BYOA):** `POST /api/v1/agents/byoa/` with a `webhookUrl`. Each message arrives as `{message, image, phone_number, reply_callback}`. You reply in the response body within about 5 seconds, or POST later to the one-time `reply_callback`, which stays valid for 24 hours. Wassist handles typing indicators, read receipts, media, rate limits, retries and the 24-hour session window.

**Other developer details:**

- **REST API resources:** agents, conversations (read receipts, typing, prompt the agent, per-conversation routing), messages, phone numbers, WhatsApp Business accounts, account-link sessions, WhatsApp templates. There is also a raw proxy to the official WhatsApp Business API (GET/POST/PUT/PATCH/DELETE). An OpenAPI spec is published.
- **SDK:** `@wassist/sdk` (TypeScript). It covers the resources above and includes `Wassist.webhooks.constructEvent` for HMAC-SHA256 signature checks with a 300-second replay tolerance, plus an Edge-runtime variant. The GitHub repo is small (2 stars when read).
- **CLI:** `wassist listen` streams live events locally.
- **Vercel eve channel:** `@wassist/eve` is a drop-in channel.
- **Sandbox number:** you can test from your own phone with no WhatsApp Business account. Sandbox routing has to be set in the dashboard, not by API key.
- **Shopify integration:** read-only access to products, orders and customers. The catalogue syncs every 24 hours. Order lookup is verified by phone-number match or by order number plus email. It can also be created programmatically with `client.onboarding.createFromShopify(...)`.
- **Other integrations named:**
  - Klaviyo, Yotpo, Recharge ("the rest of the Shopify stack")
  - Gorgias, eDesk
  - ElevenLabs voice (listed in the SDK overview)
  - Click-to-WhatsApp ad attribution back to Meta
- **Monetisation features:** message-limit paywalls, purchase links and credit grants. These are aimed at creators as well as brands.
- **WhatsApp constraints the docs call out:** free-form replies only within 24 hours of the customer's last message; after that, an approved template is required. Webhooks should be acknowledged within 10 seconds, with slow LLM work done afterwards.

## AI and agent work

- The core product is an LLM agent. Wassist contrasts it with "rigid, human-built flowcharts" at Wati and Charles (TechFundingNews).
- MCP is supported as both a consumer (Connector tools) and a packaging format (Apps). A customer (Round Treasury) cites "MCP compatibility" as a reason for choosing it.
- The agent can see images the customer sends (`%IMAGE_URL%`, and `media` in webhook events). Voice notes arrive transcribed in `message.body`.
- The "intent data" feature turns conversations into structured demand signals.
- The founder built "Big Tony", a WhatsApp bouncer bot, for the Unicorn Mafia developer community (from his LinkedIn).

## People at this event

**Josh Warwick: founder and CEO, Wassist (co-host and judge)**

- Studied computer science at the University of Oxford (Balliol College, per LinkedIn).
- Theodo UK, 2017–2020: software engineer, then Technical Lead. He built zero-to-one products for Admiral (Veygo), Cleo and ECL.
- Co-founder and CTO of Ark (proptech, property management for landlords) from 2020. LinkedIn says Ark scaled to about $1M ARR, and he is still listed there as co-founder and NED.
- Has been building on WhatsApp since 2023.
- Built Wassist's core at weekend hackathons over about ten months. He is a hackathon regular himself.
- Other roles: core team at Unicorn Mafia (London developer community); Techstars mentor 2023–2025; founding member of The 93% Club for Professionals (a network for state-educated professionals).
- His LinkedIn headline is "WhatsApp Agentic commerce for Shopify brands", and it invites Shopify brands to DM him.

## What they'd likely value as judges (inference)

All of the following is inference from public material, not stated by Wassist.

- **A real merchant or customer problem measured in money.** The site quotes figures such as about £4 of support time per ticket and cart recovery that is "4x more effective than email". He is likely to respond to projects that state a cost or conversion outcome.
- **Conversational commerce done properly.** He is likely to notice whether a chat flow respects the platform's rules: the 24-hour window, opt-in, no spam. His homepage makes "customers choose" a principle.
- **Brand ownership of the customer relationship.** His thesis argues against ChatGPT/Google intermediating. A project that shows the merchant keeping the data or relationship would fit. A project that simply hands shopping to a general assistant may get sharper questions.
- **Shipping speed and a working end-to-end demo.** He built his own product at hackathons, so he may value a live flow over slides.
- **Technical taste.** He is an engineer by background and has built a signed-webhook, MCP-aware API. He is likely to notice clean integration patterns such as webhooks, idempotency and tool schemas.
- **Checkout completion inside the conversation**, which is where Wassist differentiates itself.

## How it could relate to our hack

This is a neutral mapping, not a recommendation.

- **Buyer Experience / Storefront Experience:** WhatsApp as the storefront. It covers product Q&A, sizing and recommendations in chat. The Wassist sandbox allows a live demo from a phone without a WhatsApp Business account.
- **New Ways to Buy:** buying via a messaging thread, with add-to-cart in chat and the website checkout. It could combine with the other tracks' ideas, such as spending approvals or subscription management via chat.
- **Agentic Commerce:**
  - Wassist can consume an MCP server we host as Connector tools, or call our REST endpoints as API tools. A commerce MCP server built for Grok Bot could, in principle, also be plugged into a Wassist agent, giving two agent front-ends on one commerce layer.
  - Alternatively, webhook routing or BYOA would let our own agent (or a Grok Bot routine) be the brain behind a WhatsApp number.
- **Merchant Tooling:**
  - The "intent data" idea (structured pre-purchase questions) overlaps with merchant analytics and content tooling.
  - Human handoff via Gorgias or eDesk overlaps with support tooling.
- **Constraints to be aware of if we used it:**
  - Account sign-up is needed for the API key and sandbox.
  - Replies are limited to the 24-hour window.
  - Our endpoints must respond within 60 seconds for tools, 10 seconds for webhooks and about 5 seconds for BYOA.
  - Shopify access is read-only.
  - Credits cost money beyond the free allowance.
  - We have not tested any of it.

## Sources

Pages fetched and read:

- https://wassist.app
- https://wassist.app/pricing (partly rendered)
- https://wassist.app/news/wassist-raises-1-1m-pre-seed/
- https://techfundingnews.com/openai-wants-shopping-in-chatgpt-wassist-raises-1-1m-to-keep-it-on-whatsapp/
- https://playfair.vc/companies/wassist
- https://apps.shopify.com/wassist
- https://docs.wassist.app/llms.txt
- https://docs.wassist.app/concepts/bring-your-own-agent
- https://docs.wassist.app/guides/configure-tools.md
- https://docs.wassist.app/quickstart/webhook-routing.md
- https://github.com/Wassist/sdk
- https://www.linkedin.com/in/joshwarwick (public profile text)

Read via search-result excerpts only:

- https://docs.wassist.app/ (welcome page)
- https://docs.wassist.app/sdk/overview
- https://docs.wassist.app/api-reference/agents/create
- https://docs.wassist.app/guides/create-agent-shopify
- https://github.com/Wassist/sdk/blob/main/README.md
