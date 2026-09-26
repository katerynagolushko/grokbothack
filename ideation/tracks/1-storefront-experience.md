# Track 1: Storefront Experience

> Official brief: "Build better ways to discover, explore and buy products." Research compiled 26 Sep 2026. Vendor-sourced stats are flagged as such.

## Landscape

- **Shopping is moving into AI answer engines, and the traffic converts.** Adobe measured generative-AI referrals to US retail sites up 693% year on year over the 2025 holidays. Those visits converted 31% better than other traffic ([Adobe](https://business.adobe.com/blog/ai-driven-traffic-surges-across-industries), [Marketing Dive](https://www.marketingdive.com/news/ai-has-changed-holiday-shopping-heres-what-the-numbers-say/810265/)). Amazon says more than 250 million customers used Rufus in 2025, and that users were over 60% more likely to buy ([About Amazon](http://www.aboutamazon.com/news/retail/amazon-rufus-ai-assistant-personalized-shopping-features)).
- **The storefront now has two audiences: people and agents.** Shopify's Agentic Storefronts pushes catalogues into ChatGPT, Copilot, Google AI Mode/Gemini and Meta by default. UCP, co-developed with Google, covers cart, checkout and post-purchase ([Shopify](https://www.shopify.com/news/ai-commerce-at-scale), [Shopify Help](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements), [Shopify Engineering](https://shopify.engineering/UCP)). HUMAN found 77% of agentic AI activity lands on product and search pages ([HUMAN](https://www.humansecurity.com/learn/resources/2026-state-of-ai-traffic-cyberthreat-benchmarks/)).
- **Merchants are not ready for agents.** Only 15% of merchants have structured data ready for agents, and 23% can identify AI-driven traffic ([Visa Acceptance / PYMNTS](https://www.visaacceptance.com/content/dam/documents/campaign/shopping-index/2026-global-digital-shopping-index-agentic-edition.pdf)). OpenAI has reportedly scaled back in-chat checkout because keeping live prices and stock accurate proved hard ([Yahoo/Futurism via The Information](https://nz.finance.yahoo.com/news/openai-pivot-shopping-disaster-164500492.html)).
- **Basic onsite discovery is still broken and has barely moved.** Baymard's 2026 benchmark rates 56% of sites mediocre or worse on search ([Baymard](https://baymard.com/research-articles/ecommerce-search-query-types)). In Constructor/Shopify's 2025 survey, 68% of shoppers said retailer search needs an upgrade, the same as the previous year, and 66% go to Amazon when results disappoint ([Constructor](https://constructor.com/blog/top-takeaways-state-of-ecommerce-2025)).
- **Shoppers use AI but don't trust it.** 86% of shoppers who used AI for research checked its recommendation elsewhere before buying ([Product.ai](https://product.ai/research/trust-in-ai-commerce-report/)). Three-quarters are uncomfortable letting an agent pay on their own ([Forrester](https://www.forrester.com/blogs/consumers-arent-ready-to-delegate-payments-to-ai-agents/)). Trust drops steeply as the task moves from "search and compare" (56% willing) to "use my saved card" (35%) ([Visa Acceptance](https://www.visaacceptance.com/content/dam/documents/campaign/shopping-index/2026-global-digital-shopping-index-agentic-edition.pdf)).
- **Some brands are pulling back from headless.** Agencies put three-year total cost of a headless Shopify build at roughly 2–3x a native build ([Ask Phill](https://askphill.com/blogs/blog/shopify-headless)). Dermalogica moved from a heavily customised theme to Shopify's Horizon theme and reported a 9% conversion lift and £30k a year in savings ([Shopify case study](https://www.shopify.com/case-studies/dermalogica-horizon-theme)).

## Gaps and niches

### 1. **Search that fails on how people actually type**
**Who hurts:** Shopify SMB merchants with 500–10,000 SKUs who can't afford Algolia or Constructor, and their shoppers who type use-case, feature or part-code queries.

**Evidence**
- In Baymard's 2026 benchmark, 43% of sites have issues with "use case" queries, 54% with abbreviations and symbols, and 66% with non-product queries ([Baymard](https://baymard.com/research-articles/ecommerce-search-query-types)). 88% of mobile sites have "no results" pages with no help based on the user's context ([Baymard](https://baymard.com/blog/mobile-ecommerce-search-and-navigation)).
- 86% of shoppers say they have to reformulate queries at least sometimes ([Constructor 2025 PDF](https://info.constructor.com/hubfs/2025-state-of-ecommerce.pdf)). Searchers are 24% of visitors but drive 44% of revenue ([Constructor/PR Newswire](https://www.prnewswire.com/news-releases/shoppers-who-search-on-ecommerce-sites-drive-nearly-half-of-online-revenue-according-to-new-constructor-study-302394501.html)). Both are vendor-sourced.
- One merchant reported that an exact product title returned 395 results after an upgrade, with "0 synonyms, 0 boosts" configured ([r/shopify](https://www.reddit.com/r/shopify/comments/1uf4iv8/storefront_search_went_haywire_after_shopify_plus/)). Another thread notes that nothing in analytics flags this ([r/shopify](https://www.reddit.com/r/shopify/comments/1ufgm1o/has_anyone_else_noticed_shopify_search_results/)).
- Partial-SKU search broke silently on a Dawn-theme store. Shopify's default predictive search doesn't index SKUs, tags or descriptions ([Shopify Community](https://community.shopify.com/t/shopify-search-returning-no-results/631356), [Shopify Community](https://community.shopify.com/t/trouble-with-shop-search-bar/681088/2)).

**What exists and why it falls short:** Shopify Search & Discovery has a fixed set of indexed fields and offers no control over how broadly semantic search matches. Algolia, Constructor and Klevu are strong but priced and staffed for mid-market and enterprise. None of them *monitors* relevance regressions for a small merchant.

**Agent angle:** Good fit. A Grok Bot routine could pull real queries from PostHog each night and replay them against the storefront. It would score the results, flag zero-result or noisy queries, and draft fixes (synonyms, tags, metafields) for the merchant to approve. This is an always-on "search QA teammate", not another search engine.

**One-day demo-ability:** High. Seed a store, show 20 failing queries, then run the agent and show a before/after pass rate.

**Sponsor tools that fit:** Shopify Storefront API, PostHog (search events), Supabase (query log and scores), Grok Bot routines, Vercel dashboard.

### 2. **Missing product attributes leave filters useless**
**Who hurts:** Merchants with technical or varied catalogues (parts, home, outdoor) and shoppers facing 200-item lists they can't narrow.

**Evidence**
- 58% of desktop and 78% of mobile sites are mediocre or worse on product lists and filtering. 51% don't provide all five essential filter types ([Baymard 2025](https://baymard.com/blog/current-state-product-list-and-filtering)).
- 38% of sites don't offer filters even for the attributes they show in product listings ([Baymard](https://baymard.com/research-articles/have-filters-for-list-item-info)). 66% don't explain industry-specific filters ([Baymard](https://baymard.com/research-articles/desktop-ux-ecommerce)).
- Shopify caps stores at 25 filters in total and 100 displayed values per filter, and filters disappear on collections over 5,000 products ([Shopify Help](https://help.shopify.com/en/manual/online-store/search-and-discovery/filters), [Charle](https://www.charle.co.uk/articles/shopify-custom-filters/)). Merchants in forum threads say they need 50–300 filters ([Shopify Community](https://community.shopify.com/t/how-to-add-more-than-25-filters-in-search-discovery-app/290621)).
- One merchant hit the 50-definition limit with "another 145 or so attributes" still to add ([Shopify Dev Community](https://community.shopify.dev/t/metafield-definition-filter-limitation/6325)).

**What exists and why it falls short:** Boost and Searchanise filter apps, and PIMs like Akeneo. Filter apps still need the attribute data to exist, and PIMs are enterprise tools. The real bottleneck is filling in and normalising attributes, not rendering filters.

**Agent angle:** Good fit. An agent reads images and descriptions and proposes normalised metafield values, such as colour families or "temperature rating". It also suggests which few filters matter for each collection. A human reviews in bulk.

**One-day demo-ability:** High. Take 50 messy products, enrich them, and show filters appearing and working.

**Sponsor tools that fit:** Shopify metafields and metaobjects, Sanity (attribute schema and definitions), Grok Bot, Supabase.

### 3. **Product pages don't answer the question that decides the purchase**
**Who hurts:** Apparel shoppers unsure of fit, and merchants absorbing size-related returns.

**Evidence**
- 83% of desktop and 87% of mobile apparel sites give insufficient sizing information ([Baymard](https://baymard.com/research-articles/apparel-size-information)). 58% of size charts miss critical measurements ([Baymard](https://baymard.com/research-articles/apparel-ecommerce-ux-research-launch)).
- 61% of consumers cite poor fit as a main reason for returns. 33% returned items that didn't match the description or photos ([Rithum 2025](https://www.rithum.com/press/rithums-2025-global-returns-profit-impact-report/), vendor-sourced).
- UK clothing return rates average 23.6% of online orders ([ZigZag](https://www.zigzag.global/zigzags-annual-returns-report), vendor-sourced).
- Merchants say the chat questions that actually convert are the 2am "does this run small?" type ([r/shopify](https://www.reddit.com/r/shopify/comments/1r59llw/thoughts_on_chatbots_for_sales_or_support/)).

**What exists and why it falls short:** Kiwi Sizing, True Fit and Fit Analytics provide size charts or fit models. They need structured measurement data, rarely use review text, and don't tell the merchant which questions the page leaves unanswered.

**Agent angle:** Good fit. An agent answers fit and material questions using only the size chart, reviews and product data, and cites each answer. It also logs "unanswerable" questions back to the merchant as content gaps.

**One-day demo-ability:** High. Ask five fit questions live, show the cited answers, then show the gap report.

**Sponsor tools that fit:** Sanity (size guide content), Shopify, PostHog, Supabase pgvector.

### 4. **Storefront AI assistants that make things up and can't prove they help**
**Who hurts:** SMB merchants who installed a chat widget, and shoppers burned by confident wrong answers.

**Evidence**
- 89% of US consumers don't fully trust AI shopping recommendations, and 33% regret an AI-recommended purchase ([SmartCustomer, Aug 2026](https://www.smartcustomer.com/resources/ai-shopping-survey-2026)).
- Cursor's support bot invented a policy and users cancelled ([Ars Technica](https://arstechnica.com/ai/2025/04/cursor-ai-support-bot-invents-fake-policy-and-triggers-user-uproar/), [HN](https://news.ycombinator.com/item?id=43683012)). A Michaels chatbot promised a return that store policy didn't allow ([r/MichaelsEmployees](https://www.reddit.com/r/MichaelsEmployees/comments/1ouq6im/customer_service_ai_chatbot_lied_about_our_return/)).
- Merchants say chatbots "sucked when [they] tried to be too clever, gave a confident wrong answer" ([r/ShopifyWebsites](https://www.reddit.com/r/ShopifyWebsites/comments/1q92olb/are_ai_chatbots_actually_worth_it_or_is_it_all/)). They also say "assisted sales" attribution feels inflated ([r/shopify](https://www.reddit.com/r/shopify/comments/1r59llw/thoughts_on_chatbots_for_sales_or_support/)).
- One vendor admits about 96 in 100 shoppers never open its widget, and that small stores can't measure lift at all ([Kinect, vendor blog](https://trykinect.ai/blog/ai-chatbot-shopify-conversion-results)).

**What exists and why it falls short:** Tidio, Zipchat, Shopify Inbox and Gorgias. Most report engagement numbers rather than holdout lift, and few show the sources behind their answers.

**Agent angle:** Good fit, but the differentiator has to be honesty rather than the chat itself. Every answer carries its source; the agent refuses when it has no source; and a PostHog feature-flag holdout shows real revenue per visitor.

**One-day demo-ability:** Medium–high. Showing the grounding and refusals is easy. Real lift data isn't possible in a day, but you can show how the holdout is set up.

**Sponsor tools that fit:** PostHog feature flags and experiments, Shopify, Sanity (policy content as the source of truth), Grok Bot.

### 5. **What AI assistants say about your products is often wrong, and merchants can't see it**
**Who hurts:** Brands whose products appear in ChatGPT, Gemini or Perplexity with the wrong price or specs, and non-Shopify or headless merchants outside Shopify Catalog.

**Evidence**
- Product.ai tested 220 questions: 86% produced a repeatable factual conflict, and 97% of comparison questions did. Only 85% of verifiable prices were exact, and wrong prices were off by a median $300 ([Business Insider](https://www.businessinsider.com/study-shows-ai-errors-shopping-tools-struggle-accuracy-2026-9), [Tech.co](https://tech.co/news/ai-shopping-assistants-not-ready-holidays)). This is a startup's own study.
- OpenAI itself tells shoppers to check price and availability on the merchant's site ([OpenAI](https://openai.com/index/chatgpt-shopping-research/)).
- 44% of US organisations spend more than half their AI project effort on data preparation ([Akeneo, Sep 2026](https://www.akeneo.com/press-release/akeneo-survey-ai-ambition-is-outpacing-the-commerce-foundations-needed-to-deliver-it/), vendor-sourced). Fewer than 12% of manufacturers regularly monitor answer-engine data ([Inriver](https://www.inriver.com/2026/08/product-data-blind-spots/), vendor-sourced).
- llms.txt doesn't solve this: 97% of llms.txt files got zero requests in May 2026 ([Ahrefs](https://ahrefs.com/blog/llmstxt-study/)), and a 300k-domain study found no link to citations ([SE Ranking](https://seranking.com/blog/llms-txt/)).

**What exists and why it falls short:** Shopify Catalog, Google Merchant Center, the OpenAI product feed, Profound and Peec-style visibility trackers. These push data out or count mentions. Few check whether the *facts* AI assistants state match the merchant's source of truth.

**Agent angle:** Strong fit for Grok Bot's browser and memory. It acts as a scheduled "mystery shopper": it asks AI assistants and uses Tavily about the merchant's products, extracts the claims, compares them with Shopify or Commerce Layer data, and raises a ranked list of discrepancies with suggested feed or product-page fixes.

**One-day demo-ability:** High. Pick 10 real products, show the claim-versus-truth table, then show a fix.

**Sponsor tools that fit:** Tavily, Grok Bot (browser, routines, memory), Shopify / Commerce Layer, Supabase, Vercel.

### 6. **Agent traffic you can't see, and checkouts agents can't finish**
**Who hurts:** Merchants whose bot protection blocks legitimate shopping agents, and their growth and fraud teams.

**Evidence**
- 77% of agentic activity is on product and search pages and 2.3% on checkout. HUMAN notes that behaviour which used to signal a bot "may now be a legitimate agentic commerce workflow" ([HUMAN 2026](https://www.humansecurity.com/learn/resources/2026-state-of-ai-traffic-cyberthreat-benchmarks/), vendor-sourced).
- Only 23% of merchants can clearly identify AI-driven traffic and purchases ([PYMNTS merchant edition](https://www.pymnts.com/wp-content/uploads/2026/06/PYMNTS-Intelligence-Global-Digital-Shopping-Index-Merchant-Edition-June-2026.pdf)).
- In one benchmark, CAPTCHA-gated stores completed 28.7% of agent checkouts and account-required stores 21.4%, against 88.4% for agent-ready stores ([Presenc AI](https://presenc.ai/research/agent-checkout-success-rate-benchmarks-2026)). This is a vendor benchmark, so treat it as directional.
- A practitioner describes a silent bot block at the payment step: "No error, no feedback" ([Agentic Commerce Frontier](https://agentcommerce.substack.com/p/the-agentic-commerce-frontier-march)).

**What exists and why it falls short:** Cloudflare bot management, HUMAN and Stripe Radar. These are built to block, and their dashboards don't tell a merchant "an agent tried to buy and failed here".

**Agent angle:** Good fit. Grok Bot runs a scripted agent journey (discover, add to cart, checkout) against the store on a schedule and reports where it breaks. Paired with PostHog user-agent segmentation, it separates agent sessions from human ones.

**One-day demo-ability:** Medium–high. Showing the harness on a dev store is easy; real third-party agent traffic isn't.

**Sponsor tools that fit:** Grok Bot, PostHog, Shopify / Commerce Layer checkout, Supabase.

### 7. **Finding one-of-a-kind secondhand items**
**Who hurts:** Resale shoppers hunting specific pieces, and boutique resellers restocking.

**Evidence**
- 48% of consumers, and 59% of younger ones, say better personalisation, search and discovery would make secondhand as easy as buying new ([ThredUp 2025](https://newsroom.thredup.com/news/thredup-13th-resale-report), vendor-sourced).
- ThredUp's CEO compares each item to a snowflake. ThredUp moved from tagging 6–7 attributes per item to more than 100 ([Modern Retail](https://www.modernretail.co/technology/why-thredups-ceo-thinks-its-investments-in-ai-have-been-underhyped/)). "Our items disappear once sold" ([PYMNTS](https://www.pymnts.com/news/artificial-intelligence/2025/genai-helps-resale-move-secondhand-to-first-choice/)).
- Vinted saved searches switched to "Relevance" by default. One user: "The point of a saved search is it shows you new items. Now it dosnt." ([r/vinted](https://www.reddit.com/r/vinted/comments/1p7x38c/saved_searches_not_showing_saving_to_show_as_as_most_recent_or_new_in/)).
- On Depop: "Feels like they don't want you to find specific items" ([r/Depop](https://www.reddit.com/r/Depop/comments/1idgl0v/why_is_the_search_function_so_terrible/)).

**What exists and why it falls short:** ThredUp Style Chat and image search, Vinted and Depop saved searches, and Fleek's Fleeky wishlist matching ([Fleek](https://www.joinfleek.com/pages/how-it-works)). Marketplaces tune ranking for their own engagement goals, not for a single buyer's precise want list.

**Agent angle:** Strong fit for an always-on agent with memory. It holds a buyer's detailed want list (size, measurements, condition floor, price), watches new listings, and alerts only on genuine matches, explaining why each one matches. This matches the host's world closely.

**One-day demo-ability:** High. Load a feed of listings, define a want list, and show the agent's picks alongside the listings it rejected and why.

**Sponsor tools that fit:** Grok Bot (routines, memory), Supabase pgvector, Tavily, Shopify.

### 8. **Condition claims buyers can't compare on resale storefronts**
**Who hurts:** Secondhand buyers and small resale storefronts.

**Evidence**
- Vinted asks sellers to be "as accurate and objective as possible" and to pick the lower condition when unsure. It lists stains, stretching, odours and fading as flaws to photograph ([Vinted Help](https://www.vinted.com/help/50-choosing-item-condition)).
- Condition disputes hinge on "significantly not as described", while small differences are excluded ([Vinted SNAD](https://www.vinted.com/help/1090-significantly-not-as-described-items-at-vinted?access_channel=hc_search)). Buyers get two days to report ([The Independent](https://www.the-independent.com/extras/indybest/vinted-buyer-protection-b2930811.html)).
- On Fleek, wholesale buyers rely on A/B/C grades, photos and video handpicks, and orders take 21–28 working days to arrive ([Fleek reseller page](https://www.joinfleek.com/resources/full-time-reseller)).

**What exists and why it falls short:** Free-text condition fields, platform grading guides and manual video calls. There's no shared, evidence-linked condition schema that works across storefronts.

**Agent angle:** Partial fit. A vision-assisted agent could turn photos into a structured condition report (flaws found, where, severity) that links to the evidence photos. Honest caveat: vision models will miss odours and subtle flaws, so position it as decision support, not certification.

**One-day demo-ability:** Medium. The demo works on curated photos; accuracy claims would need a labelled set.

**Sponsor tools that fit:** Sanity (condition schema), Supabase storage, Grok Bot, Shopify metafields.

### 9. **Wholesale storefronts buyers can't trust for stock, price and reordering**
**Who hurts:** Independent retailers and resellers buying wholesale, including vintage shops restocking.

**Evidence**
- 81% of B2B buyers face barriers from outdated systems and inaccurate data. 36% struggle to find products online, and only 19% say online buying meets expectations ([Sana Commerce 2025](https://www.globenewswire.com/news-release/2025/01/29/3017144/0/en/New-Survey-Reveals-Real-Time-Data-Is-the-Secret-Weapon-for-Winning-Over-Frustrated-B2B-Buyers.html), vendor-sourced).
- 39% cite lack of pricing transparency and 35% time-consuming reordering ([Contentful 2025](https://www.contentful.com/resources/the-2025-b2b-buyer-benchmark-report/), vendor-sourced).
- Of B2B buyers not using self-service portals, 58% say the supplier simply doesn't offer one ([Spryker/Statista](https://spryker.com/hubfs/00-pdf/white-paper/The-Rise-of-Self-Service-Portals-in-B2B-Aftersales.pdf), vendor-sourced).

**What exists and why it falls short:** Shopify B2B, Commerce Layer price lists and markets, Sana and Spryker. These cover structured, repeatable SKUs well. They handle "restock me something like last month's mix" poorly, especially for non-repeatable stock like vintage.

**Agent angle:** Good fit. A buyer describes the shop's aesthetic, sell-through and budget. The agent assembles a proposed restock from current supply and explains the substitutions. It connects naturally to Fleek-style request-for-quote flows such as Demand Hub.

**One-day demo-ability:** Medium. The flow is demoable with seeded supplier data; accurate real-time stock needs a live integration.

**Sponsor tools that fit:** Commerce Layer (B2B price lists, markets), Shopify B2B, Recharge (recurring restock), Grok Bot, Supabase.

### 10. **Surprise costs and slow checkout, especially on mobile**
**Who hurts:** Mobile shoppers and SMB merchants on default checkout set-ups.

**Evidence**
- Average cart abandonment is 70.19%. Excluding "just browsing", 40% abandon over extra costs and 12% because they couldn't see the total up front ([Baymard](https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark)).
- 48% of sites show delivery speed instead of a delivery date, and 62% don't make guest checkout the most prominent option ([Baymard checkout 2025](https://baymard.com/blog/current-state-of-checkout-ux)).
- Mobile has about 75% of traffic but converts at 2.8% against 3.2% on desktop, with cart abandonment of 79% against 68% ([Smart Insights / Dynamic Yield](https://www.smartinsights.com/ecommerce/ecommerce-analytics/ecommerce-conversion-rates/)).

**What exists and why it falls short:** Shop Pay, Apple Pay, shipping-estimator apps and Shopify Checkout. Most of this is solved UX that merchants simply haven't implemented.

**Agent angle:** Weak fit. These are mostly fixed, known UX changes, and an agent adds little. A possible exception is a pre-checkout "true total" answer (shipping, duties, delivery date) given on the product page. Don't build a hackathon project around this gap.

**One-day demo-ability:** Medium. The fix is easy to build but hard to make compelling on stage.

**Sponsor tools that fit:** Shopify, Commerce Layer, PostHog funnels.

### 11. **Accessible product information, beyond scanner compliance**
**Who hurts:** Blind and low-vision shoppers, disabled shoppers buying adaptive clothing, and EU-facing merchants now covered by the European Accessibility Act.

**Evidence**
- Shopify homepages average 75.1 detectable accessibility errors, 33.9% above the overall average ([WebAIM Million 2026](https://webaim.org/projects/million/)). Automated scans only cover homepages, not checkout or search ([Accessiblü](https://www.accessiblu.com/insights/the-webaim-million-2026-report-is-out-heres-what-the-numbers-actually-mean/)).
- The EAA has applied to e-commerce since 28 June 2025. It requires passing on accessibility information about products ([European Commission](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en), [Accessible.org](https://accessible.org/eaa-ecommerce-services-requirements/)).
- Visually impaired shoppers report "inaccurate, misleading, and contradictory clothing descriptions" and rely on reviews to check them ([White Rose / DIS paper](https://eprints.whiterose.ac.uk/id/eprint/199270/1/DIS_paper__Alluqmani_et_al___2023__open_access_version.pdf)). Lipstick colour names are unusable even with assistive tech ([OCAD 2025](https://openresearch.ocadu.ca/id/eprint/4788/1/Satheesh_Vyshnavi_2025_MDES_INCD.pdf)).
- 53% of disabled people prefer shopping online, yet run into "unusable filters" and poor descriptions ([Tilting the Lens 2025](https://adee.es/wp-content/uploads/2025/12/Tilting-the-Lens_Adaptive-Fashion-White-Paper_2025.pdf)).

**What exists and why it falls short:** WAVE and axe scanners, overlay widgets and alt-text generators. They fix markup, not *meaning*: plain-language colour, texture, fit and closures, checked against reviews.

**Agent angle:** Good fit. An agent writes rich descriptions of colour, texture and closures, cross-checks them against reviews for contradictions, and walks deep pages (search, product page, checkout) with a screen-reader-style pass.

**One-day demo-ability:** Medium–high. Before/after descriptions plus a contradiction flag make a clear demo.

**Sponsor tools that fit:** Sanity (structured accessible content fields), Shopify, Grok Bot browser, Vercel.

### 12. **Vague-intent and gift discovery**
**Who hurts:** Gift buyers and anyone arriving with "comfortable shoes for standing all day" rather than a product name.

**Evidence**
- More than 8 in 10 consumers have abandoned a gift purchase because it felt too frustrating, and 77% struggle with too many options ([Accenture via Forbes](https://www.forbes.com/sites/jillstandish/2025/09/26/guiding-the-holiday-shopper-winning-in-the-age-of-too-many-choices/)).
- 44% struggle to find the right gift, yet 85% of Americans weren't using AI for it in 2025 ([SurveyMonkey](https://www.surveymonkey.com/curiosity/holiday-shopping-trends-statistics/)). 63% are curious about a ChatGPT-style gift assistant, up from 31% ([Coveo](https://www.coveo.com/blog/2025-holiday-shopper-trends/), vendor-sourced).
- Constructor cites this kind of discovery-mode query as where retailer search "struggle[s] to connect the dots" ([Constructor PDF](https://info.constructor.com/hubfs/2025-state-of-ecommerce.pdf)).

**What exists and why it falls short:** Static gift guides, quiz apps like Octane AI, and Rufus's "Help Me Decide" (Amazon-only) ([Yahoo Finance](https://finance.yahoo.com/news/amazon-says-ai-shopping-assistant-152500992.html)). Quizzes are rigid, and general-purpose AI assistants don't know the merchant's actual stock.

**Agent angle:** Good fit, provided it's grounded in the store's catalogue. It asks two or three questions and returns a short list, or a Recharge bundle, with a reason for each pick.

**One-day demo-ability:** High. The before/after is easy to show on stage.

**Sponsor tools that fit:** Recharge (bundles), Shopify, Sanity (editorial gift content), PostHog.

## Underserved niches worth a look

- **Vehicle fitment search for small parts shops.** Shopify fitment apps charge by product or fitment-row count, and forum threads name auto parts as a reason stores exceed the 25-filter cap ([GoFitment](https://apps.shopify.com/gofitment), [Instant Fit](https://apps.shopify.com/fitment-tool), [Shopify Community](https://community.shopify.com/t/how-to-add-more-than-25-filters-in-search-discovery-app/290621)).
- **Colour and texture language for blind and low-vision beauty shoppers.** Brand shade names like lipstick colours carry no usable information ([OCAD 2025](https://openresearch.ocadu.ca/id/eprint/4788/1/Satheesh_Vyshnavi_2025_MDES_INCD.pdf)).
- **Social video to storefront.** 32% of UK shoppers, and 52% of Gen Z, use TikTok or Instagram instead of Google to research purchases. The step from "saw it in a video" to "find it on the brand's own site" is thin ([Retail Economics/Unbox](https://mail.retaileconomics.co.uk/retail-insights/thought-leadership-reports/unbox-the-billion-dollar-battleground-of-social-commerce)).
- **"Same 25 things, but not exactly the same" replenishment.** A Hacker News user describes fixed subscriptions leaving them either stockpiling or running out, which is a gap between Recharge-style fixed schedules and adaptive reorders ([HN](https://news.ycombinator.com/item?id=49286039)).
- **Brands moving from headless back to themes.** Brands leaving Hydrogen need content and search rebuilt on themes, and agencies now market this as a service ([SDG](https://www.sdg.la/shopify-headless-to-headed/), [Build Grow Scale](https://buildgrowscale.com/shopify-headless-pricing-cost-worth-it)).

## Sources

1. https://baymard.com/research-articles/ecommerce-search-query-types
2. https://baymard.com/blog/mobile-ecommerce-search-and-navigation
3. https://baymard.com/guidelines/1001-misspelled-search-terms
4. https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark
5. https://baymard.com/lists/cart-abandonment-rate
6. https://baymard.com/blog/current-state-of-checkout-ux
7. https://baymard.com/blog/current-state-product-list-and-filtering
8. https://baymard.com/research-articles/have-filters-for-list-item-info
9. https://baymard.com/research-articles/desktop-ux-ecommerce
10. https://baymard.com/research-articles/apparel-size-information
11. https://baymard.com/research-articles/apparel-ecommerce-ux-research-launch
12. https://info.constructor.com/hubfs/2025-state-of-ecommerce.pdf
13. https://constructor.com/blog/top-takeaways-state-of-ecommerce-2025
14. https://www.prnewswire.com/news-releases/shoppers-who-search-on-ecommerce-sites-drive-nearly-half-of-online-revenue-according-to-new-constructor-study-302394501.html
15. https://business.adobe.com/blog/ai-driven-traffic-surges-across-industries
16. https://www.marketingdive.com/news/ai-has-changed-holiday-shopping-heres-what-the-numbers-say/810265/
17. http://www.aboutamazon.com/news/retail/amazon-rufus-ai-assistant-personalized-shopping-features
18. https://finance.yahoo.com/news/amazon-says-ai-shopping-assistant-152500992.html
19. https://www.shopify.com/news/ai-commerce-at-scale
20. https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements
21. https://shopify.engineering/UCP
22. https://www.humansecurity.com/learn/resources/2026-state-of-ai-traffic-cyberthreat-benchmarks/
23. https://www.visaacceptance.com/content/dam/documents/campaign/shopping-index/2026-global-digital-shopping-index-agentic-edition.pdf
24. https://www.pymnts.com/wp-content/uploads/2026/06/PYMNTS-Intelligence-Global-Digital-Shopping-Index-Merchant-Edition-June-2026.pdf
25. https://www.akeneo.com/press-release/akeneo-survey-ai-ambition-is-outpacing-the-commerce-foundations-needed-to-deliver-it/
26. https://www.inriver.com/2026/08/product-data-blind-spots/
27. https://nz.finance.yahoo.com/news/openai-pivot-shopping-disaster-164500492.html
28. https://openai.com/index/chatgpt-shopping-research/
29. https://www.businessinsider.com/study-shows-ai-errors-shopping-tools-struggle-accuracy-2026-9
30. https://tech.co/news/ai-shopping-assistants-not-ready-holidays
31. https://product.ai/research/trust-in-ai-commerce-report/
32. https://www.smartcustomer.com/resources/ai-shopping-survey-2026
33. https://www.forrester.com/blogs/consumers-arent-ready-to-delegate-payments-to-ai-agents/
34. https://ahrefs.com/blog/llmstxt-study/
35. https://seranking.com/blog/llms-txt/
36. https://presenc.ai/research/agent-checkout-success-rate-benchmarks-2026
37. https://agentcommerce.substack.com/p/the-agentic-commerce-frontier-march
38. https://www.reddit.com/r/shopify/comments/1uf4iv8/storefront_search_went_haywire_after_shopify_plus/
39. https://www.reddit.com/r/shopify/comments/1ufgm1o/has_anyone_else_noticed_shopify_search_results/
40. https://community.shopify.com/t/shopify-search-returning-no-results/631356
41. https://community.shopify.com/t/trouble-with-shop-search-bar/681088/2
42. https://help.shopify.com/en/manual/online-store/search-and-discovery/filters
43. https://community.shopify.com/t/how-to-add-more-than-25-filters-in-search-discovery-app/290621
44. https://community.shopify.dev/t/metafield-definition-filter-limitation/6325
45. https://www.charle.co.uk/articles/shopify-custom-filters/
46. https://www.reddit.com/r/shopify/comments/1r59llw/thoughts_on_chatbots_for_sales_or_support/
47. https://www.reddit.com/r/ShopifyWebsites/comments/1q92olb/are_ai_chatbots_actually_worth_it_or_is_it_all/
48. https://trykinect.ai/blog/ai-chatbot-shopify-conversion-results
49. https://arstechnica.com/ai/2025/04/cursor-ai-support-bot-invents-fake-policy-and-triggers-user-uproar/
50. https://news.ycombinator.com/item?id=43683012
51. https://www.reddit.com/r/MichaelsEmployees/comments/1ouq6im/customer_service_ai_chatbot_lied_about_our_return/
52. https://www.rithum.com/press/rithums-2025-global-returns-profit-impact-report/
53. https://www.zigzag.global/zigzags-annual-returns-report
54. https://newsroom.thredup.com/news/thredup-13th-resale-report
55. https://www.modernretail.co/technology/why-thredups-ceo-thinks-its-investments-in-ai-have-been-underhyped/
56. https://www.pymnts.com/news/artificial-intelligence/2025/genai-helps-resale-move-secondhand-to-first-choice/
57. https://www.reddit.com/r/vinted/comments/1p7x38c/saved_searches_not_showing_saving_to_show_as_as_most_recent_or_new_in/
58. https://www.reddit.com/r/Depop/comments/1idgl0v/why_is_the_search_function_so_terrible/
59. https://www.vinted.com/help/50-choosing-item-condition
60. https://www.vinted.com/help/1090-significantly-not-as-described-items-at-vinted?access_channel=hc_search
61. https://www.the-independent.com/extras/indybest/vinted-buyer-protection-b2930811.html
62. https://www.joinfleek.com/pages/how-it-works
63. https://www.joinfleek.com/resources/full-time-reseller
64. https://www.globenewswire.com/news-release/2025/01/29/3017144/0/en/New-Survey-Reveals-Real-Time-Data-Is-the-Secret-Weapon-for-Winning-Over-Frustrated-B2B-Buyers.html
65. https://www.contentful.com/resources/the-2025-b2b-buyer-benchmark-report/
66. https://spryker.com/hubfs/00-pdf/white-paper/The-Rise-of-Self-Service-Portals-in-B2B-Aftersales.pdf
67. https://www.smartinsights.com/ecommerce/ecommerce-analytics/ecommerce-conversion-rates/
68. https://webaim.org/projects/million/
69. https://www.accessiblu.com/insights/the-webaim-million-2026-report-is-out-heres-what-the-numbers-actually-mean/
70. https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en
71. https://accessible.org/eaa-ecommerce-services-requirements/
72. https://eprints.whiterose.ac.uk/id/eprint/199270/1/DIS_paper__Alluqmani_et_al___2023__open_access_version.pdf
73. https://openresearch.ocadu.ca/id/eprint/4788/1/Satheesh_Vyshnavi_2025_MDES_INCD.pdf
74. https://adee.es/wp-content/uploads/2025/12/Tilting-the-Lens_Adaptive-Fashion-White-Paper_2025.pdf
75. https://www.forbes.com/sites/jillstandish/2025/09/26/guiding-the-holiday-shopper-winning-in-the-age-of-too-many-choices/
76. https://www.surveymonkey.com/curiosity/holiday-shopping-trends-statistics/
77. https://www.coveo.com/blog/2025-holiday-shopper-trends/
78. https://mail.retaileconomics.co.uk/retail-insights/thought-leadership-reports/unbox-the-billion-dollar-battleground-of-social-commerce
79. https://www.shopify.com/case-studies/dermalogica-horizon-theme
80. https://askphill.com/blogs/blog/shopify-headless
81. https://www.sdg.la/shopify-headless-to-headed/
82. https://buildgrowscale.com/shopify-headless-pricing-cost-worth-it
83. https://news.ycombinator.com/item?id=49286039
84. https://apps.shopify.com/gofitment
85. https://apps.shopify.com/fitment-tool
