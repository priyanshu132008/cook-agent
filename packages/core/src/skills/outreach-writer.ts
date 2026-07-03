import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud, type ChatMessage } from '../models.ts';
import { headlessSpinner, introSafe, outroSafe } from '../headless.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runOutreachWriter(): Promise<string> {
    introSafe(blazeOrange.bold(' [ SKILL: OUTREACH WRITER ] '));
    const s = headlessSpinner();
    s.start('Loading customer ledger...');

    try {
        const customers = await readMemory('customers.md').catch(() => 'No customers found. Run customer-finder first.');
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const engineMode = engineMatch ? engineMatch[1].trim().toLowerCase() : 'local';
        const isCloud = engineMode.includes('cloud');
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Drafting high-conversion DMs via ${targetModel}...`));

        // Isolated context — system sets role+tone, user carries the exact
        // customer ledger for THIS outreach. No chat history bleed.
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are COOK AGENT, an elite growth hacker. Read the target customer archetypes provided and write exactly one personalized cold DM/Email for each.

- Tone: Founder-to-founder, zero corporate speak, slightly informal.
- Structure: Hook (their pain), Value (our solution), Call to Action (low friction).
- Keep them under 4 sentences.`
            },
            {
                role: 'user',
                content: `CUSTOMER LEDGER:
${customers}

Write the outreach messages.`
            }
        ];

        const drafts = isCloud
            ? await generateCloud(messages, targetModel)
            : await generateLocal(messages, targetModel);

        s.stop(hackerGreen('✅ Outreach drafts compiled.'));
        console.log('\n' + drafts.trim() + '\n');
        outroSafe(blazeOrange('Go send them.'));

        // Explicit return — Telegram ships this directly to chat.
        return drafts.trim();
    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed.'));
        console.error(error);
        process.exit(1);
    }
}
