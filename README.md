# ai_voice_agent


## Tested On:
- Macbook Pro with M1 PRO with 16 GB Ram - macOS Tahoe 26.3

## Dependencies (temp)
- [nodejs-whisper](https://github.com/ChetanXpro/nodejs-whisper) – Node.js wrapper for Whisper
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) – (Optional, can be removed)
- Emscripten – (For building whisper.cpp, if needed)
- macOS say
- [ollama-js](https://github.com/ollama/ollama-js) - Ollama library for node
    - brew install ollama
    - ollama serve
    - ollama pull mistral:7b
- prompt-sync


```bash
export GEMINI_API_KEY="your_api_key_here"
```
Install system tools on macOS:

```bash
brew install ffmpeg sox
```

## Install

```bash
npm install
```

## Configure models

Model/provider settings are in `src/utils/config.ts`.

Default setup uses Gemini:

```ts
llm: { provider: "gemini" }
gemini: { model: "gemini-3-flash-preview" }
```

If using Gemini, set your key before running:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

If you want local inference, switch `llm.provider` to `"local"`, then run Ollama:

```bash
brew install ollama
ollama serve
ollama pull mistral:7b
```

## Build

```bash
npm run build
```

## Start 

```bash
npm run start
```


## Usage 

- Record Audio 

```bash
r <seconds to record> 
```

- Use a prerecorded audio file

```bash
f <filename>
```

- Quir

```
q
```



