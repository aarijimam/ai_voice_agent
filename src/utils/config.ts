export type LlmProvider = "local" | "gemini";

export const config = {
  llm: {
    provider: "gemini" as LlmProvider,
  },
  whisper: {
    model: "medium",
    language: "de",
  },
  ollama: {
    model: "mistral:7b", 
    options: {
        temperature: 0.3,
        maxTokens: 1000,
    }
  },
  tts: {
    voice: "Samantha",
  }, 
  gemini: {
    model: "gemini-3.1-flash-lite-preview",
    apiKey: process.env.GEMINI_API_KEY ?? "",
  },

  audio: {
    sampleRate: 16000,
    channels: 1,
    tempDir: "audio/temp",
  }
} as const;