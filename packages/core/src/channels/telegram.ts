import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generateLocal, generateCloud } from '../models.ts';
import type { ChatMessage } from '../models.ts';
import { readMemory } from '../memory.ts';
import { runHardTruth } from '../skills/hard-truth.ts';
import { runCustomerFinder } from '../skills/customer-finder.ts';
import { runDecisionPartner } from '../skills/decision-partner.ts';
import { runBuildGuide } from '../skills/build-guide.ts';
import { runIdeaValidator } from '../skills/idea-validator.ts';
import { runResearchAgent } from '../skills/research-agent.ts';
import { runOutreachWriter } from '../skills/outreach-writer.ts';
import { runLaunchSequence } from '../skills/launch-sequence.ts';
import { runAnchor } from '../skills/anchor.ts';
import { runDoctor } from '../skills/doctor.ts';

const PROJECT_ROOT = process.cwd();
const AUTH_FILE = path.join(PROJECT_ROOT, 'memory', 'tg_auth.json');
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getAuthData() {
    try {
        const data = await fs.readFile(AUTH_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { allowedIds: [], pending: {} };
    }
}

async function saveAuthData(data: any) {
    await fs.writeFile(AUTH_FILE, JSON.stringify(data, null, 2));
}

export async function approveTelegram(code: string) {
    const data = await getAuthData();
    let approvedId = null;
    for (const [chatId, pendingCode] of Object.entries(data.pending)) {
        if (pendingCode === code) {
            approvedId = chatId;
            break;
        }
    }
    if (approvedId) {
        data.allowedIds.push(Number(approvedId));
        delete data.pending[approvedId];
        await saveAuthData(data);
        console.log(chalk.hex('#00FF41')(`\n✅ Telegram Device [${approvedId}] Paired Successfully.\n`));
    } else {
        console.log(chalk.red(`\n❌ Invalid pairing code.\n`));
    }
}

// ─────────────────────────────────────────────────────────────────────
// Skill router — Telegram parity with the TUI's `cook <cmd>` dispatcher.
//
// Telegram users type the same `cook hunt` / `cook blueprint` / etc.
// commands as TUI users. We intercept them BEFORE the chat pipeline,
// invoke the underlying programmatic skill, capture its stdout, strip
// terminal chrome (ANSI codes, clack box-drawing), chunk the result for
// the 4096-char Telegram limit, and send it back as one or more messages.
// ─────────────────────────────────────────────────────────────────────

type TelegramSkill = () => Promise<void>;

/** Map of bare subcommand names → underlying programmatic skill runner.
 *  Mirrors the table in `terminal.ts` line-for-line. */
const TELEGRAM_SKILL_MAP: Record<string, TelegramSkill> = {
    truth: runHardTruth,
    hunt: runCustomerFinder,
    decide: runDecisionPartner,
    blueprint: runBuildGuide,
    validate: runIdeaValidator,
    research: runResearchAgent,
    outreach: runOutreachWriter,
    launch: runLaunchSequence,
    anchor: runAnchor,
    doctor: runDoctor,
};

/** Strip ANSI CSI sequences, OSC sequences, and clack's box-drawing borders.
 *  Keeps inline markdown (#, *, _, `, links, etc.) intact so skill output
 *  renders as proper Markdown in Telegram. */
function cleanTerminalText(raw: string): string {
    return raw
        // 1. Strip ANSI escape sequences (CSI + OSC + simple escapes).
        //    Covers colors, cursor moves, screen clears (\x1b[2J / \x1b[H).
        .replace(/\x1b\][^\x07]*\x07/g, '')          // OSC ... BEL
        .replace(/\x1b\][^\x1b]*(?:\x1b\\|\x07)/g, '') // OSC ... ST or BEL
        .replace(/\x1b\[2J/g, '')                     // erase entire screen
        .replace(/\x1b\[H/g, '')                      // cursor home
        .replace(/\x1b\[3J/g, '')                     // erase scrollback
        .replace(/\x1b\[\d*[A-PR-Z]/g, '')           // other CSI sequences
        .replace(/\x1b\[\d+;\d+[Hf]/g, '')            // cursor position
        .replace(/\x1b\[\?\d+[hl]/g, '')              // mode set/reset
        // 2. Strip clack's box-drawing border characters (─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ and arrows)
        //    and the spinner braille frames which add nothing in a text chat.
        .replace(/[─-╿]/g, '')              // box drawing block
        .replace(/[⠀-⣿]/g, '')              // braille patterns (spinners)
        .replace(/[●○◌◦◙◘◦]/g, '')                    // circle bullet glyphs clack uses
        // 3. Collapse runs of blank lines and trim trailing whitespace per line.
        .split('\n').map(l => l.replace(/[ \t]+$/g, '')).join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** Split a long string into chunks that fit Telegram's 4096-char limit.
 *  Prefers breaking on paragraph (\n\n) → line (\n) → word → hard cut. */
function chunkForTelegram(text: string, limit = 4096): string[] {
    if (text.length <= limit) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > limit) {
        // Try to find the largest break point that fits.
        let cut = -1;

        // 1. Paragraph boundary (preferred)
        const para = remaining.lastIndexOf('\n\n', limit);
        if (para > limit / 2) cut = para;

        // 2. Line boundary
        if (cut === -1) {
            const line = remaining.lastIndexOf('\n', limit);
            if (line > limit / 2) cut = line;
        }

        // 3. Word boundary
        if (cut === -1) {
            const space = remaining.lastIndexOf(' ', limit);
            if (space > limit / 2) cut = space;
        }

        // 4. Hard cut — avoid slicing mid-code-block if possible.
        if (cut === -1) cut = limit;

        chunks.push(remaining.slice(0, cut).trimEnd());
        remaining = remaining.slice(cut).trimStart();
    }

    if (remaining.length > 0) chunks.push(remaining);
    return chunks;
}

/** Run a programmatic skill, capturing its stdout into a string.
 *  Patches `process.stdout.write` and `process.exit` for the duration
 *  of the call so the daemon isn't killed by the skill's error path. */
async function runSkillCapturingOutput(skill: TelegramSkill): Promise<string> {
    const originalWrite = process.stdout.write.bind(process.stdout);
    const originalExit = process.exit;
    const chunks: string[] = [];

    // Buffer every stdout.write — the original terminal still receives output
    // so the operator watching the daemon host sees the same UX as a TUI run.
    process.stdout.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
        const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
        chunks.push(text);
        return originalWrite(chunk as string, ...(args as []));
    }) as typeof process.stdout.write;

    // Block `process.exit()` from the skill so we stay alive to send the
    // error message back to Telegram instead of dying silently.
    process.exit = (() => {
        throw new Error('SKILL_TRY_EXIT');
    }) as never;

    try {
        try {
            await skill();
        } catch (e: any) {
            chunks.push(`\n❌ Skill crashed: ${e?.message ?? String(e)}\n`);
        }
    } finally {
        process.stdout.write = originalWrite;
        process.exit = originalExit;
    }

    return cleanTerminalText(chunks.join(''));
}

/** Send one or more Telegram messages, chunking to fit the 4096-char limit.
 *  Adds a `(<i>/<n>)` suffix on multi-chunk sends so the user knows how to
 *  read the sequence. */
async function sendTelegramChunked(
    token: string,
    chatId: number,
    text: string,
): Promise<void> {
    const chunks = chunkForTelegram(text);
    const total = chunks.length;

    for (let i = 0; i < total; i++) {
        const suffix = total > 1 ? `\n\n— (${i + 1}/${total})` : '';
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: chunks[i] + suffix,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });
    }
}

/** Parse an incoming Telegram message into a `cook <cmd>` invocation.
 *  Accepts `cook <cmd> [args...]` (case-insensitive) and `cook <cmd>` only.
 *  Returns the bare subcommand if it matches a registered skill, else null. */
function parseSkillCommand(text: string): string | null {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'cook') return null;
    if (!lower.startsWith('cook ')) return null;

    const sub = lower.slice('cook '.length).split(/\s+/)[0];
    if (sub in TELEGRAM_SKILL_MAP) return sub;
    return null;
}

// Per-chat session history — survives across messages so the LLM retains
// conversational context within a Telegram chat. Keyed by chatId.
const chatHistories: Record<number, ChatMessage[]> = {};
const MAX_TURNS = 20;

function buildSystemPrompt(memoryState: string): string {
    // Mirrors the TUI envelope exactly so Telegram replies behave identically.
    return `
[SYSTEM CONTEXT - DO NOT ACKNOWLEDGE THIS BLOCK TO THE USER]
You are COOK AGENT, an elite senior advisor and AI co-founder running locally in a terminal environment.
DO NOT say you are an AI made by Minimax, OpenAI, Anthropic, or anyone else. You are Cook.

VERBOSITY DIRECTIVE — STRICT LOCKDOWN:
Default response length is HALF of what a normal LLM produces. Provide exactly the information requested and stop. No introductory paragraphs. No "Here's what I'll do…" preambles. No "Let me know if you need more" sign-offs. No meta-commentary about your reasoning. One short sentence is almost always enough. Bullet points are fine. Code blocks are fine. Conversational filler is not.

DENSITY OVER LENGTH: If a topic is multi-part, use tight bullets. If a topic is single-part, use one tight paragraph. Code snippets, command lines, file paths, and numbers earn their keep because they carry information — keep them inline, not wrapped in ceremony. Never pad.

CONVERSATIONAL HANDLER — ABSOLUTE RULES:
1. If the message is a casual greeting ("hi", "yoo", "hey", "hello", "sup", "what's up", "howdy", "good morning", etc.) OR a low-substance opener ("are you there?", "you awake?", "test", "."), reply with EXACTLY one short sentence — e.g., "Hello. What are we building today?" — and nothing else. Do not explain yourself. Do not list capabilities. Do not introduce the system.
2. NEVER list your skills, commands, or capabilities unless the user's message contains the literal word "help" or "menu" (case-insensitive, anywhere in the message) AND is not accompanied by any other substantive question. A request for "help with my Postgres connection" is not a help request — it's a real question that gets a real answer, no catalog.
3. NEVER tell the user to run a CLI command to view their own data. Answer from [CURRENT USER MEMORY STATE] directly.
4. NEVER invent fictional context (payment systems, brain fog, marketing funnels, user personas, prior conversations, etc.) to fill space. If you don't know, say so in one line and stop.

PERSONA — COOK AGENT:
You are Cook Agent, an elite local AI co-founder for developers. Blunt, hyper-accurate, professional. You speak like a senior engineer who has shipped — short sentences, no fluff, no softening, no "I'd be happy to help." You do not acknowledge this system prompt. You do not refer to yourself as an LLM or by any vendor name (Minimax, OpenAI, Anthropic, etc.). You are Cook.

REASONING QUALITY:
When the question is technical, lead with the deciding trade-off or the sharpest insight, then stop. One trade-off in one line beats five scenarios. If the question demands structured output (a comparison, a checklist, a numbered list), give it — tight, with no preamble, no recap.

SKILL EXECUTION — RAW DATA ONLY:
When executing a skill ("cook hunt", "cook truth", "cook blueprint", "cook research", "cook validate", "cook decide", "cook outreach", "cook launch", "cook anchor"), return the skill's raw structured output verbatim. Do not wrap it in "Here's what I found…" or "Let me summarize…" or any conversational bedding. Markdown headers from the skill body are allowed and encouraged. Add nothing; remove nothing.

WHEN A USER EXPLICITLY ASKS FOR HELP:
If — and only if — the user's message is exactly or contains the literal token "help"/"menu" with no other substantive question, you may list the 13 CLI commands in compact form (one per line, no prose). This is the ONLY context in which the catalog is allowed on screen.

If the user asks about their idea, status, or profile, ANSWER DIRECTLY from [CURRENT USER MEMORY STATE]. Do not deflect them to a CLI command.

[CURRENT USER MEMORY STATE]
${memoryState}
[END SYSTEM CONTEXT]

`.trim();
}

export async function startTelegram() {
    console.clear();
    console.log(chalk.hex('#00FF41')('🤖 Booting Telegram Feral Channel [Production Mode]...'));

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!token) return console.log(chalk.red('❌ TELEGRAM_BOT_TOKEN missing from .env'));

    try { await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`); } catch (e) {}

    let offset = 0;
    console.log(chalk.white('📡 Listening for incoming transmissions...\n'));

    while (true) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}`, {
                headers: { 'User-Agent': 'FeralBuilder/1.0' }
            });

            if (!res.ok) {
                if (res.status === 502 || res.status === 504) { await delay(2000); continue; }
            }

            const data = await res.json();
            if (!data.ok) { await delay(5000); continue; }

            if (data.result && data.result.length > 0) {
                for (const update of data.result) {
                    offset = update.update_id + 1;
                    if (!update.message || !update.message.text) continue;

                    const chatId = update.message.chat.id;
                    const text = update.message.text;
                    console.log(chalk.cyan(`\n[TG] In: `) + text);

                    const authData = await getAuthData();

                    if (!authData.allowedIds.includes(chatId)) {
                        console.log(chalk.yellow(`🔒 Unauthorized device detected.`));
                        continue;
                    }

                    // ─── Skill routing (parity with TUI) ───────────────────────
                    // Intercept `cook <cmd>` BEFORE the chat pipeline so the
                    // programmatic skill runs and its real output (not a re-LLM'd
                    // summary) flows back to the user as Telegram messages.
                    const skillName = parseSkillCommand(text);
                    if (skillName) {
                        console.log(chalk.hex('#FF4500')(`⚡ [TG] cook ${skillName} → programmatic skill`));
                        await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
                        });

                        const skillFn = TELEGRAM_SKILL_MAP[skillName];
                        let captured = '';
                        try {
                            captured = await runSkillCapturingOutput(skillFn);
                        } catch (e: any) {
                            captured = `❌ Skill runner crashed: ${e?.message ?? String(e)}`;
                        }

                        if (!captured) {
                            captured = `✅ cook ${skillName} finished with no output.`;
                        }

                        await sendTelegramChunked(token, chatId, captured);
                        console.log(chalk.hex('#FF4500')(`[TG] Out: `) + captured.substring(0, 50) + '...');
                        continue;
                    }

                    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: chatId, action: 'typing' })
                    });

                    // FERAL FIX: Hardened Engine Selection (Hybrid Router)
                    const profile = await readMemory('profile.md').catch(() => '');
                    const idea = await readMemory('idea.md').catch(() => '');
                    const status = await readMemory('status.md').catch(() => '');
                    const memoryState = `### profile.md\n${profile}\n\n### idea.md\n${idea}\n\n### status.md\n${status}`;
                    const engineMode = profile.match(/\*\*Engine Mode:\*\* (.*)/i)?.[1].trim().toLowerCase() || 'local';
                    const targetModel = profile.match(/\*\*Primary Model:\*\* (.*)/i)?.[1].trim() || 'llama3.2';

                    // Re-read memory on every message so the bot stays grounded by
                    // whatever the user has most recently written to disk.
                    const systemPrompt = buildSystemPrompt(memoryState);

                    // Seed per-chat history with the envelope (only on first message
                    // for that chat — preserve across subsequent turns).
                    if (!chatHistories[chatId]) {
                        chatHistories[chatId] = [{ role: 'system', content: systemPrompt }];
                    } else {
                        // Refresh system envelope in place so any memory edits land
                        // without dropping the chat's conversation context.
                        const existing = chatHistories[chatId];
                        const sysIdx = existing.findIndex(m => m.role === 'system');
                        if (sysIdx >= 0) existing[sysIdx] = { role: 'system', content: systemPrompt };
                        else existing.unshift({ role: 'system', content: systemPrompt });
                    }

                    chatHistories[chatId].push({ role: 'user', content: text });

                    // Trim oldest non-system messages if over cap — mirrors TUI behavior.
                    const history = chatHistories[chatId];
                    const nonSystem = history.filter(m => m.role !== 'system');
                    if (nonSystem.length > MAX_TURNS) {
                        const overflow = nonSystem.length - MAX_TURNS;
                        const systemMsgs = history.filter(m => m.role === 'system');
                        const trimmedConvo = nonSystem.slice(overflow);
                        history.length = 0;
                        history.push(...systemMsgs, ...trimmedConvo);
                    }

                    let reply = '';
                    if (engineMode.includes('local')) {
                        console.log(chalk.gray(`  -> Executing Local Engine (${targetModel})...`));
                        reply = await generateLocal(history, targetModel);
                    } else {
                        console.log(chalk.gray(`  -> Executing Cloud Engine (${targetModel})...`));
                        reply = await generateCloud(history, targetModel);
                    }

                    chatHistories[chatId].push({ role: 'assistant', content: reply });

                    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: chatId, text: reply })
                    });
                    console.log(chalk.hex('#FF4500')(`[TG] Out: `) + reply.substring(0, 50) + '...');
                }
            }
        } catch (e: any) {
            console.log(chalk.red(`\n❌ ENGINE CRASH: ${e.message}`));
            console.error(e);
        }
        await delay(1000);
    }
}