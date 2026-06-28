import { intro, outro, spinner, note, text } from '@clack/prompts';
import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runDecisionPartner() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: DECISION PARTNER ] '));

    const dilemma = await text({
        message: chalk.white('What architectural or business decision is paralyzing you right now?'),
        placeholder: 'e.g., Should I use Postgres or SQLite for MVP?',
        validate: (value) => value.length === 0 ? 'Speak to the Cook.' : undefined
    });
    if (typeof dilemma !== 'string') process.exit(0);

    const s = spinner();
    s.start('Analyzing trajectory...');

    try {
        const idea = await readMemory('idea.md').catch(() => '');
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const isCloud = engineMatch ? engineMatch[1].trim().toLowerCase().includes('cloud') : false;
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Synthesizing Socratic resolution via ${targetModel}...`));

        const prompt = `
You are COOK AGENT, the Principal Engineer. The user is facing this dilemma: "${dilemma}"

PRODUCT CONTEXT: ${idea}

TASK:
1. Strip the emotion out of the decision.
2. Give the two actual trade-offs.
3. Make a definitive, brutal recommendation based on speed to ship.
Format in raw markdown.
`;

        const resolution = isCloud ? await generateCloud([{ role: 'user', content: prompt }], targetModel) : await generateLocal([{ role: 'user', content: prompt }], targetModel);
        s.stop(hackerGreen('✅ Decision resolved.'));
        console.log('\n' + resolution.trim() + '\n');
        outro(blazeOrange('Stop thinking. Start typing.'));
    } catch (error) {
        s.stop(chalk.red('❌ Engine failure.'));
        process.exit(1);
    }
}
