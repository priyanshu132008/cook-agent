import { readMemory } from './memory.ts';
import * as cheerio from 'cheerio';

const HARD_WORD_CAP = 2500;

function pruneDOM(html: string): string {
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, svg, nav, footer, header, aside').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
}

function filterByRelevance(text: string, seed: string): string {
    const tokens = seed.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    if (tokens.length === 0) return text;
    const sentences = text.split(/(?<=[.!?])\s+/);
    const keep: string[] = [];
    for (const s of sentences) {
        const lower = s.toLowerCase();
        if (tokens.some(t => lower.includes(t))) keep.push(s);
    }
    return keep.length > 0 ? keep.join(' ') : text;
}

function hardTruncate(text: string, capWords: number = HARD_WORD_CAP): string {
    const words = text.split(/\s+/);
    if (words.length <= capWords) return text;
    return `${words.slice(0, capWords).join(' ')}\n\n...[SYSTEM: ${words.length - capWords} words truncated]...`;
}

export async function executeSearch(query: string): Promise<string> {
    let profile = '';
    try {
        profile = await readMemory('profile.md');
    } catch (e) {
        // Fallback if profile doesn't exist yet
    }

    const radarMatch = profile.match(/\*\*Radar Setting:\*\* (.*)/);
    const radarSetting = radarMatch ? radarMatch[1].trim().toLowerCase() : 'stealth';

    // --- 1. TAVILY API ---
    if (radarSetting.includes('tavily')) {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) throw new Error('TAVILY_API_KEY missing in .env');

        const res = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey, query, search_depth: 'basic' })
        });
        const data = await res.json();
        if (!data.results) return 'No results found via Tavily.';
        return data.results.map((r: any) => `TITLE: ${r.title}\nCONTENT: ${r.content}\n`).join('\n');
    }

    // --- 2. BRAVE SEARCH API ---
    if (radarSetting.includes('brave')) {
        const apiKey = process.env.BRAVE_API_KEY;
        if (!apiKey) throw new Error('BRAVE_API_KEY missing in .env');

        const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Accept': 'application/json', 'X-Subscription-Token': apiKey }
        });
        const data = await res.json();
        if (!data.web || !data.web.results) return 'No results found via Brave.';
        return data.web.results.map((r: any) => `TITLE: ${r.title}\nDESCRIPTION: ${r.description}\n`).join('\n');
    }

    // --- 3. STEALTH SEARCH (Free DuckDuckGo HTML Fallback) ---
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();

    const snippets: string[] = [];
    const resultRegex = /<a class="result__snippet[^>]*>(.*?)<\/a>/gi;
    let match;
    let count = 0;
    while ((match = resultRegex.exec(html)) !== null && count < 5) {
        const cleanText = match[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
        snippets.push(`- ${cleanText}`);
        count++;
    }

    return snippets.length > 0 ? snippets.join('\n') : 'No results found via Stealth Search.';
}

// Backwards-compatible alias — preserves the Day 9 agent.ts + test-search.ts imports
// while routing through the new universal router.
export const searchWeb = executeSearch;

// Scrape a single URL and run the result through the compressor pipeline
// (pruneDOM -> filterByRelevance -> hardTruncate) before it ever reaches the LLM.
// Per project rules, ALL scraped HTML funnels through this — the LLM never
// sees raw page noise.
export async function scrapeUrl(url: string, seed: string = url): Promise<string> {
    let res: Response;
    try {
        res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
            }
        });
    } catch (e: any) {
        throw new Error(`Scrape failed: ${e.message}`);
    }
    if (!res.ok) throw new Error(`Scrape failed: HTTP ${res.status} ${res.statusText}`);

    const html = await res.text();
    const pruned = pruneDOM(html);
    const relevant = filterByRelevance(pruned, seed);
    const truncated = hardTruncate(relevant);

    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;
    return `SOURCE: ${title} (${url})\n\n${truncated}`;
}