import { SessionManager } from "./memory/session.js";
import * as fs from "fs";
import { detectIntent } from "./intents/detector.js";
import { handleIntent } from "./intents/handler.js";
import { textToSpeech } from "./pipeline/tts.js";

export class Agent {
  private session: SessionManager;

  constructor() {
    this.session = new SessionManager();
  }

  async processAudioFile(audioFilePath: string): Promise<void> {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(
        `Critical Failure: Audio file not found at ${audioFilePath}`,
      );
    }else{
        console.log(`Audio file found at ${audioFilePath}, proceeding with processing.`);
        this.processAudioFile(audioFilePath);
    }
}

  async processTextMessage(text: string): Promise<void> {
        this. session.addMessage("user", text);
        
        const intentResult = await detectIntent(text);
        
        if (intentResult.customerName) {
            this.session.updateCustomerName(intentResult.customerName);
        }
        
        console.log("Detected intent:", intentResult.intent);
        console.log("Confidence level:", intentResult.confidence);
        console.log("LLM Response:", intentResult.llm_response);

        handleIntent(intentResult, text); // This will do any processing needed based on the intent.

        const assistantMessage = intentResult.llm_response;
        this.session.addMessage("assistant", assistantMessage);

        await textToSpeech(assistantMessage, `./output/response_${Date.now()}.wav`, true);
  }


  endSession() {
    this.session.endSession();
  }
}
