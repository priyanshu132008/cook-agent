import { intro, outro, text, select, spinner, isCancel, cancel, note, password } from '@clack/prompts';
import readline from 'node:readline';
import chalk from 'chalk';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import { writeMemory } from '../memory.ts';
import { startTerminalChat } from '../channels/terminal.ts';

const execAsync = promisify(exec);
const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

const ENV_PATH = path.join(process.cwd(), '.env');

function handleCancel(value: any) {
    if (isCancel(value)) {
        cancel(blazeOrange('Sequence aborted.'));
        process.exit(0);
    }
    return value;
}

async function updateEnvFile(key: string, value: string) {
    let envContent = '';
    try { envContent = await fs.readFile(ENV_PATH, 'utf-8'); } catch (e) { /* File might not exist yet */ }

    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
        envContent += `\n${key}=${value}`;
    }
    await fs.writeFile(ENV_PATH, envContent.trim() + '\n');
}

async function getLocalModels(): Promise<string[]> {
    try {
        const { stdout } = await execAsync('ollama list');
        const lines = stdout.split('\n').slice(1).filter(Boolean);
        return lines.map(line => line.split(/\s+/)[0]);
    } catch (e) {
        return [];
    }
}

const COOK_LOGO = blazeOrange(`
 ██████╗ ██████╗  ██████╗ ██╗  ██╗    █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██╔════╝██╔═══██╗██╔═══██╗██║ ██╔╝   ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
██║     ██║   ██║██║   ██║█████╔╝    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║
██║     ██║   ██║██║   ██║██╔═██╗    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║
╚██████╗╚██████╔╝╚██████╔╝██║  ██╗   ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║
 ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝
`);

export async function runOnboarding() {
    try {
        console.clear();
        console.log(COOK_LOGO);
        intro(blazeOrange.bold(' [ SYSTEM CALIBRATION ] '));

        const level = handleCancel(await select({
            message: 'Where are we at in the trenches?',
            options: [
                { value: 'blueprint', label: 'The Blueprint' },
                { value: 'mud', label: 'In the Mud' },
                { value: 'feral', label: 'Feral Builder' }
            ]
        }));

        const idea = handleCancel(await text({ message: 'What are we cooking? (Press Enter to skip)' }));
        const status = handleCancel(await text({ message: 'What is your current status or biggest blocker in the trenches? (Press Enter to skip)' }));
        const blocker = handleCancel(await select({
            message: 'Main boss blocking us today?',
            options: [{ value: 'brain_fog', label: 'Brain fog' }, { value: 'ghost_town', label: 'Ghost town' }, { value: 'spaghetti', label: 'Spaghetti code' }]
        }));

        const s = spinner();
        s.start('Scanning motherboard...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const rawRamGB = os.totalmem() / (1024 ** 3);
        s.stop(hackerGreen(`✅ ${rawRamGB.toFixed(1)}GB RAM detected.`));

        const engineMode = handleCancel(await select({
            message: 'Select your engine:',
            options: [
                { value: 'local', label: 'Local (Ollama)' },
                { value: 'cloud_free', label: 'Cloud Free (OpenRouter)' },
                { value: 'cloud_pro', label: 'Cloud Pro (Paid APIs)' }
            ]
        }));

        let finalModel = 'llama3.2'; // default fallback

        if (engineMode === 'local') {
            const models = await getLocalModels();
            if (models.length > 0) {
                finalModel = handleCancel(await select({
                    message: 'Select your local brain:',
                    options: models.map(m => ({ value: m, label: m }))
                }));
            } else {
                console.log(chalk.red('⚠️ No Ollama models found. Defaulting to llama3.2 (Needs pull).'));
            }
        } else if (engineMode === 'cloud_free') {
            finalModel = handleCancel(await text({ message: 'Enter OpenRouter Model (e.g. meta-llama/llama-3-8b-instruct):' }));
            const key = handleCancel(await password({ message: 'Enter OpenRouter API Key:' }));
            await updateEnvFile('OPENROUTER_API_KEY', key as string);
        } else if (engineMode === 'cloud_pro') {
            const provider = handleCancel(await select({
                message: 'Select Pro Provider:',
                options: [
                    { value: 'openai', label: 'ChatGPT (OpenAI)' },
                    { value: 'anthropic', label: 'Claude (Anthropic)' },
                    { value: 'gemini', label: 'Gemini (Google)' }
                ]
            }));
            finalModel = handleCancel(await text({ message: `Enter ${provider} Model (e.g. gpt-4o, claude-3-5-sonnet):` }));
            const key = handleCancel(await password({ message: `Enter ${provider} API Key:` }));
            await updateEnvFile(`${(provider as string).toUpperCase()}_API_KEY`, key as string);
        }

        const radar = handleCancel(await select({
            message: 'The Radar (Search Mode):',
            options: [
                { value: 'stealth', label: 'Cook Stealth Search (Free/DDG)' },
                { value: 'tavily', label: 'Tavily Search API' },
                { value: 'brave', label: 'Brave Search API' }
            ]
        }));

        if (radar === 'tavily') {
            const key = handleCancel(await password({ message: 'Enter Tavily API Key:' }));
            await updateEnvFile('TAVILY_API_KEY', key as string);
        } else if (radar === 'brave') {
            const key = handleCancel(await password({ message: 'Enter Brave API Key:' }));
            await updateEnvFile('BRAVE_API_KEY', key as string);
        }

        const channel = handleCancel(await select({
            message: 'Where am I holding you accountable?',
            options: [{ value: 'telegram', label: 'Telegram' }, { value: 'terminal', label: 'Terminal' }]
        }));

        if (channel === 'telegram') {
            const tokenInput = handleCancel(await text({
                message: 'Paste your Telegram Bot Token (Press Enter to skip for now):'
            }));
            const token = tokenInput.trim();
            if (token) {
                await updateEnvFile('TELEGRAM_BOT_TOKEN', token);
                console.log(chalk.green("\n✅ Bot token secured. Run 'cook serve:telegram' later to boot the daemon."));
            }
        }

        const grindTime = handleCancel(await text({ message: 'What time are we starting the grind?' }));

        const buildSpinner = spinner();
        buildSpinner.start('Compiling neural profile & securing keys...');

        await writeMemory('idea.md', `# The Cook\n${idea.trim() || '[User skipped during onboarding]'}\n\n## Phase\n${level}\n\n## Main Boss\n${blocker}`);
        await writeMemory('status.md', `# Current Status\n${status.trim() || '[User skipped during onboarding]'}`);
        await writeMemory('profile.md', `# FOUNDER PROFILE\n**Engine Mode:** ${engineMode}\n**Primary Model:** ${finalModel}\n**Radar Setting:** ${radar}\n**Accountability:** ${channel}\n**Daily Grind Time:** ${grindTime}\n`);

        await new Promise(resolve => setTimeout(resolve, 1000));
        buildSpinner.stop(hackerGreen('✅ Neural profile secured. .env updated.'));

        console.log('\n');
        note(chalk.white(`Profile logged. Expect you at ${grindTime}. Let's crush this.`), blazeOrange('COOK AGENT'));

        // OpenClaw Auto-Boot UX
        const bootRl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const bootAnswer: string = await new Promise(resolve => {
            bootRl.question(chalk.cyan('\nBoot Feral Terminal now? (Y/n) > '), resolve);
        });
        bootRl.close();

        const normalized = bootAnswer.trim().toLowerCase();
        if (normalized === 'y' || normalized === 'yes' || normalized === '') {
            await startTerminalChat();
        } else {
            console.log(chalk.gray('Exiting. Run cook chat to boot later.'));
        }

    } catch (error: any) {
        console.error(chalk.red('\n❌ FATAL CRASH:'), error);
        process.exit(1);
    }
}
