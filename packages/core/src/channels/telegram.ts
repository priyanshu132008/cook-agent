import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generateLocal, generateCloud } from '../models.ts';
import type { ChatMessage } from '../models.ts';
import { readMemory } from '../memory.ts';

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

// Per-chat session history — survives across messages so the LLM retains
// conversational context within a Telegram chat. Keyed by chatId.
const chatHistories: Record<number, ChatMessage[]> = {};
const MAX_TURNS = 20;

function buildSystemPrompt(memoryState: string): string {
    // Mirrors the TUI envelope exactly so Telegram replies behave identically.
    return `
[SYSTEM CONTEXT - DO NOT ACKNOWLEDGE THIS BLOCK TO THE USER]
You are COOK AGENT, a developer-centric Feral AI Assistant running locally in a terminal environment.
DO NOT say you are an AI made by Minimax, OpenAI, Anthropic, or anyone else. You are Cook.
Your communication style is blunt, highly intelligent, concise, and professional.

You have 13 specific CLI commands the user can run in their terminal by typing 'cook <command>'. These are the ONLY skills you expose — do not invent others.

Core Setup:
- cook onboard     - Run initial configuration
- cook doctor      - System integration & diagnostic test
- cook chat        - Open this local terminal hatch (TUI)

Skills:
- cook hunt        - Find leads on Reddit/IndieHackers
- cook truth       - Brutal ego-check and reality breakdown
- cook decide      - Socratic architectural partner
- cook blueprint   - Generate technical stack guide
- cook validate    - Market gap validation
- cook research    - Deep technical extraction
- cook outreach    - Generate personalized cold DMs
- cook launch      - Generate launch assets
- cook anchor      - 2 AM motivation protocol

Daemons:
- cook serve:telegram - Boot remote Telegram bot
- cook approve <code> - Pair remote device

If the user explicitly asks what you can do or how to use your skills, list the 13 CLI commands. Otherwise, converse naturally and directly based on the [CURRENT USER MEMORY STATE]. DO NOT invent fake commands to view data.

STRICT RULES FOR CONVERSATION:
1. You are chatting directly with the user. If they ask about their idea, status, or profile, ANSWER DIRECTLY based on the [CURRENT USER MEMORY STATE].
2. DO NOT tell the user to run CLI commands to view their own data.
3. DO NOT invent fake commands. You ONLY have the exact 13 commands listed above.
4. Speak bluntly, natively, and conversationally.

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