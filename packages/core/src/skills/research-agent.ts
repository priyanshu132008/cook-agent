import { intro, outro, spinner } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readMemory } from '../memory.ts';
import { executeSearch, scrapeUrl } from '../search.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Strip a leading URL out of a free-form prompt and return the URL + the
// remaining prose. Lets users paste `cook research https://example.com Axora IO`
// and still get context alongside the scrape.
function splitUrlAndRest(input: string): { url: string | null; rest: string } {
    const match = input.match(/(https?:\/\/\S+)/i);
    if (!match) return { url: null, rest: input.trim() };
    const url = match[1];
    const rest = input.replace(url, '').trim();
    return { url, rest };
}

export async function runResearchAgent(initialTopic = '') {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: DEEP RESEARCH PROTOCOL ] '));

    // Topic resolution: explicit args from `cook research <topic>` always win.
    // The interactive prompt is only shown when no topic was provided.
    let topic = initialTopic.trim();

    if (!topic) {
        // Fall through to the legacy interactive flow so the skill stays usable
        // from `cook research` with no arguments.
        const { text } = await import('@clack/prompts');
        const answer = await text({
            message: chalk.white('Enter the exact technical topic, market, or URL to research:'),
            placeholder: 'e.g., SQLite vs Postgres for local-first apps',
            validate(value) {
                if (!value || value.length === 0) return 'A topic or URL is required.';
            }
        });
        if (typeof answer !== 'string') {
            process.exit(0);
        }
        topic = answer.trim();
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

        // --- PRE-FLIGHT INTERCEPTOR ---
        // Decide between scrape (URL) and search (topic). We do NOT trust the LLM
        // to make this call — it happens here in the CLI, where it belongs.
        const { url, rest } = splitUrlAndRest(topic);
        const isUrlOnly = url && rest.length === 0;

        // Human jitter (2-4s) per project Search Rules — never fire bursts.
        const jitter = 2000 + Math.floor(Math.random() * 2000);
        s.message(chalk.dim(`Simulating human jitter... resting for ${(jitter / 1000).toFixed(1)}s`));
        await delay(jitter);

        let rawToolOutput = '';
        let toolKind: 'SCRAPE' | 'SEARCH' = 'SEARCH';
        let sourceLabel = topic;

        if (isUrlOnly && url) {
            toolKind = 'SCRAPE';
            sourceLabel = url;
            s.message(blazeOrange(`Cyber-Scout scraping ${url}...`));
            rawToolOutput = await scrapeUrl(url);
        } else {
            toolKind = 'SEARCH';
            const query = (rest || topic).trim();
            sourceLabel = query;
            s.message(blazeOrange(`Cyber-Scout searching the live web for: ${query}...`));
            rawToolOutput = await executeSearch(query);
        }

        s.message(blazeOrange(`Synthesizing raw ${toolKind.toLowerCase()} data via ${targetModel}...`));

        // --- ANALYZER-ONLY PROMPT ---
        // The user's prompt is the primary directive. profile.md is background
        // user context only — it sets tone/preferences, not the topic. The
        // [VERIFIED LIVE DATA] block is the sole source of truth; the LLM is
        // explicitly forbidden from hallucinating.
        const messages = [
            {
                role: 'system' as const,
                content: `You are an analyzer. Base your entire report ONLY on the [VERIFIED LIVE DATA: DO NOT HALLUCINATE] block provided below. Do not invent information, URLs, statistics, or product claims that are not present in the data. If the live data is sparse or empty, say so explicitly in one line and stop. Background user context is for tone only — it must not override the user's primary directive.`
            },
            {
                role: 'user' as const,
                content: `PRIMARY DIRECTIVE (from user):
${topic}

BACKGROUND USER CONTEXT (tone/preferences only — DO NOT use this to redirect the topic):
${profile ? profile : '(none provided)'}

[VERIFIED LIVE DATA: DO NOT HALLUCINATE]
Source: ${toolKind === 'SCRAPE' ? 'Live URL scrape' : 'Live web search'} — ${sourceLabel}
The following raw data was just retrieved by the CLI tool. Treat it as the SOLE source of truth.

\`\`\`
${rawToolOutput}
\`\`\`

TASK:
Generate a highly dense, zero-fluff markdown briefing. Format exactly as follows:

### 📡 EXECUTIVE SUMMARY
[1-2 sentences. Bottom line up front. Grounded in the live data above.]

### ⚙️ TECHNICAL BREAKDOWN
[Bullet points of the core mechanisms, trade-offs, or architectures discovered. Every claim must trace to the live data.]

### ⚔️ THE FERAL VERDICT
[Make a definitive recommendation on how to utilize this information. If the live data does not support a confident verdict, say "Insufficient live data — recommend re-running with a more specific query." and stop.]
`
            }
        ];

        let researchReport = '';
        if (isCloud) {
            researchReport = await generateCloud(messages, targetModel);
        } else {
            researchReport = await generateLocal(messages, targetModel);
        }

        // Save persistently — use a stable slug from the topic, not the model output.
        const slugSeed = (rest || topic || 'research').replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 64) || 'research';
        const reportPath = path.join(process.cwd(), 'memory', `research_${slugSeed}.md`);
        await fs.writeFile(reportPath, researchReport.trim(), 'utf-8');

        s.stop(hackerGreen('✅ Deep research compiled.'));

        console.log('\n' + researchReport.trim() + '\n');
        console.log(`${chalk.dim('💾 Briefing securely stored at:')} ${chalk.cyan(`memory/research_${slugSeed}.md`)}\n`);

        outro(blazeOrange('Research protocol finalized.'));

    } catch (error) {
        s.stop(chalk.red('❌ Core engine failed during extraction.'));
        console.error(error);
        process.exit(1);
    }
}
