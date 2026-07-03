import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { executeSearch } from '../search.ts';
import { generateLocal, generateCloud, type ChatMessage } from '../models.ts';
import { headlessSpinner, introSafe, outroSafe } from '../headless.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runIdeaValidator(): Promise<string> {
    introSafe(blazeOrange.bold(' [ SKILL: IDEA VALIDATOR PROTOCOL ] '));

    const s = headlessSpinner();
    s.start('Retrieving product vision from memory/idea.md...');

    try {
        // 1. Gather Context
        const idea = await readMemory('idea.md');
        const profile = await readMemory('profile.md');

        // Parse model configuration
        const isCloud = profile.includes('cloud_pro') || profile.includes('cloud_free');
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange('Deploying Cyber-Scout for stealth competitor tracking...'));

        // 2. Run Stealth Search
        const searchResults = await executeSearch(`competitors alternatives to: ${idea.substring(0, 200)}`);

        s.message(blazeOrange(`Synthesizing market truth using ${targetModel}...`));

        // 3. Construct prompt — split into system (role) and user (data+task)
        //    so the LLM sees an isolated, single-task context. No chat history.
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are COOK AGENT, the elite, no-nonsense AI co-founder. Validate the product idea against the live market intelligence provided. Do not include soft pleasantries. Give the hard data.`
            },
            {
                role: 'user',
                content: `PRODUCT IDEA:
${idea}

LIVE COMPETITOR DATA (COMPRESSED):
${searchResults}

TASK:
Generate a brutal, realistic market validation matrix. Format using the following strict layout:

### 🚨 DIRECT COMPETITION & THREATS
[Analyze who is already doing this or close to it based on the search data]

### 🕳️ THE GAP (WHY WE WIN)
[Identify exactly what the current competitors are missing or failing at]

### 🛡️ EXECUTION RISKS
[List the top 2 technical or adoption blockers]

### ⚡ VERDICT
[One definitive, aggressive sentence on whether to run or pivot]`
            }
        ];

        // 4. Run through LLM Router — isolated context, no chat history.
        let verdict = '';
        if (isCloud) {
            verdict = await generateCloud(messages, targetModel);
        } else {
            verdict = await generateLocal(messages, targetModel);
        }

        s.stop(hackerGreen('✅ Market synthesis complete.'));

        console.log('\n' + verdict.trim() + '\n');

        outroSafe(blazeOrange('Validation sequence finalized.'));

        // Explicit return — Telegram ships this directly to chat.
        return verdict.trim();

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failure during validation.'));
        console.error(error);
        process.exit(1);
    }
}
