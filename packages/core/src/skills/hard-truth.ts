import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud, type ChatMessage } from '../models.ts';
import { headlessSpinner, introSafe, outroSafe } from '../headless.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runHardTruth(): Promise<string> {
    introSafe(blazeOrange.bold(' [ SKILL: HARD TRUTH MODE ] '));

    const s = headlessSpinner();
    s.start('Accessing memory matrix to evaluate your current reality...');

    try {
        // 1. Gather Context
        const idea = await readMemory('idea.md').catch(() => 'No idea set.');
        const profile = await readMemory('profile.md').catch(() => '');
        const progress = await readMemory('progress.md').catch(() => 'No progress logged yet.');

        // ROBUST ROUTING
        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const engineMode = engineMatch ? engineMatch[1].trim().toLowerCase() : 'local';
        const isCloud = engineMode.includes('cloud');

        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        // Extract Builder Level for Tone Adjustment
        let builderLevel = 'In the Mud';
        if (profile.includes('Blueprint')) builderLevel = 'Blueprint (Beginner)';
        if (profile.includes('Feral Builder')) builderLevel = 'Feral Builder (Elite/Ruthless)';

        s.message(blazeOrange(`Initializing brutal evaluation via ${targetModel}...`));

        // 2. Construct Prompt — split into system (role + tone rules) and
        //    user (the actual data + task) so the LLM sees a clean, isolated
        //    context with no chat-history bleed.
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are COOK AGENT, the brutally honest AI co-founder. Your job is to strip away founder delusion. Review the user's core idea and current progress, and tell them exactly what they are doing wrong.

USER LEVEL: ${builderLevel}
- If Blueprint (Beginner): Be direct but instructional. Point out naive assumptions.
- If In the Mud (Intermediate): Be harsh. Point out wasted time and feature creep.
- If Feral Builder (Elite/Ruthless): NO MERCY. Attack their execution speed, market positioning, and blind spots aggressively. Do not compliment them.`
            },
            {
                role: 'user',
                content: `PRODUCT VISION:
${idea}

CURRENT PROGRESS:
${progress}

TASK:
Generate a "Hard Truth" report. Format exactly with these sections:

### 🩸 THE BLEEDING EDGE (Biggest Vulnerability)
[Identify the most critical flaw or delusion in their current plan/progress]

### 🛑 DELUSION CHECK (What to Stop Doing)
[Call out time-wasting behavior, bad assumptions, or feature creep]

### 🔪 THE CUT (What to Kill)
[Tell them exactly what feature, idea, or task to completely abandon today]

### ⚡ THE WAKE-UP CALL
[One aggressive, closing sentence to snap them back into execution]`
            }
        ];

        // 3. Run through LLM Router — isolated context, no chat history.
        let truthReport = '';
        if (isCloud) {
            truthReport = await generateCloud(messages, targetModel);
        } else {
            truthReport = await generateLocal(messages, targetModel);
        }

        s.stop(hackerGreen('✅ Reality check complete.'));

        console.log('\n' + truthReport.trim() + '\n');

        outroSafe(blazeOrange('Ego disabled. Get back to work.'));

        // Return the final report explicitly so headless channels (Telegram)
        // can ship the LLM output to the user without relying on stdout
        // interception — which is fragile in a daemon context.
        return truthReport.trim();

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed to process the hard truth.'));
        console.error(error);
        process.exit(1);
    }
}