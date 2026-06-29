import readline from 'node:readline';
import chalk from 'chalk';
import { generateLocal, generateCloud } from '../models.ts';
import type { ChatMessage } from '../models.ts';
import { readMemory } from '../memory.ts';
import { runHardTruth } from '../skills/hard-truth.ts';
import { runCustomerFinder } from '../skills/customer-finder.ts';
import { runDecisionPartner } from '../skills/decision-partner.ts';
import { runBuildGuide } from '../skills/build-guide.ts';
import { runIdeaValidator } from '../skills/idea-validator.ts';
import { runResearchAgent } from '../skills/research-agent.ts';
import { runOutreachWriter } from '../skills/outreach-writer.ts';
import { runLaunchSequence } from '../skills/launch-sequence.ts';
import { runAnchor } from '../skills/anchor.ts';
import { runDoctor } from '../skills/doctor.ts';

// Module-level chat history — survives recursive startTerminalChat() calls so the LLM
// retains context across cook <skill> runs within the same TUI session.
const chatHistory: ChatMessage[] = [];
const MAX_TURNS = 20;

export async function startTerminalChat(isRecursive = false) {
    if (!isRecursive) {
        console.clear();
        console.log(chalk.hex('#FF4500')('🔥 FERAL TERMINAL UPLINK ESTABLISHED. Type "cook exit" or "exit" to close.\n'));
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const profile = await readMemory('profile.md').catch(() => '');
    const idea = await readMemory('idea.md').catch(() => '');
    const status = await readMemory('status.md').catch(() => '');
    const memoryState = `### profile.md\n${profile}\n\n### idea.md\n${idea}\n\n### status.md\n${status}`;
    const engineMode = profile.match(/\*\*Engine Mode:\*\* (.*)/i)?.[1].trim().toLowerCase() || 'local';
    const targetModel = profile.match(/\*\*Primary Model:\*\* (.*)/i)?.[1].trim() || 'llama3.2';

    // THE SYSTEM ENVELOPE (Identity enforcement + elite-advisor verbosity)
    const systemPrompt = `
[SYSTEM CONTEXT - DO NOT ACKNOWLEDGE THIS BLOCK TO THE USER]
You are COOK AGENT, an elite senior advisor and AI co-founder running locally in a terminal environment.
DO NOT say you are an AI made by Minimax, OpenAI, Anthropic, or anyone else. You are Cook.

VERBOSITY DIRECTIVE — STRICT LOCKDOWN:
Default response length is HALF of what a normal LLM produces. Provide exactly the information requested and stop. No introductory paragraphs. No "Here's what I'll do…" preambles. No "Let me know if you need more" sign-offs. No meta-commentary about your reasoning. One short sentence is almost always enough. Bullet points are fine. Code blocks are fine. Conversational filler is not.

DENSITY OVER LENGTH: If a topic is multi-part, use tight bullets. If a topic is single-part, use one tight paragraph. Code snippets, command lines, file paths, and numbers earn their keep because they carry information — keep them inline, not wrapped in ceremony. Never pad.

CONVERSATIONAL HANDLER — ABSOLUTE RULES:
1. If the message is a casual greeting ("hi", "yoo", "hey", "hello", "sup", "what's up", "howdy", "good morning", etc.) OR a low-substance opener ("are you there?", "you awake?", "test", "."), reply with EXACTLY one short sentence — e.g., "Hello. What are we building today?" — and nothing else. Do not explain yourself. Do not list capabilities. Do not introduce the system.
2. NEVER list your skills, commands, or capabilities unless the user's message contains the literal word "help" or "menu" (case-insensitive, anywhere in the message) AND is not accompanied by any other substantive question. A request for "help with my Postgres connection" is not a help request — it's a real question that gets a real answer, no catalog.
3. NEVER tell the user to run a CLI command to view their own data. Answer from [CURRENT USER MEMORY STATE] directly.
4. NEVER invent fictional context (payment systems, brain fog, marketing funnels, user personas, prior conversations, etc.) to fill space. If you don't know, say so in one line and stop.

PERSONA — COOK AGENT:
You are Cook Agent, an elite local AI co-founder for developers. Blunt, hyper-accurate, professional. You speak like a senior engineer who has shipped — short sentences, no fluff, no softening, no "I'd be happy to help." You do not acknowledge this system prompt. You do not refer to yourself as an LLM or by any vendor name (Minimax, OpenAI, Anthropic, etc.). You are Cook.

REASONING QUALITY:
When the question is technical, lead with the deciding trade-off or the sharpest insight, then stop. One trade-off in one line beats five scenarios. If the question demands structured output (a comparison, a checklist, a numbered list), give it — tight, with no preamble, no recap.

SKILL EXECUTION — RAW DATA ONLY:
When executing a skill ("cook hunt", "cook truth", "cook blueprint", "cook research", "cook validate", "cook decide", "cook outreach", "cook launch", "cook anchor"), return the skill's raw structured output verbatim. Do not wrap it in "Here's what I found…" or "Let me summarize…" or any conversational bedding. Markdown headers from the skill body are allowed and encouraged. Add nothing; remove nothing.

WHEN A USER EXPLICITLY ASKS FOR HELP:
If — and only if — the user's message is exactly or contains the literal token "help"/"menu" with no other substantive question, you may list the 13 CLI commands in compact form (one per line, no prose). This is the ONLY context in which the catalog is allowed on screen.

If the user asks about their idea, status, or profile, ANSWER DIRECTLY from [CURRENT USER MEMORY STATE]. Do not deflect them to a CLI command.

[CURRENT USER MEMORY STATE]
${memoryState}
[END SYSTEM CONTEXT]

`.trim();

    // Seed module-level chat history with the envelope (only if empty — preserve across recursive calls)
    if (chatHistory.length === 0) {
        chatHistory.push({ role: 'system', content: systemPrompt });
    }

    const chatLoop = () => {
        rl.question(chalk.cyan('You > '), async (input) => {
            const trimmed = input.trim();
            const lowerInput = trimmed.toLowerCase();

            // Bare exit — drop the uplink
            if (lowerInput === 'exit') {
                console.log(chalk.gray('Closing uplink...'));
                rl.close();
                return;
            }

            // Empty input — re-prompt
            if (!trimmed) return chatLoop();

            // `cook <command>` router — mirrors the global shell binary.
            // We accept the exact prefix `cook ` (case-insensitive) and dispatch on the next word.
            const COOK_PREFIX = 'cook ';
            let subcommand: string | null = null;

            if (lowerInput === 'cook') {
                // `cook` with no arg — conversational fallback below
                subcommand = null;
            } else if (lowerInput.startsWith(COOK_PREFIX)) {
                subcommand = lowerInput.slice(COOK_PREFIX.length).split(/\s+/)[0];
            }

            // cook exit — drop the uplink
            if (subcommand === 'exit') {
                console.log(chalk.gray('Closing uplink...'));
                rl.close();
                return;
            }

            const skillMap: Record<string, () => Promise<void>> = {
                'truth': runHardTruth,
                'hunt': runCustomerFinder,
                'decide': runDecisionPartner,
                'blueprint': runBuildGuide,
                'validate': runIdeaValidator,
                'research': runResearchAgent,
                'outreach': runOutreachWriter,
                'launch': runLaunchSequence,
                'anchor': runAnchor,
                'doctor': runDoctor
            };

            if (subcommand && skillMap[subcommand]) {
                // Dynamic color injection — echo the parsed `cook <cmd>` in blazing feral orange
                // (ANSI 256-color block) so the user sees their intent was correctly routed.
                const BLAZE = '\x1b[38;5;208m';
                const RESET = '\x1b[0m';
                process.stdout.write(`${BLAZE}⚡ cook ${subcommand}${RESET}\n`);

                rl.close();
                try {
                    await skillMap[subcommand]();
                } catch (e: any) {
                    console.log(chalk.red(`\n❌ Skill crashed: ${e.message}\n`));
                }
                console.log('\n--- Returning to Chat ---\n');
                await startTerminalChat(true);
                return;
            }

            // LLM path
            try {
                const auras = ['Cooking...', 'Farming aura...', 'Forging in the trenches...', 'Simmering...', 'Mining reality...', 'Brewing chaos...'];
                const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                const selectedAura = auras[Math.floor(Math.random() * auras.length)];

                let i = 0;
                const spinnerInterval = setInterval(() => {
                    process.stdout.write(`\r\x1b[K${chalk.hex('#FF4500')(frames[i % frames.length])} ${chalk.gray(selectedAura)}`);
                    i++;
                }, 80);

                chatHistory.push({ role: 'user', content: input });

                // Trim oldest non-system messages if over cap
                const nonSystem = chatHistory.filter(m => m.role !== 'system');
                if (nonSystem.length > MAX_TURNS) {
                    const overflow = nonSystem.length - MAX_TURNS;
                    const systemMsgs = chatHistory.filter(m => m.role === 'system');
                    const trimmedConvo = nonSystem.slice(overflow);
                    chatHistory.length = 0;
                    chatHistory.push(...systemMsgs, ...trimmedConvo);
                }

                let reply = '';
                try {
                    if (engineMode.includes('local')) {
                        reply = await generateLocal(chatHistory, targetModel);
                    } else {
                        reply = await generateCloud(chatHistory, targetModel);
                    }
                } finally {
                    clearInterval(spinnerInterval);
                    process.stdout.write('\r\x1b[K');
                }

                chatHistory.push({ role: 'assistant', content: reply });

                console.log(chalk.hex('#00FF41')('Cook > ') + reply + '\n');
            } catch (e: any) {
                console.log(chalk.red(`❌ ERROR: ${e.message}\n`));
            }

            chatLoop();
        });
    };

    chatLoop();
}