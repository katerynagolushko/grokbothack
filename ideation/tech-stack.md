# Tech stack research

## TL;DR

| Tool | What it is | Is it an SDK? | Role in our project |
| --- | --- | --- | --- |
| **Cursor** | AI code editor + cloud coding agents | Has an SDK (`@cursor/sdk`) but we mainly use the editor | How we build fast |
| **Grok Bot** | An app of always-on AI "teammates" by SpaceXAI (xAI), sold with Cursor plans | **No.** It's a finished product you chat with, not a framework | The *customer* or *merchant* agent in our demo |
| **Origin** | Cursor's own git hosting (like GitHub, built into Cursor) | Has a REST API + "Origin Apps", but for code/repos | Where we host this repo |
| **Supabase** | Postgres + auth + storage + realtime + edge functions | Yes (JS client) | Our backend / database |

---

## Grok Bot — in simple words

**Grok Bot is not an SDK or ADK.** You don't import it into code. It's an **app** (desktop: macOS/Windows/Linux, mobile: iOS/Android) where you create named AI assistants ("Bots") and message them like coworkers.

Think of it as: *hiring a virtual employee who has their own laptop in the cloud.*

- **Each Bot has a computer.** A persistent cloud machine with a browser, filesystem and terminal. It keeps working when your laptop is closed.
- **It uses real tools.** It logs into websites and apps like a human would (computer use), or uses connectors/**MCP servers** where available.
- **Setup is a chat message.** No workflow builder. "Go do X" and it does it, asking for approval when needed.
- **Bots talk to each other.** You can run many in parallel, put them in group chats, and let a "chief of staff" bot coordinate specialists.
- **Learns by demonstration.** Show it a workflow once; it saves it as a *skill/routine* and can rerun it on a schedule.
- **Memory compounds.** A Bot keeps preferences, files and browser sessions across sessions.
- **Coding:** it delegates code work to **Cursor cloud agents** and reviews their PRs/screenshots.

Made by SpaceXAI (xAI), launched Aug 11 2026, in beta. Included with paid Cursor plans (Pro/Pro+/Ultra/Teams) or SuperGrok subscriptions. Usage is separate from Cursor/Grok usage and resets weekly.

### How we can "build with" Grok Bot (since it's not an SDK)

The integration surface is **MCP + websites**:

1. **Expose our product as an MCP server** (public HTTPS URL). In a Bot chat: `Add this MCP server: https://our-app.com/mcp`. The Bot then gets our tools (e.g. `search_products`, `make_offer`, `checkout`). There is no config file — you add servers from chat or via marketplace plugins. Auth: OAuth (Bot shows a connect card) or an API key header.
2. **Build a website the Bot can browse.** Bots can use any web UI via computer use, so a "bot-friendly storefront" is directly demoable.
3. **Skills/routines.** Teach a Bot a shopping/merchant workflow once and schedule it.
4. **Bot ↔ Bot.** Run a buyer Bot and a seller Bot and let them negotiate in a group chat, using our MCP tools as the shared marketplace.

So the likely hackathon shape: **we build the commerce infrastructure (Supabase + MCP server + web UI), and Grok Bots are the autonomous buyers/sellers that use it.**

### Setup: do we need the desktop app?

Yes. Setup requires the **Grok Bot desktop app** (macOS Apple silicon/Intel, Windows, Linux; also iOS/Android) from https://x.ai/bot, signed in with your Cursor account. Accounts on Legacy Privacy Mode can't use it. The app is only a thin client: the Bots themselves run on a cloud computer.

### Can our code / Cursor control a Bot?

There's **no general public API or CLI** to create Bots, send them arbitrary messages, or read transcripts (unlike Origin, which has a CLI + REST API). But there are official ways in and out:

**Into the Bot (our app → Bot)**
- **Webhook routines (official, [docs](https://cursor.com/help/grok-bot/routines))**: in the app, open a Bot → Routines → When to run → add a webhook → save. You get a `POST to` URL and a secret key. Our backend calls:
  ```bash
  curl -X POST "$GROK_BOT_WEBHOOK_URL" \
    -H "Authorization: Bearer $GROK_BOT_WEBHOOK_KEY" \
    -H "Content-Type: application/json" \
    -d '{"event":"new_order","orderId":"123"}'
  ```
  The Bot wakes up with the saved routine instruction plus our JSON body. `200` = run started (not finished). Keep the key server-side only. Each run spends weekly Bot usage.
- **Event listeners**: routines can also fire on Slack, GitHub, Microsoft Teams, Linear, Sentry, PagerDuty events, or on a cron schedule (min 5 min apart).
- *Unofficial:* the Bot's cloud computer runs an undocumented local gateway on port 1340 (`/api/sendPrompt` etc.). It's unsupported and may break. Avoid it for the demo.

**Out of the Bot (Bot → our app)**
- **MCP server**: the Bot calls our tools (search, offer, checkout). This is the main integration.
- **Our website**: the Bot uses it via computer use.
- **HTTP from its terminal**: the Bot has a shell, so it can `curl` our API when told to.

**Demo loop:** Supabase event → our backend POSTs to the Bot's webhook routine → Bot acts through our MCP tools/site → writes results back to Supabase → live dashboard.

### If we need an LLM inside our own code: xAI API

Different product, fully programmatic: https://docs.x.ai/overview. It's OpenAI-compatible (`base_url="https://api.x.ai/v1"`, key from console.x.ai) and includes the Responses API with function calling, structured outputs and web search, plus voice, image, video, and the Code API (`grok-4.7`). Use it for things like a merchant-side negotiation agent that we fully control. It's billed separately from Cursor.

### Not to be confused with

| Product | What it is |
| --- | --- |
| Grok Bot | The always-on teammate app (above) |
| Grok chat | The assistant at grok.com |
| Grok Build | xAI's terminal coding agent (TUI/headless, Agent Client Protocol) |
| xAI API | Programmatic access to Grok models at console.x.ai — this *is* the SDK-style option if we need an LLM inside our own code |

Docs: https://docs.x.ai/grok-bot · Launch post: https://x.ai/news/introducing-grok-bot · MCP how-to: https://composio.dev/content/how-to-add-mcp-servers-to-grok-bot

---

## Origin — in simple words

**Origin is Cursor's GitHub.** A git forge built into Cursor, in early beta since Aug 17 2026 for paid plans.

- Create repos, `git clone/push/pull` normally (`https://origin.cursor.com/{owner}/{repo}.git`)
- Pull requests, code browsing/search at `cursor.com/codebase`
- Mirror a GitHub repo into Origin (GitHub stays source of truth for mirrored repos)
- Cursor agents (and Grok Bots, via cloud agents) can create repos, branch, push and open PRs
- **Origin CLI** for terminal workflows (`origin auth login`, etc.)
- **Origin Apps + Public REST API**: build integrations that react to repo events (webhooks signed with Ed25519, app JWT → installation token). This is for *code/repo* automation, not commerce.

For us: host the hackathon repo on Origin (likely expected by the sponsors), and let Cursor cloud agents / Grok Bots work on it.

Docs: https://cursor.com/docs/origin · API: https://cursor.com/docs/api/origin

---

## Supabase

Postgres database with auto-generated APIs, auth, storage, realtime subscriptions and edge functions. Good fit for: product catalog, orders, bot identities, spending limits/approvals, audit log of bot actions (observability is one of the judging questions), and realtime dashboards showing bots transacting live.

---

## Cursor

Our editor and agent. Useful extras for the day:
- **Cloud agents** to parallelise tasks (they push to Origin/GitHub and open PRs)
- **Cursor SDK** (`@cursor/sdk`) if we want to run agents programmatically
- Grok Bot comes bundled with paid Cursor plans, so the same account gives us access
