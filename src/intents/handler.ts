import type {Intent} from "./types.js";

export async function handleIntent(intent: Intent) {
    switch (intent.type) {
        case "policy_enquiry":
            handlePolicyEnquiry(intent.confidence);
            break;

        case "report_claim":
            handleReportClaim(intent.confidence);
            break;
            
        case "schedule_appointment":
            handleScheduleAppointment(intent.confidence);
            break;

        case "general_conversation":
            handleGeneralConversation(intent.confidence);
            break;

        default:
            handleUnknownIntent(intent.confidence);
            break;
    }
}


function handlePolicyEnquiry(confidence: number) : string{
    console.log("Handling policy enquiry with confidence:", confidence);
    return "Policy enquiry handled";
}

function handleReportClaim(confidence: number) : string {
    console.log("Handling claim report with confidence:", confidence);
    return "Claim report handled";
}

function handleScheduleAppointment(confidence: number) : string {
    console.log("Handling appointment scheduling with confidence:", confidence);
    return "Appointment scheduled";
}

function handleUnknownIntent(confidence: number) : string {
    console.log("Handling unknown intent with confidence:", confidence);
    return "Unknown intent handled";
}

function handleGeneralConversation(confidence: number) : string {
    console.log("Handling general conversation with confidence:", confidence);
    return "General conversation handled";
}