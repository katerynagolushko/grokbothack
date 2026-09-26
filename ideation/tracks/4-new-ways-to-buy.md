# Track 4: New Ways to Buy

> Official brief: "Explore subscriptions, bundles, marketplaces, reselling and programmatic purchasing." Research compiled 26 Sep 2026. Vendor-sourced stats are flagged as such.

## Landscape

- **Resale is taking share from new, and supply is now the constraint.** ThredUp's 2026 report puts global secondhand apparel on course for $393bn by 2030, about 10% of apparel spend. It says US secondhand grew 13% in 2025, nearly four times faster than clothing retail, and that "supply is the new constraint" ([ThredUp](https://www.thredup.com/resale), [press release](https://ir.thredup.com/node/11491/pdf)). Vinted's 2025 GMV rose 47% to €10.8bn and revenue passed €1.1bn, but net profit fell 19% to €62m as it spent on logistics, payments and new categories ([Vinted](https://company.vinted.com/newsroom/financial-results-2025), [Reuters](https://www.reuters.com/business/retail-consumer/second-hand-fashion-platform-vinted-reports-38-jump-revenue-2026-04-09/)). McKinsey/BoF expect secondhand to grow two to three times faster than firsthand through 2027 ([McKinsey](https://www.mckinsey.com/industries/retail/our-insights/state-of-fashion)).
- **UK subscription rules arrive in January 2027, and the enforcer already has teeth.** The DMCCA subscription regime was brought forward to January 2027. It requires reminder notices, a 14-day renewal cooling-off period and online exit, and formal guidance is still unpublished ([TLT](https://www.tlt.com/insights-and-events/insight/dmcc-act-subscription-contracts-regime-brought-forward-by-the-pm-what-do-businesses-need-to-know), [Brodies](https://brodies.com/insights/commercial-contracts-and-outsourcing/the-dmcca-subscription-contracts-the-timeline-just-got-shorter/)). The CMA now fines directly: £5.8m in fines plus £1.95m in refunds by June 2026, mostly for drip pricing ([A&O Shearman](https://www.aoshearman.com/en/insights/cma-clamps-down-on-checkout-tricks-as-consumer-enforcement-pipeline-accelerates)).
- **The infrastructure for agents to buy things is going live, but merchant adoption is patchy.** Visa ran live agent-initiated purchases at independent European merchants in July 2026 ([Visa](https://www.visa.co.uk/about-visa/newsroom/press-releases.3457328.html)). Mastercard launched Agent Pay for Machines for micropayments ([Mastercard](https://www.mastercard.com/us/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html)). A September census counted about 10,700 storefronts on the latest UCP version, almost all through Shopify templates ([UCP Checker](https://ucpchecker.com/blog/state-of-agentic-commerce-september-2026)). Meanwhile OpenAI scaled back in-chat checkout after only about 12 Shopify merchants went live ([Rye](https://rye.com/blog/openai-chatgpt-checkout-agentic-commerce)).
- **UK buy-now-pay-later has been regulated since 15 July 2026.** Third-party lenders now need affordability checks and must give clear key information. Merchant-provided instalments stay outside the rules ([FCA PS26/1](https://www.fca.org.uk/publications/policy-statements/ps26-1-regulation-deferred-payment-credit)).
- **EU textile rules are reshaping the bale supply chain.** Since 16 October 2025, separately collected textiles count as waste until professionally sorted for reuse, and exports need sorting evidence. Harmonised sorting requirements are still to come, and textile producer-responsibility schemes must be running by April 2028 ([European Commission](https://environment.ec.europa.eu/news/revised-waste-framework-directive-enters-force-2025-10-16_en), [Directive 2025/1892](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32025L1892)).
- **Subscriptions are holding up, but on discounts.** Across 20,000 Recharge brands, same-day cancels fell 35% while first-order discounts rose 18% ([Recharge 2026](https://getrecharge.com/reports/subscription-trend-report-2026/)).

## Gaps and niches

### 1. [Subscriptions] **Proving DMCC compliance before January 2027**
- **Who hurts:** UK Shopify merchants with £1–20m revenue running subscriptions on Recharge or Skio, with no in-house legal or engineering team to audit sign-up, reminder and cancel journeys.
- **Evidence:**
  - Go-live is January 2027. Detailed guidance is still pending, and the implementation window is "already very narrow" ([TLT](https://www.tlt.com/insights-and-events/insight/dmcc-act-subscription-contracts-regime-brought-forward-by-the-pm-what-do-businesses-need-to-know)).
  - Retention offers are allowed but "must not frustrate or unreasonably elongate the process". Firms asked what counts as a "reasonable number of offers", and that is still undefined ([GOV.UK response](https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/outcome/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version)).
  - DBT estimates 9.7m unwanted subscriptions costing £1.6bn a year. About 3.6m of them came from trials that rolled over ([GOV.UK consultation](https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version)).
  - The CMA can fine up to 10% of global turnover without going to court ([BCLP](https://www.bclplaw.com/en-US/events-insights-news/cma-imposes-first-financial-penalty-under-new-consumer-powers-in-drip-pricing-crackdown.html)).
- **What exists and why it falls short:** Recharge, Skio and Loop provide the plumbing and cancellation flows, but their flows are built to retain customers, not to evidence compliance. Law firms produce checklists, not tests of the live site.
- **Agent angle:** Strong fit. An agent with a browser signs up to a test subscription, counts the steps and offers on the way out, and checks that reminder and cooling-off emails arrive on time. It then produces a timestamped evidence report against the relevant DMCCA sections, and can re-run on a schedule.
- **One-day demo-ability:** High. A Shopify dev store with Recharge, a planted "dark" cancel flow and a generated report make a clear before-and-after.
- **Sponsor tools that fit:** Grok Bot (browser, scheduled routines), Recharge, Shopify, Supabase (evidence store), Sanity (rule definitions as structured content), Vercel.

### 2. [Subscriptions] **Price creep and forgotten renewals, from the subscriber's side**
- **Who hurts:** UK households with 5–15 subscriptions, including replenishment ones like pet food, coffee and vitamins.
- **Evidence:**
  - 26% of UK adults (13m+) accidentally took out a subscription in a year. Unused subscriptions cost £688m, up £382m since 2022 ([Citizens Advice](https://www.citizensadvice.org.uk/about-us/media-centre/press-releases/consumers-spend-688-million-on-unused-subscriptions-in-the-last-year/)).
  - DBT's impact assessment found that at least a quarter of consumers kept paying without realising the price had gone up ([DBT IA](https://assets.publishing.service.gov.uk/media/60f672b98fa8f50c76838794/rccp-subscriptions-traps-ia.pdf)).
  - Amazon's terms charge "the cost of the item on the day that order is processed" and allow price changes "at any time" ([Amazon T&Cs](https://www.amazon.com/gp/help/customer/display.html?nodeId=GWFU7NECYFLW6M6U)). One user reported coffee beans rising from $12.35 to $19.94 ([r/amazonprime](https://www.reddit.com/r/amazonprime/comments/1iuvxzt/bait_and_switch_with_subscribe_and_save/)).
  - Under current law, the Ombudsman upheld a £53.89 renewal charge because the customer missed a one-month notice clause ([FOS DRN-5918106](https://www.financial-ombudsman.org.uk/decision/DRN-5918106.pdf)).
- **What exists and why it falls short:** Bank apps (Monzo, Emma) list recurring payments but don't read the price in each renewal email or act on it. Rocket Money is US-focused.
- **Agent angle:** Good fit. An agent reads reminder notices, compares the renewal price with the current one-off price, and skips, swaps or cancels within the notice window. Be honest about the limits: it needs inbox access, and automated cancellation may conflict with merchant terms. The January 2027 reminder notices will make those emails far easier to parse.
- **One-day demo-ability:** Medium–High. Seeded emails plus one real cancel flow is enough.
- **Sponsor tools that fit:** Grok Bot (memory, email and browser), Tavily (current price lookup), Supabase, PostHog.

### 3. [Subscriptions] **Replenishment timing and the leaky first reorder**
- **Who hurts:** Direct-to-consumer brands selling consumables (supplements, coffee, beauty) whose subscribers stockpile or run out.
- **Evidence:**
  - For supplements, "the biggest drop is the first reorder". Active churn is 17.3% and the skip rate is 6.9%. Coffee and beauty both sit at 20.7% active churn ([Recharge](https://getrecharge.com/blog/supplement-subscription-retention/)).
  - Brands raised first-order discounts by 18% to convert ([Recharge 2026](https://getrecharge.com/reports/subscription-trend-report-2026/)).
  - Users skip or cancel when a shipment's price or timing doesn't suit them ([r/AmazonWTF](https://www.reddit.com/r/AmazonWTF/comments/1jiwq29/always_review_your_subscribe_and_save/)).
- **What exists and why it falls short:** Recharge, Skio and Smartrr offer fixed intervals plus skip, swap and pause. Cadence is set at checkout and rarely reflects actual use.
- **Agent angle:** Moderate. An agent checks in before the first reorder, estimates how much product is left, and moves the date instead of letting the order ship or the customer cancel. You need usage signals, which in a demo would be simulated.
- **One-day demo-ability:** Medium. The logic is easy, but proving a retention lift on stage needs synthetic data.
- **Sponsor tools that fit:** Recharge (skip and reschedule), PostHog (engagement signals), Grok Bot (webhook routines), Supabase.

### 4. [Bundles] **Build-a-box subscriptions that break on stock-outs**
- **Who hurts:** Shopify merchants selling mix-and-match or build-a-box subscriptions, especially across several channels.
- **Evidence:**
  - Recharge: "Bundles are not compatible with out-of-stock order settings. If a selection in a subscriber's bundle is out of stock, it will still be processed" ([Recharge](https://support.getrecharge.com/hc/en-us/articles/8592670804503-Handling-out-of-stock-orders-and-products)). Bundle orders are not supported by partial fulfilment ([Recharge](https://support.getrecharge.com/hc/en-us/articles/10093532488343-Configuring-partial-order-fulfillment-for-out-of-stock-items)).
  - In Recharge, swapping a bundle variant wipes its contents, and collections are capped at 250 products ([Recharge](https://support.getrecharge.com/hc/en-us/articles/11808240171287-Getting-started-with-dynamically-priced-customizable-bundles)).
  - The free Shopify Bundles app handles fixed bundles only, and nested bundles aren't supported ([BOGOS](https://bogos.io/shopify-bundle-inventory-management/), [Shopify dev](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-customized-bundle-function)).
  - Shared components drift across marketplaces ([Sumtracker](https://www.sumtracker.com/blog/how-to-reliably-sync-bundle-inventory-across-sales-channels)).
- **What exists and why it falls short:** BOGOS, Fast Bundle, Bundle Kit and Sumtracker sync stock. None of them looks ahead at upcoming renewals and fixes each subscriber's box before the charge. Recharge's advice is a manual bulk swap.
- **Agent angle:** Strong fit. Before each charge run, the agent checks upcoming bundle renewals against stock. It picks a like-for-like substitute using product attributes, messages the subscriber with a one-tap choice, and applies the swap.
- **One-day demo-ability:** High. Seed 20 subscriptions and one out-of-stock item, then show the swap flow end to end.
- **Sponsor tools that fit:** Recharge, Shopify, Sanity (substitution rules and product attributes), Grok Bot, Commerce Layer (for non-Shopify stock).

### 5. [Bundles] **Mystery boxes and "representative" bundles nobody can verify**
- **Who hurts:** UK buyers of mystery clothing boxes and the small sellers running them on TikTok Shop or Instagram.
- **Evidence:**
  - The ASA ruled Groupon's "£89.99 → £14.99" mystery box misleading because there was no evidence every item was worth at least £89.99 ([ASA](https://www.asa.org.uk/rulings/groupon-international-ltd.html)).
  - TikTok Shop UK requires a fixed item count, a pool of no more than 20 individually listed products, and bans vague pools like "random items from brands" ([TikTok Shop](https://seller-uk.tiktok.com/university/essay?knowledge_id=1514396635858690)).
  - The ASA found Glossybox's "hero" product was in only about one in four boxes, and substitutes ranged from £34 down to £2.99 ([ASA](https://www.asa.org.uk/rulings/the-hut-com-ltd-g21-1123050-the-hut-com-ltd.html)).
- **What exists and why it falls short:** Platform rules and ASA rulings apply after the event. Nothing gives sellers a verifiable value distribution or a record of what each box contained.
- **Agent angle:** Moderate. An agent checks a listing against the ASA and TikTok rules and keeps a per-box contents record from packing photos, so claims like "worth at least £X" are backed up.
- **One-day demo-ability:** High to build, but the commercial case is narrower.
- **Sponsor tools that fit:** Sanity (pool definitions), Supabase, Grok Bot (vision and rules), Shopify.

### 6. [Marketplaces, B2B wholesale] **Bale grading means different things to different suppliers**
- **Who hurts:** Small resellers (Depop, Vinted or Shopify shops) spending £150–£4,000 per bundle on vintage wholesale.
- **Evidence:**
  - Buyers report "Grade A" pallets with glue, curry stains, holes and mould. One buyer got 173 skirts, binned 37, and was offered only a credit note ([r/reselling](https://www.reddit.com/r/reselling/comments/1rsnlha/dont_purchase_from_vintage_wholesale_supply_in/), [r/Depop](https://www.reddit.com/r/Depop/comments/gieiy9/has_anyone_had_any_experience_with_bulk_vintage/)).
  - As a business buyer, "the consumer act does not apply". Unless the supplier defined 'A Grade', "it is effectively meaningless" ([r/LegalAdviceUK](https://www.reddit.com/r/LegalAdviceUK/comments/10pa3cp/purchased_a_bale_of_vintage_clothing_from_an/)).
  - Fleek users say suppliers are "really stretching the grading" and hide tears. Buyer protection may not cover ABC-grade bundles, and experienced buyers avoid suppliers with fewer than 10 repeat buyers ([r/JoinFleek](https://www.reddit.com/r/JoinFleek/comments/1sevagi/anyone_here_using_fleek_for_sourcing/), [r/reselling](https://www.reddit.com/r/reselling/comments/1jvr0d4/opinions_about_the_fleek_app_where_they_sell_lots/), [r/reselling](https://www.reddit.com/r/reselling/comments/1klvh8u/is_fleek_reliable/)).
  - The EU requires sorting "in accordance with harmonised sorting requirements" that don't exist yet ([Directive 2025/1892](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32025L1892)).
- **What exists and why it falls short:** Fleek has buyer protection, reviews, repeat-buyer counts, video handpicks and moodboards ([App Store](https://apps.apple.com/us/app/fleek-wholesale/id1631016145)). Grades are still supplier-defined text, and claims rely on the buyer's own photos and arguments.
- **Agent angle:** Strong fit, and directly relevant to the host. Define grades as a machine-readable rubric listing defect types and thresholds. The agent grades supplier photos before purchase and unboxing photos after, then reports the share that met the grade and builds a claim pack item by item. Over time this gives each supplier a "grade accuracy" score.
- **One-day demo-ability:** High. Photograph 20 garments, run them against the rubric, and produce a report plus a claim.
- **Sponsor tools that fit:** Grok Bot (vision and memory of supplier history), Sanity (grade rubric schema), Supabase (photos and scores), PostHog, Vercel.

### 7. [Marketplaces] **Nobody chases stuck cross-border wholesale orders for you**
- **Who hurts:** Resellers whose stock is stuck in transit or under-delivered, with cash tied up and claim windows running out.
- **Evidence:**
  - One buyer had "over £1000 worth of stock stuck in transit across 3 packages" for more than a month. Support kept closing the ticket and offered £15 off ([r/JoinFleek](https://www.reddit.com/r/JoinFleek/comments/1s5lxe1/update_for_my_bad_experience_with_fleek/)).
  - Another: "It took two months to receive two of those orders and I am still waiting on the other two" ([r/JoinFleek](https://www.reddit.com/r/JoinFleek/comments/1sevagi/anyone_here_using_fleek_for_sourcing/)).
  - A buyer paid €1,500 and received half the items, some of them wrong ([r/Flipping](https://www.reddit.com/r/Flipping/comments/1ncymkq/vintage_wholesale_supply_is_scammer/)).
- **What exists and why it falls short:** Carrier tracking pages, platform support queues and chargebacks. Chargebacks are a blunt tool that also hurts good suppliers, as that buyer noted.
- **Agent angle:** Good fit for an always-on agent. It watches tracking, messages the supplier and the platform on a schedule, logs every contact, and escalates before protection deadlines.
- **One-day demo-ability:** Medium. You'd need mocked tracking events. The value shows over days, not minutes.
- **Sponsor tools that fit:** Grok Bot (webhook routines, memory), Supabase, Tavily (carrier status pages).

### 8. [Marketplaces, trust] **AI-made listings, fakes and faked damage claims**
- **Who hurts:** Vinted, Depop and eBay buyers, honest sellers facing false "not as described" claims, and the platforms' support teams.
- **Evidence:**
  - One in four UK secondhand clothing buyers unknowingly bought a fake in the past year. Nearly 60% of them had problems, including refund disputes ([Just Style](https://www.just-style.com/news/uk-issues-guidance-on-spotting-counterfeit-secondhand-fashion/)).
  - 45% of 18–24-year-olds have encountered counterfeit designer items on resale platforms ([HotMinute, on IPO research](https://hotminute.co.uk/2026/05/29/nearly-half-of-uk-18-to-24-year-olds-have-been-sold-counterfeits-on-vinted-and-ebay/)).
  - Researchers found Vinted shops selling Shein and Temu items at about double the price using AI try-on photos. Buyers are also reportedly AI-editing damage into photos to get refunds ([nss magazine](https://www.nssmag.com/en/fashion/45705/artificial-intelligence-ai-vinted-scams-fake-listings)).
  - Vinted buyers get 48 hours to raise concerns ([GOV.UK](https://www.gov.uk/government/publications/how-to-spot-fake-fashion-when-shopping-second-hand/how-to-spot-fake-fashion-when-shopping-second-hand)). 70% of Vestiaire users rank authentication as the most valuable digital-passport feature ([BCG](https://www.bcg.com/publications/2025/how-fashion-luxury-brands-can-win-secondhand-market)).
- **What exists and why it falls short:** Vinted Item Verification (designer items only), Entrupy and Legit Check. They cover luxury pieces, not the mid-market bulk, and not the question of whether a photo is real.
- **Agent angle:** Partial. An agent can check whether listing photos appear elsewhere (reverse search via Tavily), flag supplier-catalogue images and check photo metadata. It cannot reliably authenticate garments from photos, so the claims need to stay modest.
- **One-day demo-ability:** Medium.
- **Sponsor tools that fit:** Tavily, Grok Bot (vision), Supabase.

### 9. [Reselling] **Crosslisting still double-sells, especially on Vinted**
- **Who hurts:** UK part-time and full-time resellers listing the same one-off item on Vinted, Depop and eBay.
- **Evidence:**
  - Vinted sale detection works only through a Chrome extension, can take up to 30 minutes, and Vinted can't relist ([Crosslist docs](https://docs.crosslist.com/knowledge-base/sales/autodelist)).
  - List Perfectly's auto-delist "can't bypass captchas" and needs a logged-in, awake device ([List Perfectly](https://listperfectly.com/selling/the-ultimate-guide-to-list-perfectlys-auto-delist/)).
  - June 2026: "the tools I've tried seem to handle it unreliably". Top reply: "Manually" ([r/vinted](https://www.reddit.com/r/vinted/comments/1u77c7a/anyone_selling_on_vinted_and_other_apps_how_do/)). A Vendoo user says "it doesn't always delist sold items across all platforms" ([r/Depop](https://www.reddit.com/r/Depop/comments/1sf3vun/crosslisting_tools_that_actually_sync_inventory/)).
- **What exists and why it falls short:** Vendoo, List Perfectly, Crosslist and Vintedge. Where there's no API, they rely on the seller's own browser being open.
- **Agent angle:** Plausible. An always-on cloud browser removes the "device must be awake" problem. Be honest about the risk: automating Vinted may breach its terms, and captchas remain.
- **One-day demo-ability:** Medium. Fragile on stage.
- **Sponsor tools that fit:** Grok Bot (cloud browser), Shopify (as the master inventory), Supabase.

### 10. [Reselling] **Pricing and listing one-off items takes too long**
- **Who hurts:** Resellers with a backlog of unlisted stock, often freshly bought bundles, and casual sellers who never list at all.
- **Evidence:**
  - "About 20 min per item, 2 hours for 6 items": ironing, measurements, pricing research and writing ([r/reselling](https://www.reddit.com/r/reselling/comments/1pnan56/how_long_does_it_take_you_to_list_a_single_item/)).
  - Vinted's suggested prices are "mostly way too low". One seller's shirts had a £2 suggestion and sold for nearly £20 ([r/vinted](https://www.reddit.com/r/vinted/comments/1m6p3aj/am_i_pricing_too_low/)). A pricing-tool vendor claims Vinted's suggestions run 10–15% below sold medians; treat that as a vendor claim ([Vinta](https://blog.vinta.app/blog/how-to-price-high-value-items-vinted)).
  - ThredUp says unlocking $23.3bn needs "making the act of selling just as easy as clicking 'buy'" ([ThredUp](https://ir.thredup.com/node/11491/pdf)). BCG found busy schedules limit sellers ([Vestiaire x BCG](https://www.vestiairecollective.com/journal/vestiaire-collective-x-bcg/)).
- **What exists and why it falls short:** eBay Magic Listing (95% of sellers in early tests used its AI descriptions, per [a16z](https://a16z.com/marketplaces-in-the-age-of-ai/)), Vinted's price suggestions, Vinting and Thrifly. Pricing from sold listings is still manual across platforms. Some sellers object to pricing tools on ethical grounds ([r/vinted](https://www.reddit.com/r/vinted/comments/1iqsyaf/hey_everyone_quick_question_how_do_you_determine/)).
- **Agent angle:** Good but crowded. Photos go in; the agent drafts a listing, researches comparable sold prices, recommends a price band and explains why. The new angle for this venue is doing it for a whole bundle: "this £300 bale should net about £X".
- **One-day demo-ability:** High.
- **Sponsor tools that fit:** Tavily, Grok Bot, Shopify, Supabase, PostHog.

### 11. [Reselling] **Returns and take-back resale for small brands**
- **Who hurts:** Direct-to-consumer brands below enterprise scale that write off lightly worn returns.
- **Evidence:**
  - Rhone processes about 5,000 returns a month and donated lightly worn items. Donating means "basically losing all the upfront investment" ([Modern Retail](https://www.modernretail.co/operations/rhone-debuts-resale-site-built-on-customer-returns/)).
  - Archive and Trove's showcased clients are large brands: New Balance (about 100,000 pairs recirculated) and Calvin Klein ([Archive](https://www.archiveresale.com/blog/new-balance-expands-reconsidered-to-include-apparel), [Debrand](https://debrand.ca/blog/calvin-klein-announcement/)).
  - Trove bought reverse.supply citing EU producer-responsibility pressure ([Trove](https://trove.com/resources/trove-uk-eu-expansion/)). EU textile schemes must be running by April 2028 ([B&D](https://www.bdlaw.com/publications/eu-targets-textile-waste-with-waste-framework-directive-amendments/)).
- **What exists and why it falls short:** Archive, Trove, ThredUp's resale-as-a-service and Tersus. These are managed programmes with cleaning and warehousing; nothing lightweight exists for a 5-person Shopify brand. (That's an inference from their client lists, not proven pricing.)
- **Agent angle:** Good. The agent grades return photos, decides whether to restock, sell as "pre-loved" or donate, and lists pre-loved items in a Shopify collection at a condition-based price.
- **One-day demo-ability:** Medium–High.
- **Sponsor tools that fit:** Shopify, Sanity (condition grades), Grok Bot, Supabase, PostHog.

### 12. [Programmatic purchasing] **Letting an agent buy needs spending rules, not just a card**
- **Who hurts:** Small businesses and developers who want agents to reorder or buy, and merchants unsure whether to accept agent traffic.
- **Evidence:**
  - Developer blockers: "Stripe requires 3D Secure for off-session payments; e-commerce sites block browser automation" ([HN](https://news.ycombinator.com/item?id=47371289)).
  - "Spend authorization is the hard part… the pre-action judgment layer is the problem" ([r/AI_Agents](https://www.reddit.com/r/AI_Agents/comments/1rfitui/trusting_agents_with_your_money/)).
  - Visa's agent platform offers spend limits, merchant-category limits and real-time approval, and Mastercard binds guardrails to agent tokens ([Visa/Artemis report](https://www.visa.com/api/image-proxy?path=%2Fcontent%2Fdam%2Fvisa%2Freimagine-visa%2Fthought-leadership%2Fdocuments%2Fagentic-payments-report.pdf)). These are network-level controls, not controls a small business manages itself.
  - Shopify's UCP identity linking runs almost entirely through one provider, Shop ([UCP Checker](https://ucpchecker.com/blog/state-of-agentic-commerce-september-2026)).
- **What exists and why it falls short:** Agentspay, AWS AgentCore Payments ([OpenAI cookbook](https://developers.openai.com/cookbook/examples/partners/aws/controlled_agentic_commerce_with_agentcore_payments/controlled_agentic_commerce)) and virtual cards. They're aimed at developers; nothing gives a shop owner a "buy up to £200 of these SKUs from these suppliers, ask me above that" rule.
- **Agent angle:** Strong fit. A spending-rules layer: the agent proposes a purchase, the rules engine approves, rejects or escalates it (for example via a Telegram tap), then checkout runs on a UCP-enabled Shopify store with a full audit trail.
- **One-day demo-ability:** High on a dev store with a test card.
- **Sponsor tools that fit:** Grok Bot, Shopify (UCP), Commerce Layer, Supabase (rules and audit log), Vercel.

### 13. [Programmatic purchasing] **Restocking by eyeball and comparing supplier quotes by hand**
- **Who hurts:** Small Shopify sellers and resellers who restock from a handful of suppliers, including Fleek buyers re-sourcing categories that sell well.
- **Evidence:**
  - "I… just try to estimate by eye when I should reorder" ([r/smallbusiness](https://www.reddit.com/r/smallbusiness/comments/1si8nrh/i_cant_keep_up_with_inventory_and_reordering/)).
  - Quotes arrive as "unit price only… MOQ but no lead time… 'shipping extra'" ([r/procurement](https://www.reddit.com/r/procurement/comments/1qn5ad5/how_do_you_compare_supplier_quotes_when_everyone/)). A home-made quote-comparison agent drew "Demo please" replies ([r/procurement](https://www.reddit.com/r/procurement/comments/1m6iyha/i_made_an_ai_agent_to_compare_the_rfqs_happy_to/)).
  - Fleek already supports sourcing requests and "Make an Offer" negotiation ([Fleek](https://www.joinfleek.com/home)).
- **What exists and why it falls short:** inFlow, Zoho Inventory, Katana and Cin7 (about $30–200 a month, per [r/smallbusiness](https://www.reddit.com/r/smallbusiness/comments/1tvgyp3/what_do_small_businesses_use_to_track_suppliers/)) and Lumari (YC, aimed at direct procurement with an ERP; [Lumari](https://lumari.ai/)). None ties sell-through on one-off secondhand stock to "which bundle to buy next".
- **Agent angle:** Strong fit. The agent watches Shopify sell-through by category, sends quote requests to suppliers, turns the replies into a comparison table, and drafts an order for approval. It pairs well with the spending rules in entry 12.
- **One-day demo-ability:** High.
- **Sponsor tools that fit:** Shopify, Grok Bot (email and routines), Supabase, PostHog, Tavily.

### 14. [Programmatic purchasing] **Drops and pre-orders: bots up front, broken promises afterwards**
- **Who hurts:** Small streetwear and vintage brands running limited drops and pre-orders.
- **Evidence:**
  - Bots make up "about 10%-50% of all entries" to Nike launches ([Nike](https://www.nike.com/launch/t/inside-snkrs-fairness)). One Dunk relaunch drew 11m bot attempts for 3,600 pairs ([CrowdHandler](https://www.crowdhandler.com/blog/how-crowdhandler-supported-the-nike-x-wu-tang-clan-dunk-relaunch)).
  - Shopify lists pre-orders as higher risk when setting payout reserves ([Shopify Help](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/reserves)).
  - A deposit balance can charge on a fixed date even after the shipment slips ([Stoq](https://www.stoqapp.com/blog/shopify-preorder-delays)).
- **What exists and why it falls short:** Queue-it, CrowdHandler and EQL handle fairness at the front. Pre-order apps handle checkout. Nothing handles what happens after a date slips: messages, re-charging, refunds.
- **Agent angle:** Honest split. Blocking bots is an infrastructure problem, not an agent one. An agent does fit the aftermath: spotting a supplier delay, sending delay notices with a cancel option, pausing balance charges, and producing dispute evidence.
- **One-day demo-ability:** Medium.
- **Sponsor tools that fit:** Shopify, Grok Bot, Supabase, PostHog.

## Underserved niches worth a look

- **Tracking the tax-reporting threshold for Vinted sellers.** Platforms now report sellers with 30+ sales or £1,700+ a year to HMRC, and the first 2025 data went over in January 2026. Casual sellers don't know where they stand ([Vendy Studio](https://www.vendystudio.com/blog/vinted-uk-hmrc-tax-guide-2026)).
- **Football-shirt mystery boxes.** A £1 "mystery shirt" promotion was ruled misleading ([ASA CrypticKits](https://www.asa.org.uk/rulings/cryptickits-g23-1200829-cryptickits.html)). This is a hobby vertical where provable box contents would matter.
- **Intimates and swimwear take-back.** Calvin Klein's scheme accepts intimates, "a category often excluded from circularity programs" ([Debrand](https://debrand.ca/blog/calvin-klein-announcement/)).
- **Resellers pooling orders to reach volume price tiers.** Fleek's pricing is "the more you buy, the less you pay per piece" ([Fleek](https://www.joinfleek.com/home)). Consumer group-buying has failed on subsidies ([Facily post-mortem](https://unicornburn.com/autopsy/facily-social-commerce-brazil)), but B2B pooling between trusted resellers is untested.
- **Agents paying for data during sourcing.** x402 lets an agent pay per request for a supplier report within a set limit ([OpenAI cookbook](https://developers.openai.com/cookbook/examples/partners/aws/controlled_agentic_commerce_with_agentcore_payments/controlled_agentic_commerce)). That could support per-lookup pricing checks or supplier-reputation queries.

## Sources

- https://www.tlt.com/insights-and-events/insight/dmcc-act-subscription-contracts-regime-brought-forward-by-the-pm-what-do-businesses-need-to-know
- https://brodies.com/insights/commercial-contracts-and-outsourcing/the-dmcca-subscription-contracts-the-timeline-just-got-shorter/
- https://www.twobirds.com/en/insights/2026/uk/subscription-contract-changes-to-be-brought-forward-to-january-2027
- https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/outcome/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version
- https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version
- https://www.gov.uk/government/news/new-measures-unveiled-to-crack-down-on-subscription-traps
- https://assets.publishing.service.gov.uk/media/60f672b98fa8f50c76838794/rccp-subscriptions-traps-ia.pdf
- https://www.legislation.gov.uk/ukpga/2024/13/part/4/chapter/2
- https://www.citizensadvice.org.uk/about-us/media-centre/press-releases/consumers-spend-688-million-on-unused-subscriptions-in-the-last-year/
- https://www.financial-ombudsman.org.uk/decision/DRN-5918106.pdf
- https://www.aoshearman.com/en/insights/cma-clamps-down-on-checkout-tricks-as-consumer-enforcement-pipeline-accelerates
- https://www.bclplaw.com/en-US/events-insights-news/cma-imposes-first-financial-penalty-under-new-consumer-powers-in-drip-pricing-crackdown.html
- https://getrecharge.com/reports/subscription-trend-report-2026/
- https://getrecharge.com/blog/supplement-subscription-retention/
- https://support.getrecharge.com/hc/en-us/articles/8592670804503-Handling-out-of-stock-orders-and-products
- https://support.getrecharge.com/hc/en-us/articles/10093532488343-Configuring-partial-order-fulfillment-for-out-of-stock-items
- https://support.getrecharge.com/hc/en-us/articles/11808240171287-Getting-started-with-dynamically-priced-customizable-bundles
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GWFU7NECYFLW6M6U
- https://www.reddit.com/r/amazonprime/comments/1iuvxzt/bait_and_switch_with_subscribe_and_save/
- https://www.reddit.com/r/AmazonWTF/comments/1jiwq29/always_review_your_subscribe_and_save/
- https://bogos.io/shopify-bundle-inventory-management/
- https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-customized-bundle-function
- https://www.sumtracker.com/blog/how-to-reliably-sync-bundle-inventory-across-sales-channels
- https://www.asa.org.uk/rulings/groupon-international-ltd.html
- https://www.asa.org.uk/rulings/cryptickits-g23-1200829-cryptickits.html
- https://www.asa.org.uk/rulings/the-hut-com-ltd-g21-1123050-the-hut-com-ltd.html
- https://seller-uk.tiktok.com/university/essay?knowledge_id=1514396635858690
- https://www.thredup.com/resale
- https://ir.thredup.com/node/11491/pdf
- https://company.vinted.com/newsroom/financial-results-2025
- https://www.reuters.com/business/retail-consumer/second-hand-fashion-platform-vinted-reports-38-jump-revenue-2026-04-09/
- https://www.mckinsey.com/industries/retail/our-insights/state-of-fashion
- https://www.bcg.com/publications/2025/how-fashion-luxury-brands-can-win-secondhand-market
- https://www.vestiairecollective.com/journal/vestiaire-collective-x-bcg/
- https://www.joinfleek.com/home
- https://apps.apple.com/us/app/fleek-wholesale/id1631016145
- https://techcrunch.com/2024/11/12/fleek-a-marketplace-for-wholesale-second-hand-clothes-sews-up-20m/
- https://www.reddit.com/r/reselling/comments/1rsnlha/dont_purchase_from_vintage_wholesale_supply_in/
- https://www.reddit.com/r/Flipping/comments/1ncymkq/vintage_wholesale_supply_is_scammer/
- https://www.reddit.com/r/Depop/comments/gieiy9/has_anyone_had_any_experience_with_bulk_vintage/
- https://www.reddit.com/r/LegalAdviceUK/comments/10pa3cp/purchased_a_bale_of_vintage_clothing_from_an/
- https://www.reddit.com/r/reselling/comments/1jvr0d4/opinions_about_the_fleek_app_where_they_sell_lots/
- https://www.reddit.com/r/reselling/comments/1klvh8u/is_fleek_reliable/
- https://www.reddit.com/r/JoinFleek/comments/1s5lxe1/update_for_my_bad_experience_with_fleek/
- https://www.reddit.com/r/JoinFleek/comments/1sevagi/anyone_here_using_fleek_for_sourcing/
- https://environment.ec.europa.eu/news/revised-waste-framework-directive-enters-force-2025-10-16_en
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32025L1892
- https://www.bdlaw.com/publications/eu-targets-textile-waste-with-waste-framework-directive-amendments/
- https://www.just-style.com/news/uk-issues-guidance-on-spotting-counterfeit-secondhand-fashion/
- https://hotminute.co.uk/2026/05/29/nearly-half-of-uk-18-to-24-year-olds-have-been-sold-counterfeits-on-vinted-and-ebay/
- https://www.gov.uk/government/publications/how-to-spot-fake-fashion-when-shopping-second-hand/how-to-spot-fake-fashion-when-shopping-second-hand
- https://www.nssmag.com/en/fashion/45705/artificial-intelligence-ai-vinted-scams-fake-listings
- https://docs.crosslist.com/knowledge-base/sales/autodelist
- https://listperfectly.com/selling/the-ultimate-guide-to-list-perfectlys-auto-delist/
- https://www.reddit.com/r/vinted/comments/1u77c7a/anyone_selling_on_vinted_and_other_apps_how_do/
- https://www.reddit.com/r/Depop/comments/1sf3vun/crosslisting_tools_that_actually_sync_inventory/
- https://www.reddit.com/r/reselling/comments/1pnan56/how_long_does_it_take_you_to_list_a_single_item/
- https://www.reddit.com/r/vinted/comments/1m6p3aj/am_i_pricing_too_low/
- https://www.reddit.com/r/vinted/comments/1iqsyaf/hey_everyone_quick_question_how_do_you_determine/
- https://blog.vinta.app/blog/how-to-price-high-value-items-vinted
- https://a16z.com/marketplaces-in-the-age-of-ai/
- https://a16z.com/marketplaces-in-the-age-of-ai-take-two-graveyard-to-greenfield/
- https://www.modernretail.co/operations/rhone-debuts-resale-site-built-on-customer-returns/
- https://www.archiveresale.com/blog/new-balance-expands-reconsidered-to-include-apparel
- https://debrand.ca/blog/calvin-klein-announcement/
- https://trove.com/resources/trove-uk-eu-expansion/
- https://www.visa.co.uk/about-visa/newsroom/press-releases.3457328.html
- https://www.visa.com/api/image-proxy?path=%2Fcontent%2Fdam%2Fvisa%2Freimagine-visa%2Fthought-leadership%2Fdocuments%2Fagentic-payments-report.pdf
- https://www.mastercard.com/us/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html
- https://openai.com/index/buy-it-in-chatgpt/
- https://shopify.engineering/UCP
- https://rye.com/blog/openai-chatgpt-checkout-agentic-commerce
- https://ucpchecker.com/blog/state-of-agentic-commerce-september-2026
- https://news.ycombinator.com/item?id=47371289
- https://www.reddit.com/r/AI_Agents/comments/1rfitui/trusting_agents_with_your_money/
- https://developers.openai.com/cookbook/examples/partners/aws/controlled_agentic_commerce_with_agentcore_payments/controlled_agentic_commerce
- https://www.reddit.com/r/smallbusiness/comments/1si8nrh/i_cant_keep_up_with_inventory_and_reordering/
- https://www.reddit.com/r/smallbusiness/comments/1tvgyp3/what_do_small_businesses_use_to_track_suppliers/
- https://www.reddit.com/r/procurement/comments/1qn5ad5/how_do_you_compare_supplier_quotes_when_everyone/
- https://www.reddit.com/r/procurement/comments/1m6iyha/i_made_an_ai_agent_to_compare_the_rfqs_happy_to/
- https://lumari.ai/
- https://www.nike.com/launch/t/inside-snkrs-fairness
- https://www.crowdhandler.com/blog/how-crowdhandler-supported-the-nike-x-wu-tang-clan-dunk-relaunch
- https://help.shopify.com/en/manual/payments/shopify-payments/payouts/reserves
- https://www.stoqapp.com/blog/shopify-preorder-delays
- https://www.fca.org.uk/publications/policy-statements/ps26-1-regulation-deferred-payment-credit
- https://www.vendystudio.com/blog/vinted-uk-hmrc-tax-guide-2026
- https://unicornburn.com/autopsy/facily-social-commerce-brazil

Sources I left out on purpose: several "Online Store News" articles on Faire vs Ankorstore and Recharge churn gave contradictory fee and churn figures, so none of their numbers appear above. I also found no reliable 2026 figures for Faire or Ankorstore commissions.
