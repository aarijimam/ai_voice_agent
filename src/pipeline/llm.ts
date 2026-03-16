import ollama from 'ollama'
import { startTimer } from '../utils/logger.js';
import type {Message} from '../intents/types.js';
import { config } from '../utils/config.js';
import { GoogleGenAI } from "@google/genai";
import { debugLog } from '../utils/debug.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';


//queries the local llm provider (ollama) or Gemini based on config. Returns the raw text response from the model.
export async function queryLLM(messages: Message[], schema?: z.ZodTypeAny): Promise<string> {
    if (config.llm.provider === "gemini") {
        return queryGemini(messages);
    }

    const timer = startTimer("LLM Timer");
    const response = await ollama.chat({
      model: config.ollama.model,
      options: config.ollama.options,
      messages,
      ...(schema ? { format: zodToJsonSchema(schema) } : {}),
    });
    const elapsed = timer.end();
    debugLog(`LLM process has been running for ${elapsed} milliseconds.`);
    return response.message.content;
}



//This code below is AI generated

function getGeminiClient(): GoogleGenAI {
  const apiKey = config.gemini.apiKey?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is required when llm.provider is set to 'gemini'.",
    );
  }

  return new GoogleGenAI({ apiKey });
}

export async function queryGemini(messages: Message[]): Promise<string> {
  const ai = getGeminiClient();
  const timer = startTimer("Gemini Timer");
  const lastUserMessageIndex = [...messages]
    .reverse()
    .findIndex((message) => message.role === "user");

  const userMessageIndex =
    lastUserMessageIndex === -1
      ? messages.length - 1
      : messages.length - 1 - lastUserMessageIndex;

  const history = messages.slice(0, Math.max(0, userMessageIndex)).map((message) => ({
    // Gemini SDK expects "model/user" role style, so assistant gets mapped to model.
    role: message.role === "assistant" ? "model" : "user",
    parts: [
      {
        text:
          // Keep system text in history by wrapping it as explicit instruction text.
          message.role === "system"
            ? `[SYSTEM INSTRUCTION]\n${message.content}`
            : message.content,
      },
    ],
  }));

  const chat = ai.chats.create({
    model: config.gemini.model,
    history,
  });

  const latestUserMessage = messages[userMessageIndex]?.content ?? "";
  const response = await chat.sendMessage({
    message: latestUserMessage,
  });

  const elapsed = timer.end();
  debugLog(`Gemini process has been running for ${elapsed} milliseconds.`);
  return response.text ? response.text : "Sorry, I couldn't generate a response.";
}
