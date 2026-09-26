# Miranda

## In one sentence

One portable shopper profile that follows the shopper across all stores and uses data on the user from every source. Partner stores call our API to reorder their site for that shopper, with consent.

## The moat

Zara knows Zara. Miranda knows everything. Zara knows what you bought at Zara. It has no idea you bought three pairs of wide-leg trousers at COS, returned a jacket to H&M because the sleeves ran short, and only wear black and navy. Miranda knows all of it, because the profile follows the shopper.

A store gets derived signals ("wide-leg: strong, 3 buys at COS"), never the receipts. Consent is per store and revocable. Miranda's verdict stays on the buyer's side: a store cannot hide a bad take.

## How it works for the shopper

Named for Miranda Priestley's manner: blunt, decisive, original lines. Not film quotes. She lives on WhatsApp.

1. **Store already in mind.** Miranda sits as a layer on that store and reorders the grid for the shopper.
2. **No store in mind.** The shopper tells Miranda what they want. She guides them to places that fit, with a verdict and a link per stop.

## How it works for the store

Three endpoints: `GET /api/profile` (consented card for that store), `POST /api/rank` (your product IDs back in order, with a reason per item), `POST /api/events` (tell Miranda about a purchase or return). One script tag or one API call.

## What we are demoing today

1. WhatsApp: shopper sends a photo or a request, Miranda replies with a verdict and stops (live via Wassist).
2. Partner store: shopper consents, the grid reorders for them, with a reason per tile.
3. `/compare`: two shoppers (Alex, Bea) side by side on the same catalogue.
4. `/merchant`: what the store gets, proof numbers, the API.

All shopper data is mock. Verdicts are rules in code, not prompts.

## What we are not building today

- A browser extension on real third-party stores.
- Seller-controlled verdicts or hiding bad takes.
- Gmail order-email import, affiliate purchase signals, generative storefront via OpenUI (roadmap).
