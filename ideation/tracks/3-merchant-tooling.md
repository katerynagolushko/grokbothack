# Track 3: Merchant Tooling

> Official brief: "Build tools that help merchants manage, optimise and grow their stores." Research compiled 26 Sep 2026. Vendor-sourced stats are flagged as such.

## Landscape

- **Shopify's own AI assistant is now in daily use, and merchants are using it to build their own tools.** In Q2 2026, daily active merchants using Sidekick were up 3.6x year on year. It handled nearly 34 million conversations and was used to create more than 36,000 custom apps, up from 12,000 in Q1. About half of a new merchant's Sidekick conversations are about setting up the store. For merchants five years in, over 40% are about analytics and reporting ([Shopify Q2 2026 call, StockAnalysis](https://stockanalysis.com/stocks/shop/transcripts/660732-q2-2026/); [Motley Fool](https://www.fool.com/earnings/call-transcripts/2026/08/12/shopify-shop-q2-2026-earnings-call-transcript/)). App developers still say "only a small percentage of our merchants utilize it" and complain there is no usage data ([Shopify dev forum](https://community.shopify.dev/t/sidekick-feedback/36381)). One secondary article claims Sidekick was deprioritised in 2025 with under 12% weekly use ([Signal](https://www.readsignal.io/article/shopify-data-moat-ai-sidekick)). It contradicts Shopify's disclosures and I could not verify it, so treat it as unconfirmed.
- **Selling through AI assistants is real but mostly limited to the US, and most merchants are not ready for it.** Traffic from generative AI to US retail sites rose 693% over the 2025 holidays, and those visitors converted 31% better than other traffic ([Adobe](https://business.adobe.com/blog/ai-driven-traffic-surges-across-industries)). Only 15% of merchants have structured product data that AI agents can read, and only 23% can identify traffic coming from AI ([Visa/PYMNTS GDSI](https://www.visaacceptance.com/en-us/insights/global-digital-shopping-index-agentic.html)). Checkout inside AI channels is for US buyers only. UK stores can take part only if they sell to the US ([Shopify UK](https://www.shopify.com/uk/blog/how-agentic-commerce-works)).
- **Resale is growing, and supply is now the bottleneck, which means the seller's workload is the problem.** The global secondhand apparel market is projected to reach $393bn by 2030. ThredUp says "supply is the new constraint" and that selling must become "as easy as clicking buy" ([ThredUp 2026](https://newsroom.thredup.com/news/thredup-14th-resale-report)).
- **UK and EU compliance keeps piling up:**
  - EU General Product Safety Regulation (GPSR) since Dec 2024, which covers used goods too ([business.gov.uk](https://www.business.gov.uk/campaign/europe/european-union-eu-regulations/eu-general-product-safety-regulation-eu-gpsr/)).
  - European Accessibility Act (EAA) since June 2025.
  - UK packaging EPR (extended producer responsibility) reporting.
  - HMRC platform reporting since 2024 ([GOV.UK](https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform)).
  - The DMCCA subscription rules (Digital Markets, Competition and Consumers Act), brought forward to January 2027 ([TLT](https://www.tlt.com/insights-and-events/insight/dmcc-act-subscription-contracts-regime-brought-forward-by-the-pm-what-do-businesses-need-to-know)).
  - The £135 low-value import relief abolished by October 2028 at the latest ([KPMG](https://kpmg.com/uk/en/insights/tax/small-parcels-big-impact.html)).
  - EU textile EPR by April 2028 ([EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202501892)).
- **Platforms are dropping native tools and leaving gaps.** Shopify's Stocky inventory app shut down on 31 Aug 2026. Supplier lists cannot be exported ([Shopify Help](https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky)). Shopify Marketplace Connect only reduces stock when it imports a matching order, so merchants report overselling ([Shopify Community](https://community.shopify.com/t/marketplace-connect-not-syncing-inventory/311671)).
- **UK small-business AI use is broad but shallow.** 54% of UK SMEs used AI in early 2026, but only about 10% have systems tailored to their business ([ISER/BCC](https://www.iser.essex.ac.uk/wp-content/uploads/files/working-papers/iser/2026-01.pdf)). In August 2025, only 19% of retail SMEs used AI ([YouGov](https://yougov.com/en-gb/articles/52730-we-polled-uk-sme-leaders-about-ai-adoption-heres-what-they-said?utm=)). Only 11% of firms automate to a "great extent" ([BCC](https://www.britishchambers.org.uk/wp-content/uploads/2025/09/The-Turning-Point-for-SMEs-Unlocking-the-next-level-of-AI.pdf?msg_pos=3)).

## Gaps and niches

### 1. **App-stack audit: which subscriptions actually earn their keep**
- **Who hurts:** A one- or two-person Shopify store paying £150–£1,000 a month across 6–15 apps with no idea which ones move revenue.
- **Evidence:**
  - Across 120,017 stores, those with 3+ paid apps spend about $150 a month and those with 6+ spend $400–600 ([StoreInspect](https://storeinspect.com/blog/shopify-app-spending)).
  - "Six subscriptions, $167/mo, and none of them drive a single extra sale" ([r/shopify](https://www.reddit.com/r/shopify/comments/1pdulmb/anyone_else_tired_of_paying_for_6_different_apps/)).
  - "I have 14 installed but only use 3… paying $200/month" ([r/shopify](https://www.reddit.com/r/shopify/comments/1mi4xzb/can_we_talk_about_shopify_apps_and_how_i_have_14/)).
  - "Most store owners make these decisions on gut feel" ([r/shopify](https://www.reddit.com/r/shopify/comments/1o93nse/how_much_are_you_spending_on_shopify_apps_per_month/)).
- **What exists and why it falls short:** Merchants replace apps with Shopify Flow, n8n or Pipedream, or with Sidekick-built custom apps. That removes cost but doesn't measure whether an app was worth it. No tool matches each app's cost against the metric it claims to move, or tests switching one off safely.
- **Agent angle:** Good fit. An agent lists installed apps and billing, maps each to the metric it claims to affect (average order value from upsells, review conversion), and uses PostHog to compare before and after. It then proposes "switch off for 14 days" experiments and a replacement Flow or script. Grok Bot could read app billing pages that have no API.
- **One-day demo-ability:** High. A seeded dev store with fake app costs and a PostHog experiment gives a clear before and after.
- **Sponsor tools that fit:** Shopify, PostHog, Supabase, Cursor, Grok Bot.

### 2. **Photo-to-listing for one-off secondhand items**
- **Who hurts:** Vinted, Depop and eBay clothing resellers and small vintage shops listing 10–50 unique items a day.
- **Evidence:**
  - 22 clothing items photographed and drafted in "like 2 hours". Clothing is slowest because "I have to measure everything" ([r/Flipping](https://www.reddit.com/r/Flipping/comments/1hpghj0/how_long_does_it_take_you_to_photographlist_your/)).
  - About 20 minutes per item manually, and "taking pictures and measurements is the difficult part… wish there was a way to speed that up" ([r/reselling](https://www.reddit.com/r/reselling/comments/1pnan56/how_long_does_it_take_you_to_list_a_single_item/)).
  - The average time from intake to online is 10 minutes per garment. Many resellers list only their best stock online because of it ([Tailored Co](https://www.thetailoredco.com/resale-clothing-app-for-speedier-listings/)).
  - ThredUp names supply, meaning how easy it is to sell, as the core constraint ([ThredUp](https://newsroom.thredup.com/news/thredup-14th-resale-report)).
- **What exists and why it falls short:** Vendoo, List Perfectly, Crosslist and Spadeberry fill forms from photos. Measurements, condition notes and flaws still need a human. Users also complain about paid add-ons and field errors across platforms ([r/BehindTheClosetDoor](https://www.reddit.com/r/BehindTheClosetDoor/comments/1l1bdsd/whats_the_best_crosslisting_app_for_resellers/)).
- **Agent angle:** Strong fit, and relevant to the host (Fleek). Vision turns photos into structured attributes (brand, size, material, era, flaws), stored in Sanity as one master record. Grok Bot's browser then publishes to Vinted and Depop, which have no open API.
- **One-day demo-ability:** High. Photograph five real garments on stage and show them live on two channels.
- **Sponsor tools that fit:** Grok Bot, Sanity, Shopify, Supabase, Vercel.

### 3. **Always-on delisting for single-quantity stock across marketplaces**
- **Who hurts:** Resellers cross-listing unique items on Vinted, Depop, eBay and Shopify, who double-sell overnight.
- **Evidence:**
  - Crosslist detects Vinted sales through a Chrome extension, which can take up to 30 minutes. Vinted listings can't be relisted ([Crosslist docs](https://docs.crosslist.com/knowledge-base/sales/autodelist)).
  - Vendoo checks for sales about every 10 minutes and only "while your computer is on… close your laptop overnight and you have no protection" ([FLUF comparison](https://fluf.io/compare/vendoo-alternative/)).
  - With Marketplace Connect, eBay sales don't reduce Shopify stock, so items relist on the next 30-minute sync ([Shopify Community](https://community.shopify.com/t/inventory-sync-without-importig-the-order/384296/1)).
- **What exists and why it falls short:** Vendoo, List Perfectly and Crosslist depend on a browser extension. Vinted's official Pro API is only open to allowlisted Pro accounts ([Vinted Pro docs](https://pro-docs.svc.vinted.com/)).
- **Agent angle:** Grok Bot's cloud computer is the key point here. It is a browser that is always logged in and doesn't need the seller's laptop open. Be honest about the limits: polling many accounts through a browser is fragile, and automating Vinted may breach its terms.
- **One-day demo-ability:** Medium-High. Sell on one channel and watch the others delist within minutes. Reliability over time can't be shown in a day.
- **Sponsor tools that fit:** Grok Bot, Supabase (inventory ledger), Shopify, Commerce Layer.

### 4. **Pricing unique items from sold comparables**
- **Who hurts:** Secondhand and vintage sellers, whose items have no barcode to match against.
- **Evidence:**
  - "2 minutes to price research (this is where I bog down the most)" ([r/reselling](https://www.reddit.com/r/reselling/comments/1pnan56/how_long_does_it_take_you_to_list_a_single_item/)).
  - "I research every item and find comps… list close to the average SOLD price" ([r/Flipping](https://www.reddit.com/r/Flipping/comments/1hpghj0/how_long_does_it_take_you_to_photographlist_your/)).
  - ThredUp says sellers now optimise for "liquidity, not maximum price" ([ThredUp 2026 report](https://cf-assets-tup.thredup.com/resale_report/2026/ThredUp_Resale_Report_2026.pdf)).
- **What exists and why it falls short:** Pricefy matches products by EAN/GTIN barcode or visual similarity ([Pricefy](https://www.pricefy.io/)). Prisync starts at $99 a month ([PageCrawl](https://pagecrawl.io/blog/best-ecommerce-monitoring-tools)). Both are built for new goods with SKUs. Vinted's official API offers no catalogue search ([Lobstr](https://www.lobstr.io/blog/vinted-api)).
- **Agent angle:** Good fit. Tavily and the browser gather sold and active comparables from eBay, Vinted and Depop. The agent weighs them by condition grade and platform fees and suggests a "quick sale" price and a "hold" price. It then learns from what actually sells, using Supabase.
- **One-day demo-ability:** High. Photograph an item, get a price band with its evidence.
- **Sponsor tools that fit:** Tavily, Grok Bot, Supabase, PostHog.

### 5. **Checking wholesale bales against what the supplier claimed**
- **Who hurts:** Small resale shops buying £300–£5,000 bales on Fleek or from direct suppliers.
- **Evidence:**
  - Fleek's grade AB means 70% grade A and 30% grade B, with "a margin error of up to 10%". A review on the same page reads: "all Carhartt pants but they all with paint spots, holes. It's a CD rate not a AB" ([Fleek listing](https://www.joinfleek.com/products/custom-handpick-zander-500-gbp-mix-bale)).
  - A buyer who says they spent almost £100k: "grade A/B (in other words from experience, mostly B, a few C's)". Fleek's reply points buyers to repeat-buyer counts ([r/reselling](https://www.reddit.com/r/reselling/comments/1klvh8u/is_fleek_reliable/)).
  - Sorting a mixed bale takes 10–14 hours per 100 items, against 5–7 for pre-graded bundles ([vintagesupplier.com](https://vintagesupplier.com/branded-clothing-bundle-vs-bale-which-is-better-for-resale/)).
- **What exists and why it falls short:** Suppliers self-grade, marketplace reviews can be gamed, and there is no independent evidence at unboxing.
- **Agent angle:** Medium fit. Vision grades each item at unboxing and compares the actual grade mix with the listing, producing a dispute pack and a supplier scorecard. Honest caveat: grading stains and holes from photos is error-prone, so a human should confirm.
- **One-day demo-ability:** Medium. It works with 20 staged garments, but grading accuracy is hard to prove on stage.
- **Sponsor tools that fit:** Grok Bot, Supabase, Sanity, Vercel.

### 6. **Agent-readiness audit: is the store even visible to AI shoppers?**
- **Who hurts:** UK DTC (direct-to-consumer) merchants on Shopify or custom stacks behind Cloudflare.
- **Evidence:**
  - Only 15% of merchants have agent-readable product data, 23% can identify AI traffic, and 11% of SMBs count as agent-ready ([PYMNTS](https://www.pymnts.com/smbs/2026/visa-says-small-merchants-could-move-faster-on-ai-shopping/)).
  - Cloudflare blocks AI crawlers by default on zones created after mid-2025, so "your store may already be invisible to AI search without anyone having chosen that" ([Depict](https://depict.ai/resources/guides/shopify-bot-traffic)). Defaults changed again on 15 Sep 2026 ([Cloudflare docs](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/)).
  - AI referrals convert 31% better than other traffic ([Adobe](https://business.adobe.com/blog/ai-driven-traffic-surges-across-industries)).
- **What exists and why it falls short:** Shopify's admin tracks "product data quality" for its AI channels ([BLKDG](https://www.blkdg.com/blog/agentic-commerce-shopify/)). It doesn't check CDN or bot settings, test what an agent actually sees, or cover stores that aren't on Shopify.
- **Agent angle:** Strong fit. Grok Bot acts as a shopper agent against the store, checks robots.txt and bot blocks, and asks real questions ("is this jacket true to size and in stock?"). It scores the answers, then writes fixes back through Sanity or Shopify. PostHog adds tracking of AI referrals.
- **One-day demo-ability:** High. Audit a real UK store, then re-run it after fixes.
- **Sponsor tools that fit:** Grok Bot, Tavily, Sanity, Shopify, PostHog, Commerce Layer.

### 7. **GPSR data for used and vintage listings sold into the EU**
- **Who hurts:** UK eBay, Etsy and Vinted Pro sellers of used goods who ship to EU or Northern Ireland buyers.
- **Evidence:**
  - Amazon's GPSR guidance says it covers "used, repaired, and reconditioned items", and non-compliant listings risk removal ([Amazon Seller Forums](https://sellercentral.amazon.co.uk/seller-forums/discussions/t/611e88dd-bc36-4cdd-b74b-380416e8c28e)).
  - An eBay seller: manufacturers "have long gone out of business… nearly impossible to comply". Entering "Unknown" is not legally enough ([EUProof](https://www.euproof.com/blog/gpsr-ebay)).
  - Etsy suggests opting out of EU buyers if unsure ([Etsy Seller Handbook](https://www.etsy.com/seller-handbook/article/1093438529659)).
  - Small UK firms are weighing whether EU sales remain viable at all ([UK Trade and Business Commission](https://www.tradeandbusiness.uk/news/what-is-gpsr)).
- **What exists and why it falls short:** Responsible Person services and generic compliance software. Nothing sorts a catalogue of one-off items into "compliant", "fixable" and "block from the EU".
- **Agent angle:** Good fit. Tavily researches current manufacturer contacts for each brand, flags genuine antiques (100+ years old, which are exempt), fills GPSR fields, and sets per-item EU visibility. A human signs off.
- **One-day demo-ability:** Medium-High. Take 30 real listings to a compliance report and push fixes.
- **Sponsor tools that fit:** Tavily, Grok Bot, Sanity, Shopify.

### 8. **Evidence packs for disputes, chargebacks and "not as described" claims**
- **Who hurts:** Small merchants without a disputes team, and marketplace sellers facing false claims.
- **Evidence:**
  - A chargeback costs merchants about $128 on average ($82 internal, $46 third-party) ([Mastercard](https://www.mastercard.com/global/en/news-and-trends/Insights/2025/what-s-the-true-cost-of-a-chargeback-in-2025.html)).
  - UK merchants win 49.1% of the disputes they contest ([Mastercard/Datos](https://www.mastercard.com/content/dam/mccom/shared/news-and-trends/insights/2025/2025-global-chargebacks-outlook/pdf/2025-state-of-chargebacks-report.pdf)).
  - Smaller merchants likely do worse because they lack dedicated teams ([Chargeback Gurus](https://www.chargebackgurus.com/blog/chargeback-stats-and-insights-from-mastercards-state-of-chargebacks-report)).
  - 9% of returns are fraudulent and 19.3% of online sales are returned ([NRF](https://nrf.com/research/2025-retail-returns-landscape)).
  - City of London Trading Standards notes sellers facing false "counterfeit" or "damaged" claims where "the buyer will be allowed to keep the goods" ([Trading Standards fact sheet](https://www.cityoflondon.gov.uk/assets/Business/fact-sheet-2026-vinted.pdf)).
- **What exists and why it falls short:** Chargeflow and Chargeback Gurus serve card chargebacks for Shopify and Stripe merchants. Nothing assembles evidence for marketplace claims such as Vinted or Etsy.
- **Agent angle:** Medium fit. The agent gathers listing photos, the stated size and condition, tracking, parcel weight and messages into a submission ready to paste. It drafts the response against the platform's own rules.
- **One-day demo-ability:** Medium. Evidence can be assembled convincingly, but a win can't be shown live.
- **Sponsor tools that fit:** Grok Bot, Supabase, Shopify.

### 9. **Replacing Stocky: supplier lists, purchase orders and reorder decisions**
- **Who hurts:** Small Shopify retailers with physical shops who relied on Stocky, and brands under about 100 SKUs using spreadsheets.
- **Evidence:**
  - Stocky ended on 31 Aug 2026, its APIs stopped the same day, and "Suppliers can't be exported" ([Shopify Help](https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky)).
  - Replenishment planning based on sales speed "has no real native twin" in Shopify ([Shopify Community](https://community.shopify.com/t/has-stocky-been-extended-beyond-august-31/676429)).
  - A merchant calls Cin7 "too expensive" and SkuVault/Linnworks "too warehouse-focused" ([Shopify Community](https://community.shopify.com/t/looking-for-a-good-inventory-management-replenishment-tool-for-shopify-amazon/628799/21)).
  - Inventory distortion (stock-outs plus overstock) equals 6.5% of global retail sales, and planning failures cost $148.8bn ([IHL](https://www.ihlservices.com/news/analyst-corner/2025/09/retail-inventory-crisis-persists-despite-172-billion-in-improvements/)).
- **What exists and why it falls short:** Sumtracker ($59–119 a month), Prediko, Forstock, Replenly ($19 a month) and Inventory Planner ([Sumtracker listing](https://apps.shopify.com/sumtracker-fulfil-ship-track)). All still need supplier data entered by hand, and none reads supplier emails or price lists.
- **Agent angle:** Medium fit. The agent rebuilds the supplier list from the inbox and invoices, drafts purchase orders from sales speed, and chases suppliers for ship dates. Forecasting is well served already; data entry is not.
- **One-day demo-ability:** Medium. The inbox-to-purchase-order flow demos well, forecast quality less so.
- **Sponsor tools that fit:** Shopify, Supabase, Grok Bot.

### 10. **DMCCA subscription compliance check (January 2027)**
- **Who hurts:** UK DTC brands running subscriptions or subscribe-and-save, typically on Recharge.
- **Evidence:**
  - The regime moves to January 2027. It requires reminder notices, a 14-day cooling-off period after renewals, and "if customers can subscribe online, they must be able to cancel online too" ([Brodies](https://brodies.com/insights/commercial-contracts-and-outsourcing/the-dmcca-subscription-contracts-the-timeline-just-got-shorter/)).
  - The CMA (Competition and Markets Authority) can fine up to 10% of worldwide turnover ([Stephenson Harwood](https://www.stephensonharwood.com/media/dlfdwrdd/subscription-reforms-brought-forward-to-january-2027.pdf)).
  - Notices must be on a "durable medium" and their "purpose must be immediately apparent" ([Gov response](https://assets.publishing.service.gov.uk/media/69cce372a2e82c1bd822d7de/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime.pdf)).
  - Subscription merchants also attract small-value chargebacks ([Mastercard](https://www.mastercard.com/global/en/news-and-trends/Insights/2025/what-s-the-true-cost-of-a-chargeback-in-2025.html)).
- **What exists and why it falls short:** Law-firm checklists. I found no tool that tests a live store's sign-up, reminder and cancellation journey against the Act.
- **Agent angle:** Strong fit. Grok Bot subscribes, waits, and tries to cancel as a mystery shopper, recording every step. It checks the emails received against the prescribed contents and outputs a gap report plus Recharge setting fixes.
- **One-day demo-ability:** High. A timed browser run showing "cancellation took 7 clicks and a chat" is vivid.
- **Sponsor tools that fit:** Recharge, Grok Bot, Shopify, Supabase.

### 11. **Wholesale order intake from email, PDF and WhatsApp**
- **Who hurts:** Small brands and wholesalers selling to shops, including vintage wholesalers supplying resellers.
- **Evidence:**
  - Nearly 50% of B2B orders still arrive by email, with a 4.2% error rate on manual entry ([Hyperfox citing Conexiom](https://www.hyperfox.com/insights/which-order-channel-to-automate-first)).
  - Customer service reps spend 20–40% of their time on order entry ([Conexiom](https://conexiom.com/blog/the-real-cost-of-manual-order-entry-in-b2b-operations)).
  - 42% of suppliers still take orders manually ([Orderchamp](https://blog.orderchamp.com/en-us/research-the-2025-digital-b2b-sales-landscape)).
  - 52% of small firms write off late payments up to 10 times a year rather than chase them ([GoCardless/FSB](https://gocardless.com/blog/gocardless-fsb-late-payments-report-2025)).
- **What exists and why it falls short:** Conexiom and Hyperfox target mid-market ERP users. Shopify B2B portals need buyers to change how they order.
- **Agent angle:** Good fit. The agent turns an email, PDF or WhatsApp message into a draft order in Commerce Layer or Shopify B2B, checked against stock and price lists. It flags exceptions and schedules payment-chasing messages.
- **One-day demo-ability:** High. Forward a messy PDF and a WhatsApp voice note, and an order appears.
- **Sponsor tools that fit:** Commerce Layer, Shopify, Grok Bot, Supabase.

### 12. **Support beyond "where is my order": pre-sale product questions and chat channels**
- **Who hurts:** Fashion and lifestyle DTC brands with small support teams.
- **Evidence:**
  - WISMO ("where is my order") is 18% of tickets across Gorgias brands, not the 40–50% often quoted ([Gorgias](https://www.gorgias.com/blog/automate-wismo-requests); [LinkedIn analysis](https://www.linkedin.com/posts/guillaumeluccisano_wismo-accounts-for-40-50-of-support-tickets-activity-7449448845056495616-IiyP)).
  - The same analysis found product questions to be the top category at 17%. These are pre-sale, so they are revenue rather than cost.
  - Gorgias AI costs $0.90–1.00 per resolution, and each resolution is also billed as a ticket ([Chatarmin](https://chatarmin.com/en/blog/gorgias-pricing)).
- **What exists and why it falls short:** WISMO automation is crowded and mature: Gorgias, and judge Wassist on WhatsApp ([Wassist](https://wassist.app/news/wassist-raises-1-1m-pre-seed/)). The gap is accurate answers to product questions, which depends on structured data that most stores lack (see gap 6).
- **Agent angle:** Weak as a standalone idea because it's crowded. It's better as a layer that fills in missing attributes from questions customers actually ask.
- **One-day demo-ability:** High to build, but low on novelty.
- **Sponsor tools that fit:** Sanity, Shopify, PostHog.

## Underserved niches worth a look

- **Tax-year reconciliation of HMRC platform reports for multi-platform resellers.** Platforms report by calendar year, but HMRC's tool needs tax-year figures, so sellers must convert them themselves ([GOV.UK](https://www.gov.uk/guidance/check-if-you-need-to-tell-hmrc-about-your-income-from-online-platforms)).
- **EU textile EPR fees for small fashion sellers.** France's Refashion charges €0.58 per piece under the simplified declaration, against about €0.04 per T-shirt with full data. Having eco-modulation data is worth roughly 15x ([Collective Studio](https://collectivestudioltd.com/journal/eu-textile-epr-for-clothing-brands)).
- **Packaging weights for UK "small producers"** (turnover over £1m and 25–50 tonnes of packaging). They must report weight by material once a year, with the next deadline 1 April 2027 ([GOV.UK](https://www.gov.uk/guidance/epr-for-packaging-what-you-must-do-as-a-small-producer)).
- **EAA checks for merchants just above the micro-enterprise threshold that sell into the Netherlands.** The Dutch regulator ACM published a webshop investigation in March 2026, and fines go up to €900k ([TrustYourWebsite](https://trustyourwebsite.com/nl/en/guides/eaa-small-business-guide)).
- **UK low-value import reform preparation.** Overseas sellers will need tariff classification per item and a fiscal representative ([GOV.UK](https://www.gov.uk/government/consultations/reforming-the-customs-treatment-of-low-value-imports-into-the-united-kingdom/outcome/reforming-the-customs-treatment-of-low-value-imports-into-the-united-kingdom-consultation-response)).

## Sources

1. https://storeinspect.com/blog/shopify-app-spending
2. https://www.reddit.com/r/shopify/comments/1pdulmb/anyone_else_tired_of_paying_for_6_different_apps/
3. https://www.reddit.com/r/shopify/comments/1mi4xzb/can_we_talk_about_shopify_apps_and_how_i_have_14/
4. https://www.reddit.com/r/shopify/comments/1o93nse/how_much_are_you_spending_on_shopify_apps_per_month/
5. https://stockanalysis.com/stocks/shop/transcripts/660732-q2-2026/
6. https://www.fool.com/earnings/call-transcripts/2026/08/12/shopify-shop-q2-2026-earnings-call-transcript/
7. https://community.shopify.dev/t/sidekick-feedback/36381
8. https://www.readsignal.io/article/shopify-data-moat-ai-sidekick (unverified)
9. https://business.adobe.com/blog/ai-driven-traffic-surges-across-industries
10. https://www.visaacceptance.com/en-us/insights/global-digital-shopping-index-agentic.html
11. https://www.pymnts.com/smbs/2026/visa-says-small-merchants-could-move-faster-on-ai-shopping/
12. https://www.shopify.com/uk/blog/how-agentic-commerce-works
13. https://www.blkdg.com/blog/agentic-commerce-shopify/
14. https://depict.ai/resources/guides/shopify-bot-traffic
15. https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
16. https://newsroom.thredup.com/news/thredup-14th-resale-report
17. https://cf-assets-tup.thredup.com/resale_report/2026/ThredUp_Resale_Report_2026.pdf
18. https://www.reddit.com/r/Flipping/comments/1hpghj0/how_long_does_it_take_you_to_photographlist_your/
19. https://www.reddit.com/r/reselling/comments/1pnan56/how_long_does_it_take_you_to_list_a_single_item/
20. https://www.thetailoredco.com/resale-clothing-app-for-speedier-listings/
21. https://www.reddit.com/r/BehindTheClosetDoor/comments/1l1bdsd/whats_the_best_crosslisting_app_for_resellers/
22. https://docs.crosslist.com/knowledge-base/sales/autodelist
23. https://fluf.io/compare/vendoo-alternative/
24. https://community.shopify.com/t/inventory-sync-without-importig-the-order/384296/1
25. https://community.shopify.com/t/marketplace-connect-not-syncing-inventory/311671
26. https://pro-docs.svc.vinted.com/
27. https://www.lobstr.io/blog/vinted-api
28. https://www.pricefy.io/
29. https://pagecrawl.io/blog/best-ecommerce-monitoring-tools
30. https://www.joinfleek.com/products/custom-handpick-zander-500-gbp-mix-bale
31. https://www.reddit.com/r/reselling/comments/1klvh8u/is_fleek_reliable/
32. https://vintagesupplier.com/branded-clothing-bundle-vs-bale-which-is-better-for-resale/
33. https://www.business.gov.uk/campaign/europe/european-union-eu-regulations/eu-general-product-safety-regulation-eu-gpsr/
34. https://sellercentral.amazon.co.uk/seller-forums/discussions/t/611e88dd-bc36-4cdd-b74b-380416e8c28e
35. https://www.euproof.com/blog/gpsr-ebay
36. https://www.etsy.com/seller-handbook/article/1093438529659
37. https://www.tradeandbusiness.uk/news/what-is-gpsr
38. https://www.mastercard.com/global/en/news-and-trends/Insights/2025/what-s-the-true-cost-of-a-chargeback-in-2025.html
39. https://www.mastercard.com/content/dam/mccom/shared/news-and-trends/insights/2025/2025-global-chargebacks-outlook/pdf/2025-state-of-chargebacks-report.pdf
40. https://www.chargebackgurus.com/blog/chargeback-stats-and-insights-from-mastercards-state-of-chargebacks-report
41. https://nrf.com/research/2025-retail-returns-landscape
42. https://www.cityoflondon.gov.uk/assets/Business/fact-sheet-2026-vinted.pdf
43. https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky
44. https://community.shopify.com/t/has-stocky-been-extended-beyond-august-31/676429
45. https://community.shopify.com/t/looking-for-a-good-inventory-management-replenishment-tool-for-shopify-amazon/628799/21
46. https://apps.shopify.com/sumtracker-fulfil-ship-track
47. https://www.ihlservices.com/news/analyst-corner/2025/09/retail-inventory-crisis-persists-despite-172-billion-in-improvements/
48. https://www.tlt.com/insights-and-events/insight/dmcc-act-subscription-contracts-regime-brought-forward-by-the-pm-what-do-businesses-need-to-know
49. https://brodies.com/insights/commercial-contracts-and-outsourcing/the-dmcca-subscription-contracts-the-timeline-just-got-shorter/
50. https://www.stephensonharwood.com/media/dlfdwrdd/subscription-reforms-brought-forward-to-january-2027.pdf
51. https://assets.publishing.service.gov.uk/media/69cce372a2e82c1bd822d7de/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime.pdf
52. https://www.hyperfox.com/insights/which-order-channel-to-automate-first
53. https://conexiom.com/blog/the-real-cost-of-manual-order-entry-in-b2b-operations
54. https://blog.orderchamp.com/en-us/research-the-2025-digital-b2b-sales-landscape
55. https://gocardless.com/blog/gocardless-fsb-late-payments-report-2025
56. https://www.gorgias.com/blog/automate-wismo-requests
57. https://www.linkedin.com/posts/guillaumeluccisano_wismo-accounts-for-40-50-of-support-tickets-activity-7449448845056495616-IiyP
58. https://chatarmin.com/en/blog/gorgias-pricing
59. https://wassist.app/news/wassist-raises-1-1m-pre-seed/
60. https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform
61. https://www.gov.uk/guidance/check-if-you-need-to-tell-hmrc-about-your-income-from-online-platforms
62. https://collectivestudioltd.com/journal/eu-textile-epr-for-clothing-brands
63. https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202501892
64. https://www.gov.uk/guidance/epr-for-packaging-what-you-must-do-as-a-small-producer
65. https://trustyourwebsite.com/nl/en/guides/eaa-small-business-guide
66. https://www.gov.uk/government/consultations/reforming-the-customs-treatment-of-low-value-imports-into-the-united-kingdom/outcome/reforming-the-customs-treatment-of-low-value-imports-into-the-united-kingdom-consultation-response
67. https://kpmg.com/uk/en/insights/tax/small-parcels-big-impact.html
68. https://www.iser.essex.ac.uk/wp-content/uploads/files/working-papers/iser/2026-01.pdf
69. https://yougov.com/en-gb/articles/52730-we-polled-uk-sme-leaders-about-ai-adoption-heres-what-they-said?utm=
70. https://www.britishchambers.org.uk/wp-content/uploads/2025/09/The-Turning-Point-for-SMEs-Unlocking-the-next-level-of-AI.pdf?msg_pos=3
