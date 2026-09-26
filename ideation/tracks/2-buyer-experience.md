# Track 2: Buyer Experience

> Official brief: "Help customers understand products and make better buying decisions." Research compiled 26 Sep 2026. Vendor-sourced stats are flagged as such.

## Landscape

- **AI assistants now send lots of retail traffic, but their answers are often wrong.** Adobe measured a 693.4% year-on-year rise in generative-AI referrals to US retail sites over the 2025 holiday season, and those visitors converted 31% better than other traffic ([Adobe](https://news.adobe.com/news/downloads/pdfs/2026/01/010726-holiday-shopping-season-2025.pdf), [Digital Commerce 360](https://www.digitalcommerce360.com/2026/01/13/generative-ai-online-holiday-shopping-traffic-2025/)). A study by Product.ai, published this week, found that 86% of 220 shopping questions produced a repeatable factual conflict across ChatGPT, Claude, Gemini and Perplexity ([Business Insider](https://www.businessinsider.com/study-shows-ai-errors-shopping-tools-struggle-accuracy-2026-9)).
- **AI assistants are starting to carry paid placements.** Amazon's Sponsored Products and Sponsored Brands prompts inside Rufus became billable on 25 March 2026 ([PPC Land](https://ppc.land/rufus-shows-5-products-not-50-what-brands-must-know-about-amazons-ai-filter/), [Amazon Ads](https://advertising.amazon.com/resources/whats-new/unboxed-2025-sponsored-products-and-sponsored-brands-prompts)). Google is piloting "Direct Offers" ads in AI Mode alongside its Universal Commerce Protocol (UCP) checkout ([Google](https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/)).
- **UK consumer law now has real teeth.** Since April 2025, the Digital Markets, Competition and Consumers (DMCC) Act bans fake and hidden-incentive reviews and drip pricing, and the CMA can fine up to 10% of global turnover without going to court ([GOV.UK](https://www.gov.uk/government/news/fake-and-misleading-reviews-5-businesses-under-cma-investigation), [Taylor Wessing](https://www.taylorwessing.com/en/insights-and-events/insights/2025/04/dmcca-drip-pricing)). In March 2026 the CMA opened five review investigations (Autotrader, Feefo, Just Eat, Dignity, Pasta Evangelists) and said it expected to give an update in September 2026 ([GOV.UK case page](https://www.gov.uk/cma-cases/online-consumer-reviews)).
- **EU rules land this week.** From 27 September 2026, the day after the hackathon, the EU bans generic green claims such as "eco-friendly" or "climate friendly" unless the trader can show recognised excellent performance ([EUR-Lex 2024/825](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202400825)). The European Accessibility Act has applied to e-commerce since 28 June 2025, yet no European market audited reached 50% compliance ([Contentsquare Foundation](https://contentsquare.com/press/ecommerce-accessibility-snapshot/)).
- **Free returns are ending, and fit is still the main cause of returns.** 42% of 100 benchmarked UK fashion retailers now charge for returns, rising to 80% in young fashion ([Retail Economics/ZigZag](https://www.retaileconomics.co.uk/retail-insights/thought-leadership-reports/zigzag-uk-returns-benchmark-2025)). 61% of shoppers name poor fit as their main reason for returning ([Rithum](https://www.businesswire.com/news/home/20250515391907/en/Rithums-2025-Global-Returns-Profit-Impact-Report-Uncovers-Consumer-Expectations-and-Strategic-Opportunities-for-Retailers-and-Brands-Struggling-with-Returns-Management)).
- **Resale is growing, and so is the trust problem.** Entrupy could not confirm 11.1% of footwear it checked in 2025 as authentic ([Entrupy 2026](https://www.entrupy.com/report/state-of-the-fake-report-2026/)). Grading of secondhand goods, from phones to vintage bales, has no common standard ([Fleek](https://www.joinfleek.com/blog/bundles-vs-bales-for-first-time-resellers), [Finsur](https://www.finsur.co.uk/p/market-update-caveat-emptor)).

## Gaps and niches

### 1. **A second opinion on AI shopping answers**
**Who hurts:** Mainstream shoppers who ask ChatGPT, Gemini or Perplexity "which should I buy?" and act on the answer, especially for safety-critical or pricey items such as child seats, phones and appliances.

**Evidence**
- In head-to-head comparison questions, 97% of AI answers contained a checkable conflict (a different price, model or spec). When a price was wrong, it was off by a median of $300 ([Business Insider on Product.ai](https://www.businessinsider.com/study-shows-ai-errors-shopping-tools-struggle-accuracy-2026-9)).
- Which? experts judged that fewer than half of ChatGPT's recommendation sets were good. Eight picks were unsafe, insecure or poor, including a Pixel 4a whose security updates had already ended ([Which?](https://www.which.co.uk/news/article/ai-told-us-to-buy-these-products-why-you-should-avoid-them-atmvx3p5yo9T)).
- OpenAI says its own shopping research feature "might make mistakes about product details like price and availability" ([OpenAI](https://openai.com/index/chatgpt-shopping-research/)).

**What exists and why it falls short:** ChatGPT shopping research, Perplexity, Google AI Mode and Rufus each give one confident answer with no cross-check. Which? and RTINGS test products in labs but cover few SKUs and don't plug into the chat. Product.ai benchmarks accuracy but isn't a tool shoppers use.

**Agent angle:** A strong fit. An agent takes an AI recommendation, re-checks each claim (price, spec, whether the model is current, whether software support has ended, recalls) against retailer pages and independent tests, then returns a claim-by-claim verdict with sources. Grok Bot's browser and memory suit re-checking over time.

**One-day demo-ability:** High. Paste a ChatGPT answer and show wrong claims flagged live with source links.

**Sponsor tools that fit:** Tavily (evidence search), Supabase (claim and verdict store), Sanity (structured product facts), PostHog, Vercel.

### 2. **Whose side is the shopping agent on? Detecting sponsorship steering**
**Who hurts:** Shoppers using platform-owned assistants, and brands without big ad budgets who lose visibility.

**Evidence**
- An arXiv paper from September 2026 found that when an LLM is told it works for the platform, it penalises sponsored listings less, and "disclosure mandates designed for human consumers cannot by themselves protect consumers" ([arXiv 2609.17989](https://arxiv.org/abs/2609.17989)).
- LatentEval summarises a preregistered experiment in which shoppers picked a secretly sponsored book 22.4% of the time through normal search but 61.2% through a conversational agent ([LatentEval](https://latenteval.ai/guides/whose-side-is-your-shopping-agent-on)).
- Rufus narrows about 50 search results down to roughly five named products, and paid prompts inside it are now billable ([PPC Land](https://ppc.land/rufus-shows-5-products-not-50-what-brands-must-know-about-amazons-ai-filter/)).
- The Phia shopping extension was suspended by Impact.com in July 2026 over affiliate-tracking behaviour ([RetailBoss](https://retailboss.substack.com/p/phoebe-gates-phia-backed-by-celebrity)).

**What exists and why it falls short:** Disclosure labels ("Sponsored") reach the agent, not the human. No consumer tool shows what an assistant left out or how its answers differ between platforms.

**Agent angle:** Run the same brief through several assistants and marketplaces, then show a "rejected alternatives" list, how many results were paid, and cheaper equivalents. An honest limit: we can't see inside Rufus's ranking, only compare its outputs.

**One-day demo-ability:** Med. The side-by-side is easy; proving bias convincingly on stage is harder.

**Sponsor tools that fit:** Tavily, Supabase, PostHog, Vercel.

### 3. **Review trust after the DMCC Act, including AI summaries built on bad reviews**
**Who hurts:** Shoppers who rely on star ratings and "Verified Purchase" badges, and small UK merchants who now carry legal duties as review publishers.

**Evidence**
- Pangram found 3% of front-page Amazon reviews were AI-generated (5.2% in baby products). 74% of those were five-star and 93% carried "Verified Purchase" ([Pangram](https://www.pangram.com/blog/ai-amazon-reviews)).
- Trustpilot removed 3.9m fake reviews in the first half of 2026, 10% of everything submitted ([Trustpilot H1-26](https://assets.ctfassets.net/wonkqgvit51x/4Bu64w8O1N70GkDYTswhfX/1271472bb018cd9b1acf95b6d2d72984/Trustpilot_-_H1-26_Results_FINAL.pdf)).
- CMA guidance says publishers must correct "AI generated review summaries" affected by banned reviews ([CMA208](https://assets.publishing.service.gov.uk/media/67eeb64fe9c76fa33048c790/CMA208_-_Fake_reviews_guidance.pdf)). Of more than 100 businesses the CMA reviewed, 54 could be failing its guidance ([GOV.UK](https://www.gov.uk/cma-cases/online-consumer-reviews)).
- Which? has repeatedly found "review merging" on Amazon, where reviews for different products appear under one listing ([Which?](https://www.which.co.uk/reviews/online-shopping/article/online-shopping/how-to-spot-a-fake-review-aiDaS3e1ivfr)).

**What exists and why it falls short:** Fakespot shut down in 2025. Platform-side detection (Trustpilot, Amazon) is opaque. Merchant review apps on Shopify rarely audit their own compliance.

**Agent angle:** Two options. A buyer-side "review health" read on a listing: merged variants, bursts of reviews, incentive wording, a star rating recomputed from credible reviews only. Or a merchant-side DMCC compliance checker that scans a store's review policy, incentive disclosures and AI summaries. The second fits Shopify better.

**One-day demo-ability:** High for the compliance scanner; Med for fake-review detection, because scraping is fragile.

**Sponsor tools that fit:** Shopify, Sanity (policy content), Tavily, Supabase, PostHog.

### 4. **Cross-brand fit translation, new and secondhand**
**Who hurts:** Women's fashion shoppers above all; people who "bracket" (buy several sizes to return most); tall, petite and non-hourglass body shapes.

**Evidence**
- 61% of shoppers cite poor fit as their main reason for returns, 36% admit to bracketing, and 39% say better size recommendations would significantly reduce their returns ([Rithum](https://www.businesswire.com/news/home/20250515391907/en/Rithums-2025-Global-Returns-Profit-Impact-Report-Uncovers-Consumer-Expectations-and-Strategic-Opportunities-for-Retailers-and-Brands-Struggling-with-Returns-Management), [Rithum PDF](https://s48401.pcdn.co/wp-content/uploads/2025/05/Rithum-2025-Global-Returns-Profit-Impact-Report.pdf)).
- Size or fit is the top online apparel return reason for 53% of brands and retailers ([Coresight](https://coresight.com/research/the-true-cost-of-apparel-returns-alarming-return-rates-require-loss-minimization-solutions/)). UK clothing return rates average 23.6% ([ZigZag](https://www.zigzag.global/zigzags-annual-returns-report)).
- From Reddit: "Size charts are basically useless because every brand measures differently… I'll order two sizes and return one" ([r/femalefashionadvice](https://www.reddit.com/r/femalefashionadvice/comments/1mgrry5/how_do_you_actually_figure_out_your_sizing_when/)). A former garment worker says only about 50% of spot-checked measurements were within spec ([r/femalefashionadvice](https://www.reddit.com/r/femalefashionadvice/comments/4b6aa3/inconsistencies_in_clothing_fit_within_the_same/)).

**What exists and why it falls short:** True Fit, Fit Analytics and body scanning are sold to retailers and locked inside one store. Secondhand listings rely on sellers' own measurements, which may be made up. Nothing uses "a garment I already own that fits" as the reference across shops.

**Agent angle:** The shopper tells the agent once which garments fit them. The agent reads garment measurement tables across brands and resale listings, then says "size M here matches your Uniqlo tee within 1cm at the chest", with a confidence level. Body scanning is not a sensible one-day scope.

**One-day demo-ability:** High, using a handful of real size charts plus a Depop or Vinted listing.

**Sponsor tools that fit:** Shopify, Commerce Layer (variant data), Sanity (structured size charts), Supabase (the shopper's "fit wardrobe"), PostHog (measure bracketing), Wassist-style chat.

### 5. **Condition grades that mean different things, in consumer resale and refurbished tech**
**Who hurts:** Buyers on Vinted, Depop and eBay, and anyone buying a refurbished phone.

**Evidence**
- Vinted gives buyers two days after delivery to report a problem, after which payment is released automatically. "Minor differences" don't qualify for a refund ([Vinted](https://www.vinted.com/help/463/1356-item-is-significantly-not-as-described), [Vinted refund policy](https://www.vinted.co.uk/help/465)). Depop excludes smells and "minor damage on second hand or vintage items" from its protection ([Depop](https://depophelp.zendesk.com/hc/en-gb/articles/360038455993-What-does-Depop-consider-significantly-not-as-described)).
- Private sellers only have to deliver goods "as described" and need not disclose faults ([Which?](https://www.which.co.uk/consumer-rights/advice/i-want-to-return-my-goods-what-are-my-rights-ams3G2z9V7lW)).
- "Excellent" refurbished iPhone 15s ranged across a £99 spread at 11 UK retailers because each defines the grade differently ([Finsur](https://www.finsur.co.uk/p/market-update-caveat-emptor)). Refurbed publishes battery thresholds at every tier; Back Market does so only for Premium, and rebuy not at all ([Refurbito](https://refurbito.com/en/posts/refurbished-condition-grades-platform-comparison)).
- In Which? lab tests, two CeX Grade B phones had 84% and 93% battery capacity, and a Grade C iPhone was faulty ([Which?](https://www.which.co.uk/reviews/mobile-phones/article/how-to-buy-a-second-hand-or-refurbished-mobile-phone-aMG1q8n2sQPt)).

**What exists and why it falls short:** Each platform uses its own grading scale. The CTIA grading standard has low UK adoption. Buyers have to translate between scales by hand.

**Agent angle:** Normalise listings onto a single rubric (battery %, screen, defects shown in photos, whether the seller is a trader or private). Suggest questions to ask the seller before buying, and remind the buyer before the two-day window closes.

**One-day demo-ability:** High for normalising grades across 3–4 sellers; Med for condition-from-photo.

**Sponsor tools that fit:** Tavily, Supabase, Sanity (rubric), Grok Bot routines (deadline reminders), PostHog.

### 6. **Verifying wholesale vintage grades, a B2B buyer problem (Fleek's market)**
**Who hurts:** Small resellers and boutique buyers spending hundreds to thousands of pounds on bales they can't inspect.

**Evidence**
- On Fleek's own blog: a Grade AB bale is about 70% A and 30% B, "realistically, 30-40% of the contents might not be worth listing", there is a built-in grading margin of error of up to 10%, and "other suppliers may call our Grade B items Grade A" ([Fleek](https://www.joinfleek.com/blog/bundles-vs-bales-for-first-time-resellers)).
- A supplier's grading policy allows a 10-percentage-point tolerance and says any grading the buyer does after delivery "does not override" the supplier's ([Vintage Wholesale Supply](https://vintagewholesalesupplyltd.com/pages/grading-policy)).
- A reseller on Reddit on buying bales: "there's always going to be 'rag house filler'" ([r/Flipping](https://www.reddit.com/r/Flipping/comments/1rpsznv/i_run_a_vintage_and_secondhand_wholesale/)). A vendor blog claims about 60% of repeat buyers see quality fall on their second order; this is an unverified vendor claim ([VintageSupplier](https://vintagesupplier.com/how-to-compare-vintage-wholesale-suppliers-on-quality-and-grading/)).
- Gartner: 69% of B2B buyers see inconsistencies between supplier websites and sales reps, and buyers who self-serve are 1.65 times more likely to regret a purchase ([Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience), [Gartner report](https://emt.gartnerweb.com/ngw/globalassets/en/sales-service/documents/trends/gartner-b2b-buying-report.pdf.)).

**What exists and why it falls short:** Each supplier writes its own grade definitions. Verification means manual photo and video requests. There is no shared record of whether suppliers' grades matched what arrived.

**Agent angle:** A buyer-side agent turns supplier listings into a like-for-like comparison: grade mix, cost per sellable piece, and a grade-match history built from buyers' own unboxing logs. A good fit for the host judge. An honest limit: fairly grading a whole bale from a few photos is not reliable.

**One-day demo-ability:** Med-High. The comparison and cost-per-sellable-piece calculator is easy; photo grading is shaky.

**Sponsor tools that fit:** Commerce Layer or Shopify (B2B catalogue), Supabase (grade-match ledger), Sanity, Tavily, PostHog.

### 7. **Authenticity checks for mid-price resale, below the designer threshold**
**Who hurts:** Buyers of Nike, Adidas, Samba, Ugg and Labubu on Vinted, Depop and eBay, where fakes are common but the items are too cheap for paid authentication.

**Evidence**
- Entrupy could not confirm 11.1% of footwear as authentic in 2025, and 54.1% of Louis Vuitton sneakers it checked ([Entrupy 2026](https://www.entrupy.com/report/state-of-the-fake-report-2026/)).
- StockX says the most counterfeited sneakers are now mainstream models such as the adidas Samba and Campus 00s, not rare grails ([Footwear Magazine](https://footwearmagazine.com/stockx-unveils-2025-report-after-blocking-370k-fakes-worth-74m-in-us/)).
- Vinted's Item Verification covers "selected designer items", is paid for by the buyer, and does not check condition ([Vinted](https://www.vinted.co.uk/help/1147)). Buyers on Reddit report the first-line response to fakes comes "from a bot" ([r/vinted](https://www.reddit.com/r/vinted/comments/1ojdo8q/is_there_any_point_reporting_fake_or_counterfeit/)).

**What exists and why it falls short:** Entrupy, CheckCheck and Legit App are paid and aimed at high-value items. Community legit-check forums are slow.

**Agent angle:** Limited. An agent can collect the right evidence (style code against release data, label photos, whether the price is too low, seller history) and prepare a claim within the 48-hour window. Declaring "authentic" or "fake" from photos is a liability risk.

**One-day demo-ability:** Med. The evidence-pack and triage flow can be demoed; the verdict should not be.

**Sponsor tools that fit:** Tavily (release data), Supabase, Grok Bot routines.

### 8. **True landed cost before you click buy (duties, courier fees, drip pricing)**
**Who hurts:** UK buyers importing from the US, Japan or the EU, and cross-border resale buyers.

**Evidence**
- In Baymard's research, 39–40% of abandoners cite extra costs, and 12–14% "couldn't see / calculate total order cost up-front" ([Baymard](https://baymard.com/lists/cart-abandonment-rate), [Statista](https://www.statista.com/statistics/1228452/reasons-for-abandonments-during-checkout-united-states/)).
- Above £135, UK customs duty is charged on goods plus postage and insurance ([GOV.UK](https://www.gov.uk/goods-sent-from-abroad/tax-and-duty)).
- A buyer describes being hit with VAT on delivery plus an extra fee for paying it ([r/LegalAdviceUK](https://www.reddit.com/r/LegalAdviceUK/comments/1ammigk/clarification_around_vat_and_import_duties_and/)). Another reports £165 in customs on a £300 item because the seller over-declared its value ([r/LegalAdviceUK](https://www.reddit.com/r/LegalAdviceUK/comments/1mw3kfp/customs_charges_from_us_to_the_uk/)).
- CMA guidance CMA209 prohibits drip pricing and partitioned pricing ([CMA209](https://ppc.land/content/files/2025/12/1763452018310.pdf)).

**What exists and why it falls short:** Merchant-side duties calculators (Zonos, Global-e) only exist where the merchant installs them. Buyers get nothing for resale or small overseas shops.

**Agent angle:** Good. Give the agent a product URL; it looks up origin, tariff code, likely courier fee and delivery terms (duties paid or unpaid), and returns an all-in price with the reasoning shown.

**One-day demo-ability:** High for a few fixed courier fee tables plus tariff lookups.

**Sponsor tools that fit:** Commerce Layer (price and tax models), Shopify, Tavily, Supabase.

### 9. **Is this "deal" real? Checking reference prices**
**Who hurts:** Sale-driven shoppers, especially around Black Friday, which falls in November, weeks after the hackathon.

**Evidence**
- Which? found 83% of 175 Black Friday products were the same price or cheaper at another point in the year, and none were at their lowest price on the day itself ([Which?](https://www.which.co.uk/policy-and-insight/article/dont-believe-the-hype-most-black-friday-deals-the-same-price-or-cheaper-at-other-times-of-the-year-which-finds-a3TbD5x5KADs)).
- One Amazon example claimed a £160 saving against an RRP it hadn't actually charged in the period ([Which?](https://www.which.co.uk/reviews/black-friday/article/black-friday-deals-how-to-check-if-a-black-friday-deal-is-real-aKtJD2L0zJEt)).
- The FTC found intermediaries can tailor prices using location, browsing history and even mouse movements ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-surveillance-pricing-study-indicates-wide-range-personal-data-used-set-individualized-consumer)).

**What exists and why it falls short:** CamelCamelCamel covers Amazon only. PriceSpy and PriceRunner cover major UK retailers but not DTC Shopify brands or resale. None of them checks the "was" price against what the law allows.

**Agent angle:** A good fit for Grok Bot's scheduled routines: watch a list of products, record prices, flag misleading "was" prices, and alert when a price is genuinely low. Personalised pricing is hard to prove in a day.

**One-day demo-ability:** High, with pre-seeded price history.

**Sponsor tools that fit:** Supabase, Tavily, Grok Bot webhook routines, PostHog, Recharge (price-drop alerts for repeat or subscription items).

### 10. **Green-claim checker as EU rules start**
**Who hurts:** Eco-minded shoppers facing vague claims, and UK or EU merchants who now need to audit their own copy.

**Evidence**
- Generic claims ("eco-friendly", "green", "biodegradable") are banned in the EU without recognised excellent performance from 27 September 2026 ([EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202400825), [Commission FAQ](https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en?filename=ECGT+Directive+FAQ_20260518.pdf)).
- The CMA's fashion investigation flagged "eco" ranges where some products contained "as little as 20% recycled fabric" ([GOV.UK](https://www.gov.uk/cma-cases/asos-boohoo-and-asda-greenwashing-investigation)). ASOS, Boohoo and George at Asda signed undertakings ([GOV.UK](https://www.gov.uk/government/news/green-claims-cma-secures-landmark-changes-from-asos-boohoo-and-asda)).

**What exists and why it falls short:** Good On You rates brands, not individual listings. There is no tool that checks product copy line by line against the new EU blacklist or the CMA fashion guidance.

**Agent angle:** Strong and timely. Scan a product page, highlight generic claims, and ask for the specific substantiation (fibre %, certificate scope). Works for buyers and as a pre-publish merchant check.

**One-day demo-ability:** High. The rules are text, so the demo shows a real listing annotated live.

**Sponsor tools that fit:** Sanity (claims as structured content), Shopify, Tavily, Supabase.

### 11. **What the returns policy actually means for this order**
**Who hurts:** Younger fashion shoppers and "serial returners" caught by fair-use rules they didn't know existed.

**Evidence**
- 42% of UK fashion retailers charge for returns, only 24 of 100 offer fully free returns, and 49% of shoppers have abandoned a purchase over a returns policy ([Retail Economics/ZigZag](https://www.retaileconomics.co.uk/retail-insights/thought-leadership-reports/zigzag-uk-returns-benchmark-2025)).
- Only 53% of shoppers know fair-use return limits exist ([InternetRetailing](https://internetretailing.net/returns-limits-accepted-if-explained-but-only-half-of-consumers-are-aware-of-fair-use-policies/)). ASOS has not defined what counts as a "regular" returner ([BBC](https://www.bbc.com/news/articles/cwy98e42xkno)).
- 51% of UK adults say returns policies have influenced where they buy ([YouGov](https://yougov.com/en-gb/articles/53017-free-returns-and-flexibility-what-uk-shoppers-expect-from-retailer-return-policies)).

**What exists and why it falls short:** Policies sit in long terms-and-conditions pages. Comparison sites ignore returns entirely.

**Agent angle:** Before checkout, turn each retailer's policy into a per-basket answer: return cost, deadline, whether an in-store return is free, and whether the item is excluded. Useful, but not deep.

**One-day demo-ability:** High.

**Sponsor tools that fit:** Sanity (structured policies), Shopify, Commerce Layer, PostHog.

### 12. **Shopping help for disabled and older shoppers**
**Who hurts:** Screen-reader users, older shoppers and people with limited English.

**Evidence**
- 84% of audited European e-commerce pages failed to label buttons and fields for assistive technology, and product pages scored 3.5/10 on average ([Contentsquare Foundation](https://join.contentsquare-foundation.org/hubfs/RM/2025/Ecomm%203%20pager%20English.pdf)).
- 69% of disabled shoppers with access needs abandon difficult sites, and only 8% tell the site owner. This data is from 2019 ([Click-Away Pound](https://clickawaypound.com/downloads/CAP2019PR2.pdf)).
- 46% of regular internet users aged 65+ shop online less than monthly or never, and 4.7m people over 65 lack basic digital skills ([Age UK](https://www.ageuk.org.uk/siteassets/documents/reports-and-publications/reports-and-briefings/active-communities/internet-use-statistics-july-2025-1.pdf), [Age UK briefing](https://www.ageuk.org.uk/siteassets/documents/reports-and-publications/reports-and-briefings/age-uk-parliamentary-briefing---protecting-older-people-from-digital-exclusion-june-2025.pdf)).
- Ofcom names limited English proficiency as a digital-disadvantage risk factor ([Ofcom](https://www.ofcom.org.uk/internet-based-services/technology/digital-adoption-and-digital-disadvantage-today-what-has-changed-and-what-barriers-remain)).

**What exists and why it falls short:** Overlay widgets such as accessiBe are widely criticised by disabled users. Fixing accessibility properly takes developer time, and the EAA only covers the EU.

**Agent angle:** Partial. A conversational layer (WhatsApp or voice) can answer "what are the dimensions, is it machine washable, what's the total?" in plain language or another language, getting around a badly labelled page. It does not make the site itself compliant.

**One-day demo-ability:** Med. Easy to build, but a moving demo needs a real user story.

**Sponsor tools that fit:** Shopify, Sanity, Supabase, Vercel. Wassist, a judge, is in exactly this chat channel.

## Underserved niches worth a look

- **Vintage size labels.** A 1960s size 12 fits roughly a modern 4–6 (US sizes), and Depop sellers argue over whether to list the tag size or the "fits like" size, since mislabelling can trigger a "not as described" claim ([Vintage Unscripted](https://vintageunscripted.com/decoding-vintage-womens-clothing-sizing/), [r/Depop](https://www.reddit.com/r/Depop/comments/mvy271/what_is_the_correct_size_to_list/)).
- **Supplement dose checking on marketplaces.** Which? found vitamin D sold at 12.5 times the safe upper limit on AliExpress, and "height growth" gummies on Temu marketed to kids ([Which?](https://www.which.co.uk/policy-and-insight/article/supplements-containing-as-much-as-12.5-times-the-recommended-safe-upper-limit-of-popular-vitamins-and-minerals-sold-on-online-marketplaces-which-warns-aURgQ2m6j4jm)).
- **Cheap children's products.** All 27 children's products Euroconsumers bought on Shein failed compliance tests, as did 26 of 27 from Temu ([Euroconsumers](https://www.euroconsumers.org/systemic-failures-in-product-compliance-on-temu-and-shein/)). A third of kids' sunglasses Which? tested couldn't give the required protection, and all were missing required labelling ([Which?](https://www.which.co.uk/news/article/kids-sunglasses-bought-on-online-marketplaces-unsafe-and-illegal-in-the-uk-amWdH8D9J9gG)).
- **Trader or private seller?** On mixed marketplaces, your rights depend on whether the seller is a business, which isn't always obvious ([Saga](https://www.saga.co.uk/money-news/your-rights-when-buying-second-hand)).
- **Checkout failures in agentic shopping.** Only about 32.6% of test sessions on UCP-enabled stores reached checkout, and the store's own implementation explained about 75% of the variance in outcomes ([UCP Checker](https://ucpchecker.com/ucp-playground)). A store "agent-readiness" audit is a niche nobody owns yet.

## Sources

1. https://www.gov.uk/government/news/fake-and-misleading-reviews-5-businesses-under-cma-investigation
2. https://www.gov.uk/cma-cases/online-consumer-reviews
3. https://assets.publishing.service.gov.uk/media/67eeb64fe9c76fa33048c790/CMA208_-_Fake_reviews_guidance.pdf
4. https://www.bbc.com/news/articles/cj37eeyz0epo
5. https://www.which.co.uk/news/article/ai-told-us-to-buy-these-products-why-you-should-avoid-them-atmvx3p5yo9T
6. https://www.which.co.uk/news/article/can-you-get-a-good-deal-using-ai-this-black-friday-axs630o9T935
7. https://openai.com/index/chatgpt-shopping-research/
8. https://www.businessinsider.com/study-shows-ai-errors-shopping-tools-struggle-accuracy-2026-9
9. https://www.businesswire.com/news/home/20250515391907/en/Rithums-2025-Global-Returns-Profit-Impact-Report-Uncovers-Consumer-Expectations-and-Strategic-Opportunities-for-Retailers-and-Brands-Struggling-with-Returns-Management
10. https://s48401.pcdn.co/wp-content/uploads/2025/05/Rithum-2025-Global-Returns-Profit-Impact-Report.pdf
11. https://coresight.com/research/the-true-cost-of-apparel-returns-alarming-return-rates-require-loss-minimization-solutions/
12. https://www.zigzag.global/zigzags-annual-returns-report
13. https://www.retaileconomics.co.uk/retail-insights/thought-leadership-reports/zigzag-uk-returns-benchmark-2025
14. https://www.taylorwessing.com/en/insights-and-events/insights/2025/04/dmcca-drip-pricing
15. https://ppc.land/content/files/2025/12/1763452018310.pdf (CMA209)
16. https://www.vinted.com/help/463/1356-item-is-significantly-not-as-described
17. https://www.vinted.co.uk/help/465
18. https://www.vinted.co.uk/help/1147
19. https://www.reddit.com/r/vinted/comments/1ojdo8q/is_there_any_point_reporting_fake_or_counterfeit/
20. https://www.entrupy.com/report/state-of-the-fake-report-2026/
21. https://footwearmagazine.com/stockx-unveils-2025-report-after-blocking-370k-fakes-worth-74m-in-us/
22. https://www.gov.uk/goods-sent-from-abroad/tax-and-duty
23. https://www.reddit.com/r/LegalAdviceUK/comments/1ammigk/clarification_around_vat_and_import_duties_and/
24. https://www.reddit.com/r/LegalAdviceUK/comments/1mw3kfp/customs_charges_from_us_to_the_uk/
25. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202400825
26. https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en?filename=ECGT+Directive+FAQ_20260518.pdf
27. https://news.adobe.com/news/downloads/pdfs/2026/01/010726-holiday-shopping-season-2025.pdf
28. https://www.digitalcommerce360.com/2026/01/13/generative-ai-online-holiday-shopping-traffic-2025/
29. https://baymard.com/lists/cart-abandonment-rate
30. https://www.statista.com/statistics/1228452/reasons-for-abandonments-during-checkout-united-states/
31. https://www.pangram.com/blog/ai-amazon-reviews
32. https://www.which.co.uk/reviews/online-shopping/article/online-shopping/how-to-spot-a-fake-review-aiDaS3e1ivfr
33. https://www.joinfleek.com/blog/bundles-vs-bales-for-first-time-resellers
34. https://vintagewholesalesupplyltd.com/pages/grading-policy
35. https://vintagesupplier.com/how-to-compare-vintage-wholesale-suppliers-on-quality-and-grading/
36. https://www.reddit.com/r/Flipping/comments/1rpsznv/i_run_a_vintage_and_secondhand_wholesale/
37. https://ppc.land/rufus-shows-5-products-not-50-what-brands-must-know-about-amazons-ai-filter/
38. https://advertising.amazon.com/resources/whats-new/unboxed-2025-sponsored-products-and-sponsored-brands-prompts
39. https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-surveillance-pricing-study-indicates-wide-range-personal-data-used-set-individualized-consumer
40. https://clickawaypound.com/downloads/CAP2019PR2.pdf
41. https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience
42. https://emt.gartnerweb.com/ngw/globalassets/en/sales-service/documents/trends/gartner-b2b-buying-report.pdf.
43. https://www.gov.uk/government/news/green-claims-cma-secures-landmark-changes-from-asos-boohoo-and-asda
44. https://www.gov.uk/cma-cases/asos-boohoo-and-asda-greenwashing-investigation
45. https://assets.ctfassets.net/wonkqgvit51x/4Bu64w8O1N70GkDYTswhfX/1271472bb018cd9b1acf95b6d2d72984/Trustpilot_-_H1-26_Results_FINAL.pdf
46. https://www.which.co.uk/news/article/kids-sunglasses-bought-on-online-marketplaces-unsafe-and-illegal-in-the-uk-amWdH8D9J9gG
47. https://www.which.co.uk/policy-and-insight/article/supplements-containing-as-much-as-12.5-times-the-recommended-safe-upper-limit-of-popular-vitamins-and-minerals-sold-on-online-marketplaces-which-warns-aURgQ2m6j4jm
48. https://www.euroconsumers.org/systemic-failures-in-product-compliance-on-temu-and-shein/
49. https://www.which.co.uk/reviews/mobile-phones/article/how-to-buy-a-second-hand-or-refurbished-mobile-phone-aMG1q8n2sQPt
50. https://refurbito.com/en/posts/refurbished-condition-grades-platform-comparison
51. https://www.finsur.co.uk/p/market-update-caveat-emptor
52. https://www.reddit.com/r/femalefashionadvice/comments/1mgrry5/how_do_you_actually_figure_out_your_sizing_when/
53. https://www.reddit.com/r/femalefashionadvice/comments/4b6aa3/inconsistencies_in_clothing_fit_within_the_same/
54. https://internetretailing.net/returns-limits-accepted-if-explained-but-only-half-of-consumers-are-aware-of-fair-use-policies/
55. https://www.bbc.com/news/articles/cwy98e42xkno
56. https://yougov.com/en-gb/articles/53017-free-returns-and-flexibility-what-uk-shoppers-expect-from-retailer-return-policies
57. https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/
58. https://ucpchecker.com/ucp-playground
59. https://www.which.co.uk/policy-and-insight/article/dont-believe-the-hype-most-black-friday-deals-the-same-price-or-cheaper-at-other-times-of-the-year-which-finds-a3TbD5x5KADs
60. https://www.which.co.uk/reviews/black-friday/article/black-friday-deals-how-to-check-if-a-black-friday-deal-is-real-aKtJD2L0zJEt
61. https://www.reddit.com/r/BuyItForLife/comments/1la5kci/in_a_world_of_massproduced_garbage_aigenerated/ (background on quality and discovery pain)
62. https://www.ageuk.org.uk/siteassets/documents/reports-and-publications/reports-and-briefings/active-communities/internet-use-statistics-july-2025-1.pdf
63. https://www.ageuk.org.uk/siteassets/documents/reports-and-publications/reports-and-briefings/age-uk-parliamentary-briefing---protecting-older-people-from-digital-exclusion-june-2025.pdf
64. https://www.ofcom.org.uk/internet-based-services/technology/digital-adoption-and-digital-disadvantage-today-what-has-changed-and-what-barriers-remain
65. https://depophelp.zendesk.com/hc/en-gb/articles/360038455993-What-does-Depop-consider-significantly-not-as-described
66. https://vintageunscripted.com/decoding-vintage-womens-clothing-sizing/
67. https://www.reddit.com/r/Depop/comments/mvy271/what_is_the_correct_size_to_list/
68. https://www.which.co.uk/consumer-rights/advice/i-want-to-return-my-goods-what-are-my-rights-ams3G2z9V7lW
69. https://www.saga.co.uk/money-news/your-rights-when-buying-second-hand
70. https://arxiv.org/abs/2609.17989
71. https://latenteval.ai/guides/whose-side-is-your-shopping-agent-on
72. https://retailboss.substack.com/p/phoebe-gates-phia-backed-by-celebrity
73. https://contentsquare.com/press/ecommerce-accessibility-snapshot/
74. https://join.contentsquare-foundation.org/hubfs/RM/2025/Ecomm%203%20pager%20English.pdf
75. https://wassist.app/ (judge context: WhatsApp shopping agents)

**Caveats on sources.** The vintagesupplier.com "60% batch drift" figure is a vendor's claim, not independent research. The LatentEval figures summarise third-party experiments I could not check at the original source. The Click-Away Pound data dates from 2019. I did not confirm whether the CMA has published its promised September 2026 update on the review investigations.
