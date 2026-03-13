import ollama from 'ollama'
import { startTimer } from '../utils/logger.js';
import type {Message} from '../intents/types.js';

export async function queryLLM(messages: Message[]): Promise<string> {
    const timer = startTimer("LLM Timer");
    const response = await ollama.chat({
        model: 'llama3.2:3b',
        messages: messages
    })
    timer.end();
    console.log(`LLM process has been running for ${timer.end()} milliseconds.`);
    return response.message.content;
}
