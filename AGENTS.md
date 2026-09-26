# AGENTS.md

Instructions for any AI coding agent (Cursor, Claude Code, Codex, Gemini, Copilot, Grok, etc.) working in this repo. This file is the single source of truth; `CLAUDE.md` and `GEMINI.md` only point here.

## What this project is

Our team's entry for the **Grok Bot Commerce London Hackathon**, Saturday 26 September 2026, at Fleek HQ, London. One day, teams of up to 3, **code freeze 16:30**, Top 5 demo live for 3 minutes each.

The theme is agentic commerce. Our framing: **Grok Bot is the worker; we build the commerce layer it plugs into** (usually an MCP server + Supabase backend + small web UI, plus a webhook routine to wake the Bot on events).

## Current phase

**Idea chosen: Miranda.** App scaffold lives in `miranda/` — see [`STATUS.md`](./STATUS.md) for run instructions and open work (deploy, WhatsApp account wiring, optional merchant / Grok Bot).

## Repo map

| Path | What it is |
| --- | --- |
| `AGENTS.md` | This file: agent instructions and project context |
| `STATUS.md` | Living handoff: current decision, open questions, next steps, time left |
| `README.md` | Short human-facing overview |
| `CLAUDE.md`, `GEMINI.md` | Pointers to this file for tools that look for those names |
| `miranda/` | Miranda demo: WhatsApp-style chat + shop journey on `/`. Run: `cd miranda && npm install && npm run dev` |
| `kat/miranda.md` | Product one-pager for Miranda |
| `ideation/hackathon.md` | Official event details: schedule, tracks, judging, prizes, sponsors |
| `ideation/tech-stack.md` | What Cursor, Grok Bot, Origin, Supabase are, and how they fit |
| `ideation/note.md` | Q&A from research: what Grok Bot really is, how to control it from code |
| `ideation/partners/` | Each partner's product, APIs, MCP servers, free access and gotchas; `README.md` has the comparison table |
| `ideation/tracks/` | Deep research per official track: gaps, evidence, demo-ability; `README.md` has the cross-track overview |
| `ideation/problems-and-ideas.md` | 10 sourced real-world problems turned into ideas |
| `ideation/shortlist-demo.md` | 3 demoable picks with demo scripts, metrics and build plans (recommended: Haggle) |

## Hackathon facts that affect every decision

Full details are in `ideation/hackathon.md`. The short version:

- **Tracks:** Storefront Experience, Buyer Experience, Merchant Tooling, New Ways to Buy, Agentic Commerce.
- **Judging:** Problem, Experience, Execution, AI / Grok Bot, Commerce depth ("real understanding of the stack"), Originality, Impact.
- **Stack called out:** Shopify, Commerce Layer, Recharge, Sanity, PostHog, plus Cursor, Grok Bot, Supabase, Tavily, Vercel. Using some of these visibly helps "Commerce depth".
- **Submission:** a working, **live** demo at code freeze. Deploy to a public URL (Vercel is suggested) well before 16:30.
- **Judges include Fleek** (a wholesale secondhand clothing marketplace, and the venue). Ideas in their market land well.

## Grok Bot: facts agents often get wrong

- **Grok Bot is not an SDK or library.** It's an app (by SpaceXAI/xAI, bundled with paid Cursor plans) where you create named AI "teammates" that run on a shared cloud computer with a browser, terminal and filesystem.
- **There's no official public API to chat with a Bot.** Official ways in: **webhook routines** (POST JSON to a URL with a Bearer secret; `200` means the run *started*, not finished) and event/cron triggers.
- **The Bot reaches our app through:** an **MCP server** we host at a public HTTPS URL (main integration), our website via computer use, or `curl` from its terminal.
- **Unofficial:** an internal gateway on port 1340, and the community [`grok-bot-skill`](https://github.com/adamanz/grok-bot-skill) CLI that uses the local desktop session. Fine for dev convenience, **never make the live demo depend on them**.
- **xAI API** (`https://api.x.ai/v1`, OpenAI-compatible) is a different product. Use it when we need an LLM inside our own code, e.g. supplier/merchant agents we fully control.
- **Origin** is Cursor's git hosting. We tried it and moved away. This repo now lives on **GitHub**: `https://github.com/minthantkyaw28/grokbothack` (remote `origin`). Use `gh` for GitHub tasks.

## Working agreements

**Demo reliability beats features.**
- We control both sides of every transaction (our own marketplace and counterparties). Don't depend on live third-party sites behaving on stage.
- Every claim in the demo should be a number on screen computed from the database (e.g. % saved, mandate violations = 0), not a sentence on a slide.
- Enforce hard rules (price floors, budgets, approval thresholds) **in code**, not in prompts.
- Keep a fallback: the same flow drivable by an xAI API agent, a pre-run batch of results, and a recorded video.

**Scope.** It's a one-day hack with about 6h45m of build time. Prefer the smallest thing that demos end to end. Cut anything that doesn't show up in the 3-minute script.

**Secrets.** Never commit keys. Webhook secrets, Supabase service-role keys, xAI keys and payment keys stay server-side, in `.env` files that are gitignored, or in Vercel/Supabase env vars. Provide a `.env.example` with names only.

**Git.** Small commits with clear messages. Don't force-push or rewrite shared history. Don't commit generated or build artifacts.

**Docs.** When a decision is made or something important is learned, update `STATUS.md` (and the relevant `ideation/` file if a fact changed). Keep this file accurate when structure or stack changes.

## Writing style for docs

Match the existing `ideation/` docs:
- Plain English, short sentences, UK spelling (catalogue, authorise, optimise) and £.
- Lead with the point; use tables for short enumerable facts.
- Cite sources with links when stating stats or product facts.
- No hype words, no emojis.

## Code conventions

**Miranda (`miranda/`):** Next.js 15 App Router + TypeScript. Catalogue and shopper profile are TypeScript modules (no Supabase in this slice). Verdicts are pure functions in `lib/verdict.ts` — no LLM required. Optional `XAI_API_KEY` must not be required to run the demo.

```bash
cd miranda && npm install && npm run dev   # http://localhost:3000
cd miranda && npm run build && npm start
```

Later / optional (not required for the current demo slice):

- **Backend / data:** Supabase if we add auth, realtime merchant views, or persistence.
- **Agent integration:** MCP server for Grok Bot, public HTTPS URL.
- **Counterparty / polish:** xAI API only when a key exists.
- **Hosting:** Vercel.
