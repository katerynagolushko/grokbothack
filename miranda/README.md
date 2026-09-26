# Miranda

Zara knows Zara. Miranda knows everything. One portable shopper profile that follows the shopper across all stores and uses data on the user from every source. Partner stores call our API to reorder their site for that shopper, with consent per store. Built for the Grok Bot Commerce hackathon. Blunt fashion-editor manner, original lines. Verdicts are deterministic TypeScript rules (budget, fabric, size, aesthetics); no API keys required for the visual demo.

Merchants do not get the private profile or the receipts. They get a consented taste card, derived cross-store signals ("wide-leg: strong, 3 buys at COS") and proof that a buyer agent on their storefront raises match rate and cuts wasted browse.

## Demo script (3 minutes)

1. WhatsApp: shopper sends a photo or "black blazer under £80", Miranda replies with a verdict and stops (live via Wassist).
2. Partner store (`/shop/runway`): shopper consents, the grid reorders for them, with a reason per tile.
3. `/compare`: Alex and Bea side by side on the same catalogue. Same SKUs, different order.
4. `/merchant`: what we know that the store does not, proof numbers, the API.
5. Close: one API call, consent per store, never chats, never receipts.

## Partner API

All data is mock. Consent is checked per store on every call.

| Endpoint | What it does |
| --- | --- |
| `GET /api/profile?user=alex&store=runway` | Consented card for that store only: sizes, budget bands, colours, fits, dealbreaker fabrics, derived signals, history count. No purchases, no chat. 403 without consent. |
| `POST /api/rank` | Body: `{ user, store, products?: [{ id }] }`. Returns the products in order with `verdict`, `reason` and `fromHistory` per item, plus counts. Bad takes rank last, never hidden. |
| `POST /api/events` | Body: `{ user, store, type: "view" \| "add_to_cart" \| "purchase", productId }`. `GET /api/events?store=runway` returns the counters. |

## Visual demo (WhatsApp + shop)

The home page is an interactive journey:

1. WhatsApp-style chat beside a fashion catalogue (Runway & Archive).
2. Press **Demo** (or send a message like “Black blazer under £80 for dinner”).
3. Miranda replies with a short plan, then walks the floor: products highlight one by one while chat bubbles explain suggest vs skip.
4. Bad takes stay visible and badged. **Miranda on** reorders by taste; off shows generic catalogue order.
5. Counts line: suggested vs bad takes from `judgeProduct`.

Avatar: `public/miranda-avatar.png` (original stylised illustration).

## Merchant page

`/merchant` is the B2B pitch: what Miranda knows that the store does not (cross-store purchases, derived signals, consent per store for Alex and Bea), before/after grid reorder, proof metrics computed from the same seed shopper + catalogue via `verdict.ts`, and a "Plug in" section with the three endpoints. Cross-store data comes from `lib/profiles.ts`, the same source as the API.

## Run locally

```bash
cd miranda
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production check
```

## Other routes

| Path | Purpose |
| --- | --- |
| `/` | Visual WhatsApp + shop journey (main demo) |
| `/merchant` | B2B / merchant pitch: cross-store signals, proof metrics, API |
| `/compare` | Two shoppers (Alex, Bea) side by side on one catalogue |
| `/shop/runway` | Runway storefront (`?miranda=1` to enable taste layer) |
| `/shop/archive` | Archive storefront |
| `/api/profile` | Consented card per store (see Partner API) |
| `/api/rank` | Rank product IDs for a shopper, reason per item |
| `/api/events` | Record a purchase or return |
| `/api/journey` | Same journey JSON used by chat / WhatsApp |
| `/api/wassist` | Wassist WhatsApp webhook (preferred) |
| `/api/whatsapp/webhook` | Twilio / generic JSON stub |

## Wassist WhatsApp (optional)

1. Copy `.env.example` → `.env` and set `WASSIST_API_KEY` (and `WASSIST_WEBHOOK_SECRET` after creating a webhook).
2. Deploy or tunnel so the URL is public HTTPS.
3. In [Wassist Developers → Webhooks](https://wassist.app/developers/webhooks), point the URL at:
   `https://<your-host>/api/wassist`
4. Keep **Subscription message received** enabled. Route the sandbox (or your number) to that webhook.
5. Set `WASSIST_WEBHOOK_SECRET` to the signing secret shown once at create time. Until it is set, signature checks are skipped (local stub only).

Outbound replies use `X-API-Key` against `https://backend.wassist.app/api/v1/conversations/{id}/messages/`. See [webhook routing quickstart](https://docs.wassist.app/quickstart/webhook-routing). Never commit `.env`.

## Stack

Next.js App Router, TypeScript, no required env vars for the visual demo. Optional: `NEXT_PUBLIC_APP_URL`, `WASSIST_API_KEY` / `WASSIST_WEBHOOK_SECRET`, Twilio / xAI keys for WhatsApp and spoken lines.
