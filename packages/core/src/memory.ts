import { readFile, writeFile, mkdir, appendFile, access } from 'node:fs/promises';
import path from 'node:path';
import { enforceSandbox } from './sandbox.ts';

export async function readMemory(filename: string): Promise<string> {
  const filePath = enforceSandbox(path.join(process.cwd(), 'memory', filename));
  await mkdir(path.join(process.cwd(), 'memory'), { recursive: true });
  return readFile(filePath, { encoding: 'utf8' });
}

export async function writeMemory(filename: string, content: string): Promise<void> {
  const filePath = enforceSandbox(path.join(process.cwd(), 'memory', filename));
  await mkdir(path.join(process.cwd(), 'memory'), { recursive: true });
  await writeFile(filePath, content, { encoding: 'utf8' });
}

export async function appendMemory(filename: string, data: string): Promise<void> {
  const filePath = enforceSandbox(path.join(process.cwd(), 'memory', filename));
  const targetDir = path.dirname(filePath);

  try {
    await access(targetDir);
  } catch {
    await mkdir(targetDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logEntry = `\n\n### [${timestamp}]\n${data}\n`;

  await appendFile(filePath, logEntry, 'utf-8');
  console.log(`💾 Memory persistently appended to: ${filename}`);
}