import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readMemory } from '../memory.ts';
import { executeSearch } from '../search.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

// Helper for human jitter delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function runCustomerFinder() {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: CUSTOMER FINDER PROTOCOL ] '));

    const s = spinner();
    s.start('Analyzing target profile from memory/idea.md...');

    try {
        const idea = await readMemory('idea.md');
        const profile = await readMemory('profile.md');

        const isCloud = profile.includes('cloud_pro') || profile.includes('cloud_free');
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        // Sequential targets to prevent IP rate limits
        const platforms = [
            { name: 'Reddit Solopreneurs', query: `site:reddit.com "solopreneur" OR "solo founder" "brain fog" OR "overwhelmed"` },
            { name: 'IndieHackers Traffic', query: `site:indiehackers.com "building alone" OR "burnout" "tasks"` }
        ];

        let rawScrapedData = '';

        // STRICT MANDATE: for...of sequential execution only. No Promise.all()
        for (const platform of platforms) {
            s.message(blazeOrange(`Cyber-Scout hunting on ${platform.name}...`));
            const result = await executeSearch(platform.query);
            rawScrapedData += `\n--- SOURCE: ${platform.name} ---\n${result}\n`;

            // Human jitter implementation (2-4 random seconds delay)
            const jitter = Math.floor(Math.random() * 2000) + 2000;
            s.message(chalk.dim(`Simulating human jitter... resting for ${(jitter/1000).toFixed(1)}s`));
            await delay(jitter);
        }

        s.message(blazeOrange('Synthesizing target leads list...'));

        const prompt = `
You are COOK AGENT, the elite growth hacker co-founder.
Based on the product vision and these raw search signals, extract EXACTLY 3 high-signal potential customer profile archetypes or online clusters where our target buyers are actively complaining about their blockers.

PRODUCT VISION:
${idea}

RAW HUNTING SIGNAL:
${rawScrapedData}

TASK:
Generate a clean markdown list of 3 specific customer profiles.
Include where to find them, what their core emotional complaint is, and a 1-sentence personalized hook strategy.
Output raw markdown only. Do not wrap in markdown code fences or backticks.
`;

        let leadsMatrix = '';
        if (isCloud) {
            leadsMatrix = await generateCloud([{ role: 'user', content: prompt }], targetModel);
        } else {
            leadsMatrix = await generateLocal([{ role: 'user', content: prompt }], targetModel);
        }

        // Write leads persistently to memory/customers.md
        const customersPath = path.join(process.cwd(), 'memory', 'customers.md');
        await fs.writeFile(customersPath, leadsMatrix.trim(), 'utf-8');

        s.stop(hackerGreen('✅ Target acquisition ledger successfully compiled.'));

        console.log('\n' + leadsMatrix.trim() + '\n');

        console.log(`${chalk.dim('💾 Leads permanently stored at:')} ${chalk.cyan('memory/customers.md')}\n`);
        outro(blazeOrange('Customer lookup cycle closed.'));

    } catch (error) {
        s.stop(chalk.red('❌ Hunting sequence compromised.'));
        console.error(error);
        process.exit(1);
    }
}
