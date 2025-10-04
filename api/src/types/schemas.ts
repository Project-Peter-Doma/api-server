// api/src/types/schemas.ts

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

// We can add schemas for the other agents here as we build them
// export const LiveMomentumReportSchema = z.object({...});
// export const LiquidityReportSchema = z.object({...});
// export const CompsReportSchema = z.object({...});


// ==================================================================
// Schema for the FINAL Aggregated Output
// ==================================================================
export const FinalReportSchema = z.object({
    domain_name: z.string().describe("The domain name that was analyzed."),
    peter_score: z.number().min(0).max(100).describe("The final, synthesized score for the domain."),
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
        // The reports can be the actual agent output or a failure object
        on_chain_report: z.any(),
        web2_report: z.any(),
        market_intel_report: z.any(),
    }),
});


// ==================================================================
// TypeScript Types Inferred from Schemas
// ==================================================================

export type OnChainReport = z.infer<typeof OnChainReportSchema>;
export type Web2Report = z.infer<typeof Web2ReportSchema>;
export type MarketIntelReport = z.infer<typeof MarketIntelReportSchema>;
export type FinalReport = z.infer<typeof FinalReportSchema>;
