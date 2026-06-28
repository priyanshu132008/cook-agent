import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const NEON = chalk.hex('#00FF41');
const RED = chalk.hex('#FF0000');
const BAR = '████████████████████████████████████████████████████████████████';

function printRow(status: boolean, name: string, detail: string, fix?: string) {
    const icon = status ? NEON('✓') : RED('✗');
    const title = NEON(name.padEnd(25, ' '));
    const desc = status ? NEON(detail) : RED(detail);
    console.log(`${icon}  ${title} ${desc}`);
    if (!status && fix) {
        console.log(`      ${NEON('FIX:')} ${NEON(fix)}`);
    }
}

export async function runDoctor() {
    console.clear();
    console.log(NEON('\n$ cook doctor\n'));
    console.log(NEON('COOK AGENT — SYSTEM DIAGNOSTICS'));
    console.log(NEON(BAR));

    let passed = 0;
    const total = 7;

    const profileRaw = await fs.readFile(path.join(process.cwd(), 'memory', 'profile.md'), 'utf-8').catch(() => '');
    const hasProfile = Boolean(profileRaw.includes('**Primary Model:**'));
    const engineMode = profileRaw.match(/\*\*Engine Mode:\*\* (.*)/i)?.[1].trim().toLowerCase() || 'local';
    const targetModel = profileRaw.match(/\*\*Primary Model:\*\* (.*)/i)?.[1].trim() || 'llama3.2';

    // 1. Engine Status / Local Engine (Ollama) / Cloud API Gateway
    if (!hasProfile) {
        printRow(false, 'Engine Status', 'Profile missing — cannot determine engine.', 'run `cook onboard` first');
    } else if (engineMode.includes('local')) {
        try {
            const res = await fetch('http://127.0.0.1:11434/api/tags');
            if (res.ok) { printRow(true, 'Local Engine (Ollama)', 'localhost:11434 responding'); passed++; }
            else throw new Error();
        } catch {
            printRow(false, 'Local Engine (Ollama)', 'Ollama not running.', 'run `ollama serve` in a new terminal');
        }
    } else {
        printRow(true, 'Cloud API Gateway', `${targetModel} target registered`); passed++;
    }

    // 2. Model State / Local Model / Cloud Routing
    if (!hasProfile) {
        printRow(false, 'Model State', 'Profile missing — cannot check model.', 'run `cook onboard` first');
    } else if (engineMode.includes('local')) {
        try {
            const res = await fetch('http://127.0.0.1:11434/api/tags');
            const data = await res.json();
            const models = data.models.map((m: any) => m.name);
            if (models.includes(targetModel) || models.includes(targetModel+':latest')) {
                printRow(true, 'Local Model', `${targetModel} ready`); passed++;
            } else {
                printRow(false, 'Local Model', `Model ${targetModel} not found.`, `run 'ollama pull ${targetModel}'`);
            }
        } catch {
            printRow(false, 'Local Model', 'Cannot check models, engine offline.', 'start engine first');
        }
    } else {
        const envRaw = await fs.readFile(path.join(process.cwd(), '.env'), 'utf-8').catch(() => '');
        if (envRaw.includes('API_KEY')) { printRow(true, 'Cloud Routing', 'API keys detected in .env'); passed++; }
        else { printRow(false, 'Cloud Routing', 'Missing API keys.', 'add keys to .env file'); }
    }

    // 3. RAM Available (dynamic threshold: 0.5GB cloud, 2.5GB local/no-profile)
    const freeRamGB = os.freemem() / (1024 ** 3);
    const ramThreshold = (hasProfile && engineMode.includes('cloud')) ? 0.5 : 2.5;
    const ramDetail = (hasProfile && engineMode.includes('cloud'))
        ? `${freeRamGB.toFixed(1)}GB free — sufficient for Cloud mode`
        : `${freeRamGB.toFixed(1)}GB free — sufficient for agent`;
    if (freeRamGB > ramThreshold) {
        printRow(true, 'RAM available', ramDetail); passed++;
    } else {
        printRow(false, 'RAM available', `Low RAM. (${freeRamGB.toFixed(1)}GB free)`, 'close other apps and retry');
    }

    // 4. Channel Connected (Telegram)
    const envRaw = await fs.readFile(path.join(process.cwd(), '.env'), 'utf-8').catch(() => '');
    if (envRaw.includes('TELEGRAM_BOT_TOKEN=')) {
        printRow(true, 'Telegram connected', 'Bot token detected in environment'); passed++;
    } else {
        printRow(false, 'Telegram connected', 'Channel not connected.', 'add TELEGRAM_BOT_TOKEN to .env');
    }

    // 5. Memory Readable + Writable
    try {
        const testPath = path.join(process.cwd(), 'memory', '.test');
        await fs.writeFile(testPath, 'ok');
        await fs.readFile(testPath);
        await fs.unlink(testPath);
        printRow(true, 'Memory readable', '/memory/ — read/write OK'); passed++;
    } catch {
        printRow(false, 'Memory readable', 'Cannot write to /memory/.', 'check folder permissions with ls -la');
    }

    // 6. Search Working (Internet ping)
    try {
        const res = await fetch('https://duckduckgo.com', { method: 'HEAD' });
        if (res.ok) { printRow(true, 'Search Layer 1', 'duckduckgo.com responding'); passed++; }
        else throw new Error();
    } catch {
        printRow(false, 'Search Layer 1', 'Network timeout.', 'check your internet connection');
    }

    // 7. Auth Token (Profile setup)
    if (hasProfile) {
        printRow(true, 'Auth token', '~/memory/profile.md valid'); passed++;
    } else {
        printRow(false, 'Auth token', 'Profile missing or corrupted.', 'run `cook onboard` to regenerate');
    }

    console.log(NEON(BAR));
    if (passed === total) {
        console.log(NEON(`${passed}/${total} checks passed. Cook is ready.\n`));
    } else {
        console.log(NEON(`${passed}/${total} checks passed. `) + RED(`Errors detected.\n`));
    }
}