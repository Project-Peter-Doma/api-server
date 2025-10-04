// api/src/orchestrator.ts

import { runOnChainAnalyst } from './agents/onChainAnalyst.js';
import { runWeb2AuthorityAnalyst } from './agents/web2AuthorityAnalyst.js';
import { runMarketIntelligenceAgent } from './agents/marketIntelligenceAgent.js';
import { runLiveMomentumAgent } from './agents/liveMomentumAgent.js';
import { runLiquidityPredictorAgent } from './agents/liquidityPredictorAgent.js';
import { runComparableSalesAgent } from './agents/comparableSalesAgent.js';

import { jsonLLM_aggregator } from './services/together.js';
import { FinalReportSchema, FinalReport } from './types/schemas.js';

export async function runFullAnalysis(domain: string): Promise<FinalReport | null> {
  console.log(`[Orchestrator] Starting full analysis for ${domain}...`);
  const tld = domain.split('.').pop() || '';

  try {
    console.log('[Orchestrator] Triggering all specialist agents in parallel...');
    
    const results = await Promise.allSettled([
      runOnChainAnalyst(domain),
      runWeb2AuthorityAnalyst(domain),
      runMarketIntelligenceAgent(domain),
      runLiveMomentumAgent(tld),
      runLiquidityPredictorAgent(domain),
      runComparableSalesAgent(domain),
    ]);
    console.log('[Orchestrator] All specialist agents have completed.');

    const createDefaultReport = (agentName: string, reason: string) => ({ status: "failure", agent_name: agentName, reason });
    
    const onChainReport = results[0].status === 'fulfilled' && results[0].value ? results[0].value : createDefaultReport('on_chain_analyst', 'Agent failed or domain not found on Doma.');
    const web2Report = results[1].status === 'fulfilled' && results[1].value ? results[1].value : createDefaultReport('web2_authority_analyst', 'Agent failed to fetch Web2 data.');
    const marketIntelReport = results[2].status === 'fulfilled' && results[2].value ? results[2].value : createDefaultReport('market_intelligence_agent', 'Agent failed to conduct research.');
    const momentumReport = results[3].status === 'fulfilled' && results[3].value ? results[3].value : createDefaultReport('live_momentum_agent', 'Agent failed.');
    const liquidityReport = results[4].status === 'fulfilled' && results[4].value ? results[4].value : createDefaultReport('liquidity_predictor_agent', 'Agent failed.');
    const compsReport = results[5].status === 'fulfilled' && results[5].value ? results[5].value : createDefaultReport('comparable_sales_agent', 'Agent failed.');

    // CORRECTED: The prompt is now valid plain text.
    const aggregatorSystemPrompt = `
      You are the final intelligence synthesizer for the 'Peter' platform for the domain '${domain}'.
      Synthesize the provided expert reports into a final JSON object.
      If a report has a status of "failure", acknowledge this and assign its scores a value of 0.

      **EXPERT REPORTS:**
      1. On-Chain Analyst: ${JSON.stringify(onChainReport, null, 2)}
      2. Web2 Authority: ${JSON.stringify(web2Report, null, 2)}
      3. Market Intelligence: ${JSON.stringify(marketIntelReport, null, 2)}
      4. Live Momentum (for .${tld}): ${JSON.stringify(momentumReport, null, 2)}
      5. Liquidity Predictor: ${JSON.stringify(liquidityReport, null, 2)}
      6. Comparable Sales: ${JSON.stringify(compsReport, null, 2)}
      
      **Your Synthesis Task:**
      - For the 'executive_summary', write a compelling, 3-4 sentence summary. If on-chain data is missing, state that it's a "traditional Web2 asset."
      - For the 'peter_score', calculate a final composite score (0-100) as a weighted average. Weighting: Market Trend (25%), Brandability (20%), On-Chain Health (20%), Predicted Liquidity (15%), SEO Authority (10%), Traffic (5%), Live Momentum (5%). Use 0 for any missing scores.
      - For the 'scores' object, populate it by extracting the relevant individual scores from each report. Use 0 for missing scores.
      - For the 'deep_dive' object, populate it by nesting the full content of each specialist report.
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
