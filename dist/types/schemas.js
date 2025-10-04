// src/types/schemas.ts
import { z } from 'zod';
// ==================================================================
// Schemas for Individual Agent Outputs
// ==================================================================
export const OnChainReportSchema = z.object({
    on_chain_health_score: z.number().min(1).max(10).describe("Score for long-term stability and holder confidence."),
    on_chain_health_reasoning: z.string().describe("Explanation for the health score based on Doma data."),
    liquidity_score: z.number().min(1).max(10).describe("Score for market velocity and desirability based on on-chain transfers."),
    liquidity_reasoning: z.string().describe("Explanation for the liquidity score referencing transfer history."),
});
export const Web2AuthorityReportSchema = z.object({
    seo_authority_score: z.number().min(1).max(10).describe("Score based on Domain Authority and backlink profile."),
    seo_authority_reasoning: z.string().describe("Explanation for the SEO score."),
    traffic_score: z.number().min(1).max(10).describe("Score based on estimated organic web traffic and its trend."),
    traffic_reasoning: z.string().describe("Explanation for the traffic score."),
});
export const MarketIntelReportSchema = z.object({
    brandability_score: z.number().min(1).max(10).describe("Score for brand potential, memorability, and pronounceability."),
    brandability_reasoning: z.string().describe("Explanation for the brandability score."),
    market_trend_score: z.number().min(1).max(10).describe("Score based on the current market sentiment for the domain's keywords and TLD."),
    market_trend_reasoning: z.string().describe("Explanation for the trend score, citing recent news or data."),
    analyst_summary: z.string().describe("A concise, expert summary of the domain's key opportunities and risks."),
});
/**
 * This file establishes the strict data contracts for each of our specialist agents.
 * The next step is to create the helper functions that allow our agents to
 * communicate with the AI models and external APIs.
 *
 * When you are ready, say "next" to build the AI and external API services.
 */ 
//# sourceMappingURL=schemas.js.map