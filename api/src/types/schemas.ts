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

export const Web2ReportSchema = z.object({
    seo_authority_score: z.number().min(1).max(10),
    seo_authority_reasoning: z.string(),
    traffic_score: z.number().min(1).max(10),
    traffic_reasoning: z.string(),
});

export const MarketIntelReportSchema = z.object({
    brandability_score: z.number().min(1).max(10),
    brandability_reasoning: z.string(),
    market_trend_score: z.number().min(1).max(10),
    market_trend_reasoning: z.string(),
    analyst_summary: z.string(),
});

// ==================================================================
// Schema for the FINAL Aggregated Output
// ==================================================================
// CORRECTED: Added the definition and export for the final report schema.
export const FinalReportSchema = z.object({
    domain_name: z.string(),
    peter_score: z.number().min(1).max(100).describe("The final, synthesized score for the domain."),
    executive_summary: z.string().describe("A top-level summary of the domain's value proposition."),
    scores: z.object({
        on_chain_health: z.number(),
        liquidity: z.number(),
        seo_authority: z.number(),
        traffic: z.number(),
        brandability: z.number(),
        market_trend: z.number(),
    }),
    deep_dive: z.object({
        on_chain_report: OnChainReportSchema,
        web2_report: Web2ReportSchema,
        market_intel_report: MarketIntelReportSchema,
    }),
});
export const LiveMomentumReportSchema = z.object({
  momentum_score: z.number().min(0).max(100).describe("A quantitative score from 0-100 representing market activity. MUST be a number, not a string."),
  momentum_state: z.enum(["Accelerating", "Peaking", "Stable", "Cooling Down", "Dormant"]).describe("The qualitative state of the market momentum."),
  reasoning: z.string().describe("A brief, data-driven explanation for the score and state."),
});

export type LiveMomentumReport = z.infer<typeof LiveMomentumReportSchema>;

// ==================================================================
// TypeScript Types Inferred from Schemas
// ==================================================================

export type OnChainReport = z.infer<typeof OnChainReportSchema>;
export type Web2Report = z.infer<typeof Web2ReportSchema>;
export type MarketIntelReport = z.infer<typeof MarketIntelReportSchema>;
export type FinalReport = z.infer<typeof FinalReportSchema>; // CORRECTED: Added the export for the final type

// ==================================================================
// Schema for the NEW Liquidity Predictor Agent
// ==================================================================
export const LiquidityReportSchema = z.object({
  liquidity_score: z.number().min(1).max(10).describe("A 1-10 score for the domain's market velocity and desirability."),
  liquidity_reasoning: z.string().describe("A brief explanation for the prediction, citing patterns from its live research."),
  market_activity_summary: z.string().describe("A summary of recent sales, listings, or discussions found for similar domains."),
});

export type LiquidityReport = z.infer<typeof LiquidityReportSchema>;

export const CompsReportSchema = z.object({
  comparable_sales: z.array(z.object({
    domain: z.string().describe("The comparable domain that was sold."),
    price_usd: z.number().describe("The sale price in USD. MUST be a number."),
    date: z.string().describe("The date of the sale in YYYY-MM format."),
  })).describe("An array of the 3 most relevant comparable sales found."),
  analysis_summary: z.string().describe("A one-sentence summary explaining why these comps were chosen and what they indicate about the target domain's value."),
});

export type CompsReport = z.infer<typeof CompsReportSchema>;