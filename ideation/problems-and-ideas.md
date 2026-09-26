# 10 real problems → 10 ideas

Research from Reddit (r/shopify, r/procurement, r/Flipping, r/reselling, r/vinted, r/Depop, r/smallbusinessuk, r/MiddleClassFinance…), payment networks (Visa, Mastercard, Stripe), and industry reports. Sept 2026.

**Framing for every idea:** Grok Bot is the worker. It already has a computer, memory, plugins (Airwallex, Apify, Apollo, Attio…), and can use websites that have no API. **What we build is the missing layer** it plugs into, usually an **MCP server + Supabase backend + small web UI**, plus a **webhook routine** so events can wake the Bot.

---

## 1. AI agents get blocked at checkout, and merchants can't tell good agents from bad bots

**The problem**
- Fraud systems rely on human signals like mouse movement, device fingerprints and home IPs. Agent purchases lack those, so legitimate agent orders get declined or cancelled ([Rye](https://rye.com/blog/agentic-commerce-consumer-trust), [Stellagent / Chargebacks911](https://stellagent.ai/insights/agentic-commerce-false-declines)).
- The fallback is a human finishing the order manually, which costs $1–3 per order.
- Mastercard says agents "resemble the behavior of a fraud bot" ([Mastercard](https://www.mastercard.com/us/en/news-and-trends/stories/2026/agentic-commerce-standards.html)).
- Many merchants either block all agent traffic or approve it all, and "cannot even measure the problem yet."

**The gap:** There's no simple way for a small merchant to say "I know this agent, who it acts for, and what it's allowed to buy."

**Idea: Agent Passport.** A "know your agent" layer:
- Each Grok Bot gets a signed identity plus a mandate (who it acts for, budget, allowed categories).
- Merchants call one MCP tool or API, `verify_agent`, and get accept, step-up or reject, along with a consent trail they can use as evidence in a dispute.
- The demo shows a Bot buying from two shops: one without Passport blocks it, one with Passport accepts it.

**Tracks:** Infrastructure, Payments.

---

## 2. People will let an AI search for them, but not pay for them

**The problem**
- 56% of consumers will let an agent search and compare products, but only 35% will give it payment credentials ([Visa 2026 Digital Shopping Index](https://www.visaacceptance.com/content/dam/documents/campaign/shopping-index/2026-global-digital-shopping-index-agentic-edition.pdf)).
- 70% are open to agents shopping for them, but only 17% are comfortable completing a purchase ([Rye](https://rye.com/blog/agentic-commerce-consumer-trust)).
- A new source of chargebacks: purchases the customer authorised but didn't expect.

**The gap:** Standards exist on paper, such as Google's AP2 mandates and Visa/Mastercard agent tokens ([AP2 spec](https://ap2-protocol.org/ap2/payment_mandate/)). But there's no friendly **consumer control panel** for "my Bots can spend £X on Y, and ask me above Z."

**Idea: Allowance, a spending wallet with rules for your Bots.**
- Supabase holds each user's rules: budget per Bot, allowed merchants and categories, per-item caps, and an expiry.
- An MCP tool, `request_purchase`, auto-approves anything inside the rules. Anything outside them sends a one-tap approval to your phone.
- Every decision is logged, which answers the "trustworthy and observable" question on the hackathon page.
- Payment runs through the Airwallex plugin.

**Tracks:** Payments, Shopping. It pairs naturally with idea 1: Passport is the merchant side, Allowance is the consumer side.

---

## 3. Secondhand wholesale: buying stock is a gamble *(the judges' own market)*

**The problem**
- Fleek (the host and judges) connects around 2,000 wholesale suppliers with 50,000+ resellers. Buyers negotiate via "Make an Offer", ask for photos and hop on live video handpicks ([Fortune](https://fortune.com/2026/07/08/fleek-an-online-marketplace-connecting-vintage-clothing-wholesalers-and-retailers-raises-25-million-in-new-funding/), [App Store](https://apps.apple.com/us/app/fleek-wholesale/id1631016145)).
- Resellers say "Grade A" isn't standardised and blind bales are "a lottery ticket" ([r/Flipping](https://www.reddit.com/r/Flipping/comments/1udjy2d/the_wholesale_mystery_box_market_has_become_an/)).
- 20–30% of first-time bale buyers get a significant quality mismatch ([VintageSupplier](https://vintagesupplier.com/how-to-vet-a-vintage-wholesale-supplier-before-buying-bales/)).
- Buyer Protection claims must be filed within 5 days.

**The gap:** Sourcing is manual: browsing, chatting, negotiating and checking photos, repeated across many suppliers.

**Idea: Sourcing Bot plus a bot-to-bot negotiation desk.**
- A reseller's Grok Bot gets a brief: "90s sportswear, grade A/B, under £8 per piece, 50 pieces".
- It searches suppliers, requests a manifest and photos, and negotiates with supplier Bots through our **structured offer protocol** (offer, counter, accept) in Supabase.
- It scores photos against the grade spec and books the order.
- After delivery, it compares what arrived against the manifest and drafts a protection claim before the 5-day deadline.

**Tracks:** Marketplaces, Shopping. **Strongest judge fit.**

---

## 4. Resellers double-sell across Vinted, eBay and Depop

**The problem**
- Crosslisting tools "sometimes auto-delist when I didn't tell it to, and other times… doesn't auto-delist at all" ([r/reselling](https://www.reddit.com/r/reselling/comments/1rkszog/what_crosslisting_software_do_large_resellers_use/)).
- Tools are unreliable on Vinted, and Nifty doesn't support it at all. Many sellers delist by hand ([r/vinted](https://www.reddit.com/r/vinted/comments/1u77c7a/anyone_selling_on_vinted_and_other_apps_how_do/), [r/Depop](https://www.reddit.com/r/Depop/comments/1sf3vun/crosslisting_tools_that_actually_sync_inventory/)).

**Why Grok Bot fits:** Vinted has no clean API, and Grok Bot's selling point is working on sites without APIs.

**Idea: One Ledger.**
- Supabase is the single inventory record for every item.
- When a sale is detected on any platform, it triggers our webhook routine, and the Bot delists the item everywhere else via the browser, then confirms it in the ledger.
- A second Bot refreshes stale listings and handles incoming offers within price floors you set.

**Tracks:** Merchants, Marketplaces.

---

## 5. Supplier quotes arrive in 10 different formats

**The problem**
- "Comparing quotes is turning into a bigger pain than finding suppliers": one gives unit price only, another has no lead time, shipping is "extra" ([r/procurement](https://www.reddit.com/r/procurement/comments/1qn5ad5/how_do_you_compare_supplier_quotes_when_everyone/)).
- Email RFQ (request for quote) response rates are 30–50% ([AuraVMS](https://www.auravms.com/blogs/how-to-write-an-rfq-that-gets-supplier-responses)).
- Expired quotes cost 5–10% of purchasing power ([Ability.ai](https://www.ability.ai/solutions/operations-automation/supplier-quote-management)).

**Idea: RFQ Room, a machine-readable request for quotes.**
- A buyer Bot posts a structured RFQ covering price, minimum order, lead time, Incoterms, packaging and payment terms.
- Supplier Bots, or humans through a zero-signup form, answer in the schema.
- Our layer normalises the answers and calculates landed cost.
- The buyer Bot chases non-responders, ranks the quotes and negotiates with the top two.

**Tracks:** Infrastructure, Merchants. Shows bots transacting with other bots.

---

## 6. Restaurants and cafés: early-morning supplier calls and silent price creep

**The problem**
- A UK restaurant owner: "what I hate is the inventory management… having to call suppliers early in the morning and taking notes of what's left before closing" ([r/smallbusinessuk](https://www.reddit.com/r/smallbusinessuk/comments/1nqm5c9/inventory_management_nightmare_for_restaurant/)).
- "Suppliers raise prices quietly. A few pence here, a couple of percent there" ([Dishboard](https://dishboard.io/product/food-cost)).
- Existing tools cost £129 per site per month.

**Idea: Kitchen Buyer Bot.**
- Staff snap a photo of stock levels and delivery invoices.
- The Bot keeps a price ledger in Supabase and flags price hikes.
- It gets quotes from 2–3 suppliers, often by email or supplier websites, and places the order within a budget that needs approval.
- The owner wakes up to a done order instead of a phone call.

**Tracks:** Merchants, Shopping.

---

## 7. Returns recover about 12 cents on the dollar

**The problem**
- "We were only getting back ~12 cents on the dollar on returned items… stuff would pile up and we'd end up bulk liquidating" ([r/smallbusiness](https://www.reddit.com/r/smallbusiness/comments/1s22q9i/anyone_else_actually_look_at_what_returns_are/)).
- Online returns average 16–20% of orders, and 25% in apparel. Each return costs $10–50 all-in ([Eightx](https://eightx.co/return-rate)).

**Idea: Second Life Router.**
- A photo of a returned item goes to the Bot, which grades it (the same idea as Fleek Sort).
- It routes each item to the best channel: back to stock, resell on Vinted or eBay, bundle for a wholesale buyer on a Fleek-like marketplace, or recycle.
- It lists the item there and tracks recovered value in Supabase.

**Tracks:** Merchants, Marketplaces. Ties to Fleek and the circular economy.

---

## 8. Subscription creep and cancellation friction

**The problem**
- "$47/mo in subscription increases I never noticed… None of the billing portals show what you were paying before" ([r/MiddleClassFinance](https://www.reddit.com/r/MiddleClassFinance/comments/1tymb7e/47mo_in_subscription_increases_i_never_noticed/)).
- Cancel flows redirect to "pick your new plan".
- 52% of consumers cancelled at least one subscription in six months ([NY Post / Deloitte](https://nypost.com/2026/08/12/lifestyle/heres-what-consumers-are-canceling-in-2026/)).
- Retention discounts are real if you ask ([r/RecurringExpenses](https://www.reddit.com/r/RecurringExpenses/comments/1s2e56y/got_a_subscription_price_increase_heres_the/)).

**Idea: Churn Bot.**
- It reads statements and emails to build a subscription ledger with price history.
- It spots price increases, then asks: keep, downgrade, haggle or cancel?
- It works through cancel flows in the browser, claims the retention offer and saves proof.
- Rules decide which actions need approval.

**Tracks:** Shopping, Conversational. Very relatable for a demo.

---

## 9. Money left on the table after purchase

**The problem**
- Amazon has no price-drop adjustment. You have to ask support for a goodwill credit or return and rebuy ([TaskMonkey](https://taskmonkey.ai/blog/does-amazon-do-price-adjustments/after-purchase)).
- Late-delivery refunds only apply to guaranteed delivery dates ([Amazon](https://www.amazon.com/gp/help/customer/display.html?nodeId=GCNQVPEFZLZZVLVY)).
- Nobody tracks this across all their shops.

**Idea: Claim Bot.**
- It watches every order confirmation in your inbox and tracks prices and delivery dates.
- When there's a price drop, a late delivery or a missing item, it files the claim or chats with support, keeping screenshots as evidence in Supabase.
- A dashboard shows "£ recovered this month".

**Tracks:** Shopping.

---

## 10. Merchants are invisible to AI shoppers

**The problem**
- Getting into ChatGPT shopping requires an approved, structured product feed updated daily. Blocking `OAI-SearchBot` makes you invisible ([OpenAI Commerce](https://developers.openai.com/commerce/guides/get-started), [Frostbite](https://frostbitemarketing.com/resources/chatgpt-shopping-product-feed-setup/)).
- Stripe warns merchants that they "unwittingly block the very crawlers" that recommend them ([Stripe](https://stripe.com/guides/how-to-prepare-for-agentic-commerce-technical-field-guide)).
- Shopify owners already have app fatigue: "over 1/3 of [my bill] is app charges" ([r/shopify](https://www.reddit.com/r/shopify/comments/1r857c6/app_fatigue_im_tired/)).

**Idea: Agent-Ready Store.** One click turns a Shopify or Supabase catalogue into:
- An **MCP storefront** (`search`, `get_offer`, `negotiate`, `checkout`) any Bot can use.
- An ACP-style feed.
- An "agent traffic" dashboard showing which Bots visited, what they asked for, and why they did or didn't buy.

This answers "What does a storefront look like when the customer is an AI?"

**Tracks:** Merchants, Infrastructure.

---

## Honourable mentions

- **Late invoices.** UK SMEs lose about £2,077 a month to late payments ([Airwallex](https://www.airwallex.com/en-uk/blog/late-payment-impact)). QuickBooks puts the total at 56.4m hours a year of chasing ([QuickBooks](https://quickbooks.intuit.com/uk/press/smbs-chase-late-payments/)). A collections Bot could chase escalating reminders and payment links through the Airwallex plugin, and Airwallex is in the Grok Bot marketplace.
- **Competitor price watching.** Small shops check competitor tabs by hand every week. Auto-repricing bots have chained each other to a $2 item listed at $43,000 ([Shopify Community](https://community.shopify.com/t/merchants-who-track-competitor-prices-what-do-you-use/652475/10)). A price-watch Bot could suggest changes within hard floors, with human approval.
- **Tool sprawl.** "18 apps on a Shopify store… and it wasn't helping" ([r/shopify_growth](https://www.reddit.com/r/shopify_growth/comments/1r858s7/we_had_18_apps_on_a_shopify_store_and_it_wasnt/)). A team of Bots could replace a handful of single-purpose apps.

---

## Pattern: most ideas share the same core layer

| Building block | Used by ideas |
| --- | --- |
| Agent identity + mandate (who, for whom, what limits) | 1, 2, 3, 5, 6 |
| Structured offer / negotiate / checkout protocol over MCP | 3, 5, 10 |
| Supabase ledger + audit log (what happened, who approved) | 2, 4, 6, 7, 8, 9 |
| Webhook routine to wake a Bot on events | 4, 6, 9 |
| Human approval on phone for out-of-policy actions | 2, 3, 6, 8 |

That means we can build **one core layer** (identity, mandate, offer protocol, ledger, approvals) and demo it through the use case that lands best.

## Shortlist

| Pick | Why |
| --- | --- |
| **#3 Sourcing Bot + negotiation desk** | Judges' own market (Fleek), bot-to-bot negotiation, real money problem, very visual demo |
| **#1 + #2 Passport + Allowance** | Pure infrastructure play, directly answers "how should humans authorise autonomous purchases" and "trustworthy and observable" |
| **#4 One Ledger** | Clearest "Grok Bot can do what APIs can't" story (Vinted has no API) |
