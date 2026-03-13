import { queryLLM } from "../pipeline/llm.js";
import type {Message} from './types.js';

const SYSTEM_PROMPT = `
You are an intent classifier for an insurance company voice agent.
Analyse the user message and respond ONLY with valid JSON in this format:
{
  "intent": "policy_enquiry" | "report_claim" | "schedule_appointment" | "unknown",
  "confidence": 0.0-1.0,
  "entities": {}
}

Intent definitions:
- policy_enquiry: customer asking about their policy status, coverage, or details
- report_claim: customer wants to report damage or file a claim
- schedule_appointment: customer wants to book or cancel an appointment
- unknown: anything else
`;


export async function detectIntent(message: string): Promise<{ intent: string, confidence: number }> {
    const messages:Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
    ];
    const response = await queryLLM(messages);
    try {
        const parsed = JSON.parse(response);
        return { intent: parsed.intent, confidence: parsed.confidence };
    } catch (error) {
        console.error("Failed to parse LLM response:", error);
        return { intent: "unknown", confidence: 0.0 };
    }
}
