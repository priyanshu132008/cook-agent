import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { executeSearch } from '../search.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runIdeaValidator() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: IDEA VALIDATOR PROTOCOL ] '));

    const s = spinner();
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

        // 3. Construct prompt
        const prompt = `
You are COOK AGENT, the elite, no-nonsense AI co-founder.
Validate the following product idea against live market intelligence.

PRODUCT IDEA:
${idea}

LIVE COMPETITOR DATA (COMPRESSED):
${searchResults}

TASK:
Generate a brutal, realistic market validation matrix.
Do not include soft pleasantries. Give me the hard data.
Format using the following strict layout:

### 🚨 DIRECT COMPETITION & THREATS
[Analyze who is already doing this or close to it based on the search data]

### 🕳️ THE GAP (WHY WE WIN)
[Identify exactly what the current competitors are missing or failing at]

### 🛡️ EXECUTION RISKS
[List the top 2 technical or adoption blockers]

### ⚡ VERDICT
[One definitive, aggressive sentence on whether to run or pivot]
`;

        // 4. Run through LLM Router
        let verdict = '';
        if (isCloud) {
            verdict = await generateCloud([{ role: 'user', content: prompt }], targetModel);
        } else {
            verdict = await generateLocal([{ role: 'user', content: prompt }], targetModel);
        }

        s.stop(hackerGreen('✅ Market synthesis complete.'));

        console.log('\n' + verdict.trim() + '\n');

        outro(blazeOrange('Validation sequence finalized.'));

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failure during validation.'));
        console.error(error);
        process.exit(1);
    }
}