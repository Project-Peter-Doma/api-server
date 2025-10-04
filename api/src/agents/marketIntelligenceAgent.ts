// src/agents/marketIntelligenceAgent.ts

import { runStreamingResearch } from '../services/perplexity.js';
import { runXSentimentAgent, XSentimentReport } from './xSentimentAgent.js';
import { jsonLLM_formatter } from '../services/together.js';
import { MarketIntelReportSchema, MarketIntelReport } from '../types/schemas.js';
import { z } from 'zod';
import zodToJsonSchema from "zod-to-json-schema";

// Helper function to find and parse a JSON block from a string
function extractAndParseJson(text: string): any {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
    const match = text.match(jsonRegex);
    if (!match) throw new Error("No valid JSON block found in the LLM response.");
    const jsonString = match[1] || match[2];
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON string:", jsonString);
        throw new Error("LLM returned a string that is not valid JSON.");
    }
}

export async function runMarketIntelligenceAgent(domain: string): Promise<MarketIntelReport | null> {
  console.log(`[Market Intel Agent] Starting analysis for ${domain}...`);

  const parts = domain.split('.');
  const keyword = parts.length > 1 ? parts.slice(0, -1).join('.') : parts[0];
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';

  // --- SEQUENTIAL STEP 1: Get X/Twitter Sentiment First ---
  // CORRECTED: Handle the case where the X agent might fail and return null.
  const xSentimentReport = await runXSentimentAgent(keyword, tld);
  if (!xSentimentReport) {
    console.error("[Market Intel Agent] Could not proceed without X Sentiment report.");
    return null;
  }

  // --- SEQUENTIAL STEP 2: Build the Enriched Perplexity Prompt ---
  // CORRECTED: Pass the entire structured xSentimentReport as a JSON string.
  const researchPrompt = `
    You are an elite market intelligence analyst with deep expertise in the crypto and Web3 ecosystems. Your mission is to conduct a deep investigation into the market viability of the domain "${domain}", using the provided real-time X/Twitter sentiment as a starting point.

    **STARTING CONTEXT (Real-time X/Twitter Sentiment Report):**
    """
    ${JSON.stringify(xSentimentReport, null, 2)}
    """

    **Your Expanded Research Mandate:**
    1.  **General Market & Financial Analysis:** Go beyond Twitter. Search financial news and crypto news for the keyword "${keyword}". Corroborate or contradict the Twitter sentiment with hard data.
    2.  **TLD Market Analysis:** Research the secondary market for the ".${tld}" TLD. Find at least two recent, high-value comparable sales from marketplaces like NameBio or DNJournal.
    3.  **Brand & Web Presence Analysis:** Analyze the brand potential of "${keyword}". Search for active companies with similar names. Determine if a website is active on "${domain}" and describe it.

    **Final Report Generation:**
    Synthesize all your findings (including the initial X sentiment) into a single, valid JSON object and nothing else. Adhere strictly to the provided schema. Include citations using [Source N].

    **JSON SCHEMA TO FOLLOW:**
    ${JSON.stringify(zodToJsonSchema(MarketIntelReportSchema), null, 2)}
  `;

  try {
    const rawReport = await runStreamingResearch(researchPrompt);
    if (!rawReport) throw new Error("Perplexity research returned no content.");
    
    console.log(`[Market Intel Agent] Received enriched report from Perplexity.`);

    const structuredReport = extractAndParseJson(rawReport);
    const validatedReport = MarketIntelReportSchema.parse(structuredReport);

    console.log(`[Market Intel Agent] Successfully generated final structured report for ${domain}.`);
    return validatedReport;

  } catch (error) {
    console.error(`[Market Intel Agent] Agent failed for ${domain}:`, error);
    return null;
  }
}