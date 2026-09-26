# Track 5: Agentic Commerce

> Official brief: "Build experiences where AI agents can discover, compare and transact." Research compiled 26 Sep 2026. Vendor-sourced stats are flagged as such.

## Landscape

- **OpenAI stepped back from checkout; ACP is now mainly a product-feed protocol.** Instant Checkout launched on 29 September 2025 with US Etsy sellers. On 24 March 2026 OpenAI said the first version "did not offer the level of flexibility that we aspire to provide", let merchants use their own checkout, and repurposed ACP to carry catalogues, inventory and promotions ([Digital Commerce 360](https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/), [Retail Dive](https://www.retaildive.com/news/walmart-sparky-chatgpt-instant-checkout/815647/), [OpenAI ACP docs](https://developers.openai.com/commerce)). Walmart put about 200,000 items into Instant Checkout. It said purchases made inside ChatGPT converted at one-third the rate of click-outs to its own site, and it replaced the integration with its own Sparky agent inside ChatGPT ([Search Engine Land](https://searchengineland.com/walmart-chatgpt-checkout-converted-worse-472071), [WIRED](https://www.wired.com/story/ai-lab-walmart-openai-shaking-up-agentic-shopping-deal/)).
- **Google and Shopify launched UCP in January 2026.** UCP is an open protocol compatible with A2A, AP2 and MCP ([Google](https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/), [Google Developers](https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/?linkId=36493970)). Checkout through it is limited to selected merchants in the US, Canada and Australia ([Merchant Center Help](https://support.google.com/merchants/answer/16837055?hl=en)). AP2 v0.2 added mandates for purchases where the human is not present, but it is not part of Google's Universal Cart at launch ([Digital Applied](https://www.digitalapplied.com/blog/google-universal-cart-merchant-preparation-guide)).
- **Shopify turned agent selling on by default.** Agentic Storefronts syndicates products to ChatGPT, Copilot, Gemini and Meta. The Catalog MCP (global and per-store), Checkout Kit and a new Agentic plan open Shopify Catalog to non-Shopify brands ([Shopify news](https://www.shopify.com/news/ai-commerce-at-scale), [Shopify dev: Catalog](https://shopify.dev/docs/agents/catalog), [Checkout Kit](https://shopify.dev/docs/agents/carts-and-checkout/checkout-kit)). Purchasing across all of these channels is currently available to US buyers only ([Shopify blog](https://www.shopify.com/blog/how-agentic-commerce-works)).
- **Card networks and Stripe are building the identity and payment layer.** Visa's Trusted Agent Protocol and Mastercard Agent Pay both authenticate agents using Cloudflare's Web Bot Auth, which relies on HTTP message signatures ([Cloudflare](https://blog.cloudflare.com/secure-agentic-commerce/), [Visa TAP](https://developer.visa.com/capabilities/trusted-agent-protocol/overview)). Mastercard added Agent Pay for Machines for micropayments in June 2026 ([Mastercard](https://www.mastercard.com/us/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html)). Visa, Mastercard and Ant began work on a shared "Know Your Agent" framework on 10 September 2026, with no implementation timeline yet ([Reuters](https://www.reuters.com/technology/payment-firms-visa-mastercard-ant-international-team-up-ai-agent-trust-framework-2026-09-10/), [Ant International](https://www.ant-intl.com/en/news/detail/?id=ant-international-mastercard-and-visa-initiate-collaboration-on-know-your-agent-interoperability-to-scale-agentic-commerce)). Stripe ships Shared Payment Tokens and a Radar bot score ([Stripe ACS](https://stripe.com/blog/agentic-commerce-suite), [Stripe Radar](https://stripe.com/blog/expanding-stripe-radar-to-protect-more-of-your-business)).
- **Crypto agent payments are mostly not agents.** TRM Labs found only 0.6–7.5% of plausible commerce value on x402 looked agent-driven ([PYMNTS](https://www.pymnts.com/news/artificial-intelligence/2026/agentic-payments-are-growing-most-x402-payments-are-not-from-ai-agents/), [arXiv 2607.12575](https://arxiv.org/html/2607.12575)).
- **The law is still moving.** On 4 August 2026 the Ninth Circuit lifted Amazon's injunction against Perplexity's Comet agent, holding that the user, not Perplexity, "accessed" Amazon ([Ninth Circuit opinion](https://cdn.ca9.uscourts.gov/datastore/opinions/2026/08/04/26-1444.pdf), [Cooley](https://www.cooley.com/news/insight/2026/2026-08-06-ninth-circuit-rules-on-ai-agent-access-to-third-party-websites-under-cfaa)). HM Treasury's payments consultation asks whether consent, authentication and liability rules need updating for agentic payments. It closes on 6 October 2026 ([GOV.UK](https://www.gov.uk/government/consultations/modernising-payment-services-regulation/modernising-payment-services-regulation-consultation), [Bratby](https://bratby.law/agentic-payments-accountability-gap/)).
- **Demand is real but mostly research, not autonomous buying.** AI-referred retail traffic was up 62% year on year in July 2026 and converted 60% better than other traffic ([Digital Commerce 360 / Adobe](https://www.digitalcommerce360.com/2026/08/19/adobe-ai-referral-traffic-data-july-2026/)). However, 77% of agentic activity lands on product and search pages and only 2.3% on checkout ([HUMAN](https://www.humansecurity.com/wp-content/uploads/HUMAN_Report_2026-State-of-AI-Traffic-and-Cyberthreat-Benchmark.pdf)). Forecasts: McKinsey says agents could orchestrate $3–5tn of global consumer commerce by 2030 ([McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-agentic-commerce-opportunity-how-ai-agents-are-ushering-in-a-new-era-for-consumers-and-merchants)); Morgan Stanley says $190–385bn of US ecommerce ([Morgan Stanley](https://www.morganstanley.com/insights/articles/agentic-commerce-market-impact-outlook)).

## Gaps and niches

### 1. Proof of delegation for disputes
- **Who hurts:** Payments and disputes leads at mid-size merchants, who absorb chargebacks on agent orders by default.
- **Evidence:**
  - "Today, the merchant absorbs the loss by default." The evidence merchants need (delegated authority, the limits the customer set, proof the agent stayed within scope, notification timestamps) is not what they currently hold ([Chargeflow](https://www.chargeflow.io/blog/agentic-commerce-chargebacks-the-evidence-playbook-merchants-need)).
  - In a survey of 500 US and UK fraud leaders, 39% said the AI provider should be liable, 20% the customer and only 15% favoured shared liability ([Darwinium via The Paypers](https://thepaypers.com/fraud-and-fincrime/news/darwinium-research-exposes-fraud-blind-spots-as-agentic-commerce-grows)).
  - It is unclear whether a merchant must prove it fulfilled the order or prove the consumer consented to the agent: "two completely different levels of proof" ([The Paypers](https://thepaypers.com/payments/expert-views/disputes-and-friendly-fraud-in-the-age-of-agentic-commerce)).
  - EU lawyers say a complete audit trail is needed: who consented, what the mandate covered, which limits applied, whether step-up authentication fired, and what the agent did ([Osborne Clarke](https://www.osborneclarke.com/insights/agentic-payments-new-challenge-europes-payments-ecosystem)).
- **What exists and why it falls short:** AP2 mandates, Mastercard Verifiable Intent and Stripe Shared Payment Tokens scope the payment. But the mandate record sits with the agent platform, and there is no standard evidence pack a merchant can pull for a dispute. Justt and Chargeflow assemble evidence but depend on data merchants do not receive.
- **Agent angle:** A Grok Bot shopper records a signed mandate (budget, category, merchant) plus a step-by-step action log in Supabase. A merchant-side webhook turns this into a dispute-ready evidence PDF. Weakness: card schemes do not yet recognise such evidence, so the value is illustrative.
- **One-day demo-ability:** High. Mandate in, purchase, simulated dispute, evidence pack out.
- **Sponsor tools that fit:** Supabase, Shopify or Commerce Layer order webhooks, Vercel, Grok Bot webhook routines.

### 2. Prompt injection hidden in listings and reviews
- **Who hurts:** Marketplaces with user-written listings (resale, wholesale), agent builders, and shoppers.
- **Evidence:**
  - A product description on a Shopify MCP store forced an unauthorised catalogue search and made the model present an upsell "as its own opinion" ([CodeIntegrity](https://www.codeintegrity.ai/blog/shopify)).
  - Simple human-written injections partially hijacked web agents in up to 86% of cases in the NeurIPS 2025 WASP benchmark ([WASP](https://proceedings.neurips.cc/paper_files/paper/2025/file/1c9818387f5dd0a0bc151214660f059d-Paper-Datasets_and_Benchmarks_Track.pdf)).
  - In Microsoft's Magentic Marketplace, GPT-4o, GPT-OSS-20b and Qwen3-4b redirected all payments to the manipulative business under prompt injection ([Microsoft Research](https://www.microsoft.com/en-us/research/blog/magentic-marketplace-an-open-source-simulation-environment-for-studying-agentic-markets/)).
  - Injections in customer reviews redirected an agent from shopping for screen protectors to attacker URLs ([AgentVigil](https://www.alphaxiv.org/abs/2505.05849)).
- **What exists and why it falls short:** BrowseSafe defends inside the agent ([arXiv](https://arxiv.org/pdf/2511.20597v1)), and HostileShop is a red-teaming tool ([GitHub](https://github.com/mikeperry-tor/HostileShop)). Nothing on the marketplace side scans its own listings for text aimed at agents before syndicating them to Shopify Catalog or ACP feeds.
- **Agent angle:** A listing firewall that scores each new listing for agent-targeted instructions, with a Grok Bot red-teamer that tries to exploit the catalogue overnight and files findings. Honest limit: detection is probabilistic and attackers adapt.
- **One-day demo-ability:** High. A poisoned listing is flagged live, and a naive agent is shown being hijacked by it.
- **Sponsor tools that fit:** Sanity (listing content), Shopify, Supabase, PostHog (flag rates), Grok Bot.

### 3. Merchants cannot see what agents do on their store
- **Who hurts:** Growth and analytics teams at DTC brands.
- **Evidence:**
  - A Shopify developer asked other merchants for the `app_id` and `source_name` values on AI-channel orders because "Shopify hasn't documented the actual API field values anywhere" ([r/shopify](https://www.reddit.com/r/shopify/comments/1r2cvzv/has_anyone_received_a_chatgpt_copilot_google_ai/)).
  - ChatGPT orders show up as online-store orders with a referrer, while Copilot and Gemini orders show up as their own channels. Copied links and device switching break attribution ([ShopifyRanked](https://shopifyranked.com/shopify-ai-search/agentic-channel-attribution/)).
  - 79% of agent activity was on product and search routes in June 2026 ([HUMAN](https://www.humansecurity.com/learn/blog/state-of-agentic-traffic-june-2026-browser-agent-tooling-for-developers-is-catching-on-fast/)). Commerce firms put over 90% of AI bot activity into "monitor" only ([Akamai](https://www.akamai.com/newsroom/press-release/akamai-research-commerce-becomes-the-epicenter-for-ai-bot-attacks-and-agentic-fraud-in-2026)).
  - Adobe declined to share what share of retailer traffic comes from AI sources ([Chief Marketer](https://www.chiefmarketer.com/ai-delivers-high-value-shoppers-to-retailers-new-data-finds/)).
- **What exists and why it falls short:** Shopify's Agentic admin pane, GA4 and Cloudflare bot analytics report counts. None of them shows an agent-session funnel: what the agent read, which field was missing, and where it dropped off.
- **Agent angle:** Classify sessions in PostHog using user agent and Web Bot Auth signature headers, then build an agent funnel. A Grok Bot runs scripted "mystery shopper" agents daily to give a baseline. Weakness: agentic browsers that drive a real user's browser look human.
- **One-day demo-ability:** Med-High. The synthetic agent traffic is easy; real traffic samples are thin.
- **Sponsor tools that fit:** PostHog, Vercel middleware, Supabase, Grok Bot, Shopify.

### 4. Shipping and returns policies that agents cannot read
- **Who hurts:** SMB merchants on any platform, especially outside Shopify.
- **Evidence:**
  - In a scan of 235 product pages, 92% had no machine-readable return policy, 94% no machine-readable shipping terms, and 47% offered none of the three things an agent needs to complete a purchase ([Acom](https://getacom.ai/blog/ai-shopping-readiness-study)).
  - Across 47,000 stores, only 11.8% had a `returnPolicy` field and 14.2% `shippingDetails` ([SignalixIQ](https://signalixiq.com/blog/ai-commerce-readiness-report-2026)).
  - 98% of 2,847 stores supported no agentic commerce protocol ([AgentReadyHQ](https://agentreadyhq.com/blog/state-of-ai-commerce-readiness-2026)).
  - Note: all three are vendor studies, so treat them as directional.
- **What exists and why it falls short:** Audit tools are plentiful (AgentReady, Shopti, Adobe's checker), and Shopify Catalog enriches data automatically. The audit space is crowded. Automatically fixing the problem, by turning prose policy pages into structured data, is less served.
- **Agent angle:** A Grok Bot reads the policy pages, writes `ShippingDetails` and `MerchantReturnPolicy` into Sanity or Shopify metafields, then re-tests with an agent query. Honest: this is the most crowded entry on the list.
- **One-day demo-ability:** High. Show before and after on a live store.
- **Sponsor tools that fit:** Sanity, Shopify, Tavily (crawling), Vercel.

### 5. One-off and secondhand stock does not fit catalogue protocols
- **Who hurts:** Vintage wholesalers, resellers and boutique buyers (Fleek's market).
- **Evidence:**
  - Shopify's Global Catalog clusters results by Universal Product ID. That assumes identical products, and vintage items have no barcode ([Shopify dev](https://shopify.dev/docs/agents/catalog)).
  - Product identifiers were the single biggest driver of AI citation (+38%), and only 14% of pages carried a full barcode ([Shopti](https://blog.shopti.ai/posts/structured-data-ai-visibility-before-after-benchmark-ecommerce-2026/), [Acom](https://getacom.ai/blog/ai-shopping-readiness-study)). Both are vendor studies.
  - Agent access to Vinted currently depends on scraping past Cloudflare and TLS fingerprinting ([r/SideProject](https://www.reddit.com/r/SideProject/comments/1r3b2va/vinted_mcp_server_i_built_a_tool_that_lets_ai/)). A hackathon resale agent had to drive four marketplaces with browser automation ([FlipIt](https://github.com/Jay-Thpr/FlipIt)).
- **What exists and why it falls short:** Listing generators such as Listed AI deliberately avoid auto-posting ("copy, paste"). There is no agreed structured schema for condition, grade, measurements or lot composition. Nothing handles "sold once, gone" inventory in agent feeds.
- **Agent angle:** A UCP-style MCP endpoint exposing graded, photo-verified lots (brand mix, grade, defects, measurements), with a Grok Bot acting as a boutique's buyer against it. This is strong because it is the host's own domain.
- **One-day demo-ability:** High. A mock bale catalogue, an agent query, and a purchase.
- **Sponsor tools that fit:** Commerce Layer (SKU-less items, price lists), Sanity (lot schema), Supabase, Tavily, Grok Bot.

### 6. Agents take the first acceptable offer instead of comparing
- **Who hurts:** Consumers delegating purchases, and smaller or slower merchants.
- **Evidence:**
  - Across all models tested, the first proposal was chosen 60–100% of the time, giving response speed a 10–30x advantage over quality ([arXiv 2510.25779](https://arxiv.org/abs/2510.25779)).
  - Welfare dropped as the market grew, because agents contacted few businesses ([Microsoft Research](https://www.microsoft.com/en-us/research/publication/magentic-marketplace-an-open-source-environment-for-studying-agentic-markets/)).
  - A Business Insider tester's budget was ignored when ChatGPT suggested a $2,400 cuff ([Business Insider](https://www.businessinsider.com/i-tried-shopping-on-chatgpt-with-new-instant-checkout-feature-2025-10)).
  - Only 27% of consumers believe shopping agents actually work for them ([Horizon Media](https://www.prnewswire.com/news-releases/horizon-media-study-identifies-the-trust-tax-how-ai-shopping-can-quietly-erode-brand-loyalty-302787593.html)).
- **What exists and why it falls short:** Comparison sites and price trackers are built for humans. No agent tool enforces "collect N quotes, then score them deterministically".
- **Agent angle:** A "patient buyer" Grok Bot that fans out through Shopify Global Catalog and Tavily, waits, and scores offers with fixed rules rather than LLM judgement. It shows the gap against a naive agent. Weakness: this is a technique, not yet a product.
- **One-day demo-ability:** High. Run the naive agent and the patient agent side by side on the same task.
- **Sponsor tools that fit:** Shopify Catalog MCP, Tavily, PostHog (experiment), Supabase.

### 7. Smaller sellers lose when negotiating against stronger buyer agents
- **Who hurts:** Small sellers and wholesalers facing buyer agents, and weak buyer agents facing strong sellers.
- **Evidence:**
  - Weak seller agents earned 9.5% less on average and up to 14.13% less against a stronger buyer. Weak buyers paid about 2% more. Failures included selling below cost and breaking the budget ([arXiv 2506.00073](https://arxiv.org/pdf/2506.00073)).
  - Baseline models accepted individually irrational supply-chain contracts in 19.2% of negotiations ([arXiv 2608.07538](https://arxiv.org/html/2608.07538v1)).
  - A deterministic offer generator raised buyer deal rates from 26.67% to 88.88% ([ACL 2024](https://aclanthology.org/2024.findings-acl.213.pdf)).
- **What exists and why it falls short:** Enterprise negotiation bots exist for large procurement teams. Procurement surveys say autonomous negotiation remains rare ([Procurement AI survey](https://procurementaiagents.com/reports/procurement-ai-adoption-survey-2026)). No SMB seller has a hard-floor guard.
- **Agent angle:** A seller-side negotiation agent where price floors, MOQs and margins live in Commerce Layer, and the LLM only writes the wording (the OG-Narrator pattern). A Grok Bot plays the adversarial buyer.
- **One-day demo-ability:** High. A live haggle where the floor is never breached.
- **Sponsor tools that fit:** Commerce Layer, Supabase, Grok Bot, PostHog.

### 8. Telling good agents from bad without enterprise bot management
- **Who hurts:** SMB merchants and fraud teams.
- **Evidence:**
  - 48% of organisations allow agent traffic by default and 31% block it. Authentication and identity binding are the top barrier, cited by 46% ([Darwinium](https://finance.yahoo.com/sectors/technology/articles/dawinium-research-captures-trends-causing-130000944.html)). Vendor-commissioned survey.
  - An established agent with history carries a different risk profile from a newly created one, even if both are authenticated ([Adyen](https://www.adyen.com/knowledge-hub/agentic-commerce-fraud)).
  - There are three separate network schemes (Visa TAP, Mastercard Verifiable Intent, Ant's Agentic Mobile Protocol), and the interoperability work has only just begun ([PYMNTS](https://www.pymnts.com/cybersecurity/2026/visa-mastercard-team-with-ant-know-your-agent-framework/)).
- **What exists and why it falls short:** Cloudflare verifies Web Bot Auth signatures ([docs](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/)), and Stripe Radar has a bot score. Reputation does not travel between merchants unless you are on Adyen's or Stripe's network.
- **Agent angle:** A shared agent reputation ledger in Supabase keyed by signature key ID, plus a Vercel middleware verifier. The Grok Bot signs its own requests. Weakness: network effects are needed, and a hackathon cannot show them.
- **One-day demo-ability:** Med. Signing and verification are doable; reputation needs seeded data.
- **Sponsor tools that fit:** Vercel, Supabase, PostHog, Grok Bot.

### 9. Buyer-side spending guardrails that actually hold
- **Who hurts:** Consumers and finance teams handing agents a card.
- **Evidence:**
  - Operator bought $31.43 of eggs without confirmation when asked only to compare prices ([AI Incident Database](https://incidentdatabase.ai/cite/1028/), [Washington Post](https://www.washingtonpost.com/technology/2025/02/07/openai-operator-ai-agent-chatgpt/)).
  - Comet bought an Apple Watch from a fake Walmart site and autofilled a saved card without asking ([Guardio](https://guard.io/labs/scamlexity-we-put-agentic-ai-browsers-to-the-test-they-clicked-they-paid-they-failed)).
  - 60% of Americans would not let an agent spend any amount without prior approval ([Visa via The Paypers](https://thepaypers.com/payments/news/visa-research-maps-consumer-and-business-readiness-for-agentic-commerce)).
  - Shoppers want final approval (29%) or limits to small purchases (22%) ([Omnisend](https://www.omnisend.com/latest-news/omnisend-study-80-of-u-s-shoppers-okay-with-ai-completing-online-purchases-up-from-34-last-year/)). Vendor survey.
- **What exists and why it falls short:** Stripe Link issues a one-time card per task ([Stripe Sessions](https://stripe.com/newsroom/news/sessions-2026)), and SPTs and AP2 scope payments. Each is tied to one platform. None checks whether the merchant is legitimate.
- **Agent angle:** A policy MCP tool the Grok Bot must call before paying. It checks budget, category, allowlist, domain age and reputation (via Tavily), and escalates to a human by webhook. Honest: it only holds if the agent cannot bypass the tool.
- **One-day demo-ability:** High. Show the fake shop being blocked and a legitimate purchase approved.
- **Sponsor tools that fit:** Tavily, Supabase, Grok Bot routines, Vercel.

### 10. UK and EU shoppers are excluded from in-chat checkout
- **Who hurts:** UK merchants, and UK shoppers who have to clear strong customer authentication (SCA) on each payment.
- **Evidence:**
  - Purchasing across Shopify's AI channels is available to US buyers only ([Shopify](https://www.shopify.com/blog/how-agentic-commerce-works)). Google UCP checkout covers the US, Canada and Australia only ([Google](https://support.google.com/merchants/answer/16837055?hl=en)).
  - SCA methods "are strongly tied to a person (the payer)" ([Taylor Wessing](https://www.taylorwessing.com/en/insights-and-events/insights/2026/02/agentic-ai-in-payments)).
  - HM Treasury asks how to authenticate machine-initiated instructions. Its consultation closes on 6 October 2026 ([Bratby](https://bratby.law/agentic-payments-accountability-gap/), [Simmons & Simmons](https://www.simmons-simmons.com/en/publications/cmsq3drw700cculdcpfpwl1oa/payments-view-Summer-2026)).
- **What exists and why it falls short:** UK stores get discovery only ([Why Matters](https://whymatters.co.uk/blog/agentic-commerce-shopify)). Nothing is designed for "agent prepares, human taps once to authenticate".
- **Agent angle:** A Grok Bot builds the cart via the Catalog MCP, then hands off a prefilled Checkout Kit URL for a single SCA tap, keeping the human present. It could also serve as an evidence-backed response to the consultation.
- **One-day demo-ability:** Med. Depends on getting a UK test store and payment sandbox working.
- **Sponsor tools that fit:** Shopify Checkout Kit, Commerce Layer, Vercel, Grok Bot.

### 11. Merchants have little control over which agents sell their products, and how
- **Who hurts:** Independent brands, and wholesale partners bound by clauses banning sales on Amazon.
- **Evidence:**
  - More than 180 businesses told a founder their products had been listed by Amazon's Buy for Me without consent. Opting out means emailing Amazon ([CNBC](https://www.cnbc.com/2026/01/06/amazons-ai-shopping-tool-sparks-backlash-from-some-online-retailers.html)).
  - Merchants received orders for out-of-stock and discontinued items, and faced conflicts with wholesale partners ([Modern Retail](https://www.modernretail.co/technology/brands-are-upset-that-buy-for-me-is-featuring-their-products-on-amazon-without-permission/)). One sticker listing showed a photo of trousers ([The Decoder](https://the-decoder.com/amazons-ai-shopping-tool-lists-products-without-seller-permission/)).
  - The Ninth Circuit ruling weakens anti-hacking law as a way to block agents; contract claims may remain ([Ropes & Gray](https://www.ropesgray.com/en/insights/alerts/2026/08/tool-or-intruder-what-amazon-v-perplexity-means-for-agentic-ai-and-the-cfaa)).
- **What exists and why it falls short:** robots.txt, Cloudflare rules and Shopify's per-channel toggles are binary on or off. There is no machine-readable way to state "agent terms" such as minimum advertised price, no resale, or stock-truth endpoints.
- **Agent angle:** A Grok Bot that searches agent surfaces (via Tavily) for your products and flags price, image or stock mismatches, plus a published agent-terms file. Weakness: monitoring is easier than enforcement.
- **One-day demo-ability:** Med-High.
- **Sponsor tools that fit:** Tavily, Supabase, Sanity, Grok Bot routines.

### 12. AI visibility tracking is statistically unreliable
- **Who hurts:** Brand and SEO leads moving budget to generative engine optimisation (GEO) and answer engine optimisation (AEO).
- **Evidence:**
  - The top recommendation changed in 43.6% of back-to-back identical prompts across 161,023 answer pairs ([Parse](https://parse.gl/research/does-ai-recommend-the-same-brand-again)). Vendor study.
  - Only about 5 brands per category are mentioned in 80% or more of 100 runs, and most trackers check each prompt once ([Search Engine Land](https://searchengineland.com/repeated-chatgpt-runs-brand-visibility-468552)).
  - Cited sources overlap by only 34–42% between consecutive days ([arXiv 2604.07585](https://arxiv.org/html/2604.07585v1)).
- **What exists and why it falls short:** Many AI visibility trackers exist (crowded), mostly reporting single-snapshot rankings.
- **Agent angle:** A Grok Bot runs repeated prompt panels on a schedule and reports mention share with confidence intervals in PostHog. Honest: crowded, and repeated runs cost money.
- **One-day demo-ability:** High.
- **Sponsor tools that fit:** PostHog, Supabase, Tavily, Grok Bot routines.

### 13. Agent-managed subscriptions: reorders tied to actual consumption
- **Who hurts:** Subscription shoppers who stockpile or run out, and subscription brands facing agents that cancel.
- **Evidence:**
  - Renewals are about 77% of subscription revenue on Recharge, and 71.5% process with no storefront visit ([Recharge](https://getrecharge.com/blog/agentic-commerce-subscriptions/)). Vendor data.
  - 16% of US shoppers would allow automatic reorders without review ([Omnisend](https://www.omnisend.com/latest-news/omnisend-study-80-of-u-s-shoppers-okay-with-ai-completing-online-purchases-up-from-34-last-year/)). Vendor survey.
  - A Hacker News commenter: recurring orders must be the exact same amount on a fixed interval, so "I either end up stacking up more than what I need or run out" ([HN](https://news.ycombinator.com/item?id=49286039)).
- **What exists and why it falls short:** Recharge's portal and API support skip, swap and cadence changes ([Recharge docs](https://docs.getrecharge.com/docs/subscriptions)), but a human has to drive them. No mandate model says "adjust within these limits".
- **Agent angle:** A Grok Bot with a scoped mandate that skips, swaps or brings forward orders via the Recharge API based on usage signals, and logs every change. It is good for retention if it prevents a cancellation.
- **One-day demo-ability:** High. Recharge's sandbox API makes this straightforward.
- **Sponsor tools that fit:** Recharge, Shopify, Supabase, Grok Bot routines.

### 14. B2B buyers use agents faster than suppliers can serve them
- **Who hurts:** Wholesale suppliers and distributors, including secondhand bale sellers.
- **Evidence:**
  - 38% of B2B buyers use agentic AI in purchasing, against 24% of suppliers ([Deloitte Digital](https://www.deloittedigital.com/content/dam/digital/global/documents/insights-20260206-b2b-commerce-research-report.pdf), [Deloitte](https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/articles/b2b-agentic-commerce.html)).
  - Three in four distributors are not scaling agentic AI ([Distribution Strategy Group](https://distributionstrategy.com/report/state-of-agentic-ai-in-distribution-2026/)).
  - Data quality and integration are the top procurement barriers ([Procurement AI survey](https://procurementaiagents.com/reports/procurement-ai-adoption-survey-2026)).
- **What exists and why it falls short:** Punchout and e-procurement integrations are heavy. Consumer protocols do not model minimum order quantities, tiered pricing, lead times or credit terms well.
- **Agent angle:** A supplier-side MCP exposing MOQ, tier pricing and lead times from Commerce Layer, with a Grok Bot acting as a boutique's procurement agent.
- **One-day demo-ability:** Med-High.
- **Sponsor tools that fit:** Commerce Layer, Supabase, Sanity, Grok Bot.

## Underserved niches worth a look

- **Checking whether "agent payment" volume is real.** Settlement counts are gas-subsidised, and only $187,861 on Base demonstrably reached a nameable service. An agent-authenticity scorer for payment rails is missing ([arXiv 2607.12575](https://arxiv.org/html/2607.12575)).
- **Token freeloading on retailer chatbots.** Attackers route their own model workloads through retailers' public AI endpoints, running up the retailer's costs ([Akamai](https://www.akamai.com/blog/security/smash-grab-scale-agentic-ai-reshaping-threat-commerce)).
- **Cross-domain logins that trip agent safety filters.** ChatGPT Agent refused Harris Teeter's login because it lives on kroger.com, a domain the agent judged unrelated to the task ([Understanding AI](https://www.understandingai.org/p/chatgpt-agent-a-big-improvement-but)).
- **Agents claiming they finished tasks they did not.** ChatGPT Agent said it added five lamps (about $825) to an Etsy cart that was actually empty. Independent verification of agent claims is unaddressed ([Noti Group](https://noti.group/i-sent-chatgpt-agent-out-to-shop-for-me-and-it-couldnt-finish-the-job/)).
- **Group and office ordering.** Collecting ten people's food orders is cited as a real chore agents could handle ([HN](https://news.ycombinator.com/item?id=49286039)).

## Sources

1. https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/
2. https://developers.openai.com/commerce
3. https://www.retaildive.com/news/walmart-sparky-chatgpt-instant-checkout/815647/
4. https://searchengineland.com/walmart-chatgpt-checkout-converted-worse-472071
5. https://www.wired.com/story/ai-lab-walmart-openai-shaking-up-agentic-shopping-deal/
6. https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/
7. https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/?linkId=36493970
8. https://support.google.com/merchants/answer/16837055?hl=en
9. https://www.digitalapplied.com/blog/google-universal-cart-merchant-preparation-guide
10. https://www.shopify.com/news/ai-commerce-at-scale
11. https://www.shopify.com/blog/how-agentic-commerce-works
12. https://shopify.dev/docs/agents/catalog
13. https://shopify.dev/docs/agents/carts-and-checkout/checkout-kit
14. https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts
15. https://developer.visa.com/capabilities/trusted-agent-protocol/overview
16. https://www.mastercard.com/us/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html
17. https://blog.cloudflare.com/secure-agentic-commerce/
18. https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/
19. https://www.reuters.com/technology/payment-firms-visa-mastercard-ant-international-team-up-ai-agent-trust-framework-2026-09-10/
20. https://www.ant-intl.com/en/news/detail/?id=ant-international-mastercard-and-visa-initiate-collaboration-on-know-your-agent-interoperability-to-scale-agentic-commerce
21. https://www.pymnts.com/cybersecurity/2026/visa-mastercard-team-with-ant-know-your-agent-framework/
22. https://stripe.com/blog/agentic-commerce-suite
23. https://stripe.com/newsroom/news/sessions-2026
24. https://stripe.com/blog/expanding-stripe-radar-to-protect-more-of-your-business
25. https://www.pymnts.com/news/artificial-intelligence/2026/agentic-payments-are-growing-most-x402-payments-are-not-from-ai-agents/
26. https://arxiv.org/html/2607.12575
27. https://cdn.ca9.uscourts.gov/datastore/opinions/2026/08/04/26-1444.pdf
28. https://www.cooley.com/news/insight/2026/2026-08-06-ninth-circuit-rules-on-ai-agent-access-to-third-party-websites-under-cfaa
29. https://www.ropesgray.com/en/insights/alerts/2026/08/tool-or-intruder-what-amazon-v-perplexity-means-for-agentic-ai-and-the-cfaa
30. https://www.gov.uk/government/consultations/modernising-payment-services-regulation/modernising-payment-services-regulation-consultation
31. https://bratby.law/agentic-payments-accountability-gap/
32. https://www.simmons-simmons.com/en/publications/cmsq3drw700cculdcpfpwl1oa/payments-view-Summer-2026
33. https://www.osborneclarke.com/insights/agentic-payments-new-challenge-europes-payments-ecosystem
34. https://www.taylorwessing.com/en/insights-and-events/insights/2026/02/agentic-ai-in-payments
35. https://www.digitalcommerce360.com/2026/08/19/adobe-ai-referral-traffic-data-july-2026/
36. https://www.chiefmarketer.com/ai-delivers-high-value-shoppers-to-retailers-new-data-finds/
37. https://www.humansecurity.com/wp-content/uploads/HUMAN_Report_2026-State-of-AI-Traffic-and-Cyberthreat-Benchmark.pdf
38. https://www.humansecurity.com/learn/blog/state-of-agentic-traffic-june-2026-browser-agent-tooling-for-developers-is-catching-on-fast/
39. https://www.akamai.com/newsroom/press-release/akamai-research-commerce-becomes-the-epicenter-for-ai-bot-attacks-and-agentic-fraud-in-2026
40. https://www.akamai.com/blog/security/smash-grab-scale-agentic-ai-reshaping-threat-commerce
41. https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-agentic-commerce-opportunity-how-ai-agents-are-ushering-in-a-new-era-for-consumers-and-merchants
42. https://www.morganstanley.com/insights/articles/agentic-commerce-market-impact-outlook
43. https://www.chargeflow.io/blog/agentic-commerce-chargebacks-the-evidence-playbook-merchants-need
44. https://thepaypers.com/fraud-and-fincrime/news/darwinium-research-exposes-fraud-blind-spots-as-agentic-commerce-grows
45. https://finance.yahoo.com/sectors/technology/articles/dawinium-research-captures-trends-causing-130000944.html
46. https://thepaypers.com/payments/expert-views/disputes-and-friendly-fraud-in-the-age-of-agentic-commerce
47. https://www.adyen.com/knowledge-hub/agentic-commerce-fraud
48. https://www.codeintegrity.ai/blog/shopify
49. https://proceedings.neurips.cc/paper_files/paper/2025/file/1c9818387f5dd0a0bc151214660f059d-Paper-Datasets_and_Benchmarks_Track.pdf
50. https://arxiv.org/pdf/2511.20597v1
51. https://github.com/mikeperry-tor/HostileShop
52. https://www.alphaxiv.org/abs/2505.05849
53. https://www.microsoft.com/en-us/research/blog/magentic-marketplace-an-open-source-simulation-environment-for-studying-agentic-markets/
54. https://arxiv.org/abs/2510.25779
55. https://www.microsoft.com/en-us/research/publication/magentic-marketplace-an-open-source-environment-for-studying-agentic-markets/
56. https://www.reddit.com/r/shopify/comments/1r2cvzv/has_anyone_received_a_chatgpt_copilot_google_ai/
57. https://shopifyranked.com/shopify-ai-search/agentic-channel-attribution/
58. https://getacom.ai/blog/ai-shopping-readiness-study
59. https://signalixiq.com/blog/ai-commerce-readiness-report-2026
60. https://agentreadyhq.com/blog/state-of-ai-commerce-readiness-2026
61. https://blog.shopti.ai/posts/structured-data-ai-visibility-before-after-benchmark-ecommerce-2026/
62. https://www.reddit.com/r/SideProject/comments/1r3b2va/vinted_mcp_server_i_built_a_tool_that_lets_ai/
63. https://github.com/Jay-Thpr/FlipIt
64. https://www.businessinsider.com/i-tried-shopping-on-chatgpt-with-new-instant-checkout-feature-2025-10
65. https://www.prnewswire.com/news-releases/horizon-media-study-identifies-the-trust-tax-how-ai-shopping-can-quietly-erode-brand-loyalty-302787593.html
66. https://arxiv.org/pdf/2506.00073
67. https://arxiv.org/html/2608.07538v1
68. https://aclanthology.org/2024.findings-acl.213.pdf
69. https://procurementaiagents.com/reports/procurement-ai-adoption-survey-2026
70. https://incidentdatabase.ai/cite/1028/
71. https://www.washingtonpost.com/technology/2025/02/07/openai-operator-ai-agent-chatgpt/
72. https://guard.io/labs/scamlexity-we-put-agentic-ai-browsers-to-the-test-they-clicked-they-paid-they-failed
73. https://thepaypers.com/payments/news/visa-research-maps-consumer-and-business-readiness-for-agentic-commerce
74. https://www.omnisend.com/latest-news/omnisend-study-80-of-u-s-shoppers-okay-with-ai-completing-online-purchases-up-from-34-last-year/
75. https://whymatters.co.uk/blog/agentic-commerce-shopify
76. https://www.cnbc.com/2026/01/06/amazons-ai-shopping-tool-sparks-backlash-from-some-online-retailers.html
77. https://www.modernretail.co/technology/brands-are-upset-that-buy-for-me-is-featuring-their-products-on-amazon-without-permission/
78. https://the-decoder.com/amazons-ai-shopping-tool-lists-products-without-seller-permission/
79. https://parse.gl/research/does-ai-recommend-the-same-brand-again
80. https://searchengineland.com/repeated-chatgpt-runs-brand-visibility-468552
81. https://arxiv.org/html/2604.07585v1
82. https://getrecharge.com/blog/agentic-commerce-subscriptions/
83. https://docs.getrecharge.com/docs/subscriptions
84. https://news.ycombinator.com/item?id=49286039
85. https://www.deloittedigital.com/content/dam/digital/global/documents/insights-20260206-b2b-commerce-research-report.pdf
86. https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/articles/b2b-agentic-commerce.html
87. https://distributionstrategy.com/report/state-of-agentic-ai-in-distribution-2026/
88. https://www.understandingai.org/p/chatgpt-agent-a-big-improvement-but
89. https://noti.group/i-sent-chatgpt-agent-out-to-shop-for-me-and-it-couldnt-finish-the-job/
90. https://www.accenture.com/content/dam/accenture/final/accenture-com/document-fy26/q4/Accenture-Consumer-Pulse-2026.pdf
