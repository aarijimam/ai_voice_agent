export type LlmProvider = "local" | "gemini";
export type AgentLanguage = "en" | "de";

// Single initial language source so whisper + voice always start in sync.
const whisperLanguage: AgentLanguage = "en";


export const config: AppConfig = {
  llm: {
    provider: "local", // Switches between local LLM (Ollama) and cloud LLM (Gemini). 
  },
  whisper: {
    model: "medium", // whisper model size for STT, can be "tiny", "base", "small", "medium", or "large". Larger models are more accurate but require more resources and time.
    language: whisperLanguage,
  },
  ollama: {
    model: "llama3.2:3b", // Ollama model name, make sure to have it pulled and available locally if using local LLM provider.
    options: {
      temperature: 0.3,
      maxTokens: 1000,
    },
  },
  tts: {
    voice: getVoiceForLanguage(whisperLanguage),
  },
  gemini: {
    model: "gemini-3.1-flash-lite-preview", // Gemini model, make sure to set up API key and permissions correctly if using Gemini provider.
    apiKey: process.env.GEMINI_API_KEY ?? "",
  },

  audio: {
    sampleRate: 16000,
    channels: 1,
    tempDir: "audio/temp",
  },

  setLanguage(lang: AgentLanguage): void {
    config.whisper.language = lang;
    config.tts.voice = getVoiceForLanguage(lang);
  },
};



function getVoiceForLanguage(lang: AgentLanguage): string {
  return lang === "de" ? "Anna" : "Samantha";
}

type AppConfig = {
  llm: {
    provider: LlmProvider;
  };
  whisper: {
    model: string;
    language: AgentLanguage;
  };
  ollama: {
    model: string;
    options: {
      temperature: number;
      maxTokens: number;
    };
  };
  tts: {
    voice: string;
  };
  gemini: {
    model: string;
    apiKey: string;
  };
  audio: {
    sampleRate: number;
    channels: number;
    tempDir: string;
  };
  setLanguage: (lang: AgentLanguage) => void;
};

