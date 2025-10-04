// src/orchestrator.ts

import { runOnChainAnalyst } from './agents/onChainAnalyst.js';
import { runWeb2AuthorityAnalyst } from './agents/web2AuthorityAnalyst.js';
import { runMarketIntelligenceAgent } from './agents/marketIntelligenceAgent.js';
import { jsonLLM_aggregator } from './services/together.js';
import { FinalReportSchema, FinalReport } from './types/schemas.js';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export async function runFullAnalysis(domain: string): Promise<FinalReport | null> {
  console.log(`[Orchestrator] Starting full analysis for ${domain}...`);

  try {
    console.log('[Orchestrator] Triggering all specialist agents in parallel...');
    const [
        onChainReport,
        web2Report,
        marketIntelReport
    ] = await Promise.all([
      runOnChainAnalyst(domain),
      runWeb2AuthorityAnalyst(domain),
      runMarketIntelligenceAgent(domain),
    ]);
    console.log('[Orchestrator] All specialist agents have completed.');
    
    if (!onChainReport || !web2Report || !marketIntelReport) {
        throw new Error("One or more specialist agents failed to produce a report.");
    }
    
    // CORRECTED: Fixed the prompt syntax and logic.
    const aggregatorSystemPrompt = `
      You are the final intelligence synthesizer for the 'Peter' domain valuation platform.
      You have been provided with three expert reports for the domain '${domain}'.
      Your task is to combine these reports into a single, final JSON object for our dashboard.
      You must intelligently synthesize the information, not just copy it.

      **EXPERT REPORTS:**
      1.  **On-Chain Analyst Report:** ${JSON.stringify(onChainReport, null, 2)}
      2.  **Web2 Authority Analyst Report:** ${JSON.stringify(web2Report, null, 2)}
      3.  **Market Intelligence Agent Report:** ${JSON.stringify(marketIntelReport, null, 2)}
      
      **Your Synthesis Task:**
      1.  Read the 'analyst_summary' from the Market Intelligence report and use it as the 'executive_summary'.
      2.  Calculate a final 'peter_score' (1-100) as a weighted average of the sub-scores. Use this weighting: on_chain_health (30%), market_trend (30%), brandability (15%), liquidity (15%), seo_authority (5%), traffic (5%).
      3.  Populate the 'scores' object by extracting the individual scores from each report.
      4.  Populate the 'deep_dive' object by nesting the full content of each of the three specialist reports.
    `;

    console.log('[Orchestrator] Sending reports to Aggregator Agent...');
    const finalReport = await jsonLLM_aggregator(
      `Generate the final, synthesized dashboard report for the domain '${domain}' based on the provided expert analyses in the system prompt.`,
      FinalReportSchema,
      aggregatorSystemPrompt
    );
    
    console.log(`[Orchestrator] Aggregation complete for ${domain}.`);
    // Add the domain name to the final report
    finalReport.domain_name = domain;
    return finalReport;

  } catch (error) {
    console.error(`[Orchestrator] Full analysis failed for ${domain}:`, error);
    return null;
  }
}