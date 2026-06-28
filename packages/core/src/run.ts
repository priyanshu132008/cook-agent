import { runAgentLoop } from './agent.ts';

async function main() {
    console.log("🔥 IGNITION SEQUENCE INITIATED...");
    
    try {
        // The real-world Cyborg test
        const prompt = "Search the web for the latest version of Next.js and give me a 2 sentence summary of its new features.";
        
        // Pass the correct variable into the loop
        const response = await runAgentLoop(prompt);
        
        console.log("\n================ [ COOK AGENT ] ================\n");
        console.log(response);
        console.log("\n================================================\n");
        console.log("✅ Sequence complete.");
    } catch (error) {
        console.error("❌ EXECUTION FAILED:", error);
    }
}

main();