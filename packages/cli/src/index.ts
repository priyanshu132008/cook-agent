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

const blazeOrange = chalk.hex('#FF4500');
const args = process.argv.slice(2);
const command = args[0];

async function main() {
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
            console.log(`   ${chalk.cyan('cook serve:telegram')} - Boot Telegram Bot`);
            console.log(`   ${chalk.cyan('cook approve <code>')} - Pair remote device\n`);
    }
}

main();
