export type IntentType = 
    | "policy_enquiry"
    | "report_claim"
    | "schedule_appointment"
    | "unknown";

export interface Intent {
    type: IntentType;
    confidence: number;
}

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}