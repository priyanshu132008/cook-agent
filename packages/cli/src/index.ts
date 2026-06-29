#!/usr/bin/env node
import chalk from 'chalk';
import { startTelegram, approveTelegram } from '../../core/src/channels/telegram.ts';
import { startTerminalChat } from '../../core/src/channels/terminal.ts';
import { runOnboarding } from '../../core/src/cli/onboarding.ts';
import { runDoctor } from '../../core/src/skills/doctor.ts';
import { runIdeaValidator } from '../../core/src/skills/idea-validator.ts';
import { runCustomerFinder } from '../../core/src/skills/customer-finder.ts';
import { runLaunchSequence } from '../../core/src/skills/launch-sequence.ts';
import { runHardTruth } from '../../core/src/skills/hard-truth.ts';
import { runBuildGuide } from '../../core/src/skills/build-guide.ts';
import { runResearchAgent } from '../../core/src/skills/research-agent.ts';
import { runOutreachWriter } from '../../core/src/skills/outreach-writer.ts';
import { runDecisionPartner } from '../../core/src/skills/decision-partner.ts';
import { runAnchor } from '../../core/src/skills/anchor.ts';
import { daemonStart, daemonStop, daemonLogs } from './daemon.ts';

const blazeOrange = chalk.hex('#FF4500');
// Accept either `cook <cmd>` or bare `<cmd>` from the global shell so the binary
// matches the TUI's `cook <command>` router byte-for-byte.
const rawArgs = process.argv.slice(2);
const args: string[] =
    rawArgs[0] && rawArgs[0].toLowerCase() === 'cook' ? rawArgs.slice(1) : rawArgs;
const command = args[0];
const BLAZE = '\x1b[38;5;208m';
const RESET = '\x1b[0m';

async function main() {
    // Echo the parsed skill in blazing feral orange so the user sees the
    // global binary dispatched the same way the TUI would have.
    // (Daemon and serve commands log their own status — don't double-print.)
    if (
        command &&
        command !== 'serve:telegram' &&
        command !== 'approve' &&
        !command.startsWith('daemon:')
    ) {
        process.stdout.write(`${BLAZE}⚡ cook ${command}${RESET}\n`);
    }

    switch (command) {
        case 'onboard':
            await runOnboarding();
            break;
        case 'doctor':
            await runDoctor();
            break;
        case 'chat':
            await startTerminalChat();
            break;
        case 'serve:telegram':
            await startTelegram();
            break;
        case 'approve':
            if (!args[1]) {
                console.log(chalk.red('❌ Please provide a pairing code. Example: cook approve 4815'));
            } else {
                await approveTelegram(args[1]);
            }
            break;
        case 'validate':
            await runIdeaValidator();
            break;
        case 'hunt':
            await runCustomerFinder();
            break;
        case 'launch':
            await runLaunchSequence();
            break;
        case 'truth':
            await runHardTruth();
            break;
        case 'blueprint':
            await runBuildGuide();
            break;
        case 'research':
            await runResearchAgent();
            break;
        case 'outreach':
            await runOutreachWriter();
            break;
        case 'decide':
            await runDecisionPartner();
            break;
        case 'anchor':
            await runAnchor();
            break;
        case 'daemon:start':
            try {
                await daemonStart();
            } catch (e: any) {
                console.log(chalk.red(`\n❌ Failed to start daemon: ${e?.message ?? String(e)}\n`));
                process.exit(1);
            }
            break;
        case 'daemon:stop':
            try {
                await daemonStop();
            } catch (e: any) {
                console.log(chalk.red(`\n❌ Failed to stop daemon: ${e?.message ?? String(e)}\n`));
                process.exit(1);
            }
            break;
        case 'daemon:logs':
            daemonLogs();
            break;
        default:
            console.log(blazeOrange.bold('\n [ COOK AGENT ] - FERAL BUILDER CLI \n'));
            console.log(chalk.white(' Core Setup:'));
            console.log(`   ${chalk.cyan('cook onboard')}     - Run initial configuration`);
            console.log(`   ${chalk.cyan('cook doctor')}      - System integration & diagnostic test`);
            console.log(`   ${chalk.cyan('cook chat')}        - Open local terminal hatch (TUI)\n`);

            console.log(chalk.white(' Skills:'));
            console.log(`   ${chalk.cyan('cook hunt')}        - Find leads on Reddit/IndieHackers`);
            console.log(`   ${chalk.cyan('cook truth')}       - Brutal ego-check and reality breakdown`);
            console.log(`   ${chalk.cyan('cook decide')}      - Socratic architectural partner`);
            console.log(`   ${chalk.cyan('cook blueprint')}   - Generate technical stack guide`);
            console.log(`   ${chalk.cyan('cook validate')}    - Market gap validation`);
            console.log(`   ${chalk.cyan('cook research')}    - Deep technical extraction`);
            console.log(`   ${chalk.cyan('cook outreach')}    - Generate personalized cold DMs`);
            console.log(`   ${chalk.cyan('cook launch')}      - Generate launch assets`);
            console.log(`   ${chalk.cyan('cook anchor')}      - 2 AM motivation protocol\n`);

            console.log(chalk.white(' Daemons:'));
            console.log(`   ${chalk.cyan('cook serve:telegram')}  - Boot Telegram Bot`);
            console.log(`   ${chalk.cyan('cook approve <code>')}  - Pair remote device`);
            console.log(`   ${chalk.cyan('cook daemon:start')}    - Run Telegram Bot in background (pm2)`);
            console.log(`   ${chalk.cyan('cook daemon:stop')}     - Stop background daemon`);
            console.log(`   ${chalk.cyan('cook daemon:logs')}     - Stream daemon output\n`);
    }
}

main();
