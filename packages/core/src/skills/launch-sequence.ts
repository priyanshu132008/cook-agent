import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runLaunchSequence() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: LAUNCH SEQUENCE MATRIX ] '));

    const s = spinner();
    s.start('Synthesizing launch materials from idea and customer ledgers...');

    try {
        // 1. Gather Context
        const idea = await readMemory('idea.md');
        const customers = await readMemory('customers.md');
        const profile = await readMemory('profile.md');

        // ROBUST ROUTING PATCH
        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const engineMode = engineMatch ? engineMatch[1].trim().toLowerCase() : 'local';
        const isCloud = engineMode.includes('cloud');

        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Generating channel-optimized distribution copy using ${targetModel}...`));

        // 2. Construct Prompt
        const prompt = `
You are COOK AGENT, an elite growth hacker and marketing mastermind.
Build a copy-paste ready launch dossier for our product based on the vision and target customer pain points.

PRODUCT VISION:
${idea}

TARGET BUYER ARCHETYPES & HOOKS:
${customers}

TASK:
Generate hyper-targeted launch copy for 4 major platforms.
- Adopt an aggressive, clean, highly persuasive "Builder-to-Builder" tone.
- Do not write generic corporate marketing speak.
- Provide raw text formatted exactly with these headings:

### 😺 PRODUCT HUNT LAUNCH ASSETS
**Tagline:** [Max 60 characters - high punch]
**Description:** [Max 250 characters highlighting the unblocking mechanism]

### 📝 HACKER NEWS (SHOW HN)
**Title:** Show HN: Cook Agent – An open-source, local-first AI co-founder built for [...]
**Body Text:** [An honest, text-heavy description explaining why it runs locally, has no Docker bloat, and solves builder paralysis]

### 🐦 TWITTER/X ENGAGEMENT THREAD
Tweet 1: [Hook tweet addressing brain fog/burnout directly]
Tweet 2: [The value proposition - local, zero-cost, persistent memory]
Tweet 3: [The call to action / git command]

### 👽 REDDIT COMMUNITY TARGETING (r/startups / r/IndieHackers)
**Post Title:** [High-curiosity headline focused on solo-builder burnout]
**Post Body:** [A narrative-driven text post sharing the story of building a tool to solve personal execution blocks]
`;

        // 3. Run through LLM Router
        let launchDossier = '';
        if (isCloud) {
            launchDossier = await generateCloud([{ role: 'user', content: prompt }], targetModel);
        } else {
            launchDossier = await generateLocal([{ role: 'user', content: prompt }], targetModel);
        }

        // Save persistently to file
        const launchPath = path.join(process.cwd(), 'memory', 'launch_sequence.md');
        await fs.writeFile(launchPath, launchDossier.trim(), 'utf-8');

        s.stop(hackerGreen('✅ Distribution assets generated.'));

        console.log('\n' + launchDossier.trim() + '\n');

        console.log(`${chalk.dim('💾 Campaign permanently stored at:')} ${chalk.cyan('memory/launch_sequence.md')}\n`);
        outro(blazeOrange('Launch materials locked. Ready for deployment.'));

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed to compile launch sequence.'));
        console.error(error);
        process.exit(1);
    }
}