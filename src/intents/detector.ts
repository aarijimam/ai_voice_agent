import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';
import type { IntentResult } from "./types.js";
import {AGENT_PROMPT} from "../conversation/prompts.js";


export async function detectIntent(message: string): Promise<IntentResult> {
    const messages:Message[] = [
        { role: "system", content: AGENT_PROMPT },
        { role: "user", content: message }
    ];
    const response = await queryLLM(messages);
    try {
        console.log("LLM Response for intent detection:", response);
        const parsed = JSON.parse(response);
        return { intent: parsed.intent, confidence: parsed.confidence, llm_response: parsed.llm_response };
    } catch (error) {
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 , llm_response: "Sorry, I couldn't understand that, can you please rephrase?"};
    }
}
