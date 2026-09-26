# Notes: Q&A from research session (26 Sep 2026)

Key questions we worked through before the hack. Details and links are in [tech-stack.md](./tech-stack.md).

## What is Grok Bot, really?

**Q: Is Grok Bot an SDK / ADK?**
No. You don't import it into code. It's a finished **app** (by SpaceXAI / xAI, sold through Cursor and SuperGrok plans) where you create named AI "teammates" and message them like coworkers.

**Q: So what does it actually do?**
Each Bot works on a **cloud computer** with a browser, filesystem and terminal. It logs into your tools, works across apps and websites (via plugins/MCP, or by clicking around like a human), keeps memory, learns workflows by demonstration (skills/routines), and keeps working 24/7 when your laptop is closed. Bots can message each other and hand off work, with a "chief of staff" coordinating specialists.

**Q: Is it similar to OpenClaw?**
Yes, same idea: an always-on personal agent with memory, skills, scheduled jobs and a computer. The differences:
- OpenClaw is open source and self-hosted (you run the machine, pick the model, hack anything).
- Grok Bot is managed and closed, runs in Cursor's cloud, is built around multiple bots, and hands coding to Cursor cloud agents.

xAI's own engineering guide says you no longer need a machine at home running 24/7 for OpenClaw.

> Our take: **Grok Bot is OpenClaw, but cleaner, more purpose-built, and managed by SpaceXAI/Cursor.**

**Q: Why is it powerful?**
The plugin marketplace (Airwallex, 1inch, Aave, Apify, Apollo, Clay, Attio, Context.dev, Crustdata, …) lets Bots act as an **AI-powered glue layer across fragmented tools**. Assign one Bot per tool or area of work and chain them together. Lots of possibilities.

**Q: What are the catches?**
- All Bots share one cloud computer, so any login one Bot has, every Bot has.
- Every run and handoff uses up weekly usage.
- Clicking around websites is slow and flaky, so a live demo should rely on MCP tools and webhooks.
- Sensitive actions may pause for human approval.

## Using it

**Q: Do we need to install the desktop app?**
Yes. Download it from https://x.ai/bot (macOS/Windows/Linux, plus iOS/Android) and sign in with your Cursor account. It won't work on Legacy Privacy Mode. The app is only the chat window; the Bots run in the cloud.

**Q: Can we control Grok Bot from code / Cursor, like we do with Origin?**
Only partly. There's **no full public API or CLI**: you can't create Bots, send free-form chat messages or read transcripts from code.
- **Official way in: webhook routines.** In the app, open a Bot, go to Routines, add a webhook, and save. You get a URL and a secret key. Your backend POSTs JSON to it, and the Bot runs its saved instruction with that data. A `200` means the run started, not that it finished. Routines can also fire on a schedule or on Slack, GitHub, Teams, Linear, Sentry or PagerDuty events.
- **The Bot talking to our app:** an MCP server (main integration), our website, or our HTTP API called from the Bot's terminal.
- Unofficial: an internal gateway on port 1340 exists, but it's undocumented and unsupported. Don't rely on it.
- Blog posts from August saying there are "no webhooks" are out of date.

**Q: What are x.ai/api and docs.x.ai then?**
A different product: the **xAI model API**. It's fully programmable and OpenAI-compatible (`base_url=https://api.x.ai/v1`, key from console.x.ai), with function calling, structured outputs, web search, voice, image, video and the Code API. Use it when we want an agent we fully control in our own code. It's billed separately.

## Origin

**Q: What is Origin?**
Cursor's own git hosting ("Cursor's GitHub"), in beta since Aug 2026. It has repos, PRs, code browsing and GitHub mirroring, plus a CLI and REST API for repo automation (not commerce).

**Q: What do we need to use it?**
Your Cursor account on a paid plan, a claimed codebase name at cursor.com/codebase, and the `origin` CLI (`origin auth login` sets up git credentials).
- This repo was first hosted at `https://origin.cursor.com/min-thant-kyaw/grokbothack.git` (HTTPS, because SSH failed on an unverified host key and Cursor doesn't publish its fingerprint).
- **26 Sep:** Origin wasn't working out well, so we moved the repo to GitHub: https://github.com/minthantkyaw28/grokbothack

## What this means for our project

Grok Bot is the **agent**, and we build the **commerce system it uses**:

1. Something happens in Supabase.
2. Our backend POSTs to a Bot's webhook routine.
3. The Bot acts through our MCP tools or site, alongside plugins like Airwallex.
4. Results are written back to Supabase.
5. A live dashboard shows it happening.

Strong direction: build the **missing commerce piece for the Bot tool grid**: a commerce MCP server or plugin with a catalogue built for bots, negotiation, spending limits and human approval for purchases.
