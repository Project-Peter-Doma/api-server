// src/services/perplexity.ts
import Perplexity from '@perplexity-ai/perplexity_ai';
import 'dotenv/config';
const perplexity = new Perplexity({ apiKey: process.env.PERPLEXITY_API_KEY });
/**
 * TIER 2: Performs a deep research task using Perplexity's `sonar-deep-research` model.
 */
export async function runDeepResearch(researchPrompt) {
    console.log('Initiating Perplexity AI deep research call...');
    try {
        const response = await perplexity.chat.completions.create({
            model: "sonar-deep-research",
            messages: [
                {
                    role: "system",
                    content: "You are an expert market research analyst. Your goal is to conduct thorough web research based on the user's request and provide a detailed, well-structured text report. Focus on finding verifiable facts, figures, and recent news.",
                },
                {
                    role: "user",
                    content: researchPrompt,
                },
            ],
        });
        // CORRECTED ERROR HANDLING: Strict checks for content existence and type
        const message = response.choices?.[0]?.message;
        if (!message || !message.content) {
            throw new Error("Perplexity response content is empty or undefined.");
        }
        if (typeof message.content !== 'string') {
            console.warn("Perplexity returned non-string content. Returning empty string.");
            // In a real app, you might want to process the array of chunks, but for now we expect a string.
            return "";
        }
        console.log('Received deep research report from Perplexity AI.');
        return message.content;
    }
    catch (error) {
        console.error("Error during Perplexity AI research call:", error);
        throw new Error("Failed to get a valid research response from Perplexity.");
    }
}
