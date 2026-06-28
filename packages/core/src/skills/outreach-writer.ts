import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runOutreachWriter() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: OUTREACH WRITER ] '));
    const s = spinner();
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

        const prompt = `
You are COOK AGENT, an elite growth hacker.
Read the following target customer archetypes and write exactly one personalized cold DM/Email for each.

CUSTOMER LEDGER:
${customers}

TASK:
Write the outreach messages.
- Tone: Founder-to-founder, zero corporate speak, slightly informal.
- Structure: Hook (their pain), Value (our solution), Call to Action (low friction).
- Keep them under 4 sentences.
`;

        const drafts = isCloud ? await generateCloud([{ role: 'user', content: prompt }], targetModel) : await generateLocal([{ role: 'user', content: prompt }], targetModel);
        s.stop(hackerGreen('✅ Outreach drafts compiled.'));
        console.log('\n' + drafts.trim() + '\n');
        outro(blazeOrange('Go send them.'));
    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed.'));
        console.error(error);
        process.exit(1);
    }
}
