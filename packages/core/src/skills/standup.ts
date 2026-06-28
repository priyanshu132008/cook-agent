import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud } from '../models.ts';
const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runStandup() {
    console.clear();
    intro(blazeOrange.bold(' [ DAILY STANDUP PROTOCOL ] '));

    const s = spinner();
    s.start('Reading neural profile and analyzing project progress...');

    try {
        // 1. Gather Context
        const profile = await readMemory('profile.md');
        const idea = await readMemory('idea.md');

        let progress = '';
        try {
            const progressPath = path.join(process.cwd(), 'PROGRESS.md');
            progress = await fs.readFile(progressPath, 'utf-8');
        } catch (e) {
            progress = 'No progress logged yet.';
        }

        // 2. Parse configuration
        const isCloud = profile.includes('cloud_pro') || profile.includes('cloud_free');
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        s.message(blazeOrange(`Generating level-aware battle plan using ${targetModel}...`));

        // 3. Construct the strict prompt
        const prompt = `
You are COOK AGENT, an elite AI co-founder.

THE MISSION:
${idea}

THE FOUNDER PROFILE:
${profile}

PROGRESS SO FAR:
${progress.substring(progress.length - 2000)} // Only look at recent progress

TASK:
Based on the founder's profile level, project idea, and the recent progress log, generate EXACTLY 3 highly specific, actionable tasks for today's coding session.
- Do not include pleasantries.
- Use a feral, aggressive, "let's build" tone.
- Format strictly as a bulleted list.
`;

        // 4. Execute LLM Call
        let battlePlan = '';
        if (isCloud) {
            battlePlan = await generateCloud([{ role: 'user', content: prompt }], targetModel);
        } else {
            battlePlan = await generateLocal([{ role: 'user', content: prompt }], targetModel);
        }

        s.stop(hackerGreen('✅ Battle plan secured.'));

        // 5. Output to Terminal
        console.log('\n');
        note(chalk.white(battlePlan.trim()), blazeOrange("TODAY'S OBJECTIVES"));

        outro(blazeOrange('Standup complete. Get to work.'));

    } catch (error: any) {
        s.stop(chalk.red('❌ Brain offline. Failed to generate standup.'));
        console.error(error);
        process.exit(1);
    }
}