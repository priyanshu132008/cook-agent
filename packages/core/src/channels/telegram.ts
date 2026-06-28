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
                    const engineMode = profile.match(/\*\*Engine Mode:\*\* (.*)/i)?.[1].trim().toLowerCase() || 'local';
                    const targetModel = profile.match(/\*\*Primary Model:\*\* (.*)/i)?.[1].trim() || 'llama3.2';

                    const messages: ChatMessage[] = [
                        { role: 'system', content: `You are COOK AGENT, a developer-centric Feral AI Assistant running locally. You are NOT made by Minimax, OpenAI, Anthropic, or anyone else. Your style is blunt, concise, and professional. Reply briefly — max 2 sentences. Current User Profile: ${profile}` },
                        { role: 'user', content: text }
                    ];

                    let reply = '';
                    if (engineMode.includes('local')) {
                        console.log(chalk.gray(`  -> Executing Local Engine (${targetModel})...`));
                        reply = await generateLocal(messages, targetModel);
                    } else {
                        console.log(chalk.gray(`  -> Executing Cloud Engine (${targetModel})...`));
                        reply = await generateCloud(messages, targetModel);
                    }

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