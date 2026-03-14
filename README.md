# ai_voice_agent

TypeScript based AI voice agent for insurance support use cases.
This project runs as a CLI app and supports English and German.

## Tested on

- MacBook Pro with M1 Pro and 16 GB RAM
- macOS Tahoe 26.3
- Apple Silicon arm64

## What this agent does

- Accepts voice input from microphone or audio file
- Runs speech to text
- Detects intent with LLM and returns structured JSON
- Generates spoken response with text to speech
- Maintains session memory and customer context
- Saves session summaries for cross session continuity

## Main intents

- policy_enquiry
- report_claim
- schedule_appointment
- general_conversation
- unknown fallback

## Tech stack

- Node.js + TypeScript
- STT: nodejs-whisper with whisper.cpp
- LLM: Gemini API (default) or Ollama (local)
- TTS: macOS say
- Audio tools: sox and ffmpeg

## Install dependencies

Install system tools on macOS.

```bash
brew install ffmpeg sox
```

Install npm packages.

```bash
npm install
```

## Environment setup

If you use Gemini provider, set your API key.

```bash
export GEMINI_API_KEY="your_api_key_here"
```

## Model configuration

Model and provider settings are in src/utils/config.ts.

Default configuration uses Gemini.

```ts
llm: { provider: "gemini" }
gemini: { model: "gemini-3.1-flash-lite-preview" }
```

Local option uses Ollama.
If you switch provider to local, run Ollama with a model.

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

## Development

```bash
npm run dev
```

`npm run dev` runs with development logging enabled.

## CLI usage

When app starts it asks phone number.
If phone is valid it uses phone based user key.
If phone is not provided it uses anonymous UUID key.

Commands

- r <seconds>
    Record microphone audio and process it
- f <filename>
    Process audio file from audio folder
- l <en|de>
    Switch language and voice
- q
    End session and save memory plus summary

## Console output behavior

To reduce noise in normal runs, logging is split into two levels.

- Always shown in both `npm run start` and `npm run dev`:
    - Agent listening status
    - STT transcribed text
    - Assistant/LLM response text
- Only shown in `npm run dev`:
    - Internal debug logs (intent detection payloads, timing diagnostics, session debug details)

## Latency logging

The app logs timing in milliseconds for key steps and writes per-turn benchmark rows to CSV.

- CSV output file: `data/benchmarks/latency.csv`
- Columns: `timestamp, sessionId, userKey, inputSource, sttMs, llmMs, ttsMs, totalMs, status`
- STT timer
- LLM timer
- TTS timer

> **IMPORTANT:** `ttsMs` includes the full time for macOS `say` to finish speaking the complete sentence, and `totalMs` also includes that same full TTS playback duration.

> **NOTE:** When using local models (for example via Ollama and local Whisper execution), end-to-end latency is highly dependent on local model size, hardware, and current system load.

## Memory behavior

- Stores conversation history in current session
- Recalls customer name in later turns
- Clears runtime session on quit
- Persists session logs in data/memory
- Persists summarized context in data/summaries

## Notes

- This project is designed for Apple Silicon workflow
- macOS say is used for low latency local TTS
- Local LLM quality depends on RAM and model size

## Related docs

- docs/TECHNICAL_DOCUMENTATION.md
- docs/AI_USAGE.md



