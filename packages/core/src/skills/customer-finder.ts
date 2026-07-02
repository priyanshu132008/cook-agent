import { intro, outro, spinner } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readMemory } from '../memory.ts';
import { executeSearch, scrapeUrl } from '../search.ts';
import { generateLocal, generateCloud } from '../models.ts';

const blazeOrange = chalk.hex('#FF4500');
const hackerGreen = chalk.hex('#00FF00');

// Human jitter delay — Search Rules forbid burst firing.
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const URL_REGEX = /^https?:\/\//i;
const URL_IN_STRING = /(https?:\/\/\S+)/i;

function looksLikeUrl(input: string): boolean {
    return URL_REGEX.test(input.trim());
}

function extractUrl(input: string): string | null {
    const m = input.match(URL_IN_STRING);
    return m ? m[1] : null;
}

export async function runCustomerFinder(initialTarget = '') {
    console.clear();
    intro(blazeOrange.bold(' [ SKILL: CUSTOMER FINDER PROTOCOL ] '));

    // Target resolution: an explicit target from `cook hunt <target>` always wins.
    // Otherwise, fall back to the interactive prompt so the legacy flow keeps
    // working from `cook hunt` with no arguments.
    let target = initialTarget.trim();

    if (!target) {
        const { text } = await import('@clack/prompts');
        const answer = await text({
            message: chalk.white('Who are we hunting? (audience, market, URL, or paste a competitor link)'),
            placeholder: 'e.g., solo founders shipping AI tools on Reddit, https://axora.io',
            validate(value) {
                if (!value || value.length === 0) return 'A target is required.';
            }
        });
        if (typeof answer !== 'string') {
            process.exit(0);
        }
        target = answer.trim();
    }

    const s = spinner();
    s.start('Calibrating Cyber-Scout for the hunt...');

    try {
        // profile.md / idea.md are now BACKGROUND USER CONTEXT only.
        // They inform tone and preferences — they do NOT set the hunting target
        // when the user has supplied their own.
        const profile = await readMemory('profile.md').catch(() => '');
        const idea = await readMemory('idea.md').catch(() => '');

        const isCloud = profile.includes('cloud_pro') || profile.includes('cloud_free');
        const modelMatch = profile.match(/\*\*Primary Model:\*\* (.*)/);
        const targetModel = modelMatch ? modelMatch[1].trim() : 'llama3.2';

        // --- PRE-FLIGHT INTERCEPTOR ---
        // Three branches:
        //   1. Target is a bare URL             → scrape it, find complainers in the content
        //   2. Target contains a URL + prose    → scrape the URL, focus on the prose framing
        //   3. Target is a free-form audience   → run a tailored live web search
        //   4. No target was supplied (legacy)  → fall back to the default
        //                                          Reddit / IndieHackers sweep
        let rawHuntingSignal = '';
        let toolKind: 'SCRAPE' | 'SEARCH' = 'SEARCH';
        let sourceLabel = target;

        const standaloneUrl = looksLikeUrl(target);
        const embeddedUrl = extractUrl(target);
        const urlToScrape = standaloneUrl ? target : (embeddedUrl && !standaloneUrl ? embeddedUrl : null);

        if (urlToScrape) {
            toolKind = 'SCRAPE';
            sourceLabel = urlToScrape;
            s.message(blazeOrange(`Cyber-Scout scraping ${urlToScrape}...`));

            const jitter = 2000 + Math.floor(Math.random() * 2000);
            s.message(chalk.dim(`Simulating human jitter... resting for ${(jitter / 1000).toFixed(1)}s`));
            await delay(jitter);

            const focus = target.replace(urlToScrape, '').trim();
            rawHuntingSignal = await scrapeUrl(urlToScrape, focus || urlToScrape);
        } else if (target) {
            // User-supplied audience — build a precise query and search live.
            toolKind = 'SEARCH';
            const query = `customer complaints OR reviews OR alternatives "${target}"`;
            sourceLabel = query;
            s.message(blazeOrange(`Cyber-Scout hunting live signals for: ${target}...`));

            // Jitter before the first fetch
            const jitter = 2000 + Math.floor(Math.random() * 2000);
            s.message(chalk.dim(`Simulating human jitter... resting for ${(jitter / 1000).toFixed(1)}s`));
            await delay(jitter);

            let firstResult = await executeSearch(query);
            rawHuntingSignal += `\n--- SOURCE: Live web search — ${query} ---\n${firstResult}\n`;

            // A second targeted pass (different angle) — STRICT for...of, NO Promise.all
            const followupQuery = `forum OR reddit OR community "${target}" pain points OR frustration OR problems`;
            s.message(blazeOrange(`Cyber-Scout digging deeper (community angle)...`));
            const jitter2 = 2000 + Math.floor(Math.random() * 2000);
            s.message(chalk.dim(`Simulating human jitter... resting for ${(jitter2 / 1000).toFixed(1)}s`));
            await delay(jitter2);
            const secondResult = await executeSearch(followupQuery);
            rawHuntingSignal += `\n--- SOURCE: Live web search — ${followupQuery} ---\n${secondResult}\n`;
        } else {
            // Legacy default: when the user typed `cook hunt` with nothing,
            // keep the original Reddit/IndieHackers sweep so the skill never
            // returns empty just because someone didn't pass an argument.
            s.message(blazeOrange('No target specified — running default solopreneur sweep...'));
            const platforms = [
                { name: 'Reddit Solopreneurs', query: `site:reddit.com "solopreneur" OR "solo founder" "brain fog" OR "overwhelmed"` },
                { name: 'IndieHackers Traffic', query: `site:indiehackers.com "building alone" OR "burnout" "tasks"` }
            ];

            for (const platform of platforms) {
                s.message(blazeOrange(`Cyber-Scout hunting on ${platform.name}...`));
                const result = await executeSearch(platform.query);
                rawHuntingSignal += `\n--- SOURCE: ${platform.name} ---\n${result}\n`;

                const jitter = 2000 + Math.floor(Math.random() * 2000);
                s.message(chalk.dim(`Simulating human jitter... resting for ${(jitter / 1000).toFixed(1)}s`));
                await delay(jitter);
            }
        }

        s.message(blazeOrange('Synthesizing target leads list...'));

        // --- ANALYZER-ONLY PROMPT ---
        // The user's target is the primary directive. idea.md is background
        // context only — when the user names their own target, idea.md must
        // NOT redirect the hunt to the user's saved product.
        const messages = [
            {
                role: 'system' as const,
                content: `You are an analyzer. Base your entire report ONLY on the [VERIFIED LIVE DATA: DO NOT HALLUCINATE] block provided below. Do not invent customer profiles, subreddit names, hook strategies, or quoted complaints that are not present in the data. If the live data is sparse or empty, say so explicitly in one line and stop. Background user context (idea.md) is for tone only — it must not override the user's primary directive.`
            },
            {
                role: 'user' as const,
                content: `PRIMARY DIRECTIVE (from user):
${target}

BACKGROUND USER CONTEXT (tone/preferences only — DO NOT use this to redirect the hunt):
${idea ? `idea.md:\n${idea}` : '(none provided)'}

[VERIFIED LIVE DATA: DO NOT HALLUCINATE]
Source: ${toolKind === 'SCRAPE' ? 'Live URL scrape' : 'Live web search'} — ${sourceLabel}
The following raw data was just retrieved by the CLI tool. Treat it as the SOLE source of truth.

\`\`\`
${rawHuntingSignal}
\`\`\`

TASK:
Generate a clean markdown list of EXACTLY 3 specific customer profile archetypes or online clusters where our target buyers are ACTIVELY COMPLAINING about their blockers (as evidenced in the live data above).
Each archetype must include:
- **Where to find them** — specific subreddits, forums, or URL paths from the live data
- **Core emotional complaint** — quote or paraphrase a real signal from the live data
- **1-sentence personalized hook strategy** — grounded in the live data, not invented

Output raw markdown only. Do not wrap in markdown code fences or backticks. If the live data is insufficient, output a single line: "Insufficient live data — recommend re-running with a more specific target or URL."
`
            }
        ];

        let leadsMatrix = '';
        if (isCloud) {
            leadsMatrix = await generateCloud(messages, targetModel);
        } else {
            leadsMatrix = await generateLocal(messages, targetModel);
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
