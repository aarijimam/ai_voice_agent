import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';
import type { IntentResult } from "./types.js";
import { intentResultSchema } from "./types.js";
import { buildAgentPrompt} from "../conversation/prompts.js";
import { repairJSON } from '../utils/json_repair.js';
import type { Session } from "./types.js";
import { config } from "../utils/config.js";
import { debugLog } from "../utils/debug.js";


export async function detectIntent(message: Message[], session: Session): Promise<IntentResult> {
    const useGermanPrompt = config.whisper.language === "de";
    // System prompt is rebuilt each turn with session context.
    const messages:Message[] = [
        { role: "system", content: buildAgentPrompt(session, useGermanPrompt) },
        ...message
    ];
    debugLog("Detecting intent with messages:", messages);
    const response = await queryLLM(messages, intentResultSchema);
    try {
        // LLM can occasionally return malformed JSON, repairJSON handles common cases.
        debugLog("LLM Response for intent detection:", response);
        const rawParsed = JSON.parse(repairJSON(response));
        const normalized = {
            ...rawParsed,
            customerName:
              typeof rawParsed.customerName === "string" &&
              rawParsed.customerName.trim().toLowerCase() === "null"
                ? null
                : rawParsed.customerName,
        };
        return intentResultSchema.parse(normalized) as IntentResult;

    } catch (error) {
        // Safe fallback keeps the call flow alive instead of crashing the turn.
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 , intentSwitch: false, abandonPrevious: false, customerName: null, llm_response: "Sorry, I couldn't understand that, can you please rephrase?"};
    }
}
