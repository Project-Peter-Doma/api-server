// src/agents/liquidityPredictorAgent.ts

import { runStreamingResearch } from '../services/perplexity.js'; // Use Perplexity service
import { jsonLLM_formatter } from '../services/together.js'; // Use Together AI for formatting
import { LiquidityReportSchema, LiquidityReport } from '../types/schemas.js';

/**
 * The Liquidity Predictor Agent (Research-Based).
 * Performs a live web search using Perplexity to estimate a domain's liquidity
 * by finding signals of market activity and demand.
 * @param domain The domain name to analyze.
 * @returns A promise that resolves to the structured liquidity report.
 */
export async function runLiquidityPredictorAgent(domain: string): Promise<LiquidityReport | null> {
    console.log(`[Liquidity Agent] Starting LIVE research for ${domain}...`);

    const parts = domain.split('.');
    const keyword = parts.length > 1 ? parts.slice(0, -1).join('.') : parts[0];
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';

    // 1. Construct the Deep Research Prompt for Perplexity `sonar-reasoning-pro`
    const researchPrompt = `
        **ROLE:**
        You are an expert domain market liquidity analyst. Your mission is to conduct a massive online search to estimate the liquidity of the domain "${domain}".

        **RESEARCH MANDATE:**
        1.  **Search for Direct Activity:** Search the web for any current or recent (last 12 months) sale listings, auctions, or "for sale" landers for the exact domain "${domain}".
        2.  **Search for TLD Activity:** Search domain marketplaces (like Sedo, Afternic) and news sites (like DNJournal) for recent sales of other domains with the ".${tld}" extension. Is this TLD actively trading?
        3.  **Search for Keyword Demand:** Search forums (like NamePros) and social media (X/Twitter) for recent discussions about domains containing the keyword "${keyword}". Is there active investor or end-user demand for this term?
        4.  **Synthesize Liquidity:** Based on all your findings, assess the domain's overall liquidity. High liquidity means there is active, recent trading and discussion for similar assets, suggesting it could be sold relatively quickly. Low liquidity means there is little to no recent market activity.

        Provide a detailed text report summarizing all your findings.
    `;

    try {
        // 2. Call the Research Specialist (Perplexity)
        const unstructuredReport = await runStreamingResearch(researchPrompt);
        if (!unstructuredReport) {
            throw new Error("Perplexity research for liquidity returned no content.");
        }
        console.log(`[Liquidity Agent] Received raw liquidity research from Perplexity.`);

        // 3. Call the Formatting Specialist (Together AI) to structure the output
        const formatterSystemPrompt = `You are a data synthesizer. Your task is to take the provided research report on domain liquidity and distill it into a structured JSON object.`;
        
        const structuredReport = await jsonLLM_formatter(
            unstructuredReport,
            LiquidityReportSchema,
            formatterSystemPrompt
        );

        console.log(`[Liquidity Agent] Successfully generated structured liquidity report.`);
        return structuredReport;

    } catch (error) {
        console.error(`[Liquidity Agent] Agent failed for ${domain}:`, error);
        return null;
    }
}