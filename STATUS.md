# STATUS

Living handoff file. Update it whenever a decision is made, a blocker appears, or a step finishes. Newest information at the top of each section.

**Last updated:** 26 Sep 2026, ~12:00. **Code freeze:** 16:30 (official page). **Top 5 demos:** 17:30.

## Where we are

- Research is done: tech stack (`ideation/tech-stack.md`), a first round of ideas (`ideation/problems-and-ideas.md`, `ideation/shortlist-demo.md`), and deep per-track research on the 5 official tracks (`ideation/tracks/`).
- **The idea is not chosen.** The team explicitly doesn't want a single idea pushed; options should be compared on evidence.
- No application code yet.

## Options on the table

- **From the track research** (`ideation/tracks/README.md`): 64 evidence-backed gaps across the 5 tracks, grouped into cross-track themes. Secondhand trust (grades, condition, one-off stock) showed up in all 5 tracks; others include wrong AI product answers, agent-traffic blindness, spending rules and proof of delegation, subscription compliance and smarter reorders, and agent security.
- **From the first round** (`ideation/shortlist-demo.md`): Haggle (bot-to-bot wholesale sourcing), Guardrails (agent spending rules), Second Life (returns router). Written against the older Luma tracks.

## Open decisions

1. **Pick the problem and track(s).** Use the demo filter in `ideation/shortlist-demo.md`: we control both sides, a before → after in 3 minutes, proof is a number on screen, Grok Bot does real work, and there's a fallback.
2. **Sponsor stack for "Commerce depth":** which of Shopify, Commerce Layer, Recharge, Sanity, PostHog, Tavily to use visibly.
3. **Team roles.**
4. **Grok Bot access:** confirm at least one account on an eligible plan with the desktop app signed in, and that it can add our MCP server.
5. **Language and framework** (default suggestion: TypeScript, deployed on Vercel).

## Next steps

1. Team reviews `ideation/tracks/README.md` and picks 2–3 themes to go deeper on.
2. Decide the idea; record it here with the reasoning.
3. Plan the build against the real window (09:45–16:30; it's already midday).
4. Scaffold and deploy early; record the stack and run/deploy commands in `AGENTS.md` under "Code conventions".

## Risks

- Time: it's midday and nothing is built yet. Deciding fast matters more than deciding perfectly.
- Grok Bot slow or unavailable on stage: keep an xAI API driver for the same flow, a pre-run batch and a recorded video.
- Live demo URL not ready at code freeze: deploy early and keep redeploying.

## Log

- **26 Sep, ~12:10:** Moved the repo from Cursor Origin to GitHub (https://github.com/minthantkyaw28/grokbothack, private). Old Origin remote kept as `cursor-origin`.
- **26 Sep, ~12:00:** Deep research on the 5 official tracks saved to `ideation/tracks/` (5 reports + overview). STATUS made neutral on the idea.
- **26 Sep, 11:20:** Added `AGENTS.md`, `STATUS.md`, `README.md`, `CLAUDE.md`, `GEMINI.md`. Updated `ideation/hackathon.md` from the official hackathon page.
- **26 Sep, ~02:30:** First-round shortlist of 3 demoable ideas.
- **26 Sep, ~02:00:** Researched Grok Bot, Origin, Supabase; wrote `ideation/`.
