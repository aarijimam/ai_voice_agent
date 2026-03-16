import type { UUID } from "node:crypto";
import { z } from "zod";

export const intentTypeSchema = z.enum([
    "policy_enquiry",
    "report_claim",
    "schedule_appointment",
    "general_conversation",
    "unknown",
]);

export type IntentType = z.infer<typeof intentTypeSchema>;

export const intentResultSchema = z
    .object({
        intent: intentTypeSchema,
        intentSwitch: z.boolean(),
        abandonPrevious: z.boolean(),
        confidence: z.number().min(0).max(1),
        customerName: z.string().trim().min(1).nullable(),
        llm_response: z.string().trim().min(1),
    })
    .strict();

export type IntentResult = z.infer<typeof intentResultSchema>;

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}


export interface Session {
    sessionId: UUID;
    userKey: string;
    previousSessionSummary: string | null;
    customerName?: string | null;
    history: Message[];
    intent: IntentType;
    startedAt: Date;

    getCurrentIntent(): IntentType;
}
