import { searchWeb } from './search.ts';

async function test() {
    const results = await searchWeb("What is the latest version of Next.js?");
    console.log("\n--- SCRAPED DATA ---");
    console.log(results);
    console.log("--------------------\n");
}

test();