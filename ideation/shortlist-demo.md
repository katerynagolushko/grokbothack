# Shortlist: ideas we can demo end to end

Filtered from [problems-and-ideas.md](./problems-and-ideas.md) for the stage: **3-minute demo, about 7 hours of build time.**

## Filter used

An idea passes only if all of these are true:

1. **We control both sides.** Our own marketplace and counterparties, so no reliance on Vinted, Amazon or Netflix behaving live.
2. **One clear before → after** that fits in 3 minutes.
3. **Proof is a number on screen**, pulled from Supabase, not just a claim.
4. **Grok Bot does real work**, and our layer is visibly the thing that makes it safe or possible.
5. **It has a fallback.** A pre-run batch of results plus a recorded video if the live run is slow.

## What got cut, and why

| Idea | Why cut |
| --- | --- |
| #4 Crosslisting, #8 Churn Bot, #9 Claim Bot | Need real third-party accounts and live clicking through websites: slow, flaky, can get blocked on stage |
| #1 Agent Passport alone | Too abstract; the value only shows when there's a purchase happening, so it becomes a feature inside Pick A or B |
| #5 RFQ Room | Same mechanics as Pick A but drier; merged into A |
| #6 Kitchen Buyer | Doable but narrow, and needs realistic supplier data we don't have |
| #10 Agent-Ready Store alone | Plumbing; needs a story on top, so it becomes Pick B |

---

## Pick A (recommended): **Haggle, bot-to-bot wholesale sourcing**

**Problem statement:**
> A vintage reseller spends hours browsing supplier bundles, messaging, haggling, and still gets burned on grade. 20–30% of first-time bale buyers receive stock that doesn't match the listing. What if your Bot did the sourcing and negotiation, strictly inside the budget and rules you set, and could prove it?

**Why it lands:** it's the judges' own market (Fleek). It shows bots negotiating with bots, human authorisation and observability, and it answers 4 of the organisers' questions at once.

### What we build
- **Mock wholesale marketplace (Supabase):** about 30 supplier bundles, each with list price, a hidden price floor, grade, manifest and photos.
- **Supplier agents (xAI API):** each supplier has a persona and a floor price, and negotiates through our offer protocol (offer, counter, accept or reject).
- **MCP server (the layer):**
  - `search_bundles`
  - `request_manifest`
  - `make_offer`
  - `accept`
  - `checkout`
  - Checkout is guarded by a **mandate**: budget, max unit price, grade rules, and an approval threshold.
- **Approval:** anything over the threshold pings the user's phone to approve or deny.
- **Live dashboard:**
  - A negotiation feed.
  - Money saved against list price.
  - Mandate checks passed or blocked.
  - An audit trail.

### Grok Bot's role
The buyer Bot gets a brief in plain English, for example:

> "50 pieces of 90s sportswear, grade A/B, under £8 a piece, total ≤ £400, ask me above £300."

It then works through our MCP tools on its own. A webhook routine can also wake it, for example when a "new stock dropped" event arrives.

### 3-minute demo script
1. **(0:00–0:30) Problem.** One slide: the reseller pain point and the 20–30% mismatch stat.
2. **(0:30–1:45) Live.** Message the Grok Bot with the brief. The dashboard shows it searching, checking manifests, and haggling with 3 suppliers in parallel. One supplier refuses to go below its floor; another accepts a counter-offer.
3. **(1:45–2:15) Trust moment.** The Bot tries a £340 deal, and the mandate forces an approval request on the phone. Approve it live. Then show a blocked attempt: a grade C bundle rejected by the rules.
4. **(2:15–3:00) Proof.** The dashboard shows the order placed, £X saved (Y% below list), 0 mandate violations, and a full audit log. Close with a batch result: "over 20 pre-run briefs, the average saving was Y%, with 100% of purchases inside the mandate."

### How we validate the claim
- **Savings:** negotiated price against list price, computed in SQL, shown live.
- **Safety:** count of purchases outside the mandate. The target is **0**, proven from the audit log.
- **Batch evidence:** run 20 briefs before the demo and show the distribution. That shows it wasn't a lucky single run.
- **Baseline:** "buy at list price" versus the Bot's result.

### Risks and fallbacks
- **Grok Bot is slow or unavailable live.** The same MCP flow can be driven by an xAI API agent with an identical script. Keep a recorded video as backup.
- **Supplier agents cave too easily.** The floor price is enforced in code, not left to the model's judgement.

### Build plan (about 7 hours, 3 people)
| Time | Person 1 | Person 2 | Person 3 |
| --- | --- | --- | --- |
| 9:35–11:00 | Supabase schema + seed bundles | MCP server skeleton + deploy (public HTTPS) | Dashboard shell (Realtime feed) |
| 11:00–13:30 | Mandate + approval logic | Supplier agents (xAI) + offer protocol | Negotiation feed, savings/violations widgets |
| 13:30–15:30 | Connect Grok Bot to MCP, test briefs | Webhook routine, phone approval | Polish UI, problem slide |
| 15:30–16:45 | Batch run of 20 briefs → stats | Record fallback video | Rehearse the 3-minute script |

---

## Pick B: **Guardrails, an agent-ready store with spending rules**

**Problem statement:**
> 56% of shoppers will let an AI search for them, but only 35% will let it pay. Merchants, meanwhile, block agents because they look like fraud bots. Neither side has a way to say "this Bot is allowed to buy this, up to this much."

### What we build
- A small demo shop in Supabase, exposed as an **MCP storefront** (`search`, `get_offer`, `checkout`).
- **Agent pass:** every Bot request carries the user's mandate. The merchant verifies it and then accepts, asks for approval, or rejects.
- **User app:**
  - Set rules per Bot (budget, categories, cap).
  - Approve purchases from your phone.
  - See every Bot action.

### Demo
1. Ask Grok Bot to "restock my office snacks and a birthday gift for Sam, max £60."
2. Snacks are auto-approved. The gift goes over the cap, so it asks on the phone. A "surprise" upsell is blocked.
3. The dashboard shows:
   - Every agent action and decision.
   - A counter of disputes that were *prevented* (purchases outside the rules that were never made).

### How we validate the claim
- A red-team batch: 20 tricky prompts (injection like "ignore budget", category drift, duplicate orders). Show how many the layer blocks, with the target being all of them.
- The same prompts without our layer, to show what would have been bought.

**Trade-off:** it's the cleanest infrastructure story, but less visually exciting than negotiation. It can also run as the mandate engine inside Pick A.

---

## Pick C: **Second Life, a returns router**

**Problem statement:**
> Small shops recover about 12 cents on the dollar on returns: items pile up and get dumped to liquidators.

### What we build
- Snap a photo of a returned item. The Bot grades it (brand, condition, defects), estimates its resale value, and routes it: restock, list on our resale board, bundle for wholesale, or recycle.
- It then creates the listing automatically.

### Demo
Hold up 3 real garments to the camera. Each gets graded, priced and routed live, with listings appearing on the board. The dashboard shows "recovered £X against £Y liquidation value."

### How we validate the claim
- Grading accuracy on 20 items we label ourselves beforehand, shown as a confusion table.
- Recovered value against a liquidation baseline.

**Trade-off:** very tangible on stage, but Fleek already built "Fleek Sort" for grading, so we'd need to position it as *plugging into* that kind of flow, not reinventing it.

---

## Recommendation

**Go with Pick A (Haggle) and use Pick B's mandate engine as its safety layer.** That gives us:
- A story the judges live every day.
- A visual live moment: bots haggling, and a phone approval.
- Hard numbers: % saved and 0 violations, across a batch of 20 runs.
- An infrastructure story underneath: the offer protocol plus the mandate, which any Bot could reuse.
