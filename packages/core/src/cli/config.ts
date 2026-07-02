import { intro, outro, text, select, password, isCancel, cancel, note } from '@clack/prompts';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { readMemory, writeMemory } from '../memory.ts';

const execAsync = promisify(exec);
const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

const ENV_PATH = path.join(process.cwd(), '.env');

function handleCancel(value: any) {
    if (isCancel(value)) {
        cancel(blazeOrange('Config update aborted.'));
        process.exit(0);
    }
    return value;
}

async function updateEnvFile(key: string, value: string) {
    let envContent = '';
    try { envContent = await fs.readFile(ENV_PATH, 'utf-8'); } catch (e) { /* .env may not exist yet */ }

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

function readProfileField(raw: string, field: string): string {
    const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'i');
    const match = raw.match(regex);
    return match ? match[1].trim() : '';
}

export async function runConfig() {
    try {
        console.clear();
        intro(blazeOrange.bold(' [ ENGINE CONFIG ] '));

        // Show current config so the user knows what they're changing.
        let existingProfile = '';
        try {
            existingProfile = await readMemory('profile.md');
        } catch (e) {
            // profile.md may not exist yet — that's fine, this is the first config.
        }

        if (existingProfile) {
            const currentEngine = readProfileField(existingProfile, 'Engine Mode');
            const currentModel = readProfileField(existingProfile, 'Primary Model');
            const currentRadar = readProfileField(existingProfile, 'Radar Setting');
            note(
                chalk.gray(`Engine: ${currentEngine || '(unset)'}\n`) +
                chalk.gray(`Model:  ${currentModel || '(unset)'}\n`) +
                chalk.gray(`Radar:  ${currentRadar || '(unset)'}`),
                blazeOrange('CURRENT CONFIG')
            );
        } else {
            note(chalk.gray('No profile.md found — first run, no problem.'), blazeOrange('CURRENT CONFIG'));
        }

        const engineMode = handleCancel(await select({
            message: 'Select your engine:',
            options: [
                { value: 'local', label: 'Local (Ollama)' },
                { value: 'cloud_free', label: 'Cloud Free (OpenRouter)' },
                { value: 'cloud_pro', label: 'Cloud Pro (Paid APIs)' }
            ]
        }));

        let finalModel = 'llama3.2';

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
            const modelInput = handleCancel(await text({
                message: 'Enter OpenRouter Model (e.g. meta-llama/llama-3-8b-instruct):'
            }));
            finalModel = (modelInput || '').trim();
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
            const modelInput = handleCancel(await text({
                message: `Enter ${provider} Model (e.g. gpt-4o, claude-3-5-sonnet):`
            }));
            finalModel = (modelInput || '').trim();
            const key = handleCancel(await password({ message: `Enter ${provider} API Key:` }));
            await updateEnvFile(`${(provider as string).toUpperCase()}_API_KEY`, key as string);
        }

        // Surgically update ONLY the engine + model lines in profile.md.
        // idea.md and status.md are NEVER touched here.
        let profileBody = existingProfile;
        if (!profileBody) {
            profileBody = `# FOUNDER PROFILE\n`;
        }

        const setField = (body: string, field: string, value: string): string => {
            const regex = new RegExp(`(\\*\\*${field}:\\*\\*).*`, 'i');
            if (regex.test(body)) {
                return body.replace(regex, `$1 ${value}`);
            }
            return body.trimEnd() + `\n**${field}:** ${value}\n`;
        };

        profileBody = setField(profileBody, 'Engine Mode', engineMode as string);
        profileBody = setField(profileBody, 'Primary Model', finalModel);

        await writeMemory('profile.md', profileBody);

        outro(hackerGreen(`✅ Engine updated: ${engineMode} → ${finalModel}. .env saved. Run cook chat to spin up.`));
    } catch (error: any) {
        console.error(chalk.red('\n❌ CONFIG FAILED:'), error?.message ?? String(error));
        process.exit(1);
    }
}
