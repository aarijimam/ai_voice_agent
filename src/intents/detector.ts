import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';
import type { IntentResult } from "./types.js";
import { buildAgentPrompt} from "../conversation/prompts.js";
import { repairJSON } from '../utils/json_repair.js';
import type { Session } from "./types.js";
import { config } from "../utils/config.js";


export async function detectIntent(message: Message[], session: Session): Promise<IntentResult> {
    const useGermanPrompt = config.whisper.language === "de";
    const messages:Message[] = [
        { role: "system", content: buildAgentPrompt(session, useGermanPrompt) },
        ...message
    ];
    console.log("Detecting intent with messages:", messages);
    const response = await queryLLM(messages);
    try {
        console.log("LLM Response for intent detection:", response);
        const parsed = JSON.parse(repairJSON(response));
        const customerName = parsed.customerName && 
              parsed.customerName !== 'null' && 
              parsed.customerName.trim() !== '' 
              ? parsed.customerName.trim() 
              : null;
        return { 
            intent: parsed.intent,
             intentSwitch: parsed.intentSwitch,
              abandonPrevious: parsed.abandonPrevious,
               confidence: parsed.confidence, 
               customerName: customerName,
                llm_response: parsed.llm_response };

    } catch (error) {
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 , intentSwitch: false, abandonPrevious: false, customerName: null, llm_response: "Sorry, I couldn't understand that, can you please rephrase?"};
    }
}
