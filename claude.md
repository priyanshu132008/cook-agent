# Cook Agent — Claude Code Context
# ROLE: YOU ARE THE TYPIST. EXECUTE ONLY.
# Gemini writes logic. You paste it. Run commands. Brief replies.
## Product
Cook Agent — "Let Him Cook" — lethimcook.in
Zero Docker. Zero APIs. Stealth search built-in.
Target: young founders, student devs, builders 16-25.
## Language
TypeScript everywhere. Node.js 22. Strict mode.
No any types. Files under 200 lines. No LangChain.
## Stack
- Runtime: Node.js 22 + TypeScript 5.5 strict
- Memory: Markdown on disk /memory/ (forever, gitignored)
- Models: Ollama auto ® OpenRouter ® Claude/OpenAI
- Default: phi4-mini (8GB RAM = 12-28 tok/s)
- Search: Cook Stealth Search (zero Docker, built-in)
- Compressor: compressor.ts (ALL scraped data runs through)
- Channels: Telegram v1, WhatsApp Baileys v1.5
- Install: install.sh (Mac/Linux) + install.ps1 (Windows)
## Search Rules (CRITICAL — NEVER VIOLATE)
Layer 1: lite.duckduckgo.com/lite/ ONLY — not Google/Bing
Layer 2: 18 SearXNG instances, round-robin, 5s timeout
Layer 3: optional user API key only
NO Promise.all() for searches — EVER
for...of sequential only — always
Human jitter: 2-4 random seconds between every request
Cache /memory/cache/ — 10 min TTL — always check first
## Compressor Rules (CRITICAL)
ALL scraped HTML ® compressor.ts before ANY LLM call:
1. pruneDOM() — cheerio strips noise
2. filterByRelevance() — keyword paragraph filter
3. hardTruncate() — max 2500 words
## Memory Rules
Every session appends to memory/conversations/YYYY-MM-DD.md
profile.md, idea.md, progress.md auto-updated each session
memory/ gitignored. Never uploaded. User owns it.
## Architecture Rules
- Skills: MARKDOWN files — NOT executable scripts
- Execution: through sandbox.ts ONLY — no eval/exec
- Errors: founder-friendly always — no stack traces
## Commands
/ship — lint+build+test+commit
/skill [name] — scaffold new skill
/standup — generate build-in-public post
## Current Sprint — See CONTEXT.md