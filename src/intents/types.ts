import type { UUID } from "node:crypto";
export type IntentType = 
    | "policy_enquiry"
    | "report_claim"
    | "schedule_appointment"
    | "general_conversation"
    | "unknown"
    ;

export interface IntentResult {
    intent: IntentType;
    intentSwitch: boolean;
    abandonPrevious: boolean;
    confidence: number;
    customerName: string | null;
    llm_response: string;
}

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}


export interface Session {
    sessionId: UUID;
    customerName?: string | null;
    history: Message[];
    intent: IntentType;
    startedAt: Date;

    getCurrentIntent(): IntentType;
}
