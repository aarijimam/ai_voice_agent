import { SessionManager } from "./memory/session.js";
import * as fs from "fs";
import { detectIntent } from "./intents/detector.js";
import { handleIntent } from "./intents/handler.js";
import { textToSpeech } from "./pipeline/tts.js";
import { transcribeAudio } from "./pipeline/stt.js";
import { recordAudio } from "./pipeline/audio.js";
import type { IntentResult } from "./intents/types.js";

interface ProcessTextOptions {
  speak?: boolean;
  outputFilePath?: string;
}

export class Agent {
  private session: SessionManager;

  constructor() {
    this.session = new SessionManager();
  }
  

async processMicInput(durationSeconds = 5): Promise<IntentResult> {
    console.log(`[AGENT] Listening for ${durationSeconds}s...`);
    const audioPath = await recordAudio(durationSeconds);
    return this.processAudioFile(audioPath);
  }

  async processAudioFile(audioFilePath: string): Promise<IntentResult> {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(
        `Critical Failure: Audio file not found at ${audioFilePath}`,
      );
    } else {
        console.log(`Audio file found at ${audioFilePath}, proceeding with processing.`);
        const transcript = await transcribeAudio(audioFilePath);
        console.log("Transcribed Text:", transcript);
        return this.processTextMessage(transcript);
    }
  }

    async processTextMessage(text: string, options: ProcessTextOptions = {}): Promise<IntentResult> {

      const { speak = true, outputFilePath = `./output/response_${Date.now()}.wav` } = options;

        this. session.addMessage("user", text);

        const messages = this.session.getMessages();
        console.log("Current session messages:", messages);
        
        const intentResult = await detectIntent(messages);
        
        if (intentResult.customerName) {
            this.session.updateCustomerName(intentResult.customerName);
        }
        
        const assistantMessage = intentResult.llm_response;
        await handleIntent(intentResult, text); // This will do any processing needed based on the intent.
        if (intentResult.intent !== "unknown") {
            this.session.addMessage("assistant", assistantMessage);
        }

          await textToSpeech(assistantMessage, outputFilePath, speak);
         return intentResult;
        
  }


  endSession() {
    this.session.endSession();
  }
}
