// src/agents/liveMomentumAgent.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LiveMomentumReportSchema } from '../types/schemas.js';
import 'dotenv/config';
import axios from 'axios';

// --- REAL DATA IMPLEMENTATION (Defined ONCE) ---
async function getRecentDomaEvents(limit: number = 1000): Promise<any[]> {
    console.log(`[Momentum Agent] Fetching last ${limit} Doma events from live API...`);
    const endpoint = "https://api-testnet.doma.xyz/v1/poll";
    const headers = { "Api-Key": process.env.DOMA_API_KEY };
    try {
        const response = await axios.get(endpoint, { headers, params: { limit } });
        console.log(`[Momentum Agent] Successfully fetched ${response.data?.events?.length || 0} events.`);
        return response.data?.events || [];
    } catch (error) {
        console.error("[Momentum Agent] Failed to fetch Doma Poll API data:", error);
        return [];
    }
}

export async function runLiveMomentumAgent(tld: string): Promise<any | null> {
    console.log(`[Momentum Agent] Starting analysis for .${tld}...`);
    
    if (!process.env.GEMINI_API_KEY) {
        console.error("[Momentum Agent] GEMINI_API_KEY is not set.");
        return null;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const recentEvents = await getRecentDomaEvents();
    if (recentEvents.length === 0) {
        console.warn("[Momentum Agent] No recent events to analyze.");
        return null;
    }
    const eventDataString = JSON.stringify(recentEvents, null, 2);

    const prompt = `
        **ROLE:**
        You are a high-frequency market momentum analyst. Your task is to analyze a raw stream of recent blockchain events to calculate the current momentum for a specific Top-Level Domain (TLD).

        **CONTEXT (Live Event Stream):**
        Here is a JSON array of the most recent events from the Doma Protocol:
        \`\`\`json
        ${eventDataString}
        \`\`\`

        **TASK (The Analysis):**
        Analyze the provided event data. Focus *only* on events related to the **".${tld}" TLD**.
        1.  **Count Key Events:** Count the occurrences of 'NAME_TOKEN_SOLD', 'NAME_TOKEN_LISTED', 'NAME_TOKEN_TRANSFERRED', and 'NAME_TOKEN_MINTED' for the ".${tld}" TLD within the last 24 hours based on the event timestamps.
        2.  **Assess Velocity:** Compare the 24-hour activity to the overall activity in the dataset.
        3.  **Synthesize:** Based on this analysis, generate a structured JSON response.

        **CRITICAL INSTRUCTION: You MUST respond ONLY with a single, valid JSON object. The 'momentum_score' field MUST be an integer (a number without quotes). Do NOT output a string for the score.**

        **JSON SCHEMA TO FOLLOW:**
        \`\`\`json
        {
          "momentum_score": 100,
          "momentum_state": "'Accelerating' | 'Peaking' | 'Stable' | 'Cooling Down' | 'Dormant'",
          "reasoning": "A brief, data-driven explanation."
        }
        \`\`\`
    `;
    
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsedJson = JSON.parse(jsonMatch[0]);
            return LiveMomentumReportSchema.parse(parsedJson);
        } else {
            throw new Error("No JSON object found in Gemini response.");
        }
    } catch (error) {
        console.error("[Momentum Agent] Gemini API call or parsing failed:", error);
        return null;
    }
}

// CORRECTED: The duplicate function that was here has been removed.