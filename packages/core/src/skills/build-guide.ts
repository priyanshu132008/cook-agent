import chalk from 'chalk';
import { readMemory } from '../memory.ts';
import { generateLocal, generateCloud, type ChatMessage } from '../models.ts';
import { headlessSpinner, introSafe, outroSafe } from '../headless.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

export async function runBuildGuide(): Promise<string> {
    introSafe(blazeOrange.bold(' [ SKILL: THE BUILD GUIDE ] '));

    const s = headlessSpinner();
    s.start('Analyzing architecture requirements...');

    try {
        const idea = await readMemory('idea.md').catch(() => 'No idea set.');
        const profile = await readMemory('profile.md').catch(() => '');

        const engineMatch = profile.match(/\*\*Engine Mode:\*\* (.*)/i);
        const engineMode = engineMatch ? engineMatch[1].trim().toLowerCase() : 'local';
        const isCloud = engineMode.includes('cloud');

        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        let builderLevel = 'In the Mud';
        if (profile.includes('Blueprint')) builderLevel = 'Blueprint (Beginner)';
        if (profile.includes('Feral Builder')) builderLevel = 'Feral Builder (Elite/Ruthless)';

        s.message(blazeOrange(`Compiling technical roadmap via ${targetModel}...`));

        // Split into a system (role + tone rules) and user (the actual data
        // + task) so the LLM sees a clean, isolated context — no chat-history
        // bleed, no stale memory poisoning the run.
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are COOK AGENT, an elite Principal Engineer and Technical Architect. Generate a precise, no-fluff technical build guide for the product idea described below.

BUILDER LEVEL: ${builderLevel}
- If Blueprint: Recommend stable, easy-to-learn stacks (e.g., Next.js, Supabase).
- If In the Mud: Focus on unblocking them, recommend standard modern tooling.
- If Feral Builder: Recommend the leanest, fastest, most ruthless stack possible (e.g., Hono, pure Node, zero bloat, SQLite). Tell them to skip unnecessary abstractions.`
            },
            {
                role: 'user',
                content: `PRODUCT VISION:
${idea}

TASK:
Generate a strictly formatted architectural guide. Use these exact headings:

### 🧱 THE STACK
[List the exact frontend, backend, database, and deployment tools. No alternatives. Make the decision for them.]

### 🗺️ EXECUTION ORDER (Next 48 Hours)
[Provide exactly 4 sequential, highly technical steps to get the MVP running. No marketing steps, only code.]

### ⚠️ ARCHITECTURAL TRAPS
[List 2 common engineering rabbit holes they must avoid for this specific build.]`
            }
        ];

        // Run through LLM Router — isolated context, no chat history.
        let guideReport = '';
        if (isCloud) {
            guideReport = await generateCloud(messages, targetModel);
        } else {
            guideReport = await generateLocal(messages, targetModel);
        }

        s.stop(hackerGreen('✅ Architecture compiled.'));

        console.log('\n' + guideReport.trim() + '\n');

        outroSafe(blazeOrange('Blueprint locked. Execute the code.'));

        // Explicit return — Telegram channel ships this directly to chat
        // without relying on stdout interception (fragile in a daemon).
        return guideReport.trim();

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed to compile the build guide.'));
        console.error(error);
        process.exit(1);
    }
}
