import { fileURLToPath } from "url";
import { Agent } from "./agent.js";
import readline from "readline";
import path from 'path'
import { config } from "./utils/config.js";
import { randomUUID } from "node:crypto";



// CLI entrypoint: asks user identity, then starts command loop.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let agent: Agent;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Insurance Voice Agent");
console.log(`Current language: ${config.whisper.language}`);
console.log("Commands: [r] record <seconds> | [f] <filepath> | [l] language <en|de> | [q] quit\n");

function questionAsync(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

function normalizePhoneNumber(raw: string): string | null {
  // Light E.164 style normalization so one phone always maps to one memory key.
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const compact = trimmed.replace(/[\s\-().]/g, "");
  const e164Candidate = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;

  if (!/^\+?[1-9]\d{7,14}$/.test(e164Candidate)) {
    return null;
  }

  return e164Candidate.startsWith("+") ? e164Candidate : `+${e164Candidate}`;
}

async function initializeAgentWithUserKey(): Promise<void> {
  // In real call-center flow this would come from caller id, here we ask manually.
  const phoneInput = await questionAsync("Enter phone number for testing (optional): ");
  const normalizedPhone = normalizePhoneNumber(phoneInput);
  const userKey = normalizedPhone ? `phone:${normalizedPhone}` : `anonymous:${randomUUID()}`;

  if (normalizedPhone) {
    console.log(`Using user key: ${userKey}`);
  } else {
    console.log(`No valid phone provided. Using temporary key: ${userKey}`);
  }

  agent = new Agent(userKey);
}

function prompt() {
  // Recursive prompt loop so app keeps running until explicit quit.
  rl.question("> ", async (input) => {
    const [cmd, ...args] = input.trim().split(" ");

    switch (cmd) {
      case "r":
        // Record from microphone for N seconds, default is 5.
        try{
          await agent.processMicInput(args[0] ? parseInt(args[0], 10) : 5);
        }catch(error){
          console.error("Error during microphone input processing, make sure you are using correct command format (r <seconds>) and that your microphone is working properly.", error);
        }
        break;
      case "f":
        // Resolve input from local audio folder for easy testing.
        try{
          await agent.processAudioFile(args[0] ?  path.resolve(__dirname, `../audio/${args[0]}`) : "./audio/default.wav");
        }catch(error){
          console.error("Error during audio file processing, make sure the file path is correct and the file exists.", error);
        }
        break;
      case "l":
      case "language": {
        // Changes both STT language and mapped TTS voice.
        const lang = args[0];
        if (lang !== "en" && lang !== "de") {
          console.log("Usage: l <en|de>");
          break;
        }

        config.setLanguage(lang);
        console.log(`Language switched to: ${config.whisper.language} (voice: ${config.tts.voice})`);
        break;
      }
      case "q":
        await agent.endSession();
        rl.close();
        return;
      default:
        console.log("Unknown command");
    }

    prompt();
  });
}

initializeAgentWithUserKey()
  .then(() => prompt())
  .catch((error) => {
    console.error("Failed to initialize user identity for session.", error);
    rl.close();
  });
