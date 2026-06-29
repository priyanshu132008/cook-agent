export interface ChatMessage { role: string; content: string }

export async function generateLocal(messages: ChatMessage[], model: string): Promise<string> {
    const res = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false })
    });
    if (!res.ok) throw new Error(`Ollama failed: ${res.statusText}`);
    const data = await res.json();
    return data.message.content;
}

export async function generateCloud(messages: ChatMessage[], model: string): Promise<string> {
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
        if (data.error) throw new Error(data.error.message);
        return data.content[0].text;
    }

    // OpenAI / OpenRouter (Universal Fallback)
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const url = process.env.OPENROUTER_API_KEY
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}
