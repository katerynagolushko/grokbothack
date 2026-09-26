# Tavily

> A web search, extraction and crawling API built for AI agents: it returns ranked, cleaned, LLM-ready content rather than raw HTML. Site: https://tavily.com · Docs: https://docs.tavily.com · API reference: https://docs.tavily.com/documentation/api-reference/introduction · Playground: https://app.tavily.com/playground

## What it is

Tavily describes itself as "the web layer for AI agents": real-time web search, content extraction, site crawling, site mapping and cited research, all returned as clean text or markdown with relevance scores. The idea is that an agent calls Tavily instead of scraping search engines, so it spends fewer tokens parsing pages.

Company context (2026): Nebius (NASDAQ: NBIS, the AI cloud company) agreed to acquire Tavily on 9–10 February 2026. Tavily keeps its brand and product, and CEO Rotem Weiss stays on. Bloomberg reported the price as $275m; the official filings did not disclose it. For us this changes nothing practical, but it is useful background if a judge asks.

All requests go to `https://api.tavily.com` with `Authorization: Bearer tvly-YOUR_API_KEY`. Search and Extract can also be tried **without a key** (keyless mode, see below).

## Key products and developer surfaces

| Surface | What it does | When we'd use it |
| --- | --- | --- |
| `POST /search` | Web search with ranked results, snippets ("chunks"), optional LLM answer, images, raw page content, domain/date/country filters | Finding current product info, prices, reviews, competitor listings, news about a brand |
| `POST /extract` | Clean markdown/text from 1–20 known URLs per call; optional `query` to rerank chunks by intent | Pulling a specific product page, returns policy or size guide into an agent's context |
| `POST /map` | Discovers URLs on a site as a graph (no content) | Working out where a merchant's product/category pages live before crawling |
| `POST /crawl` | Map + extract in one call, with depth/breadth limits and natural-language `instructions` | Ingesting a small shop's catalogue or help centre into Supabase for RAG |
| `POST /research` | Asynchronous multi-search agent that writes a cited report; supports a JSON `output_schema` for structured output, streaming via SSE | Deeper "compare these 5 suppliers / products" tasks where we want structured JSON back |
| `GET /usage` | Credit usage for the key | Showing spend in a demo, guarding against running out |
| Python SDK `tavily-python` | `TavilyClient` with `search`, `extract`, `crawl`, `map`, `research` | Python backends / notebooks |
| JS SDK `@tavily/core` | `tavily({ apiKey })` with the same methods (async) | Next.js route handlers on Vercel, Supabase Edge Functions |
| `@tavily/ai-sdk` | Pre-built Vercel AI SDK v5 tools: `tavilySearch`, `tavilyExtract`, `tavilyCrawl`, `tavilyMap` | Drop-in tools for a Vercel AI SDK agent |
| Remote MCP server | `https://mcp.tavily.com/mcp/` with search, extract, map, crawl, research tools | Giving Grok Bot, Cursor or Claude web access with no code |
| Tavily CLI `tavily-cli` (`tvly`) | Terminal search/extract/crawl/research; also installs agent skills for coding agents | Quick manual research while building |
| x402 endpoint | `https://x402.tavily.com/search` – agents pay $0.01 per advanced search in USDC on Base, no API key or account | An "agent pays for its own tools" demo in the Agentic Commerce track |

### Key `/search` parameters (from the OpenAPI spec)

- `query` (required). Best-practice guide: keep it under 1,500 characters.
- `search_depth`: `basic` (default, 1 credit), `advanced` (2 credits, highest relevance), `fast` and `ultra-fast` (1 credit, lower latency; changelog labels them beta).
- `chunks_per_source`: 1–3 (default 3), number of ≤500-character snippets per result. Since a 2026 change, `basic` also returns chunks.
- `max_results`: 0–20, default 10 (note: the Vercel AI SDK tool defaults to 5).
- `topic`: `general` (default), `news`, `finance`.
- `time_range` (`day`/`week`/`month`/`year` or `d`/`w`/`m`/`y`), `start_date`, `end_date` (YYYY-MM-DD), `include_published_date`, `filter_by_published_date`.
- `include_answer`: `false` / `true` / `basic` / `advanced` (LLM-generated answer).
- `include_raw_content`: `false` / `true` / `markdown` / `text`.
- `include_images`, `include_image_descriptions`, `include_favicon`.
- `include_domains` (max 300), `exclude_domains` (max 150), and the newer `include_domains_mode`: `restrict` (hard filter) or `prefer` (boost but allow others).
- `country` (boost a country; only with `topic: general`; takes lowercase names like `united kingdom` – check the enum in the spec for exact spelling).
- `language` and `filter_by_language` (newer; ISO 639-1 code or English name).
- `auto_parameters` (Tavily picks settings; can silently bump to `advanced` = 2 credits).
- `exact_match` (only results containing quoted phrases), `safe_search`, `include_usage`.

Response: `query`, `answer`, `images`, `results[]` (`title`, `url`, `content`, `score`, optional `raw_content`, `published_date`, `favicon`, `images`, `id`), `response_time`, `usage`, `request_id`.

### Other endpoint parameters (verified)

- `/extract`: `urls` (string or 1–20 array), `query`, `chunks_per_source` (1–5, only with `query`), `extract_depth` (`basic`/`advanced`; advanced gets tables and embedded content), `include_images`, `include_favicon`, `format` (`markdown`/`text`), `timeout` (1–60 s), `include_usage`. Always check both `results` and `failed_results`; a 200 can contain failures.
- `/crawl`: `url`, `max_depth`, `max_breadth`, `limit`, `instructions`, `select_paths`, `select_domains`, `exclude_paths`, `exclude_domains`, `allow_external`, `extract_depth`, `format`, `chunks_per_source`, `include_images`, `include_favicon`, `timeout` (10–150 s), `include_usage`. (Parameter names taken from the OpenAPI spec; ranges from the Vercel tool docs: depth 1–5, breadth 1–100, limit default 50.)
- `/map`: same traversal options as crawl, without extraction.
- `/research`: `input` (required), `model` (`mini` / `pro` / `auto`, default `auto`), `stream`, `output_schema` (JSON Schema with `properties`), `citation_format` (`numbered`/`mla`/`apa`/`chicago`), `include_domains` (soft preference, max 20), `exclude_domains` (hard block, max 20), `output_length` (`short`/`standard`/`long`), `files` (up to 5 base64 `.txt`/`.md`/`.json` files). Returns `201` with a `request_id` and `status: pending`; you then poll a "Get Research Task Status" endpoint by request ID (exact path not checked – see the research-get page in the docs) or use streaming.

## AI and agent features

- **Remote MCP server** (documented): `https://mcp.tavily.com/mcp/`
  - With an API key in the URL: `https://mcp.tavily.com/mcp/?tavilyApiKey=<your-api-key>`
  - Or OAuth (no key in URL): `claude mcp add tavily-remote-mcp --transport http https://mcp.tavily.com/mcp/`
  - Or keyless (free, rate-limited; search and extract only): add header `X-Tavily-Access-Mode: keyless`
  - Cursor config via bridge: `"command": "npx -y mcp-remote https://mcp.tavily.com/mcp/?tavilyApiKey=<your-api-key>"`
  - Default parameters can be set with a `DEFAULT_PARAMETERS` header, e.g. `{"search_depth":"advanced","max_results":10}`.
  - The MCP server auto-sets `X-Session-Id`; an `X-Human-Id` can be forwarded for per-user attribution.
- **Local MCP server**: `env TAVILY_API_KEY=tvly-... npx -y tavily-mcp@latest` (docs show pinned versions 0.1.2/0.1.3 in older examples and `@latest` in newer ones; npm package also listed as `@tavily/mcp`). Needs Node 20+.
- **Grok Build plugin**: Tavily has an official plugin in xAI's Grok Build plugin marketplace (`/plugin` inside Grok Build), connecting to `https://mcp.tavily.com/mcp` via OAuth, with tools `tavily_search`, `tavily_extract`, `tavily_map`, `tavily_crawl`, `tavily_research` and skills including `product-competitor-intelligence` and `vendor-risk-kyc-screening`. Note: this is Grok **Build** (xAI's terminal coding agent). Whether Grok **Bot** (our always-on teammates) can use the same plugin is not stated; Grok Bot should be able to use the remote MCP URL directly if it accepts HTTP MCP servers.
- **Agent skills**: `pip install tavily-cli && tvly login` also installs agent skills for Claude Code, Cursor, Codex. Repo: https://github.com/tavily-ai/skills
- **Docs MCP**: `https://docs.tavily.com/mcp` lets an agent search Tavily's own docs.
- **x402 machine payments**: `POST https://x402.tavily.com/search` returns HTTP 402 with a `PAYMENT-REQUIRED` header; the agent signs an EIP-3009 USDC authorisation and retries; Tavily settles on Base and returns results plus an on-chain receipt in `PAYMENT-RESPONSE`. Price: $0.01 per call, always `advanced`. Pricing JSON at `GET /.well-known/pricing`. Automatic refunds on upstream failure.
- **Framework integrations listed in the docs**: Vercel AI SDK (`@tavily/ai-sdk`), LangChain (`pip install -U langchain-tavily`, `from langchain_tavily import TavilySearch`), OpenAI (function calling and remote MCP via the Responses API), Anthropic, LlamaIndex, CrewAI, Mastra, Google ADK, Pydantic AI, n8n, Make, Zapier, Convex, and more.
- **Recommended agent defaults** (from the docs index): `search_depth="advanced"`, `chunks_per_source=3`, `max_results=5` for focused answers, avoid `include_answer` unless you need a quick seed.

## Fastest hackathon path

1. Sign up at https://app.tavily.com (free, no card) and copy the `tvly-...` key. Ask the organisers/Greta about the sponsor credits and which account they attach to.
2. Test instantly with curl (or keyless, no signup):

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tvly-YOUR_API_KEY" \
  -d '{"query": "Who is Leo Messi?"}'
```

3. In a Next.js route handler / Supabase Edge Function:

```bash
npm i @tavily/core
```

```javascript
const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
const response = await tvly.search("Who is Leo Messi?");

console.log(response);
```

4. If using the Vercel AI SDK (v5 per the docs), give the model Tavily as a tool:

```typescript
import { tavilySearch } from "@tavily/ai-sdk";
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await generateText({
  model: openai("gpt-5-mini"),
  prompt: "What are the latest developments in quantum computing?",
  tools: {
    tavilySearch: tavilySearch(),
  },
  stopWhen: stepCountIs(3),
});
```

(The provider can be swapped for xAI via the AI SDK's xAI provider; the Tavily docs example uses OpenAI.)

5. For Grok Bot: register the remote MCP URL `https://mcp.tavily.com/mcp/?tavilyApiKey=<key>` as an MCP server, then prompt it to use `tavily-search` / `tavily-extract`.

## Pricing, limits and gotchas

- **Free ("Researcher")**: 1,000 credits per month, no card. Paid: Project 4,000 credits $30/mo; Bootstrap 15,000 $100; Startup 38,000 $220; Growth 100,000 $500; pay-as-you-go $0.008/credit.
- **Credit costs**: search basic/fast/ultra-fast 1, advanced 2; extract 1 credit per 5 successful URLs (basic) or 2 per 5 (advanced), failures free; map 1 per 10 pages (2 per 10 with `instructions`); crawl = map + extract; research is dynamic: `mini` 4–110 credits, `pro` 15–250 credits per request. One careless `pro` research call could use a quarter of the free month.
- **Rate limits**: development keys 100 requests/minute; production keys 1,000 RPM (production keys need a paid plan or pay-as-you-go). Crawl is 100 RPM on both; research creation 20 RPM; `/usage` 10 per 10 minutes. `429` responses include `Retry-After`.
- **Error codes**: `432` = plan/key limit exceeded, `433` = pay-as-you-go limit exceeded. Handle these explicitly so a demo does not fail silently.
- `auto_parameters: true` may switch to `advanced` and double cost.
- Keyless mode covers only `/search` and `/extract`; crawl, map and research need a key. Keyless limits are not published.
- Tavily is a search layer over the open web, not a product/price database. It does not have a dedicated shopping or price endpoint; any price comparison means searching/extracting retailer pages and parsing prices ourselves (via the LLM or code). Prices in snippets can be stale or wrong – `published_date` is described as a best estimate and in beta.
- Extract output order is not guaranteed; key results by URL.
- The Vercel tool defaults (`maxResults` 5) differ from the raw API default (10).

## How it could fit our hack

Neutral mapping; not a recommendation.

- **Storefront Experience**: enrich product pages with live context (reviews, press, "as seen in") pulled via search/extract, stored in Supabase and shown on the storefront. Risk: accuracy and attribution of scraped claims.
- **Buyer Experience**: a shopping assistant that answers "is this a fair price?" or "what do reviewers say about sizing?" by searching the web with `include_domains` set to trusted retailers/review sites, citing sources.
- **Merchant Tooling**: competitor price and assortment monitoring (scheduled Grok Bot routine runs searches with `time_range: "week"`, extracts competitor product pages, writes diffs to Supabase); supplier due diligence using `exact_match` and `/research` with an `output_schema` (e.g. a vintage-wholesale supplier check, which is relevant to Fleek).
- **New Ways to Buy**: "paste any product link" flows – extract a URL the buyer drops in, normalise it into a structured product, then find alternatives.
- **Agentic Commerce**: Tavily is the agent's eyes on the open web; the x402 endpoint is a concrete, working example of an agent paying per call with no human account – could be shown alongside our own agent-to-merchant payment story.
- **How Grok Bot could use it**: connect the remote MCP server so the always-on bot can search/extract during tasks; or have a webhook routine call our Vercel endpoint which calls `@tavily/core`. Session headers (`X-Session-Id`, `X-Human-Id`) and `X-Project-ID` let us attribute usage per bot/task.

## Sources

- https://docs.tavily.com/documentation/api-reference/introduction
- https://docs.tavily.com/documentation/api-reference/endpoint/search (OpenAPI spec)
- https://docs.tavily.com/documentation/api-reference/endpoint/extract.md
- https://docs.tavily.com/documentation/api-reference/endpoint/crawl.md
- https://docs.tavily.com/documentation/api-reference/endpoint/research.md
- https://docs.tavily.com/documentation/api-credits
- https://docs.tavily.com/documentation/rate-limits.md
- https://docs.tavily.com/documentation/mcp
- https://docs.tavily.com/documentation/keyless.md
- https://docs.tavily.com/documentation/machine-payments/x402.md
- https://docs.tavily.com/documentation/integrations/vercel.md
- https://docs.tavily.com/documentation/integrations/grok-build.md
- https://docs.tavily.com/documentation/integrations/langchain.md
- https://docs.tavily.com/documentation/best-practices/best-practices-search.md
- https://docs.tavily.com/sdk/javascript/quick-start.md
- https://docs.tavily.com/changelog.md
- https://docs.tavily.com/llms.txt
- https://nebius.com/newsroom/nebius-announces-agreement-to-acquire-tavily-to-add-agentic-search-to-its-ai-cloud-platform (via search summary)
- https://www.sec.gov/Archives/edgar/data/1513845/000110465926012492/tm265786d1_6k.htm (via search summary)
- https://www.bloomberg.com/news/articles/2026-02-10/nebius-agrees-to-buy-ai-agent-search-company-tavily-for-275-million (via search summary)
