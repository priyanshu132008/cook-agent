import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runAnchor() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: THE ANCHOR ] '));
    const s = spinner();
    s.start('Reading your history...');

    try {
        const progress = await readMemory('progress.md').catch(() => 'No progress logged yet.');
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const isCloud = engineMatch ? engineMatch[1].trim().toLowerCase().includes('cloud') : false;
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Generating grounding protocol via ${targetModel}...`));

        const prompt = `
You are COOK AGENT. It is 2 AM. The user is exhausted, doubting their product, and wants to quit.

THEIR RECENT PROGRESS:
${progress}

TASK:
Write a 4-sentence grounding statement. Remind them of the code they have already shipped. Remind them that normal people are sleeping, and they are building. Be relentless, cold, and highly motivational. No corporate fluff. Feral Builder energy.
`;

        const anchorText = isCloud ? await generateCloud([{ role: 'user', content: prompt }], targetModel) : await generateLocal([{ role: 'user', content: prompt }], targetModel);
        s.stop(hackerGreen('✅ Anchor deployed.'));
        console.log('\n' + anchorText.trim() + '\n');
        outro(blazeOrange('Breathe. Keep going.'));
    } catch (error) {
        s.stop(chalk.red('❌ Engine failure.'));
        process.exit(1);
    }
}
