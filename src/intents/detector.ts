import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';
import type { IntentResult } from "./types.js";
import {AGENT_PROMPT} from "../conversation/prompts.js";


export async function detectIntent(message: Message[]): Promise<IntentResult> {
    const messages:Message[] = [
        { role: "system", content: AGENT_PROMPT },
        ...message
    ];
    const response = await queryLLM(messages);
    try {
        console.log("LLM Response for intent detection:", response);
        const parsed = JSON.parse(response);
        return { intent: parsed.intent, confidence: parsed.confidence, customerName: parsed.customerName !== 'null' ? parsed.customerName : null, llm_response: parsed.llm_response };
    } catch (error) {
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 , customerName: null, llm_response: "Sorry, I couldn't understand that, can you please rephrase?"};
    }
}
