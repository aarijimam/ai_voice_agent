# ai_voice_agent

## Dependencies (temp)
- [nodejs-whisper](https://github.com/ChetanXpro/nodejs-whisper) – Node.js wrapper for Whisper
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) – (Optional, can be removed)
- Emscripten – (For building whisper.cpp, if needed)
- macOS say
- [ollama-js](https://github.com/ollama/ollama-js) - Ollama library for node
    - brew install ollama
    - ollama serve
    - ollama pull llama3.2:3b
- prompt-sync

## Gemini API key

When using Gemini (`llm.provider = "gemini"`), set the API key before running:

```bash
export GEMINI_API_KEY="your_api_key_here"
```


