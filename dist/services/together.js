// src/services/together.ts
import Together from "together-ai";
// CORRECTED IMPORT (FAILSAFE): Use a dynamic require() for this problematic library.
// This forces Node to use its CommonJS module loader for this specific package.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const zodToJsonSchema = require("zod-to-json-schema");
import 'dotenv/config';
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
const JSON_ENFORCER_PROMPT = `
IMPORTANT: You MUST respond ONLY with a valid JSON object that strictly adheres to the provided JSON schema. Do not include any explanatory text, markdown formatting, or anything outside of the JSON structure.
`;
// Helper function to handle the core LLM call and error checking
async function makeStructuredApiCall(model, userPrompt, schema, systemPrompt) {
    const finalSystemPrompt = `${systemPrompt}\n\n${JSON_ENFORCER_PROMPT}`;
    // CORRECTED USAGE: We can now call it directly as it's correctly loaded.
    const jsonSchema = zodToJsonSchema(schema, "mySchema");
    const response = await together.chat.completions.create({
        model,
        messages: [
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: {
            type: "json_object",
            // @ts-ignore - The type is compatible but TS might complain. This is a known pattern.
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
    return makeStructuredApiCall("Qwen/Qwen2-7B-Instruct", userPrompt, schema, systemPrompt);
}
/**
 * TIER 3: Formatter for unstructured research output.
 */
export async function jsonLLM_formatter(unstructuredText, schema, systemPrompt) {
    console.log('Initiating Together AI (Formatter) structured call...');
    const userPrompt = `Here is a block of unstructured text. Extract the key information and format it into the required JSON object.\n\nTEXT:\n"""\n${unstructuredText}\n"""`;
    return makeStructuredApiCall("moonshotai/moonshot-v1-8k", userPrompt, schema, systemPrompt);
}
/**
 * TIER 4: Final Aggregator for synthesizing all agent reports.
 */
export async function jsonLLM_aggregator(userPrompt, schema, systemPrompt) {
    console.log('Initiating Together AI (Aggregator) structured call...');
    return makeStructuredApiCall("Qwen/Qwen1.5-72B-Chat", userPrompt, schema, systemPrompt);
}
//# sourceMappingURL=together.js.map