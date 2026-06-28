import { readMemory } from './memory.ts';

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