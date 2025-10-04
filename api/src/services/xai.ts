// src/services/xai.ts

import axios from 'axios';
import 'dotenv/config';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.XAI_API_KEY; // Ensure XAI_API_KEY is in your .env

/**
 * Performs a deep research task on X using the xAI Grok API.
 * @param researchPrompt The specific research question for the model.
 * @returns A promise that resolves to the text-based report from Grok.
 */
export async function runXResearch(researchPrompt: string): Promise<string> {
  if (!API_KEY) {
    console.warn("[xAI Service] XAI_API_KEY not found. Skipping X research.");
    return "X/Twitter research could not be performed due to missing API key.";
  }

  console.log('[xAI Service] Initiating live X/Twitter research...');

  try {
    const response = await axios.post(
      XAI_API_URL,
      {
        messages: [
          {
            role: "system",
            content: "You are a crypto-native market analyst. Your task is to search X/Twitter to find the most relevant and recent discussions, sentiment, and news related to the user's query. Synthesize your findings into a concise, factual report.",
          },
          {
            role: "user",
            content: researchPrompt,
          },
        ],
        model: "grok-4", // Use the powerful Grok model
        search_parameters: {
          mode: "on", // Force the model to use search
          sources: [
            {
              type: "x",
              // We could add filters here later, like `post_view_count`
            }
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("xAI Grok response content is empty.");
    }
    
    console.log('[xAI Service] Successfully received X/Twitter research report.');
    return content;

  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error(`[xAI Service] Axios error: ${error.message}`);
        console.error("API Response Error:", error.response?.data);
    } else {
        console.error(`[xAI Service] An unexpected error occurred:`, error);
    }
    throw new Error("Failed to get a valid research response from xAI Grok API.");
  }
}