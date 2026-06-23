// Cook Agent — agent.ts
// Day 1 / Foundation — strict TypeScript execution loop
// Talks to local Ollama via native fetch. No abstractions. No LangChain.
// Raw string in, raw string out.

const OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "phi4-mini";

export interface AgentRequest {
  readonly prompt: string;
  readonly model?: string;
  readonly stream?: boolean;
}

export interface OllamaResponse {
  readonly model: string;
  readonly response: string;
  readonly done: boolean;
  readonly context?: ReadonlyArray<number>;
  readonly total_duration?: number;
  readonly eval_count?: number;
}

export class AgentError extends Error {
  public readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AgentError";
    this.cause = cause;
  }
}

/**
 * Hits the local Ollama /api/generate endpoint with a single prompt.
 * Returns the raw assistant text. No streaming, no tool calls, no parsing.
 */
export async function runOnce(request: AgentRequest): Promise<string> {
  const payload = {
    model: request.model ?? DEFAULT_MODEL,
    prompt: request.prompt,
    stream: false,
  };

  let response: Response;
  try {
    response = await fetch(OLLAMA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new AgentError(
      "Could not reach Ollama. Is it running on localhost:11434?",
      err,
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new AgentError(
      `Ollama returned ${response.status}: ${text || response.statusText}`,
    );
  }

  const data = (await response.json()) as OllamaResponse;
  return data.response;
}

/**
 * Sequential prompt loop. No Promise.all. One prompt at a time.
 * Each step sees the previous raw output appended to context.
 */
export async function runLoop(
  prompts: ReadonlyArray<string>,
  model: string = DEFAULT_MODEL,
): Promise<ReadonlyArray<string>> {
  const outputs: string[] = [];
  let history = "";

  for (const prompt of prompts) {
    const composed = history.length > 0 ? `${history}\n${prompt}` : prompt;
    const result = await runOnce({ prompt: composed, model });
    outputs.push(result);
    history = `${history}\n${result}`.trim();
  }

  return outputs;
}
