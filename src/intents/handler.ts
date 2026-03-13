import type {IntentResult} from "./types.js";

export async function handleIntent(intent: IntentResult, userMessage: string) {
    switch (intent.intent) {
        case "policy_enquiry":
            handlePolicyEnquiry(intent.confidence, userMessage);
            break;

        case "report_claim":
            handleReportClaim(intent.confidence, userMessage);
            break;
            
        case "schedule_appointment":
            handleScheduleAppointment(intent.confidence, userMessage);
            break;

        case "general_conversation":
            handleGeneralConversation(intent.confidence, userMessage);
            break;

        default:
            handleUnknownIntent(intent.confidence, userMessage);
            break;
    }
}


function handlePolicyEnquiry(confidence: number, userMessage: string) : string{
    console.log("Handling policy enquiry with confidence:", confidence);
    return "Policy enquiry handled";
}

function handleReportClaim(confidence: number, userMessage: string) : string {
    console.log("Handling claim report with confidence:", confidence);
    return "Claim report handled";
}

function handleScheduleAppointment(confidence: number, userMessage: string) : string {
    console.log("Handling appointment scheduling with confidence:", confidence);
    return "Appointment scheduled";
}

function handleUnknownIntent(confidence: number, userMessage: string) : string {
    console.log("Handling unknown intent with confidence:", confidence);
    return "Unknown intent handled";
}

function handleGeneralConversation(confidence: number, userMessage: string) : string {
    console.log("Handling general conversation with confidence:", confidence);
    return "General conversation handled";
}