// test-doma.ts
import { runOnChainAnalyst } from './src/agents/onChainAnalyst.js';
import 'dotenv/config';
async function testAgent() {
    const testDomain = "customizablewarner.ai";
    console.log(`--- Testing On-Chain Analyst Agent for domain: ${testDomain} ---`);
    const report = await runOnChainAnalyst(testDomain);
    if (report) {
        console.log("\n--- ✅ AGENT SUCCESS! ---");
        console.log("Received structured report:");
        console.log(JSON.stringify(report, null, 2));
    }
    else {
        console.log("\n--- ❌ AGENT FAILURE ---");
        console.log("Agent returned null. Check logs for errors.");
    }
}
testAgent();
