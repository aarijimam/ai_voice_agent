import { queryLLM } from "../pipeline/llm.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import type {Message} from '../intents/types.js';


export async function handleGeneralChat(userMessage: string, conversationHistory?: Message[]): Promise<string> {
    const messages: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
    ];
    const response = await queryLLM(messages);
    return response;
}