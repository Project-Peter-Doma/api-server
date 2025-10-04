// src/agents/web2AuthorityAnalyst.ts

import { jsonLLM_fast } from '../services/together.js';
import { getSERankingData } from '../services/seRanking.js';
import { Web2ReportSchema, Web2Report } from '../types/schemas.js';

// The "Expert Analyst" persona and contextual knowledge for the LLM
const SYSTEM_PROMPT = `
You are P.E.T.E.R., a world-class AI analyst specializing in Web2 digital authority and traffic analysis. Your expertise lies in interpreting SEO metrics to score a domain's reputation and popularity.

**Core Principles of Web2 Valuation:**

1.  **Authority is King:** Domain Authority (DA) or Rank is the primary indicator of a domain's trustworthiness and ranking potential. A score above 50 is strong, above 70 is exceptional. The number of unique referring domains is a key component of this.
2.  **Traffic is Proof:** Estimated organic traffic is direct proof of an existing audience. The historical trend of this traffic is more important than the absolute number. A growing trend is a major positive signal.

You must only return a valid JSON object adhering to the provided schema.
`;

/**
 * The Web2 Authority Analyst Agent.
 * Fetches, processes, and analyzes a domain's SEO and traffic data.
 * @param domain The domain name to analyze.
 * @returns A promise that resolves to the structured Web2Report, or null on failure.
 */
export async function runWeb2AuthorityAnalyst(domain: string): Promise<Web2Report | null> {
  console.log(`[Web2 Analyst] Starting analysis for ${domain}...`);

  // 1. Fetch Raw Web2 Data
  const rawData = await getSERankingData(domain);
  
  if (!rawData) {
    console.log(`[Web2 Analyst] No Web2 data found for ${domain}. Agent finished.`);
    return null; 
  }

  // 2. Pre-process and Summarize Data for the LLM
  const trafficTrend = rawData.monthlyTrafficHistory.length > 1
    ? (rawData.monthlyTrafficHistory[rawData.monthlyTrafficHistory.length - 1].traffic > rawData.monthlyTrafficHistory[0].traffic ? "Increasing" : "Decreasing")
    : "Stable";

  const contextSummary = `
    Analysis for domain: ${domain}
    - Domain Authority (0-100 scale): ${rawData.domainAuthority}
    - Total Referring Domains: ${rawData.referringDomains}
    - Dofollow Referring Domains: ${rawData.dofollowReferringDomains}
    - Current Estimated Monthly Traffic: ${rawData.currentTraffic > 0 ? rawData.currentTraffic : 'Not available for current month'}
    - Last 12 Months Traffic Trend: ${trafficTrend}
    - Total Keywords in Top 100: ${rawData.topRankingKeywords}
  `;
    
  // 3. Construct the User Prompt for the LLM
  const userPrompt = `
    Based on your principles and the following live data summary, generate the analysis report in JSON format.

    Data Summary:
    ${contextSummary}
    
    Your Task:
    1.  Provide an 'seo_authority_score' (1-10) based on the Domain Authority and referring domains.
    2.  Provide an 'seo_authority_reasoning' string explaining the score.
    3.  Provide a 'traffic_score' (1-10) based on the traffic metrics and trend.
    4.  Provide a 'traffic_reasoning' string explaining the score.
  `;

  try {
    // 4. Call the LLM with the prompt and a strict schema
    const report = await jsonLLM_fast(userPrompt, Web2ReportSchema, SYSTEM_PROMPT);
    console.log(`[Web2 Analyst] Successfully generated report for ${domain}.`);
    return report;
  } catch (error) {
    console.error(`[Web2 Analyst] LLM call failed for ${domain}:`, error);
    return null;
  }
}