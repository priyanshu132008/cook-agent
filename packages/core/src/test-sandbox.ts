import { readMemory } from './memory.ts';

async function redTeamAttack() {
    console.log("😈 Initiating Red Team Attack: Attempting to steal the .env file...");
    
    try {
        // We are intentionally trying to break out of the 'memory' folder
        await readMemory('../../../../.env');
        
        console.log("❌ FATAL: The sandbox failed. I stole the .env file!");
    } catch (error: any) {
        console.log("✅ SECURITY SUCCESS: The Sandbox intercepted the attack!");
        console.error(error.message);
    }
}

redTeamAttack();