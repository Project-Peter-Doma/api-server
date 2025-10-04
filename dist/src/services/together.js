// src/services/together.ts
import Together from "together-ai";
import { zodToJsonSchema } from "zod-to-json-schema";
import 'dotenv/config';
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
const JSON_ENFORCER_PROMPT = `
IMPORTANT: You MUST respond ONLY with a valid JSON object that strictly adheres to the provided JSON schema. Do not include any explanatory text, markdown formatting, or anything outside of the JSON structure.
`;
// Helper function to handle the core LLM call and error checking
async function makeStructuredApiCall(model, userPrompt, schema, systemPrompt) {
    const finalSystemPrompt = `${systemPrompt}\n\n${JSON_ENFORCER_PROMPT}`;
    const jsonSchema = zodToJsonSchema(schema, "mySchema");
    const response = await together.chat.completions.create({
        model,
        messages: [
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: {
            type: "json_object",
            // @ts-ignore
            schema: jsonSchema,
        },
        temperature: 0.2,
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("LLM response content is empty or undefined.");
    }
    try {
        const parsedJson = JSON.parse(content);
        return schema.parse(parsedJson);
    }
    catch (error) {
        console.error("Failed to parse or validate LLM JSON response:", error);
        console.error("Raw LLM content:", content);
        throw new Error("LLM returned invalid JSON.");
    }
}
/**
 * TIER 1: Fast & Cheap Analysis for data-specific agents.
 */
export async function jsonLLM_fast(userPrompt, schema, systemPrompt) {
    console.log('Initiating Together AI (Fast) structured call...');
    // CORRECTED MODEL: Switched to a powerful, serverless model.
    const model = "meta-llama/Llama-3-70b-chat-hf";
    return makeStructuredApiCall(model, userPrompt, schema, systemPrompt);
}
/**
 * TIER 3: Formatter for unstructured research output.
 */
export async function jsonLLM_formatter(unstructuredText, schema, systemPrompt) {
    console.log('Initiating Together AI (Formatter) structured call...');
    const model = "meta-llama/Llama-3-70b-chat-hf"; // Using a strong model for formatting too.
    const userPrompt = `Here is a block of unstructured text. Extract the key information and format it into the required JSON object.\n\nTEXT:\n"""\n${unstructuredText}\n"""`;
    return makeStructuredApiCall(model, userPrompt, schema, systemPrompt);
}
/**
 * TIER 4: Final Aggregator for synthesizing all agent reports.
 */
export async function jsonLLM_aggregator(userPrompt, schema, systemPrompt) {
    console.log('Initiating Together AI (Aggregator) structured call...');
    const model = "meta-llama/Llama-3-70b-chat-hf"; // Using the same powerful model for all tasks for consistency.
    return makeStructuredApiCall(model, userPrompt, schema, systemPrompt);
}
