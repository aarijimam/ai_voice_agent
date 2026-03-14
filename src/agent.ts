import { SessionManager } from "./memory/session.js";
import * as fs from "fs";
import { detectIntent } from "./intents/detector.js";
import { handleIntent } from "./intents/handler.js";
import { textToSpeech } from "./pipeline/tts.js";
import { transcribeAudio } from "./pipeline/stt.js";
import { recordAudio } from "./pipeline/audio.js";

export class Agent {
  private session: SessionManager;

  constructor(userKey: string) {
    this.session = new SessionManager(userKey);
  }
  

async processMicInput(durationSeconds = 5): Promise<void> {
    console.log(`[AGENT] Listening for ${durationSeconds}s...`);
    const audioPath = await recordAudio(durationSeconds);
    await this.processAudioFile(audioPath, true);
  }

  async processAudioFile(audioFilePath: string, shouldDelete: boolean = false): Promise<void> {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(
        `Critical Failure: Audio file not found at ${audioFilePath}`,
      );
    }
    try{
    console.log(`Audio file found at ${audioFilePath}, proceeding with processing.`);
    const transcript = await transcribeAudio(audioFilePath, shouldDelete);
    console.log("[STT] Transcribed Text:", transcript);
    if (!transcript || transcript.trim().length === 0) {
        console.log("[STT] No valid transcript generated.");
        await textToSpeech("Sorry, I couldn't understand the audio. Can you please repeat?", `./output/error_response_${Date.now()}.wav`, true);
    } else {
        await this.processTextMessage(transcript);
    }
} catch (error) {
    console.error("Error during audio processing:", error);
    await textToSpeech("Sorry, I couldn't understand the audio. Can you please repeat?", `./output/error_response_${Date.now()}.wav`, true);
}
    
}

  async processTextMessage(text: string): Promise<void> {

        this. session.addMessage("user", text);

        const messages = this.session.getMessages();
        console.log("Current session messages:", messages);
        
        const intentResult = await detectIntent(messages, this.session.getSession() ? this.session.getSession()! : this.session.createSession());
        
        if (intentResult.customerName) {
            this.session.updateCustomerName(intentResult.customerName);
        }

        if (intentResult.intentSwitch || (intentResult.intent !== "unknown" && intentResult.intent !== "general_conversation")) {
          this.session.updateIntent(intentResult.intent);
        }
        
        const assistantMessage = intentResult.llm_response;
        handleIntent(intentResult, text); // This will do any processing needed based on the intent.
        if (intentResult.intent !== "unknown") {
           console.log(`Updating session intent to: ${intentResult.intent}`);
           this.session.updateIntent(intentResult.intent);
        }

        this.session.addMessage("assistant", assistantMessage);

        console.log("Assistant Message:", assistantMessage);
         await textToSpeech(assistantMessage, `./output/response_${Date.now()}.wav`, true);
        
  }


  async endSession(): Promise<void> {
    await this.session.endSession();
  }
}
