import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';
import type { IntentResult } from "./types.js";
import { buildAgentPrompt} from "../conversation/prompts.js";
import { repairJSON } from '../utils/json_repair.js';
import type { Session } from "./types.js";
import { config } from "../utils/config.js";
import { debugLog } from "../utils/debug.js";


export async function detectIntent(message: Message[], session: Session): Promise<IntentResult> {
    // Prompt language follows current runtime language so STT/LLM/TTS stay aligned.
    const useGermanPrompt = config.whisper.language === "de";
    // System prompt is rebuilt each turn with session context.
    const messages:Message[] = [
        { role: "system", content: buildAgentPrompt(session, useGermanPrompt) },
        ...message
    ];
    debugLog("Detecting intent with messages:", messages);
    const response = await queryLLM(messages);
    try {
        // LLM can occasionally return malformed JSON, repairJSON handles common cases.
        debugLog("LLM Response for intent detection:", response);
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
        // Safe fallback keeps the call flow alive instead of crashing the turn.
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 , intentSwitch: false, abandonPrevious: false, customerName: null, llm_response: "Sorry, I couldn't understand that, can you please rephrase?"};
    }
}
