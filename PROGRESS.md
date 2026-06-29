# Progress

## Day 1
- Monorepo init
- Turborepo setup
- Core package scaffolding

## Day 2
- `memory.ts` file system matrix
- `agent.ts` baseline execution loop

## Day 3
- **Status: Complete**
- Hardware Intelligence layer via `models.ts`
- Dynamic RAM/CPU detection
- `phi4-mini` auto-selection

## Day 4
- **Status: Complete**
- OpenRouter Cloud Fallback (`generateCloud` in `models.ts`)
- 90% complexity auto-switch threshold in `runAgentLoop`
- Emergency cloud fallback if local model crashes

## Day 5
- **Status: Complete**
- Memory Compressor (`compressor.ts`) integrated into `runAgentLoop`
- Profile context auto-truncated when > 1000 chars (head/tail preservation)

## Day 6
- **Status: Complete**
- Web Search Layer 1 — `search.ts`
  - DuckDuckGo Lite endpoint (`lite.duckduckgo.com/lite/`) via form-urlencoded POST
  - 5-agent rotating User-Agent pool (Chrome / Safari / Firefox, modern desktop)
  - Cheerio 1.2.0 DOM extraction (`.result-snippet`, top-5)
  - All scraped payloads piped through `compressMemory` before any LLM call
  - Standalone smoke-test harness: `packages/core/src/test-search.ts`
- `doctor.ts` - cook doctor command (7 checks, plain-English ✔/X output).

## Day 7
- **Status: Complete**
- Web Search Layer 2 — SearXNG decentralized fallback in `search.ts`
  - 10-instance round-robin pool (`searx.be`, `searx.fmac.network`, `search.mdosch.de`, `searx.ru`, `search.bus-hit.me`, `searx.nixnet.services`, `search.inetol.net`, `searx.tiekoetter.com`, `searx.work`, `search.sapti.me`)
  - Native JSON endpoint (`format=json`) — no Cheerio needed at Layer 2
  - 5s hard timeout via Node 22 `AbortSignal.timeout` on every fetch
  - Silent fallback: Layer 2 only engages on Layer 1 failure (HTTP block, captcha wall, or timeout)
  - Same User-Agent carried from Layer 1 into Layer 2 (consistent fingerprint, no mid-fallback rotation)
  - Module-scoped `searxngIndex` advances per attempt — no hammering of dead instances
  - All Layer 2 payloads still piped through `compressMemory` before LLM handoff

## Day 8
- **Status: Complete**
- Web Search Layer 3 + Cache + Jitter — final enterprise-grade `search.ts` architecture
  - **In-memory cache** (`Map<string, {timestamp, data}>`) with 1-hour TTL — first check on every call, zero-network return on hit
  - **Network jitter** — random 500-1500ms `sleep` before every search (anti-bot humanizing)
  - **Layer 1** (DDG Lite, cheerio, 5s timeout) — unchanged from Day 7
  - **Layer 2** rewritten as `for...of` sequential loop over 3 random SearXNG nodes (4s timeout each) — first hit wins, silent advance on failure
  - **Layer 3** — optional Tavily premium API fallback, gated on `process.env.TAVILY_API_KEY`; gracefully throws when key absent so non-API users aren't impacted
  - All layers still pipe final payload through `compressMemory` and write to cache before returning
  - Pipeline returns founder-friendly string (`"Search failed completely."`) on full exhaustion — no stack traces leaked

## Day 9
- **Status: Complete**
- Persistent Memory + Search Integration into execution loop
  - **`appendMemory(filename, data)`** added to `memory.ts` — auto-creates subdirectories (e.g. `conversations/`), prepends ISO timestamp + `### [...]` header, appends UTF-8 to disk
  - **`MEMORY_DIR` alias** wired alongside existing `MEMORY_ROOT` — preserves prior `readMemory` / `writeMemory` callers while letting `appendMemory` use the snippet's `path.join(MEMORY_DIR, ...)` style
  - **`runAgentLoop` rewritten** (`agent.ts`, 52 lines):
    - Logs every user prompt to `conversations/history.md` with `**USER:**` marker before any model call
    - **Intelligent interceptor**: keyword sniff (`search` / `latest` / `current`) auto-boots the 3-layer `searchWeb` pipeline and prepends `LIVE INTERNET DATA:` block to the prompt
    - Complexity now scored on the *augmented* prompt (profile + search + user), so heavy search payloads can naturally trigger the Day 4 90+ cloud-fallback threshold
    - Dual-write on completion: `cache/last_run.md` overwritten via `writeMemory` (fast next-run context), `conversations/history.md` appended via `appendMemory` (long-term log) with `**COOK AGENT:**` marker
  - End-to-end flow now: prompt → persistent log → optional search → compress → complexity score → local/cloud model → cache + persistent log → return

## Day 10
- **Status: Complete**
- Security Layer — Auth, Sandbox, Skill Manifest
  - **`packages/core/src/registry/index.json`** — skill manifest with 3 entries: `searchWeb` (open), `writeMemory` (requires auth), `executeCode` (requires auth + `dangerous: true`)
  - **`packages/core/src/sandbox.ts`** — `enforceSandbox(targetPath)` path-traversal guard + hard-block on any `.env` access; founder-friendly breach messages with 🛑 marker, no stack traces
  - **`packages/core/src/auth.ts`** — `verifySkillAuth(skillName)` loads the manifest fresh per call, rejects unregistered skills, logs ⚠️ warning for `dangerous` skills, returns auth verdict
  - **`memory.ts` now routes every path through `enforceSandbox`**:
    - `resolveMemoryPath()` applies the existing `MEMORY_ROOT` escape check, then passes the result through `enforceSandbox()` before returning (defense-in-depth: both layers must agree)
    - `appendMemory()` now wraps its `path.join(MEMORY_DIR, filename)` result in `enforceSandbox()` directly — closes the bare-path gap I flagged on Day 9
    - `readMemory()` no longer relies on `readFile` resolving at call time — `mkdir` runs first so the sandbox check sees the final target
  - Three-layer security triad now wired: **registry** (what's allowed) → **auth** (is it registered + dangerous-flagged) → **sandbox** (where on disk it can touch)

## Day 12
- **Status: Complete**
- Aura++ Onboarding Q1-Q4 implemented (Trenches, Cooking, Boss, Rawdog Local mode)
  - **`packages/core/src/cli/onboarding.ts`** — interactive calibration interview (92 lines, under 200-line cap)
  - **Brand split**: `blazeOrange` (#FF4500) system chrome + `hackerGreen` (#00FF00) cook's aura intro card
  - **Q1 Trenches** (`select`): Blueprint / In the Mud / Feral Builder
  - **Q2 Cooking** (`text` w/ non-empty validation): free-form idea capture with placeholder example
  - **Q3 Boss** (`select`): 6 blockers (brain fog, ghost town, plateau, spaghetti, megaphone, echo chamber)
  - **Q4 Rawdog Local mode**: reuses Day 3 `detectHardware()` from `models.ts`, real RAM/model readout via spinner, conditional `ollama pull` only fires if user picks Rawdog
  - `handleCancel()` wrapper on every clack prompt — Ctrl-C exits cleanly with `process.exit(0)`
  - Persistence: `idea.md` written to memory root immediately after Part 1 (`# The Cook / Phase / Main Boss` sections)
  - Chainable: returns `{ level, idea, blocker, engineMode, hardware }` for Part 2 pickup
  - Self-boot footer: auto-runs when invoked directly via `tsx`, skipped when imported by orchestrator (no double-execution)

## Day 13
- **Status: Complete**
- Onboarding Q5-Q7 (Accountability, Radar, Grind time → profile.md + First message)
  - **`onboarding.ts` unified** (135 lines, under 200-line cap) — Part 2 absorbed into the main function; renamed `runOnboardingPart1` → `runOnboarding`
  - **`detectHardware` import dropped** — replaced by direct `os.totalmem()` for cleaner Apple Silicon handling
  - **Q5 Channel** (`select`): Telegram / Terminal Purist
  - **Q6 Radar** (`select`): Cook Stealth Search (DEFAULT) / Bring Your Own Key (Tavily)
  - **Q7 Grind Time** (`text` w/ validation): free-form start time, e.g. "05:00 AM"
  - **Permanent memory build** — sequential `writeMemory` writes:
    - `idea.md` — original 3-field layout (The Cook / Phase / Main Boss) from Day 12
    - `profile.md` — new 5-field founder profile (Engine Mode / Primary Model / Channel / Radar / Grind Time), both writes protected by Day 10 `enforceSandbox()`
  - **First message** — clack `note()` card from "COOK AGENT", personalized line interpolating grind time + boss name (underscores → spaces for readability)
  - **Behavior change to flag**: `radar` answer captured but not yet wired into `search.ts` — Layer 3 Tavily still fires regardless of `radar` setting; flag for future sprint if you want BYOK gating

- Onboarding upgrade — live System Configurator (Day 13 patch #2, 152 lines)
  - **`updateEnvFile(key, value)`** — regex-replace or append to `.env`, trimmed + newline on write; idempotent
  - **`getLocalModels()`** — runs `ollama list`, parses output, returns `string[]`; silent `[]` fallback if ollama not installed
  - **Engine-mode branching**: `local` (dynamic model picker from `ollama list`), `cloud_free` (OpenRouter model + writes `OPENROUTER_API_KEY`), `cloud_pro` (OpenAI / Anthropic / Gemini → writes `${PROVIDER}_API_KEY`)
  - **Radar branching**: stealth (no key), Tavily → `TAVILY_API_KEY`, Brave → `BRAVE_API_KEY` (Brave not yet honored in `search.ts` — flag for future sprint)
  - **API key input** via `password()` mask — keys never echo in terminal
  - **Security policy** (user-approved): `updateEnvFile` bypasses Day 10 `enforceSandbox` `.env` block — onboarding is the one-shot setup path; agent runtime still blocked

## Day 14
- **Status: Complete**
- Global Installers — `install.sh` (macOS/Linux) + `install.ps1` (Windows)
  - **`cook-agent/install.sh`** (30 lines, executable `-rwxr-xr-x`) — 5-stage installer: Node check → pnpm bootstrap → `pnpm install` → `.env` touch → onboarding launch via `node --env-file=.env --experimental-strip-types`
  - **`cook-agent/install.ps1`** (26 lines) — Windows PowerShell mirror with `Get-Command` / `Write-Host` / `Test-Path` / `New-Item`; identical 5-stage flow, brand color via `DarkYellow` + `Green`
  - **Brand-consistent chrome**: bash uses ANSI `\033[38;5;202m` (256-color orange, near `#FF4500`) and `\033[32m` (green); PowerShell uses `DarkYellow` + `Green` (closest built-in match)
  - **Onboarding launch flags**: `--env-file=.env` injects API keys into `process.env` for runtime modules; `--experimental-strip-types` (Node 22 native) runs TypeScript without tsx/ts-node
  - **`chmod +x install.sh`** applied — file is now directly executable via `./install.sh`
  - **Spec note**: `--env-file` requires the `.env` file to exist; both installers touch it before invoking node so this is safe across all platforms

## Day 15
- **Status: Complete**
- Skill: `standup` — Daily battle-plan generator
  - **`packages/core/src/skills/standup.ts`** (74 lines, under 200-line cap)
  - **Context gathering**: `readMemory('profile.md')` + `readMemory('idea.md')` (sandbox-safe) + last 2KB of `PROGRESS.md` (truncated to keep prompt size sane as the log grows)
  - **Configuration parsing**: regex-grabs `**Primary Model:** <name>`; substring-checks for `cloud_pro` / `cloud_free` to route local-vs-cloud; defaults to `llama3.2` if model line missing
  - **Strict prompt template**: Mission (idea) + Profile + recent progress + 3-task request with feral tone + bulleted-list format directive
  - **LLM execution**: branches to `generateLocal` / `generateCloud` based on profile config; reuses Day 3/4 model integrations
  - **Brand chrome**: orange intro/spinner, green success, red crash; live `s.message()` spinner update shows current model; output rendered through `clack.note()` for visual punch
  - **Auto-boot footer**: self-runs when invoked via `tsx`, skipped on import
  - **Behavior flags**:
    - `PROGRESS.md` reads bypass `enforceSandbox` (consistent with onboarding — CLI skill, not agent runtime)
    - `isCloud` substring check is brittle; cleaner regex parsing of `**Engine Mode:**` is a future-hardening TODO

## Day 16
- **Status: Complete**
- Skill: `idea-validator` — Autonomous market validation
  - **`packages/core/src/skills/idea-validator.ts`** — pulls `idea.md` + `profile.md` via `readMemory`, routes to `generateLocal` / `generateCloud` based on profile engine mode
  - **Stealth competitor sweep** — `executeSearch('competitors alternatives to: ' + idea.substring(0,200))` feeds live market intel into the prompt
  - **Strict output matrix**: 🚨 Direct Competition & Threats / 🕳️ The Gap (Why We Win) / 🛡️ Execution Risks / ⚡ Verdict — rendered via `clack.note()` for visual punch
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure

## Day 17
- **Status: Complete**
- Skill: `customer-finder` — Sequential, jitter-backed lead sourcing
  - **`packages/core/src/skills/customer-finder.ts`** — pulls `idea.md` + `profile.md`, hunts 2 source platforms (Reddit Solopreneurs, IndieHackers Traffic) for active pain signals
  - **STRICT MANDATE**: `for...of` sequential loop over platforms — no `Promise.all()`, IP stays clean
  - **Human jitter**: 2-4s random delay between every `executeSearch` call — anti-bot humanizing per project search rules
  - **Profile-driven routing**: `cloud_pro`/`cloud_free` → `generateCloud`, else `generateLocal(targetModel)` from `**Primary Model:**` regex
  - **Persistent ledger**: final leads matrix written to `memory/customers.md` via `fs.writeFile` (UTF-8) — survives across sessions
  - **Brand chrome**: orange intro/spinner + green success, red crash; `clack.note()` renders the ACQUIRED CUSTOMER LEDGER with cyan path callout

## Day 18
- **Status: Complete**
- Skill: `launch-sequence` — Copy-paste distribution dossier across 5 channels
  - **`packages/core/src/skills/launch-sequence.ts`** — pulls `idea.md` + `customers.md` + `profile.md` via `readMemory` (sandbox-safe)
  - **Profile-driven routing**: `cloud_pro`/`cloud_free` → `generateCloud`, else `generateLocal(targetModel)` from `**Primary Model:**` regex (defaults `llama3.2`)
  - **Strict prompt template**: Product Vision + Target Buyer Archetypes + 4-channel generation matrix (Product Hunt / Show HN / Twitter X / Reddit r/startups + r/IndieHackers)
  - **"Builder-to-Builder" tone directive** — aggressive, clean, persuasive; anti-corporate marketing speak
  - **Persistent ledger**: final dossier written to `memory/launch_sequence.md` via `fs.writeFile` (UTF-8) — survives across sessions, ready for channel deployment
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; `clack.note()` renders the COPY-PASTE DISTRIBUTION DOSSIER with cyan path callout

## Day 19
- **Status: Complete**
- Skill: `hard-truth` — Level-aware brutal reality check
  - **`packages/core/src/skills/hard-truth.ts`** — pulls `idea.md` + `profile.md` + `progress.md` via `readMemory` (sandbox-safe, `.catch()` fallback for missing files)
  - **Level-aware tone routing**: parses builder level from `profile.md` (Blueprint / In the Mud / Feral Builder) — modulates prompt from instructional → harsh → no-mercy
  - **Robust routing patch**: case-insensitive `\*\*Engine Mode:\*\* (.*)` regex with `cloud` substring match — handles casing/whitespace drift
  - **Strict output matrix**: 🩸 The Bleeding Edge / 🛑 Delusion Check / 🔪 The Cut / ⚡ The Wake-Up Call — rendered via `clack.note()` as HARD TRUTH VERDICT
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; outro closes with "Ego disabled. Get back to work."

## Day 20
- **Status: Complete**
- Skill: `build-guide` — Level-aware technical architecture roadmap
  - **`packages/core/src/skills/build-guide.ts`** — pulls `idea.md` + `profile.md` via `readMemory` (sandbox-safe, `.catch()` fallback for missing files)
  - **Level-aware stack routing**: Blueprint (Next.js + Supabase) → In the Mud (modern unblocking tools) → Feral Builder (Hono + pure Node + SQLite, zero bloat, skip abstractions)
  - **Robust routing patch**: case-insensitive `\*\*Engine Mode:\*\* (.*)` regex with `cloud` substring match — handles casing/whitespace drift
  - **Strict output matrix**: 🧱 The Stack / 🗺️ Execution Order (4 sequential 48-hour steps) / ⚠️ Architectural Traps (2 rabbit holes) — rendered via `clack.note()` as TECHNICAL BUILD GUIDE
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; outro closes with "Blueprint locked. Execute the code."

## Day 21
- **Status: Complete**
- Skill: `research-agent` — Deep multi-source research with adversarial verification
  - **`packages/core/src/skills/research-agent.ts`** — pulls `idea.md` + `profile.md` via `readMemory` (sandbox-safe, `.catch()` fallback for missing files)
  - **Sequential search sweep**: `for...of` over 4 research angles (market / competitors / tech / users) — `executeSearch` per angle, 2-4s human jitter between each (anti-bot humanizing per project search rules)
  - **Profile-driven routing**: case-insensitive `\*\*Engine Mode:\*\* (.*)` regex with `cloud` substring match — routes to `generateCloud` (cloud_pro/cloud_free) or `generateLocal(targetModel)` from `**Primary Model:**` regex (defaults `llama3.2`)
  - **Strict output matrix**: 📚 Sources (cited) / 🔍 Findings (synthesized) / ⚔️ Contradictions / ⚡ Verdict — rendered via `clack.note()` as RESEARCH DOSSIER
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; outro closes with "Sources cited. Verdict locked."

## Day 23
- **Status: Complete**
- Skill: `outreach-writer` — Personalized cold DM/Email drafts from customer ledger
  - **`packages/core/src/skills/outreach-writer.ts`** — pulls `customers.md` + `profile.md` via `readMemory` (sandbox-safe, `.catch()` fallback for missing ledger)
  - **Profile-driven routing**: case-insensitive `\*\*Engine Mode:\*\* (.*)` regex with `cloud` substring match — routes to `generateCloud` (cloud_pro/cloud_free) or `generateLocal(targetModel)` from `**Primary Model:**` regex (defaults `llama3.2`)
  - **Strict prompt template**: Hook (their pain) → Value (our solution) → CTA (low friction), under 4 sentences each, founder-to-founder tone, zero corporate speak
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; rendered via `clack.note()` as DEPLOYMENT READY MESSAGES; outro closes with "Go send them."
  - **Self-boot footer**: auto-runs when invoked via `tsx`, skipped on import

## Day 24
- **Status: Complete**
- Skill: `decision-partner` — Socratic resolution for paralyzed architectural/business decisions
  - **`packages/core/src/skills/decision-partner.ts`** — interactive `text()` prompt with non-empty validation captures the user's dilemma in real-time
  - **Context-aware**: pulls `idea.md` + `profile.md` via `readMemory` (sandbox-safe, `.catch()` fallback)
  - **Profile-driven routing**: case-insensitive `\*\*Engine Mode:\*\* (.*)` regex with `cloud` substring match — routes to `generateCloud` or `generateLocal(targetModel)` from `**Primary Model:**` regex (defaults `llama3.2`)
  - **Strict prompt template**: Strip emotion → give the two actual trade-offs → make a definitive brutal recommendation based on speed to ship
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; rendered via `clack.note()` as THE VERDICT; outro closes with "Stop thinking. Start typing."
  - **`handleCancel()` pattern**: Ctrl-C exits cleanly with `process.exit(0)` if user backs out of the dilemma prompt

## Day 25
- **Status: Complete**
- Skill: `anchor` — 2 AM grounding protocol for exhausted builders
  - **`packages/core/src/skills/anchor.ts`** — pulls `progress.md` + `profile.md` via `readMemory` (sandbox-safe, `.catch()` fallback for missing files)
  - **Profile-driven routing**: case-insensitive `\*\*Engine Mode:\*\* (.*)` regex with `cloud` substring match — routes to `generateCloud` or `generateLocal(targetModel)` from `**Primary Model:**` regex (defaults `llama3.2`)
  - **Strict prompt template**: 4-sentence grounding statement — remind user of code already shipped, contrast against the world sleeping, relentless cold feral-builder energy, zero corporate fluff
  - **Brand chrome**: orange intro/spinner + green success, red crash on engine failure; rendered via `clack.note()` as MESSAGE FROM THE VOID; outro closes with "Breathe. Keep going."
  - **Self-boot footer**: auto-runs when invoked via `tsx`, skipped on import

## Core Refinements
- Wired up Universal Search Router to dynamically read profile.md and execute Tavily/Brave/Stealth search.
  - **`packages/core/src/search.ts`** rewritten (60 lines, under 200-line cap) — profile-driven routing via `**Radar Setting:**` regex from `profile.md`
  - **Tavily branch** (`radarSetting.includes('tavily')`) — `process.env.TAVILY_API_KEY`, `search_depth: 'basic'`, output formatted as `TITLE:` / `CONTENT:` pairs
  - **Brave branch** (`radarSetting.includes('brave')`) — `process.env.BRAVE_API_KEY`, `X-Subscription-Token` header, output as `TITLE:` / `DESCRIPTION:` pairs
  - **Stealth branch** (default fallback) — DDG HTML endpoint (`html.duckduckgo.com/html/?q=`), regex-parsed `result__snippet` matches, no cheerio
  - **`searchWeb` alias preserved** (`export const searchWeb = executeSearch`) — Day 9 `agent.ts` + `test-search.ts` callers continue to work without modification
  - **Behavior changes vs Days 6-9**: Layers 1/2/3 (DDG Lite, SearXNG round-robin, in-memory cache, jitter) are no longer in this file; flag if you want SearXNG re-attached as a stealth-side fallback
  - **Compressor still applies** — `agent.ts` calls `compressMemory(searchContext)` after `executeSearch` returns, so the rich `TITLE/CONTENT` format is compressed via the Day 5 head/tail preservation before the LLM sees it

### PHASE 4: Channels & Distribution (Days 26 - 31)
- [x] **Day 26:** `channels/whatsapp.ts` - Baileys - QR auth (Pipeline prepped)
- [x] **Day 27:** `channels/telegram.ts` - Memory context injected & synchronized
- [x] **Day 28:** Full integration test - memory persists across restart - TUI polished
- [x] **Day 29-31:** `install.sh` architecture built for global distribution

### PHASE 5: Optimization & Web Presence (Days 32 - 34)
- [x] **Day 32-33:** Error handling - slashed TUI slash commands - optimized local execution routing
- [x] **Day 34:** `lethimcook.online` website - Vite + React + Framer Motion + SEO Matrix deployed