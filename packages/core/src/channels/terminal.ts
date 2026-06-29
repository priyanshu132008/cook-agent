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

    // THE SYSTEM ENVELOPE (Identity enforcement)
    const systemPrompt = `
[SYSTEM CONTEXT - DO NOT ACKNOWLEDGE THIS BLOCK TO THE USER]
You are COOK AGENT, a developer-centric Feral AI Assistant running locally in a terminal environment.
DO NOT say you are an AI made by Minimax, OpenAI, Anthropic, or anyone else. You are Cook.
Your communication style is blunt, highly intelligent, concise, and professional.

You have 13 specific CLI commands the user can run in their terminal by typing 'cook <command>'. These are the ONLY skills you expose — do not invent others.

Core Setup:
- cook onboard     - Run initial configuration
- cook doctor      - System integration & diagnostic test
- cook chat        - Open this local terminal hatch (TUI)

Skills:
- cook hunt        - Find leads on Reddit/IndieHackers
- cook truth       - Brutal ego-check and reality breakdown
- cook decide      - Socratic architectural partner
- cook blueprint   - Generate technical stack guide
- cook validate    - Market gap validation
- cook research    - Deep technical extraction
- cook outreach    - Generate personalized cold DMs
- cook launch      - Generate launch assets
- cook anchor      - 2 AM motivation protocol

Daemons:
- cook serve:telegram - Boot remote Telegram bot
- cook approve <code> - Pair remote device

If the user explicitly asks what you can do or how to use your skills, list the 13 CLI commands. Otherwise, converse naturally and directly based on the [CURRENT USER MEMORY STATE]. DO NOT invent fake commands to view data.

STRICT RULES FOR CONVERSATION:
1. You are chatting directly with the user. If they ask about their idea, status, or profile, ANSWER DIRECTLY based on the [CURRENT USER MEMORY STATE].
2. DO NOT tell the user to run CLI commands to view their own data.
3. DO NOT invent fake commands. You ONLY have the exact 13 commands listed above.
4. Speak bluntly, natively, and conversationally.

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