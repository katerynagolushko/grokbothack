# Huge

> Independent, private-equity-owned design and technology agency, founded in Brooklyn in 1999, with a London office. It describes itself as "AI-native". In June 2026 it bought Rotate°, a London composable-commerce and Shopify Plus agency, and the event's Huge co-host and judge both come from Rotate°. Site: [hugeinc.com](https://www.hugeinc.com/) · About: [hugeinc.com/about](https://www.hugeinc.com/about) · Rotate°: [studiorotate.com](https://studiorotate.com/) · LinkedIn: [company/hugeinc](https://www.linkedin.com/company/hugeinc)

Research date: 26 Sep 2026.

## What it is

Huge is a client-services agency: design, product and platform build, marketing, customer experience, commerce and AI adoption. It is not a software product company. Its homepage lists six "solutions":

1. Brand strategy and design
2. Marketing and content
3. Products and platforms
4. Composable commerce (formalised in June 2026 with the Rotate° deal)
5. Customer experience
6. AI activation ("transforming how teams work, today")

**Positioning in 2026:** "human-first, AI-native, systems-driven, expert-led."

- **HATs:** delivery is built around "Huge Atomic Teams" (HATs), described as small senior cross-functional teams "augmented by AI agents".
- **Commercial model:** the commerce team describes "fixed time, fixed cost, variable scope" engagements and value-based pricing tied to revenue uplift. That comes from Jim Tattersall in Huge's Makers interview. It is not a published price list.
- **Independence:** the CTO has written that being independent of a listed holding company lets them restructure around AI without signalling cost cuts to investors.

**Clients and work named on the site:**

- Google (a "14+ year partnership")
- NBCU (AI Olympics guide)
- CoinTracker
- Big Green Egg (commerce)
- Darling Ingredients

Historical clients mentioned by AEA include McDonald's and Nike, and Huge built JetBlue's first website in 2005. Healthcare clients (MM+M) include Bayer, Pfizer, GE Healthcare, Medtronic and Siemens Healthineers.

### Commerce work (mostly via Rotate°)

- **Big Green Egg (UK licensee):** replatformed from Magento to headless Commerce Layer, with DatoCMS for content. A "Build an Egg" interactive video configurator guided buyers of a high-ticket product. They built a dispatch and delivery-date API on top of Commerce Layer for a complex 3PL setup. Reported results:
  - *Huge's page:* 980% ROI, 60% revenue growth and a 23% conversion uplift.
  - *Rotate°'s page:* a 36% increase in AOV and a 19% conversion uplift.
  - *Commerce Layer's page:* a 71% increase in AOV.

  The figures differ between sources.
- **Rapha:** migration from SAP Hybris to Commerce Layer, embedded with Rapha's in-house team and delivered in about nine months.
- **Chilly's:** moved from Shopify Plus to headless Commerce Layer to sell in 36 territories and 10 languages from one store. They switched from Shop Pay to Braintree for local payment methods. Reported results: £100k+ saved in fees over six months and an 18% conversion uplift year on year (Rotate°).
- **Other Rotate° clients and stacks:**
  - Tracksmith (headless Shopify Plus)
  - Ministry of Supply (Shopify Plus with DatoCMS)
  - a subscription cosmetics brand on Shopify Plus with Recharge
  - a meal-programme brand on Shopify Plus with Sanity
  - Jamie Oliver, Sakara, SunGod, Absolute Collagen, Oliver Cabell
- **Earlier work (reported by a lower-quality source, not verified):** in 2021 Huge launched an "Experience Stack of the Future" with BigCommerce and Contentful.

## Key facts

| Item | Detail |
|---|---|
| Founded | 1999, Brooklyn, New York |
| HQ | New York (Brooklyn origins). London office since 2011, now at Old Street |
| Offices | "14 hubs" (About page). Colombia since 2014, Vietnam since 2021 |
| Ownership | Sold by Interpublic Group (IPG) to AEA Investors on 5 Dec 2024. Combined with AEA's Hero Digital, and the Hero brand was retired in April 2025. It is now independent and PE-backed, not part of Omnicom (Omnicom bought IPG, but Huge had already been sold) |
| CEO | Josh Campo (2026, per the About page and MM+M; he came from Publicis). Lisa De Bonis was CEO in April 2025. The date of the change was not confirmed |
| Other leaders | Marc Maleh (Global CTO), Lauren DeGeorge (Chief Client Officer), Angela Yang (Chief Growth Officer, joined June 2026), Jim Coleman (Executive Chair, AEA operating partner) |
| Size | "More than 1,000 people" (Rotate° LinkedIn post, June 2026). LinkedIn aggregate says 800–900 employees. The 2024 NBC release said "nearly 1,000" |
| Revenue | Not disclosed. MM+M estimates healthcare billings at about $40M, "approximately a fifth" of the business. That implies roughly $200M in total (my inference from their estimate, not a reported figure) |
| Recent deal | Acquired Rotate° (London, Shopify Plus partner since Dec 2013, Commerce Layer partner) on 8 June 2026. Terms not disclosed. Rotate° is now the foundation of Huge's commerce practice |
| AI adoption claim | 62% of clients using AI or GenAI projects from Huge, up from 25% in June 2024 (April 2025 release, via MediaPost) |

## Products and developer surface

- **No public APIs, SDKs or developer docs.** Huge is an agency, not a platform. It has no product that hackathon teams can integrate with.
- **Internal tools only:**
  - "Huge OS", an AI-powered internal prototype that the leadership team built in a 48-hour hackathon (MM+M). It is not public.
  - In 2024 Huge referred to a "proprietary platform LIVE" (NBC press release). No public details were found.
- **The platforms they build on are the relevant surface.** Rotate°/Huge London works with:
  - Shopify Plus (and Checkout)
  - Commerce Layer
  - Recharge
  - Sanity and DatoCMS
  - Braintree

  Several of these are on the hackathon's own sponsor stack: Shopify, Commerce Layer, Recharge and Sanity. Hero Digital added partnerships with Adobe, Salesforce, Contentstack and Optimizely.

## AI and agent work

- **OLI for NBCUniversal:**
  - A conversational viewing guide that tells fans when, where and how to watch Olympic events across NBC channels and Peacock, adjusted for time zone and schedule.
  - Paris 2024: built on Google Gemini Flash, grounded in NBC's programming data, and live on five NBCU sites.
  - Milan Cortina 2026: relaunched across 19 NBCU properties with live medal counts, athlete profiles, personalised highlights, calendar invites and suggested follow-up questions.
  - This is Huge's clearest public example of a production LLM experience grounded in structured, real-time data.
- **Delivery model:** HATs pair senior people with AI agents. Huge says the shift is "from human labour to human stewardship", with people acting as "architects of AI-driven systems".
- **Scepticism about AI hype:** CTO Marc Maleh's June 2026 LBB article criticises agencies selling "custom proprietary AI" that is "just a layer over Midjourney", or "custom models" the agency doesn't own. He argues that tool access is not an advantage and that the systems built around the tools are.
- **Commerce team and AI (Jim Tattersall):**
  - AI is changing their work in three ways: productivity and team shape, more time with clients, and building tools that make clients more effective.
  - One of their engineers was running a Cursor workshop in the Huge offices at the time of the interview.
- **Composable architecture:** framed as giving clients control of their own data and stack rather than locking them into one vendor.

## People at this event

**Jim Tattersall: judge**

- Founded Rotate° in late 2013 and has led independent design and technology studios for nearly two decades.
- Joined Huge through the June 2026 acquisition. His current title is listed as "MD, Commerce" on LinkedIn, and as "SVP of Product" in Huge's Makers #10 article (23 June 2026). Either may be current, or both may be used.
- Describes himself as an engineer at heart ("I always saw code as poetry").
- Public views (Makers interview):
  - sell teams and partnerships, not time and materials
  - measure features by split-tested revenue uplift over a year
  - he claims a 1,460% average ROI last year and says they regularly offer "we'll commit to increasing your turnover by 20%" value pricing
  - "we're not a feature factory"

**Tamas Zoltan Palecian: co-host**

- Technical lead, listed with Huge on the event page. He appears to have come from Rotate°: his GitHub lists his company as @StudioRotate, and his LinkedIn affiliation was Rotate°.
- His LinkedIn describes over a decade delivering commerce platforms for global brands. His focus areas are composable commerce, Shopify, headless architecture, Astro, Next.js, React, TypeScript, Cloudflare, Sanity and AI-assisted development.
- He calls himself "an enthusiastic advocate of AI" for developer productivity and content workflows.
- Public GitHub repos include a Next.js Commerce UI built with shadcn and "design.md", a format for describing a visual identity to coding agents.

## What they'd likely value as judges (inference)

All of the following is inference from public material.

- **Commerce depth in the stack.** Jim and Tamas have spent more than a decade on Shopify Plus, Commerce Layer, Recharge and headless CMSs. They are likely to notice whether a team really understands checkout, catalogue, pricing, multi-market or subscription constraints, or is just wrapping a chatbot around a product list. This matches the judging criterion "Commerce depth (real understanding of the stack)".
- **Measurable commercial impact:** conversion, AOV, ROI, fees saved. Their case studies lead with numbers, and Jim talks in terms of split-tested revenue uplift.
- **Experience craft and performance.** Huge is design-led, and Rotate° markets "beautiful, bespoke, built-to-last" experiences. Tamas's interests (Astro, performance, design systems for agents) point the same way.
- **Honest AI claims.** Their CTO publicly criticises "proprietary AI" that is really a thin wrapper. Clear statements of what the AI actually does, and what is mocked, are likely to go down better than inflated claims.
- **Grounded, structured-data AI**, like OLI: LLMs answering from real catalogue, stock or schedule data rather than free generation.
- **Composable, non-lock-in design:** modular services, the merchant owning the data.
- **Small-team execution.** They sell small senior teams, so a tight, well-scoped demo fits their worldview.

## How it could relate to our hack

This is a neutral mapping, not a recommendation.

- **Storefront Experience:** guided selling for considered purchases (like "Build an Egg"), content-plus-commerce pages, and conversational discovery grounded in catalogue data (like OLI). This is directly in their portfolio.
- **Buyer Experience:** configurators, education in the purchase flow, and reducing returns and complaints on high-ticket items.
- **Merchant Tooling:**
  - tools for Shopify or Commerce Layer merchants, such as international and multi-market setup, subscription (Recharge) operations, content workflows in Sanity, and experiment and ROI measurement
  - agent-assisted developer workflows, which interest Tamas
- **New Ways to Buy:** subscriptions and bundles on Recharge and Shopify Plus, and local payment methods.
- **Agentic Commerce:** making a composable stack (Commerce Layer or Shopify APIs plus a headless CMS) readable and transactable by agents. Their "merchant owns the stack" stance is a useful lens for any agent-commerce idea.
- **Practical notes:**
  - Huge offers nothing to integrate with directly.
  - The relevance is that its judges know the sponsor commerce platforms well. Using Shopify, Commerce Layer, Recharge or Sanity visibly and correctly is the most direct way to speak to them. Showing a before-and-after metric, even a simulated and clearly labelled one, may help too.

## Sources

Pages fetched and read:

- https://www.hugeinc.com/
- https://www.hugeinc.com/about
- https://www.hugeinc.com/ideas/makers/jim-tattersall-and-andy-jackson
- https://nz.finance.yahoo.com/news/huge-acquires-rotate-adding-composable-130000515.html (Business Wire release, 8 June 2026)
- https://lbbonline.com/news/Everyone-Has-an-AI-Position-Almost-No-One-Is-Doing-the-Work
- https://www.mmm-online.com/companydetail/huge-agency-100-2026/

Read via search-result excerpts:

- https://lbbonline.com/news/Huge-Rotate-Composable-Commerce
- https://briefglance.com/articles/why-huges-bet-on-composable-commerce-is-a-major-strategic-play (lower-quality source)
- https://www.aeainvestors.com/huge-announces-acquisition-by-aea-investors-and-strategic-combination-with-hero-digital/
- https://www.globenewswire.com/news-release/2024/12/05/2992523/0/en/Interpublic-Announces-Sale-of-Huge.html
- https://www.businesswire.com/news/home/20250410075444/en/Huge-Accelerates-Growth-Scales-Business-with-Expanded-Capabilities
- https://www.adweek.com/agencies/huge-folds-in-hero-digital-adds-ai-and-performance-marketing-muscle/
- https://www.mediapost.com/publications/article/404960/after-merging-with-hero-huge-will-be-go-to-market.html
- https://www.omc.com/newsroom/omnicom-unveils-the-new-omni-an-ai-driven-marketing-intelligence-platform-delivering-measurable-sales-growth-for-brands/
- https://www.hugeinc.com/case-study/big-green-egg
- https://commercelayer.io/customers/big-green-egg
- https://www.webbyawards.com/crafted-with-code/big-green-egg/
- https://studiorotate.com/
- https://studiorotate.com/work/big-green-egg
- https://studiorotate.com/work/rapha
- https://studiorotate.com/work/chillys
- https://commercelayer.io/customers/chillys
- https://www.shopify.com/partners/directory/partner/rotate
- https://www.hugeinc.com/work/introducing-oli/
- https://www.nbcsports.com/pressbox/press-releases/nbcuniversal-introduces-oli-ai-powered-chat-to-help-viewers-seamlessly-find-what-they-want-to-watch-throughout-olympic-games-paris-2024
- https://www.sportsbusinessjournal.com/Articles/2024/07/29/nbc-olympics-ai-chatbot/
- https://www.nbcuniversal.com/article/oli-nbcuniversals-ai-powered-olympic-guide-returns-enhanced-features-provide-fans-date-info-about
- https://www.linkedin.com/in/jprtattersall (public profile excerpt)
- https://www.linkedin.com/in/tamas-palecian (public profile excerpt)
- https://github.com/tpalecian
- https://uk.linkedin.com/company/studiorotate
