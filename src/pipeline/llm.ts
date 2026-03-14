import ollama from 'ollama'
import { startTimer } from '../utils/logger.js';
import type {Message} from '../intents/types.js';
import { config } from '../utils/config.js';

export async function queryLLM(messages: Message[]): Promise<string> {
    const timer = startTimer("LLM Timer");
    const response = await ollama.chat({
        model: config.ollama.model,
        options: config.ollama.options,
        messages: messages
    })
    timer.end();
    console.log(`LLM process has been running for ${timer.end()} milliseconds.`);
    return response.message.content;
}

import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function queryGemini(messages: Message[]): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });

  console.log(response.text);
  return response.text ? response.text : "Sorry, I couldn't generate a response.";
}
