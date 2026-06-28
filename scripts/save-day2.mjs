import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const CORE = join(ROOT, 'packages', 'core');
const SRC = join(CORE, 'src');

await mkdir(SRC, { recursive: true });

await writeFile(join(CORE, 'package.json'), JSON.stringify({ name: '@cook-agent/core', version: '1.0.0', type: 'module', main: 'src/agent.ts', exports: { '.': './src/agent.ts', './memory': './src/memory.ts' }, engines: { node: '>=22.6.0' } }, null, 2), 'utf8');

await writeFile(join(CORE, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2023', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, noEmit: true } }, null, 2), 'utf8');

await writeFile(join(SRC, 'memory.ts'), `import { readFile, writeFile, mkdir } from 'node:fs/promises';\nimport { dirname, join } from 'node:path';\nimport { fileURLToPath } from 'node:url';\n\nconst PROJECT_ROOT: string = fileURLToPath(new URL('../../', import.meta.url));\nconst MEMORY_ROOT: string = join(PROJECT_ROOT, 'memory');\n\nfunction resolveMemoryPath(filename: string): string {\n  const target = join(MEMORY_ROOT, filename);\n  const normalized = target.replace(/\\\\/g, '/');\n  const root = MEMORY_ROOT.replace(/\\\\/g, '/');\n  if (!normalized.startsWith(root + '/') && normalized !== root) throw new Error('Path escapes memory root');\n  return target;\n}\n\nexport async function readMemory(filename: string): Promise<string> {\n  return readFile(resolveMemoryPath(filename), { encoding: 'utf8' });\n}\n\nexport async function writeMemory(filename: string, content: string): Promise<void> {\n  const filePath = resolveMemoryPath(filename);\n  await mkdir(dirname(filePath), { recursive: true });\n  await writeFile(filePath, content, { encoding: 'utf8' });\n}\n`, 'utf8');

await writeFile(join(SRC, 'agent.ts'), `import { readMemory, writeMemory } from './memory.js';\n\nconst OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';\nconst MODEL = 'phi4-mini';\n\nexport async function runAgentLoop(prompt: string): Promise<string> {\n  const profileContext = await readMemory('profile.md');\n  const augmentedPrompt = \`\${profileContext.trim()}\\n\\n---\\n\\n\${prompt}\`;\n\n  const body = { model: MODEL, prompt: augmentedPrompt, stream: false };\n\n  const httpResponse = await fetch(OLLAMA_ENDPOINT, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(body)\n  });\n\n  if (!httpResponse.ok) throw new Error('Ollama request failed');\n\n  const data = await httpResponse.json();\n  await writeMemory('cache/last_run.md', data.response);\n  return data.response;\n}\n`, 'utf8');

console.log('✅ ALL FILES WRITTEN SUCCESSFULLY!');