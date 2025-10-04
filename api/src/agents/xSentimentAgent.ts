// src/agents/xSentimentAgent.ts

import { runXResearch } from '../services/xai.js';
import { jsonLLM_formatter } from '../services/together.js';
import { z } from 'zod';

// Define a much richer schema for the output of this agent
export const XSentimentReportSchema = z.object({
  narrative_velocity_score: z.number().min(1).max(10).describe("A 1-10 score for how much 'hype' and recent engagement the topics have."),
  narrative_status: z.enum(["Emerging", "Popping Off", "Mature", "Fading", "Dormant"]).describe("The current lifecycle stage of the narrative."),
  recent_discussion_summary: z.string().describe("A summary of the most recent discussions (last 7-14 days)."),
  key_posts: z.array(z.object({
    handle: z.string().describe("The X handle of the influential account."),
    summary: z.string().describe("A brief summary of their post or opinion."),
    engagement_signal: z.string().describe("A qualitative note on its traction (e.g., 'High engagement', 'Many replies')."),
  })).describe("A list of 2-3 key posts from influential voices."),
  overall_sentiment: z.enum(["Bullish", "Bearish", "Neutral", "Mixed"]).describe("The overall tone of the discussion."),
});

export type XSentimentReport = z.infer<typeof XSentimentReportSchema>;


/**
 * The X Sentiment Agent.
 * Performs a deep dive into X/Twitter to analyze the velocity, influence,
 * and hype cycle of a given narrative.
 * @param keyword The keyword to research (e.g., "crypto").
 * @param tld The TLD to research (e.g., "ai").
 * @returns A promise that resolves to a structured XSentimentReport.
 */
export async function runXSentimentAgent(keyword: string, tld: string): Promise<XSentimentReport | null> {
  console.log(`[X Sentiment Agent] Starting narrative analysis for '${keyword}' and '.${tld}'...`);

  // This is the new, high-performance research prompt
  const researchPrompt = `
    Conduct a deep-dive analysis of the current narrative and sentiment on X/Twitter for the topics "${keyword}" and the ".${tld}" domain extension.
    Your goal is to act as a crypto narrative analyst and identify the "hype cycle."

    **Your Research Mandate:**
    1.  **Narrative Velocity:** Search for recent posts (last 14 days). Is the discussion volume increasing? Is this a new, "emerging" narrative or an established one that is "popping off" again?
    2.  **Traction & Engagement:** Identify 2-3 of the most influential or high-engagement posts related to these topics. Note their traction (e.g., "high replies," "widely reposted").
    3.  **Key Voices:** Are influential accounts (e.g., VCs, developers, large community figures) talking about this? Mention specific handles if you find them.
    4.  **Overall Sentiment:** Synthesize your findings to determine if the overall sentiment is bullish (hype, excitement), bearish (fear, criticism), or neutral.

    Provide a detailed text report summarizing all your findings.
  `;

  try {
    const unstructuredReport = await runXResearch(researchPrompt);
    
    // Now, we use a formatter LLM to structure this rich report
    const formatterSystemPrompt = `You are an expert synthesizer. Your task is to take the provided research report from X/Twitter and distill it into a structured JSON object according to the schema. Accurately capture the core findings.`;
    
    const structuredReport = await jsonLLM_formatter(
      unstructuredReport,
      XSentimentReportSchema,
      formatterSystemPrompt
    );
    
    console.log(`[X Sentiment Agent] Successfully generated structured sentiment report.`);
    return structuredReport;

  } catch (error) {
    console.error(`[X Sentiment Agent] Failed:`, error);
    return null;
  }
}