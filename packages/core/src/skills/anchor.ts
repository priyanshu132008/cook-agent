import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud, type ChatMessage } from '../models.ts';
import { headlessSpinner, introSafe, outroSafe } from '../headless.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runAnchor(): Promise<string> {
    introSafe(blazeOrange.bold(' [ SKILL: THE ANCHOR ] '));
    const s = headlessSpinner();
    s.start('Reading your history...');

    try {
        const progress = await readMemory('progress.md').catch(() => 'No progress logged yet.');
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const isCloud = engineMatch ? engineMatch[1].trim().toLowerCase().includes('cloud') : false;
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Generating grounding protocol via ${targetModel}...`));

        // Isolated context — system sets the tone rule, user carries only
        // the progress for THIS anchor run. No chat history bleed.
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are COOK AGENT. It is 2 AM. The user is exhausted, doubting their product, and wants to quit. Write a 4-sentence grounding statement. Remind them of the code they have already shipped. Remind them that normal people are sleeping, and they are building. Be relentless, cold, and highly motivational. No corporate fluff. Feral Builder energy.`
            },
            {
                role: 'user',
                content: `THEIR RECENT PROGRESS:
${progress}

Write the anchor.`
            }
        ];

        const anchorText = isCloud
            ? await generateCloud(messages, targetModel)
            : await generateLocal(messages, targetModel);

        s.stop(hackerGreen('✅ Anchor deployed.'));
        console.log('\n' + anchorText.trim() + '\n');
        outroSafe(blazeOrange('Breathe. Keep going.'));

        // Explicit return — Telegram ships this directly to chat.
        return anchorText.trim();
    } catch (error) {
        s.stop(chalk.red('❌ Engine failure.'));
        process.exit(1);
    }
}
