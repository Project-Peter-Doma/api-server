// src/services/perplexity.ts

import Perplexity from '@perplexity-ai/perplexity_ai';
import 'dotenv/config';

const perplexity = new Perplexity({ apiKey: process.env.PERPLEXITY_API_KEY });

/**
 * TIER 2: Performs a research task using Perplexity's `sonar-reasoning-pro` model with streaming.
 * It accumulates the streamed response into a single text block.
 *
 * @param researchPrompt The detailed research task for the agent.
 * @returns A promise that resolves to the final, complete text-based research report.
 */
export async function runStreamingResearch(researchPrompt: string): Promise<string> {
  console.log('Initiating Perplexity AI streaming research call... (This may take a few seconds)');
  
  let fullContent = "";

  try {
    const stream = await perplexity.chat.completions.create({
      model: "sonar-reasoning-pro", // Using the specified reasoning model
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
      stream: true, // Enable streaming
    });

    // Process the stream and accumulate the content
    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const contentPiece = chunk.choices[0].delta.content;
        fullContent += contentPiece;
        // We can log progress here if needed, but for the agent we just need the final text.
        // process.stdout.write(contentPiece);
      }
    }
    
    if (fullContent.length === 0) {
        throw new Error("Perplexity stream completed but produced no content.");
    }

    console.log('Finished streaming research report from Perplexity AI.');
    return fullContent;

  } catch (error) {
    console.error("Error during Perplexity AI streaming research call:", error);
    throw new Error("Failed to get a valid research response from Perplexity via stream.");
  }
}