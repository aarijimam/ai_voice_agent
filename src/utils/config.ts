export const config = {
  whisper: {
    model: "small.en",
  },
  ollama: {
    model: "llama3.2:3b"
  },
  tts: {
    voice: "Samantha",
  }
} as const;