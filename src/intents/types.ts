export type IntentType = 
    | "policy_enquiry"
    | "report_claim"
    | "schedule_appointment"
    | "general_conversation"
    | "unknown"
    ;

export interface IntentResult {
    intent: IntentType;
    confidence: number;
}

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}