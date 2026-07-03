export interface ChatMessage { role: string; content: string }

export async function generateLocal(messages: ChatMessage[], model: string): Promise<string> {
    try {
        const res = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, stream: false })
        });
        if (!res.ok) throw new Error(`Ollama failed: ${res.statusText}`);
        const data = await res.json();
        return data.message.content;
    } catch (error: any) {
        // ECONNREFUSED is the common case — Ollama isn't running. Any other
        // failure (DNS, malformed JSON, network reset) should also be
        // surfaced to the user as text, never as an uncaught rejection
        // that kills the Telegram daemon's PM2 process.
        const isConnRefused = error?.code === 'ECONNREFUSED'
            || error?.cause?.code === 'ECONNREFUSED'
            || String(error?.message ?? '').includes('ECONNREFUSED');
        if (isConnRefused) {
            return '⚠️ Local LLM engine (Ollama) is unreachable. Please ensure the Ollama app is running on port 11434.';
        }
        return `⚠️ Local LLM engine error: ${error?.message ?? String(error)}`;
    }
}

export async function generateCloud(messages: ChatMessage[], model: string): Promise<string> {
    // Guard the OpenRouter key up front so the user gets a clean,
    // actionable message instead of a 401 from the upstream API.
    // `.includes('===')` catches the common `.env.example` placeholder
    // (e.g. `sk-or-v1-xxx===`) that an operator forgot to swap out.
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey || openRouterKey.includes('===')) {
        return "⚠️ Missing or invalid OpenRouter API Key. Please run 'cook config' to set a valid key.";
    }

    const safeModel = model.toLowerCase();

    // Anthropic — strip system message (Anthropic takes it as a top-level field)
    if (safeModel.includes('claude')) {
        const systemMsg = messages.find(m => m.role === 'system')?.content;
        const convo = messages.filter(m => m.role !== 'system');
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY!,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                system: systemMsg,
                messages: convo
            })
        });
        const data = await res.json();
        if (data.error) return `⚠️ Cloud API Error: ${data.error.message}`;
        return data.content[0].text;
    }

    // OpenAI / OpenRouter (Universal Fallback)
    const apiKey = openRouterKey || process.env.OPENAI_API_KEY;
    const url = openRouterKey
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages })
        });
        const data = await res.json();
        if (data.error) return `⚠️ Cloud API Error: ${data.error.message}`;
        return data.choices[0].message.content;
    } catch (error: any) {
        return `⚠️ Cloud API Error: ${error?.message ?? String(error)}`;
    }
}
