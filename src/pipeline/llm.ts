import ollama from 'ollama'
import { startTimer } from '../utils/logger.js';


const SYSTEM_PROMPT = 'You are a helpful assistant. You are being provided a text transcribed from an audio file. Your job is to explain what the text means.';


export async function queryLLM(prompt: string): Promise<string> {
    const timer = startTimer("LLM Timer");
    const response = await ollama.chat({
        model: 'llama3.2:1b',
        messages: [
            { 
            role: 'system', content: SYSTEM_PROMPT },
             { role: 'user', content: prompt }
            ]
    })
    timer.end();
    console.log(`LLM process has been running for ${timer.end()} milliseconds.`);
    return response.message.content;
}
