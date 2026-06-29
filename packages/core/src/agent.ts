import { readMemory, writeMemory, appendMemory } from './memory.ts';
import { generateLocal, generateCloud } from './models.ts';
import { compressMemory } from './compressor.ts';
import { searchWeb } from './search.ts';
import chalk from 'chalk';

export async function runAgentLoop(prompt: string): Promise<string> {
    const profileContext = await readMemory('profile.md');
    const optimizedContext = compressMemory(profileContext);

    // 1. Log the user's prompt to persistent history
    await appendMemory('conversations/history.md', `**USER:** ${prompt}`);

    // 2. Intelligent Interceptor: Does the AI need the internet?
    let searchContext = '';
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('search') || lowerPrompt.includes('latest') || lowerPrompt.includes('current')) {
        console.log('🌍 Real-time data requested. Booting Cyber-Scout...');
        searchContext = await searchWeb(prompt);
    }

    // 3. Construct the final brain payload
    let augmentedPrompt = `${optimizedContext.trim()}\n\n`;
    if (searchContext) augmentedPrompt += `LIVE INTERNET DATA:\n${searchContext}\n\n`;
    augmentedPrompt += `---\n\n${prompt}`;

    let response = '';

    // 4. Read engine configuration from profile.md (profile-driven routing)
    const profileForRouting = await readMemory('profile.md');
    const modelMatch = profileForRouting.match(/\*\*Primary Model:\*\* (.*)/);
    const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

    const engineMatch = profileForRouting.match(/\*\*Engine Mode:\*\* (.*)/);
    const engineMode = engineMatch ? engineMatch[1].trim() : 'local';

    if (engineMode === 'local') {
        console.log(chalk.magenta(`🧠 Routing to local hardware (${targetModel})...`));
        response = await generateLocal([{ role: 'user', content: augmentedPrompt }], targetModel);
    } else if (engineMode === 'cloud_free' || engineMode === 'cloud_pro') {
        console.log(chalk.cyan(`☁️ Routing to Cloud Engine (${targetModel})...`));
        response = await generateCloud([{ role: 'user', content: augmentedPrompt }], targetModel);
    } else {
        // Unknown engine mode — safe default to local to avoid silently calling cloud APIs the user never opted into
        console.log(chalk.magenta(`🧠 Routing to local hardware (${targetModel})...`));
        response = await generateLocal([{ role: 'user', content: augmentedPrompt }], targetModel);
    }

    // 5. Save to temporary cache AND persistent history
    await writeMemory('cache/last_run.md', response);
    await appendMemory('conversations/history.md', `**COOK AGENT:** ${response}`);

    return response;
}