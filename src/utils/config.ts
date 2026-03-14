export const config = {
  whisper: {
    model: "small.en",
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

  audio: {
    sampleRate: 16000,
    channels: 1,
    tempDir: "audio/temp",
  }
} as const;