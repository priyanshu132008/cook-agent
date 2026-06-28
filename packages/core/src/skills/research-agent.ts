import { intro, outro, spinner, note, text } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readMemory } from '../memory.ts';
import { executeSearch } from '../search.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runResearchAgent() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: DEEP RESEARCH PROTOCOL ] '));

    const topic = await text({
        message: chalk.white('Enter the exact technical topic or market to research:'),
        placeholder: 'e.g., SQLite vs Postgres for local-first apps',
        validate(value) {
            if (value.length === 0) return 'A topic is required.';
        }
    });

    if (typeof topic !== 'string') {
        process.exit(0);
    }

    const s = spinner();
    s.start('Booting Cyber-Scout for deep extraction...');

    try {
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const engineMode = engineMatch ? engineMatch[1].trim().toLowerCase() : 'local';
        const isCloud = engineMode.includes('cloud');

        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        // Execute wide net search
        const searchData = await executeSearch(`deep technical review ${topic}`);

        s.message(blazeOrange(`Synthesizing raw data via ${targetModel}...`));

        const prompt = `
You are COOK AGENT, an elite technical researcher.
Synthesize a comprehensive, developer-focused briefing on the following topic using the provided raw search data.

TOPIC: ${topic}

RAW SEARCH DATA:
${searchData}

TASK:
Generate a highly dense, zero-fluff markdown briefing. Format exactly as follows:

### 📡 EXECUTIVE SUMMARY
[1-2 sentences. Bottom line up front.]

### ⚙️ TECHNICAL BREAKDOWN
[Bullet points of the core mechanisms, trade-offs, or architectures discovered.]

### ⚔️ THE FERAL VERDICT
[Make a definitive recommendation on how to utilize this information.]
`;

        let researchReport = '';
        if (isCloud) {
            researchReport = await generateCloud([{ role: 'user', content: prompt }], targetModel);
        } else {
            researchReport = await generateLocal([{ role: 'user', content: prompt }], targetModel);
        }

        // Save persistently
        const safeName = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const reportPath = path.join(process.cwd(), 'memory', `research_${safeName}.md`);
        await fs.writeFile(reportPath, researchReport.trim(), 'utf-8');

        s.stop(hackerGreen('✅ Deep research compiled.'));

        console.log('\n' + researchReport.trim() + '\n');
        console.log(`${chalk.dim('💾 Briefing securely stored at:')} ${chalk.cyan(`memory/research_${safeName}.md`)}\n`);

        outro(blazeOrange('Research protocol finalized.'));

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed during extraction.'));
        console.error(error);
        process.exit(1);
    }
}