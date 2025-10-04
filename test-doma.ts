// test-doma.ts
import { runComparableSalesAgent } from './src/agents/comparableSalesAgent.js';
import 'dotenv/config';

async function testAgent() {
  const testDomain = "crypto.ai";
  console.log(`--- Testing Comparable Sales Agent for domain: ${testDomain} ---`);
  
  const report = await runComparableSalesAgent(testDomain);
  
  if (report) {
    console.log("\n--- ✅ AGENT SUCCESS! ---");
    console.log("Received structured report:");
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("\n--- ❌ AGENT FAILURE ---");
    console.log("Agent returned null. Check logs for errors.");
  }
}

testAgent();