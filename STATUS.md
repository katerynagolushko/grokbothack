# STATUS

Living handoff file. Update it whenever a decision is made, a blocker appears, or a step finishes. Newest information at the top of each section.

**Last updated:** 26 Sep 2026, ~16:05. **Code freeze:** 16:30 (official page). **Top 5 demos:** 17:30.

## Where we are

- **Home shop grid follows the ask.** Send / Demo leaves Runway & Archive and shows the same `/api/journey` stops as the chat (real ASOS / Mango / H&M / … links). While the reply is in flight the thread and the shop both say "Looking." If the API is empty or times out, a clothing ask still gets three retailer search cards; small talk still gets "Nothing worth your time." Locked black-blazer path unchanged (four retailer PDPs).
- **Other clothing listings:** OpenAI Responses `web_search` runs in parallel with the image pool. Cards use `GET /api/product-image?u=` (browser UA proxy) so WhatsApp never hotlinks retailer CDNs. Omit image if none; never Wikimedia. A stated colour that the title contradicts is dropped; prices over the typed cap are dropped. Synthetic prices stay inside the cap. Fallback: shop-search Links. Locked black-blazer path unchanged.
- **Black blazer path still locked.** "black blazer" / blazer / dinner blazer / black jacket → the four live retailers only (ASOS, Wilson Carter, Nobody's Child, Mango). Opener "Four stops. Don't wander." Cards and WhatsApp **Link** buttons go to the real product URLs. Photos at `public/products/{asos-blazer,wilson-charlotte,nobodys-child-blazer,mango-blazer}.jpg`.
- **Other clothing queries** return up to 3 cards with PDP Links when search works; proxied photos when the listing exposes one.
- **Copy:** "OPEN SOURCE PHOTO" / green license shout removed. CTA is **Link** on chat cards, HomeChat, and Wassist.
- **Pitch reframed (14:20): one portable shopper profile that follows the shopper across stores.** Partner stores call our API to reorder their site for that shopper, with consent per store. The moat is cross-store purchase history ("Zara knows Zara. Miranda knows everything."). Two mock shoppers: Alex (dark, minimal, wide-leg, size 8, no polyester, hates logo tees; bought at COS, H&M (returned), Fleek, Arket; consents runway + archive) and Bea (bright, fitted, sporty, size 10, no wool, loves logo tees; bought at Zara, Nike, Adidas, COS (returned); consents runway only).
- **Being built now (three agents in parallel):** `lib/profiles.ts` + `lib/rank.ts`, `GET /api/profile`, `POST /api/rank`, `POST /api/events`, `/compare` (two shoppers side by side), consent step on the shop pages. `/merchant` is updated to the new pitch: hero line, "What we know that you don't" (cross-store counts, derived signals, consent pills per store), one extra proof number (signals from other stores used in ranking), "Plug in" with the three endpoints and example JSON, updated buyer/merchant/neither table. `/merchant` reads the same `lib/profiles.ts` + `deriveSignalFacts` the API routes use, so its numbers agree with `/api/profile` and `/api/rank`.
- **WhatsApp is live via Wassist.** Shopper messages the sandbox number, Miranda replies with a text opener and a picture per stop.
- **Idea: Miranda.** A buyer-side shopping assistant (blunt fashion-editor manner, original lines) that knows one shopper's style, judges items as a bad take or a yes, and suggests what they will actually like. She lives on WhatsApp. Sellers get a consented taste card plus derived cross-store signals so their storefront can reorder for that shopper. Miranda's verdict stays on the buyer's side: a seller cannot hide a bad take.
- **Live on Vercel:** https://miranda-three-chi.vercel.app (project `miranda`, scope `kateryna-golushkos-projects`). `WASSIST_API_KEY`, `WASSIST_WEBHOOK_SECRET` and `NEXT_PUBLIC_APP_URL` set for production + preview. Wassist webhook: `https://miranda-three-chi.vercel.app/api/wassist` (GET health reports `apiKeyConfigured: true`, `webhookSecretConfigured: true`). Signature check is live: HMAC-SHA256 over `t.rawBody` via `@wassist/sdk` `constructEvent` with our own HMAC fallback; unsigned, wrong-secret or stale requests get 401. Handles `subscription.message.received` and legacy `message.received` (deduped by delivery ID and conversation+message ID), acks 200 at once and sends replies in `after()`. Replies: one text opener, then one picture per stop (`type: "unified"`, `media.url` photo, caption, "Link" URL button). Lifecycle events get 200 and no reply. In the dashboard, untick `message.received` on the webhook once routing is set to it, so a second instance can never double-reply.
- **Visual demo exists** in `miranda/`: WhatsApp-style chat beside the shop on `/`. Demo button walks the floor with product highlights and because-lines from the deterministic verdict function. Miranda on/off toggle and suggested vs bad-take counts. Avatar at `miranda/public/miranda-avatar.png`. Catalogue photos in `miranda/public/products/` (all 16 SKUs).
- **Query matching:** "black blazer" → locked four. Other garments → 3 local shop-search cards (Mango / H&M / COS|Zara). "Nothing worth your time." only for non-shopping small talk.
- **B2B merchant page** at `/merchant`: editorial hero ("Miranda for shops"), interactive before/after stage (toggle + hold), typographic proof metrics from seed profile + catalogue via `verdict.ts`. Taste card + buyer/merchant/neither table below the fold. Track remains **Buyer Experience**, with merchant depth for judges.
- **Partner research landed** in `ideation/partners/` (Shopify, Commerce Layer, Recharge, Sanity, PostHog, Tavily, Wassist, Huge, Fleek). No app code from that commit; Miranda stays the build.
- About 3 hours to code freeze. Live demo is our own catalogue plus chat. Real WhatsApp: prefer **Wassist** (sponsor, WhatsApp + MCP tools) over raw Twilio if we wire a live number.

## What we are building

Miranda, cut to what fits before 16:30. Tracks: Buyer Experience (primary) with merchant / storefront depth for Commerce depth judging.

## Open decisions

1. **Sponsor stack for "Commerce depth":** Shopify is the natural fit (catalogue or a dev store). PostHog if we have time for the before/after. See `ideation/partners/` for APIs, free access and gotchas. Skip the rest unless someone already has an account.
2. **WhatsApp path:** Wassist is live at `/api/wassist` (signed, outbound via Wassist API). In-app chat panel stays as the visual fallback. `/api/whatsapp/webhook` remains a Twilio / generic stub.
3. **Team roles.**
4. **Grok Bot access:** confirm at least one account on an eligible plan with the desktop app signed in, create a Bot named Miranda, and add our MCP server.

## Next steps

1. **Land `/compare` and the shop consent step**, build, deploy to Vercel. (`lib/profiles.ts`, `lib/rank.ts`, `/api/profile`, `/api/rank`, `/api/events` are in.)
2. **Rehearse the 3-minute script** on the live URL: WhatsApp verdict with photo → partner store consent + tailored grid → `/compare` two shoppers → `/merchant`.
3. **Record a fallback video** of the same flow.
4. **Wassist dashboard (optional):** untick `message.received` on the webhook; code now replies only on `subscription.message.received` and acks the legacy event.
5. Grok Bot named Miranda, MCP tools, webhook for a new drop. Only if time is left; xAI speaks the line if the Bot is slow.

## Risks

- Time: code freeze at 16:30. Visual journey and public URL are in; live WhatsApp sandbox wiring is the remaining reliability risk.
- Grok Bot slow or unavailable on stage: keep an xAI API driver for the same flow, a pre-run batch and a recorded video.
- Wassist secret rotation: if "Rotate secret" is pressed in the dashboard, the old one stops working at once. Update `WASSIST_WEBHOOK_SECRET` on Vercel (prod + preview) and redeploy, or every delivery gets 401.

## How to run

```bash
cd miranda && npm install && npm run dev   # http://localhost:3000
cd miranda && npm run build && npm start
```

## Log

- **26 Sep, ~16:05:** Home grid now shows journey stops (chat cards and the shop side match). Send shows "Looking." at once. Client waits 28s, then retailer-search cards if the API is empty. Non-locked colour/budget filter: conflicting colour titles dropped, over-cap prices dropped, synthetic prices clamped. Locked blazer path unchanged. Redeploy `miranda/` from this branch (Vercel project `miranda`) so https://miranda-three-chi.vercel.app picks it up.
- **26 Sep, ~15:45:** Fixed mismatched card images: no more Wikimedia/Openverse stock paired with shop Links. Photos from same-retailer CDN (site-scoped search), garment-checked, proxied via `/api/product-image`. Locked blazer path unchanged. Prod: white pants → trousers; blue t shirt → tees; black blazer → 4 local stills. https://miranda-three-chi.vercel.app
- **26 Sep, ~15:45:** Real listing photos via OpenAI Responses web_search (12s) + `/api/product-image` proxy. Locked blazer path unchanged. No Wikimedia. Clothing asks never empty.
- **26 Sep, ~15:30:** Fixed clothing asks returning "Nothing worth your time." Root cause: failed web/image scrapes emptied stops and `openerLine` treated that as small talk. Now `buildLocalShopProducts` always returns 3 Mango/H&M/COS|Zara search cards for any parsed garment (blank image OK). Locked blazer path unchanged. Prod verified: `white pants` → 3 stops, no nothing-line. https://miranda-three-chi.vercel.app
- **26 Sep, ~15:30:** Miranda spoken copy tightened to Priestley register (cold, short, dismissive; original lines only). Journey card lines stay non-rejecting for looked-up blazers/web ("Black. Structured." / "Wear it."). Opener "Four. Don't browse." Small talk still "State what you need." / "Nothing worth your time." Built and redeployed.
- **26 Sep, ~15:15:** Fixed WhatsApp duplicate offers: `/api/wassist` replies only on `subscription.message.received` (acks and ignores legacy `message.received`), strengthens dedupe with delivery + message id + conversation+body (20s), and `dedupeStops` by product id and source URL before send. Locked "Black Blazer" path still 4 unique retailer hrefs.
- **26 Sep, ~15:10:** Replaced Miranda avatar with an original graphic circular icon (silver bob, black turtleneck, glasses as prop). Saved at `miranda/public/miranda-avatar.png`. All UI srcs already pointed at `/miranda-avatar.png`. Built and redeployed to https://miranda-three-chi.vercel.app.
- **26 Sep, ~15:15:** Other clothing queries now return 2–3 real-web cards (Openverse + Wikimedia + DuckDuckGo images, shop search or product Link). Locked four-blazer path unchanged. Removed "OPEN SOURCE PHOTO". Built and redeployed.
- **26 Sep, ~15:00:** Locked the home/WhatsApp journey to four real retailer black blazers (ASOS £35 skip polyester; Wilson Carter Charlotte £29.95 suggest; Nobody's Child £72 skip polyester; Mango £49.99 skip polyester). Local product stills downloaded and checked. Web image fallback disabled on this path. Built and redeployed to https://miranda-three-chi.vercel.app. Prod `/api/journey` returns those four only; image URLs 200.
- **26 Sep, ~14:40:** Pitch reframed to the portable cross-store profile. `/merchant` updated: hero "Zara knows Zara. Miranda knows everything.", "What we know that you don't" section (Alex + Bea: cross-store item count, derived signals, consent pills per store), extra proof number (signals from other stores used in ranking), "Plug in" section with `GET /api/profile`, `POST /api/rank`, `POST /api/events` examples and roadmap line, buyer/merchant/neither table updated. `lib/merchantProof.ts` now reads `lib/profiles.ts` for the cross-store view. Docs updated: `kat/miranda.md`, `miranda/README.md`, root `README.md`.
- **26 Sep, ~14:05:** `/api/wassist` now handles `subscription.message.received` + legacy `message.received` with in-memory TTL dedupe (delivery ID, conv+message ID), ignores `subscription.activated/revoked/service_window.*` with 200, acks in <50 ms and sends via `after()`. Stops go out as `unified` picture messages (absolute `NEXT_PUBLIC_APP_URL` photo, caption, URL button) with text fallback on 4xx. Local e2e against a mock Wassist API passed; prod redeployed, health true/true, signed `subscription.message.received` → 200 (outbound 404 to fake conversation, as expected).
- **26 Sep, ~13:50:** Set `WASSIST_WEBHOOK_SECRET` in `miranda/.env` (gitignored) and on Vercel (prod + preview, sensitive). Added `@wassist/sdk` and made `/api/wassist` verify `X-Wassist-Signature` on the raw body (SDK `constructEvent`, HMAC fallback), log failures without the secret, return 401. Redeployed; health shows `webhookSecretConfigured: true`. Locally signed `test.ping` and `message.received` → 200; unsigned / wrong secret / stale → 401.
- **26 Sep, ~13:30:** Deployed `miranda/` to Vercel → https://miranda-three-chi.vercel.app. Set `WASSIST_API_KEY` + `NEXT_PUBLIC_APP_URL` (prod/preview). Health: `/api/wassist` ok with apiKeyConfigured. Webhook secret still pending Wassist dashboard create.
- **26 Sep, ~13:35:** Redesigned `/merchant` — editorial hero, dramatic before/after toggle + hold, typographic proof metrics from `computeMerchantProof`.
- **26 Sep, ~13:25:** Fixed query→product matching. Intent parse (garment/colour/budget) before verdict; no padding with unrelated categories. "black blazer" → `rw-01`.
- **26 Sep, ~13:20:** B2B merchant page at `/merchant` (taste card, proof metrics, before/after). STATUS: Buyer Experience track with merchant depth.
- **26 Sep, ~13:15:** Pulled teammate partner research (`ideation/partners/`). Reconciled with Miranda: AGENTS repo map keeps both; STATUS notes Wassist as WhatsApp path. Wired `public/products/*.jpg` into tiles, cards and PDPs.
- **26 Sep, ~13:10:** Visual WhatsApp + shop journey on `miranda/` home. Demo walk, product focus, Miranda toggle, verdict counts, stylised avatar.
- **26 Sep, ~12:55:** Idea set to Miranda. Demo scope: our catalogue, deterministic taste rules, WhatsApp, storefront reorder, merchant taste card. Amazon/Shopify browser add-on is the story, not the live dependency.
- **26 Sep, ~12:10:** Moved the repo from Cursor Origin to GitHub (https://github.com/minthantkyaw28/grokbothack, private). Old Origin remote kept as `cursor-origin`.
- **26 Sep, ~12:00:** Deep research on the 5 official tracks saved to `ideation/tracks/` (5 reports + overview). STATUS made neutral on the idea.
- **26 Sep, 11:20:** Added `AGENTS.md`, `STATUS.md`, `README.md`, `CLAUDE.md`, `GEMINI.md`. Updated `ideation/hackathon.md` from the official hackathon page.
- **26 Sep, ~02:30:** First-round shortlist of 3 demoable ideas.
- **26 Sep, ~02:00:** Researched Grok Bot, Origin, Supabase; wrote `ideation/`.
