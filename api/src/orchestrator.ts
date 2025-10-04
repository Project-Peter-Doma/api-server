// api/src/orchestrator.ts

import { runOnChainAnalyst } from './agents/onChainAnalyst.js';
import { runWeb2AuthorityAnalyst } from './agents/web2AuthorityAnalyst.js';
import { runMarketIntelligenceAgent } from './agents/marketIntelligenceAgent.js';
import { jsonLLM_aggregator } from './services/together.js';
import { FinalReportSchema, FinalReport } from './types/schemas.js';

/**
 * The main orchestrator for the Peter Intelligence System.
 * It runs all specialist agents in parallel and then uses an aggregator
 * agent to synthesize the final report.
 * @param domain The domain name to analyze.
 * @returns A promise that resolves to the final, comprehensive report.
 */
export async function runFullAnalysis(domain: string): Promise<FinalReport | null> {
  console.log(`[Orchestrator] Starting full analysis for ${domain}...`);

  try {
    console.log('[Orchestrator] Triggering all specialist agents in parallel...');
    
    // Using Promise.allSettled to ensure all agents complete, even if some fail.
    const results = await Promise.allSettled([
      runOnChainAnalyst(domain),
      runWeb2AuthorityAnalyst(domain),
      runMarketIntelligenceAgent(domain),
    ]);
    console.log('[Orchestrator] All specialist agents have completed.');

    // Helper to create a standard failure object for any agent that fails
    const createDefaultReport = (agentName: string, reason: string) => ({
      status: "failure",
      agent_name: agentName,
      reason: reason,
      // Provide default scores so the aggregator doesn't break
      on_chain_health_score: 0,
      liquidity_score: 0,
      seo_authority_score: 0,
      traffic_score: 0,
      brandability_score: 0,
      market_trend_score: 0,
    });

    // Process results, providing a default failure object if any agent rejected.
    const onChainReport = results[0].status === 'fulfilled' && results[0].value ? results[0].value : createDefaultReport('on_chain_analyst', 'Domain not found on Doma Protocol or agent failed.');
    const web2Report = results[1].status === 'fulfilled' && results[1].value ? results[1].value : createDefaultReport('web2_authority_analyst', 'Failed to fetch Web2 authority data.');
    const marketIntelReport = results[2].status === 'fulfilled' && results[2].value ? results[2].value : createDefaultReport('market_intelligence_agent', 'Failed to conduct market intelligence research.');

    // --- Aggregation Phase ---
    const aggregatorSystemPrompt = `
      You are the final intelligence synthesizer for the 'Peter' domain valuation platform.
      You have been provided with a suite of expert reports for the domain '${domain}'.
      Some reports may indicate a failure if data was not available. Your task is to
      intelligently synthesize all available information into a single, final JSON object.
      If a report has a status of "failure", you must acknowledge this in your reasoning and assign its scores a value of 0.

      **EXPERT REPORTS:**
      1.  **On-Chain Analyst Report:** ${JSON.stringify(onChainReport, null, 2)}
      2.  **Web2 Authority Report:** ${JSON.stringify(web2Report, null, 2)}
      3.  **Market Intelligence Report:** ${JSON.stringify(marketIntelReport, null, 2)}
      
      **Your Synthesis Task:**
      1.  **`executive_summary`**: Write a compelling, 3-4 sentence summary. If the on-chain report failed, explicitly state that the domain is a "traditional Web2 asset" and base your summary on the other reports.
      2.  **`peter_score`**: Calculate a final composite score (0-100). This is a weighted average of the sub-scores. Use this weighting: Market Trend (30%), Brandability (25%), SEO Authority (20%), Traffic (15%), On-Chain Health (5%), Liquidity (5%). If a score is missing or from a failed report, treat it as 0.
      3.  Populate the 'scores' object. Extract the scores from the reports; use a value of 0 if a report failed.
      4.  Populate the 'deep_dive' object by nesting the full content of each of the three specialist reports, whether they succeeded or failed.
    `;

    console.log('[Orchestrator] Sending reports to Aggregator Agent...');
    const finalReport = await jsonLLM_aggregator(
      `Generate the final, synthesized dashboard report for the domain '${domain}'.`,
      FinalReportSchema,
      aggregatorSystemPrompt
    );
    
    console.log(`[Orchestrator] Aggregation complete for ${domain}.`);
    finalReport.domain_name = domain;
    return finalReport;

  } catch (error) {
    console.error(`[Orchestrator] Full analysis failed for ${domain}:`, error);
    return null;
  }
}
