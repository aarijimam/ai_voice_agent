import { SessionManager } from "./memory/session.js";
import * as fs from "fs";
import { detectIntent } from "./intents/detector.js";
import { handleIntent } from "./intents/handler.js";
import { textToSpeech } from "./pipeline/tts.js";
import { transcribeAudio } from "./pipeline/stt.js";
import { recordAudio } from "./pipeline/audio.js";
import { appendLatencyBenchmark, type StageLatency } from "./utils/benchmark.js";
import { debugLog } from "./utils/debug.js";

// Main runtime orchestrator for one active caller/user.
// This class handles the full turn pipeline STT -> intent/LLM -> TTS.
export class Agent {
  private session: SessionManager;
  // Stores timing for one processed turn so we can write one benchmark row at the end.
  private activeBenchmark: {
    inputSource: "mic" | "file";
    startedAt: number;
    stageLatency: Record<StageLatency, number>;
    status: "ok" | "error";
  } | null = null;

  constructor(userKey: string) {
    this.session = new SessionManager(userKey);
  }
  

async processMicInput(durationSeconds = 5): Promise<void> {
  // For microphone flow we record first, then reuse the same audio-file pipeline.
  console.log(`[AGENT] Listening for ${durationSeconds}s...`);
    const audioPath = await recordAudio(durationSeconds);
    await this.processAudioFile(audioPath, true, "mic");
  }

  private startBenchmark(inputSource: "mic" | "file"): void {
    this.activeBenchmark = {
      inputSource,
      startedAt: Date.now(),
      stageLatency: {
        stt: 0,
        llm: 0,
        tts: 0,
      },
      status: "ok",
    };
  }

  private markBenchmarkError(): void {
    if (this.activeBenchmark) {
      this.activeBenchmark.status = "error";
    }
  }

  private async timeStage<T>(
    stage: StageLatency,
    operation: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    const result = await operation();
    if (this.activeBenchmark) {
      this.activeBenchmark.stageLatency[stage] = Date.now() - start;
    }
    return result;
  }

  private flushBenchmark(): void {
    const benchmark = this.activeBenchmark;
    this.activeBenchmark = null;
    if (!benchmark) {
      return;
    }

    const session = this.session.getSession();
    appendLatencyBenchmark({
      timestamp: new Date().toISOString(),
      sessionId: session ? String(session.sessionId) : "unknown",
      userKey: session?.userKey ?? "unknown",
      inputSource: benchmark.inputSource,
      sttMs: benchmark.stageLatency.stt,
      llmMs: benchmark.stageLatency.llm,
      ttsMs: benchmark.stageLatency.tts,
      totalMs: Date.now() - benchmark.startedAt,
      status: benchmark.status,
    });
  }

  async processAudioFile(
    audioFilePath: string,
    shouldDelete: boolean = false,
    inputSource: "mic" | "file" = "file",
  ): Promise<void> {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(
        `Critical Failure: Audio file not found at ${audioFilePath}`,
      );
    }
    this.startBenchmark(inputSource);
    try{
    debugLog(`Audio file found at ${audioFilePath}, proceeding with processing.`);
    const transcript = await this.timeStage("stt", () => transcribeAudio(audioFilePath, shouldDelete));
    console.log("[STT] Transcribed Text:", transcript);
    if (!transcript || transcript.trim().length === 0) {
      debugLog("[STT] No valid transcript generated.");
        await this.timeStage("tts", () => textToSpeech("Sorry, I couldn't understand the audio. Can you please repeat?", `./output/error_response_${Date.now()}.wav`, true));
    } else {
        await this.processTextMessage(transcript);
    }
} catch (error) {
    this.markBenchmarkError();
    console.error("Error during audio processing:", error);
    await this.timeStage("tts", () => textToSpeech("Sorry, I couldn't understand the audio. Can you please repeat?", `./output/error_response_${Date.now()}.wav`, true));
} finally {
    this.flushBenchmark();
}
    
}


// Core turn processing for text input, shared by both mic and file-based flows. This is where intent detection and response generation happens.
  async processTextMessage(text: string): Promise<void> {

        this. session.addMessage("user", text);

        const messages = this.session.getMessages();
        debugLog("Current session messages:", messages);
        
        const intentResult = await this.timeStage(
          "llm",
          () => detectIntent(messages, this.session.getSession() ? this.session.getSession()! : this.session.createSession()),
        );
        
        if (intentResult.customerName) {
            this.session.updateCustomerName(intentResult.customerName);
        }

        if (intentResult.intentSwitch || (intentResult.intent !== "unknown" && intentResult.intent !== "general_conversation")) {
          this.session.updateIntent(intentResult.intent);
        }
        
        const assistantMessage = intentResult.llm_response;
        handleIntent(intentResult, text); // This will do any processing needed based on the intent.
        if (intentResult.intent !== "unknown") {
            debugLog(`Updating session intent to: ${intentResult.intent}`);
           this.session.updateIntent(intentResult.intent);
        }

        this.session.addMessage("assistant", assistantMessage);

        console.log("Assistant Message:", assistantMessage);
            await this.timeStage("tts", () => textToSpeech(assistantMessage, `./output/response_${Date.now()}.wav`, true));
        
  }


  async endSession(): Promise<void> {
    await this.session.endSession();
  }
}
