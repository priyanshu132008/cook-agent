import { text } from '@clack/prompts';
import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud, type ChatMessage } from '../models.ts';
import { headlessSpinner, introSafe, isNonInteractive, outroSafe } from '../headless.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runDecisionPartner(args = ''): Promise<string> {
    introSafe(blazeOrange.bold(' [ SKILL: DECISION PARTNER ] '));

    // Block interactive prompt execution if running without arguments.
    // The headless Telegram daemon has no TTY — calling @clack/prompts
    // would block forever on stdin and freeze the whole PM2 process.
    // Bail with a friendly, instructive string the user can act on.
    if (!args || args.trim() === '') {
        if (isNonInteractive()) {
            const usage = "⚠️ Please provide the decision details you want to analyze.\nExample: `cook decide Should we build a custom proprietary LLM wrapper or rely completely on OpenRouter endpoints?`";
            console.log(usage);
            return usage;
        }
        // TUI path: still ask the operator, but only because we have a real
        // TTY to receive the answer. This is the only path that may prompt.
        const answer = await text({
            message: chalk.white('What architectural or business decision is paralyzing you right now?'),
            placeholder: 'e.g., Should I use Postgres or SQLite for MVP?',
            validate: (value) => value.length === 0 ? 'Speak to the Cook.' : undefined
        });
        if (typeof answer !== 'string') {
            return 'Decide cancelled.';
        }
        args = answer;
    }

    const s = headlessSpinner();
    s.start('Analyzing trajectory...');

    try {
        const idea = await readMemory('idea.md').catch(() => '');
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const isCloud = engineMatch ? engineMatch[1].trim().toLowerCase().includes('cloud') : false;
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Synthesizing Socratic resolution via ${targetModel}...`));

        // Isolated messages — system sets the role, user carries the exact
        // dilemma and product context. No chat history. No memory bleed.
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are COOK AGENT, the Principal Engineer. The user is facing a specific dilemma. Strip the emotion out of it, give the two actual trade-offs, then make a definitive, brutal recommendation based on speed to ship. Format in raw markdown.`
            },
            {
                role: 'user',
                content: `DILEMMA:
${args}

PRODUCT CONTEXT:
${idea}`
            }
        ];

        const resolution = isCloud
            ? await generateCloud(messages, targetModel)
            : await generateLocal(messages, targetModel);

        s.stop(hackerGreen('✅ Decision resolved.'));
        console.log('\n' + resolution.trim() + '\n');
        outroSafe(blazeOrange('Stop thinking. Start typing.'));

        // Explicit return — Telegram ships this directly to chat.
        return resolution.trim();
    } catch (error) {
        s.stop(chalk.red('❌ Engine failure.'));
        process.exit(1);
    }
}
