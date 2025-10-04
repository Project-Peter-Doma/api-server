// src/agents/onChainAnalyst.ts

import { jsonLLM_fast } from '../services/together.js';
import { getDomaOnChainData } from '../services/doma.js';
import { OnChainReportSchema, OnChainReport } from '../types/schemas.js';

const SYSTEM_PROMPT = `
You are P.E.T.E.R., a world-class AI analyst specializing in on-chain digital assets. Your expertise lies in interpreting blockchain data to uncover signals of value, liquidity, and risk. Your analysis is sharp, quantitative, and objective.

**Core Principles of On-Chain Valuation:**

1.  **History as Proof of Confidence:** A long on-chain history (>365 days) and consistent on-chain renewals signal long-term holder conviction. A "Claimed" status is the minimum bar for a legitimate asset.
2.  **Velocity as a Proxy for Liquidity:** On-chain transfers are a transparent record of market velocity. A high number of transfers and recent activity are strong indicators of current demand and liquidity.
3.  **Cross-Chain Presence as a Sign of Sophistication:** A domain existing on multiple chains signals a sophisticated owner and broader market exposure.

You must only return a valid JSON object adhering to the provided schema.
`;

export async function runOnChainAnalyst(domain: string): Promise<OnChainReport | null> {
  console.log(`[OnChain Analyst] Starting analysis for ${domain}...`);

  const rawData: any = await getDomaOnChainData(domain);
  
  if (!rawData) {
    console.log(`[OnChain Analyst] No on-chain data found for ${domain}. Agent finished.`);
    return null; 
  }

  // --- Pre-process and Summarize Data ---
  const onChainAgeDays = rawData.tokenizedAt ? Math.round((new Date().getTime() - new Date(rawData.tokenizedAt).getTime()) / (1000 * 3600 * 24)) : 0;
  
  // CORRECTED: Added 'any' type to token and act parameters
  const transferActivities = rawData.tokens?.flatMap((token: any) => 
      token.activities?.filter((act: any) => act.__typename === 'TokenTransferredActivity') || []
  ) || [];
  
  // CORRECTED: Added 'any' type to act parameter
  const renewalActivities = rawData.activities?.filter((act: any) => act.__typename === 'NameRenewedActivity') || [];

  const allActivities = [...transferActivities, ...renewalActivities].map(act => ({ ...act, createdAt: new Date(act.createdAt) }));
  allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  const daysSinceLastActivity = allActivities.length > 0
    ? Math.round((new Date().getTime() - allActivities[0].createdAt.getTime()) / (1000 * 3600 * 24))
    : onChainAgeDays;
  
  // CORRECTED: Added 'any' type to token parameter
  const chainHistory = rawData.tokens?.map((token: any) => token.networkId) || [];
  const uniqueChains = [...new Set(chainHistory)];

  const contextSummary = `
    Analysis for domain: ${rawData.name}
    - On-Chain Age: ${onChainAgeDays} days
    - Claim Status: ${rawData.claimedBy ? 'Claimed' : 'Unclaimed'}
    - Transfer Lock Status: ${rawData.transferLock ? 'Locked' : 'Unlocked'}
    - Total On-Chain Transfers: ${transferActivities.length}
    - Total On-Chain Renewals: ${renewalActivities.length}
    - Days Since Last On-Chain Activity: ${daysSinceLastActivity}
    - Chain Presence: [${uniqueChains.join(', ')}]
  `;
    
  const userPrompt = `
    Based on your principles and the following live data summary, generate the analysis report in JSON format.

    Data Summary:
    ${contextSummary}
    
    Your Task:
    1.  Provide an 'on_chain_health_score' (1-10).
    2.  Provide an 'on_chain_health_reasoning' string.
    3.  Provide a 'liquidity_score' (1-10).
    4.  Provide a 'liquidity_reasoning' string.
  `;

  try {
    const report = await jsonLLM_fast(userPrompt, OnChainReportSchema, SYSTEM_PROMPT);
    console.log(`[OnChain Analyst] Successfully generated report for ${domain}.`);
    return report;
  } catch (error) {
    console.error(`[OnChain Analyst] LLM call failed for ${domain}:`, error);
    return null;
  }
}