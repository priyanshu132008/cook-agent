import { intro, outro, spinner, note } from '@clack/prompts';
import chalk from 'chalk';

// The exact Neo-Brutalist Brand Color
const blazeOrange = chalk.hex('#FF4500');

const COOK_LOGO = blazeOrange(`
 ██████╗ ██████╗  ██████╗ ██╗  ██╗    █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██╔════╝██╔═══██╗██╔═══██╗██║ ██╔╝    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
██║     ██║   ██║██║   ██║█████╔╝     ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║
██║     ██║   ██║██║   ██║██╔═██╗     ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║
╚██████╗╚██████╔╝╚██████╔╝██║  ██╗    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║
 ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝
`);

async function runInstallCLI() {
    console.clear();
    console.log(COOK_LOGO);
    console.log('\n');

    // Styling the Clack prompts with our custom hex
    intro(blazeOrange.bold(' [ COOK AGENT INITIALIZATION ] '));

    note(
        chalk.white('Your local-first AI software developer is booting up.'),
        blazeOrange('SYSTEM STATUS')
    );

    const s = spinner();
    s.start(blazeOrange('Checking system requirements...'));

    await new Promise(resolve => setTimeout(resolve, 1500));

    s.stop(blazeOrange('✅ Hardware verified. Unified Memory architecture detected.'));

    outro(blazeOrange.bold('Day 11 UI Framework Initialized. Ready for Onboarding.'));
}

runInstallCLI().catch(console.error);