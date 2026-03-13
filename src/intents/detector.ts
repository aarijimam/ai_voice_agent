import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';
import type { IntentResult } from "./types.js";
import { INTENT_CLASSIFIER_PROMPT, SYSTEM_PROMPT } from "../conversation/prompts.js";


export async function detectIntent(message: string): Promise<IntentResult> {
    const messages:Message[] = [
        { role: "system", content: INTENT_CLASSIFIER_PROMPT },
        {role: "system", content: SYSTEM_PROMPT},
        { role: "user", content: message }
    ];
    const response = await queryLLM(messages);
    try {
        console.log("LLM Response for intent detection:", response);
        const parsed = JSON.parse(response);
        return { intent: parsed.intent, confidence: parsed.confidence };
    } catch (error) {
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 };
    }
}
