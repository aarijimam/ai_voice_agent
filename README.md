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

## Simple frontend (call simulator)

This project includes a minimal call simulator UI in `public/index.html` served by `src/server.ts`.

### Run

```bash
npm install
npm run build
npm run start:web
```

Open `http://localhost:3000` in your browser.

### Notes

- Click **Start Recording**, speak, then click **Stop Recording**.
- The web UI sends recorded audio to `POST /api/call`.
- Backend pipeline: browser audio -> ffmpeg convert to wav -> STT -> intent/LLM -> TTS.
- The response audio is returned to the browser and played back automatically.
- `POST /api/chat` still exists for text-only testing.


