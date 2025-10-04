// src/agents/comparableSalesAgent.ts

import { runStreamingResearch } from '../services/perplexity.js';
import { jsonLLM_formatter } from '../services/together.js';
import { CompsReportSchema, CompsReport } from '../types/schemas.js';

/**
 * The Comparable Sales Agent (Research-Based).
 * Performs a live web search to find the most relevant recent sales
 * for domains similar to the target.
 * @param domain The domain name to find comps for.
 * @returns A promise that resolves to the structured comps report.
 */
export async function runComparableSalesAgent(domain: string): Promise<CompsReport | null> {
    console.log(`[Comps Agent] Starting LIVE research for ${domain}...`);

    const parts = domain.split('.');
    const keyword = parts.length > 1 ? parts.slice(0, -1).join('.') : parts[0];
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';

    // 1. Construct the Deep Research Prompt for Perplexity `sonar-reasoning-pro`
    const researchPrompt = `
        **ROLE:**
        You are an expert domain sales data analyst. Your sole mission is to find the most relevant, recent, and verifiable comparable sales ("comps") for the target domain: "${domain}".

        **RESEARCH MANDATE:**
        1.  **Primary Search:** Search domain market news sites and sales databases like **DNJournal, NameBio, and Sedo's market reports** for sales of ".${tld}" domains.
        2.  **Secondary Search:** Search for sales of domains containing the keyword "${keyword}", even if they have a different TLD.
        3.  **Prioritization:** From your search results, you must identify the **Top 3 most relevant comps**. Prioritize recency (last 12-18 months) and similarity (same TLD, similar keywords, similar length) above all else.
        4.  **Data Extraction:** For each of the Top 3 comps, you must extract the domain name, the final sale price in USD, and the date of the sale.

        Provide a detailed text report summarizing your findings, listing the top 3 comps clearly.
    `;

    try {
        // 2. Call the Research Specialist (Perplexity)
        const unstructuredReport = await runStreamingResearch(researchPrompt);
        if (!unstructuredReport) {
            throw new Error("Perplexity research for comps returned no content.");
        }
        console.log(`[Comps Agent] Received raw comps research from Perplexity.`);

        // 3. Call the Formatting Specialist (Together AI) to structure the output
        const formatterSystemPrompt = `You are a data extraction specialist. Your task is to take the provided research report on comparable domain sales and extract the findings into a strict JSON object.`;
        
        const structuredReport = await jsonLLM_formatter(
            unstructuredReport,
            CompsReportSchema,
            formatterSystemPrompt
        );

        console.log(`[Comps Agent] Successfully generated structured comps report.`);
        return structuredReport;

    } catch (error) {
        console.error(`[Comps Agent] Agent failed for ${domain}:`, error);
        return null;
    }
}