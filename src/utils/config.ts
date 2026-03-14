export type LlmProvider = "local" | "gemini";
export type AgentLanguage = "en" | "de";

const whisperLanguage: AgentLanguage = "en";


export const config: AppConfig = {
  llm: {
    provider: "gemini",
  },
  whisper: {
    model: "medium",
    language: whisperLanguage,
  },
  ollama: {
    model: "mistral:7b",
    options: {
      temperature: 0.3,
      maxTokens: 1000,
    },
  },
  tts: {
    voice: getVoiceForLanguage(whisperLanguage),
  },
  gemini: {
    model: "gemini-3.1-flash-lite-preview",
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

