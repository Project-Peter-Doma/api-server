// api/src/types/schemas.ts

import { z } from 'zod';

// --- Individual Agent Schemas ---

export const OnChainReportSchema = z.object({
  on_chain_health_score: z.number().min(0).max(10),
  on_chain_health_reasoning: z.string(),
  liquidity_score: z.number().min(0).max(10),
  liquidity_reasoning: z.string(),
});

export const Web2ReportSchema = z.object({
    seo_authority_score: z.number().min(0).max(10),
    seo_authority_reasoning: z.string(),
    traffic_score: z.number().min(0).max(10),
    traffic_reasoning: z.string(),
});

export const MarketIntelReportSchema = z.object({
    brandability_score: z.number().min(0).max(10),
    brandability_reasoning: z.string(),
    market_trend_score: z.number().min(0).max(10),
    market_trend_reasoning: z.string(),
    analyst_summary: z.string(),
});

export const LiveMomentumReportSchema = z.object({
  momentum_score: z.number().min(0).max(100),
  momentum_state: z.enum(["Accelerating", "Peaking", "Stable", "Cooling Down", "Dormant"]),
  reasoning: z.string(),
});

export const LiquidityReportSchema = z.object({
  liquidity_score: z.number().min(1).max(10).describe("Changed to liquidity_score for consistency"),
  liquidity_reasoning: z.string(),
  market_activity_summary: z.string(),
});

export const CompsReportSchema = z.object({
  comparable_sales: z.array(z.object({
    domain: z.string(),
    price_usd: z.number(),
    date: z.string(),
  })),
  analysis_summary: z.string(),
});

// --- Final Aggregated Schema ---

export const FinalReportSchema = z.object({
    domain_name: z.string(),
    peter_score: z.number().min(0).max(100),
    executive_summary: z.string(),
    scores: z.object({
        on_chain_health: z.number(),
        on_chain_liquidity: z.number(),
        seo_authority: z.number(),
        traffic: z.number(),
        brandability: z.number(),
        market_trend: z.number(),
        live_momentum: z.number(),
        predicted_liquidity: z.number(),
    }),
    deep_dive: z.object({
        on_chain_report: z.any(),
        web2_report: z.any(),
        market_intel_report: z.any(),
        momentum_report: z.any(),
        liquidity_report: z.any(),
        comps_report: z.any(),
    }),
});


// --- TypeScript Types ---

export type OnChainReport = z.infer<typeof OnChainReportSchema>;
export type Web2Report = z.infer<typeof Web2ReportSchema>;
export type MarketIntelReport = z.infer<typeof MarketIntelReportSchema>;
export type LiveMomentumReport = z.infer<typeof LiveMomentumReportSchema>;
export type LiquidityReport = z.infer<typeof LiquidityReportSchema>;
export type CompsReport = z.infer<typeof CompsReportSchema>;
export type FinalReport = z.infer<typeof FinalReportSchema>;
