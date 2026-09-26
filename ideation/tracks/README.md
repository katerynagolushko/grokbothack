# Track research: gaps and niches across the 5 official tracks

Deep research run on 26 Sep 2026, one report per track, each with about 70–90 sources: industry reports (Baymard, McKinsey, Deloitte, Gartner, Visa, Mastercard, Adobe, ThredUp, Recharge), regulators (CMA, GOV.UK, FCA, EUR-Lex), academic papers (NeurIPS, arXiv, Microsoft Research), trade press, and practitioner pain from Reddit, Shopify Community and Hacker News.

**This is a map, not a recommendation.** Nothing here picks an idea. Vendor-sourced stats are flagged in each report; treat them as directional.

| # | Track | Official brief | Report | Gaps |
| --- | --- | --- | --- | --- |
| 1 | Storefront Experience | Better ways to discover, explore and buy products | [1-storefront-experience.md](./1-storefront-experience.md) | 12 |
| 2 | Buyer Experience | Help customers understand products and make better buying decisions | [2-buyer-experience.md](./2-buyer-experience.md) | 12 |
| 3 | Merchant Tooling | Tools that help merchants manage, optimise and grow their stores | [3-merchant-tooling.md](./3-merchant-tooling.md) | 12 |
| 4 | New Ways to Buy | Subscriptions, bundles, marketplaces, reselling, programmatic purchasing | [4-new-ways-to-buy.md](./4-new-ways-to-buy.md) | 14 |
| 5 | Agentic Commerce | AI agents that discover, compare and transact | [5-agentic-commerce.md](./5-agentic-commerce.md) | 14 |

Each gap in a report has: who hurts, evidence with links, what exists and why it falls short, the agent angle (with honest limits), one-day demo-ability, and sponsor tools that fit.

---

## The big picture in 6 facts

1. **AI now drives shopping traffic, but mostly research, not buying.** AI referrals to US retail were up 693% over the 2025 holidays and convert better, yet 77% of agent activity is on product and search pages and only 2.3% on checkout (Adobe, HUMAN).
2. **AI shopping answers are often wrong.** 86% of 220 shopping questions gave a repeatable factual conflict across major assistants; wrong prices were off by a median $300 (Product.ai via Business Insider, Sep 2026).
3. **Merchants aren't ready for agents.** Only 15% have agent-readable product data and 23% can identify AI traffic (Visa/PYMNTS). Agentic checkout is **US-only** on Shopify channels and US/CA/AU on Google UCP, so UK merchants get discovery only.
4. **The big players are still wobbling.** OpenAI scaled back Instant Checkout in March 2026; Walmart said in-chat purchases converted at a third of the rate of click-outs. Visa, Mastercard and Ant only started a shared "Know Your Agent" framework on 10 Sep 2026.
5. **Resale is growing and supply (seller effort) is the bottleneck.** Secondhand apparel is heading for $393bn by 2030; ThredUp says "supply is the new constraint". Grading, pricing and listing one-off items is still manual.
6. **UK/EU rules are creating deadlines right now** (see below).

## Themes that show up in more than one track

These are where the research converged independently. The same underlying gap was found from different angles.

| Theme | Where it appears | Why it matters |
| --- | --- | --- |
| **Secondhand trust: condition, grades, one-off stock** | Storefront 7, 8 · Buyer 5, 6, 7 · Merchant 2, 4, 5 · New Ways 6, 8, 10 · Agentic 5 | Appeared in **all 5 tracks**. Grades are supplier-defined text, catalogue protocols assume barcodes, pricing and listing is manual. Host and judge Fleek's own market. |
| **What AI says about products is wrong, and nobody checks** | Storefront 4, 5 · Buyer 1, 2 · Agentic 11, 12 | Shoppers can't verify, merchants can't see it. Both a buyer tool and a merchant tool. |
| **Agent-readiness and agent-traffic blindness** | Storefront 6 · Merchant 6 · Agentic 3, 4, 8 | Merchants can't see agent sessions or why agents fail. Audit tools are getting crowded; *fixing* and *funnels* less so. |
| **Spending rules, mandates, proof of delegation** | New Ways 12 · Agentic 1, 9, 10 | Liability for agent purchases is unresolved. Network-level controls exist, merchant/SMB-level ones don't. |
| **Subscriptions: compliance and smarter reorders** | Merchant 10 · New Ways 1, 2, 3, 4 · Agentic 13 · Storefront niche | UK DMCCA subscription rules from Jan 2027; fixed cadences make people stockpile or run out; bundle subscriptions break on stock-outs. |
| **Agent security: injection and negotiation floors** | Agentic 2, 6, 7 | Poisoned listings hijack agents (up to 86% in benchmarks); weak agents lose 9–14% in negotiations; agents take the first offer 60–100% of the time. |
| **Rules as text → compliance scanners** | Buyer 3, 10 · Merchant 7, 10 · New Ways 1, 5 | DMCC fake reviews, EU green claims, GPSR, subscription rules, ASA mystery-box rulings. Rules are text, so agents can check against them. |
| **Crosslisting / delisting one-off items** | Merchant 3 · New Ways 9 | Real pain, but fragile live (captchas, Vinted terms). |

## Timely hooks (dates that make a pitch feel urgent)

| Date | What |
| --- | --- |
| 31 Aug 2026 | Shopify's Stocky inventory app shut down; supplier lists can't be exported (Merchant 9) |
| 10 Sep 2026 | Visa, Mastercard and Ant begin "Know Your Agent" framework, no timeline (Agentic) |
| 15 Sep 2026 | Cloudflare changed AI-bot blocking defaults again (Merchant 6) |
| **27 Sep 2026 (tomorrow)** | **EU bans generic green claims ("eco-friendly") without proof** (Buyer 10) |
| 6 Oct 2026 | HM Treasury consultation on agentic payments (consent, authentication, liability) closes (Agentic 10) |
| Jan 2027 | UK DMCCA subscription regime: reminders, 14-day renewal cooling-off, cancel online (Merchant 10, New Ways 1) |
| Apr 2028 | EU textile EPR schemes must be running; affects bale supply (New Ways 6, Merchant niche) |

## Where the research says "crowded" or "weak fit"

Useful for avoiding traps:
- **WISMO / support automation:** mature and crowded (Gorgias, and judge Wassist) (Merchant 12).
- **Agent-readiness audit tools:** many exist already (Agentic 4). Differentiation has to be in fixing, not scanning.
- **AI visibility / GEO trackers:** crowded (Agentic 12).
- **Checkout UX fixes:** known problems, agents add little (Storefront 10).
- **Authenticating items from photos:** liability risk; frame as evidence gathering, not a verdict (Buyer 7, New Ways 8).
- **Live browser automation on third-party sites (Vinted etc.):** fragile on stage and may breach terms (Merchant 3, New Ways 9).

## Quick index: every gap rated High demo-ability

Rated High (or Med-High) by the researchers for a one-day build:

- **Storefront:** search QA teammate (1), attribute enrichment for filters (2), cited fit answers + content gaps (3), AI claims vs catalogue truth (5), one-of-a-kind want-list matching (7), vague-intent / gift discovery (12)
- **Buyer:** second opinion on AI shopping answers (1), DMCC review compliance scanner (3), cross-brand fit translation (4), grade normalisation across sellers (5), wholesale grade comparison (6), true landed cost (8), fake-deal checker (9), green-claim checker (10), per-basket returns policy (11)
- **Merchant:** app-stack ROI audit (1), photo-to-listing for one-offs (2), sold-comps pricing (4), agent-readiness audit + fix (6), GPSR for used goods (7), DMCCA subscription mystery shopper (10), wholesale order intake from email/PDF/WhatsApp (11)
- **New Ways to Buy:** DMCCA compliance evidence (1), bundle stock-out substitution (4), bale grade rubric + claim pack (6), listing and bundle pricing (10), SMB agent spending rules (12), sell-through-driven restock + RFQs (13)
- **Agentic:** proof-of-delegation evidence pack (1), listing prompt-injection firewall (2), secondhand lots as agent catalogue (5), patient buyer vs naive agent (6), hard-floor seller negotiation (7), buyer-side guardrails vs fake shops (9), consumption-based subscription agent (13)

## How to use this

1. Skim the themes table and the timely hooks.
2. Open the track reports for the 2–3 themes that interest the team and read the evidence.
3. Check each candidate against the demo filter in `../shortlist-demo.md`: we control both sides, a before → after in 3 minutes, proof is a number on screen, Grok Bot does real work, and there's a fallback.
4. Record the decision in `../../STATUS.md`.
