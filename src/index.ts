// import path from 'path'
// import { fileURLToPath } from 'url';
// import { transcribeAudio } from "./pipeline/stt.js";
// import { detectIntent } from "./intents/detector.js";
// import { handleIntent } from './intents/handler.js';
// import { textToSpeech } from './pipeline/tts.js';

// let file: string | undefined = process.argv[2];
// if (!file) {
//     console.error("Please provide the audio file name as a command line argument.");
//     process.exit(1);
// }


// // Get the current directory of the file
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const filePath = path.resolve(__dirname, `../audio/${file}`)

// // Transcribe the audio file and log the transcribed text and the time taken for the STT process.
// let transcibedText: string = await transcribeAudio(filePath);

// console.log("Transcribed Text:", transcibedText);


// let detectedIntent =  await detectIntent(transcibedText);

// console.log("Detected Intent:", detectedIntent.intent);
// console.log("Confidence Score:", detectedIntent.confidence);


// await textToSpeech(detectedIntent.llm_response, `./output/${path.parse(file).name}_response.wav`, true);
// // await handleIntent(detectedIntent, transcibedText);


import { fileURLToPath } from "url";
import { Agent } from "./agent.js";
import readline from "readline";
import path from 'path'



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const agent = new Agent();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Insurance Voice Agent");
console.log("Commands: [r] record <seconds> | [f] <filepath> | [q] quit\n");

function prompt() {
  rl.question("> ", async (input) => {
    const [cmd, ...args] = input.trim().split(" ");

    switch (cmd) {
      case "r":
        try{
          await agent.processMicInput(args[0] ? parseInt(args[0], 10) : 5);
        }catch(error){
          console.error("Error during microphone input processing, make sure you are using correct command format (r <seconds>) and that your microphone is working properly.");
        }
        break;
      case "f":
        try{
          await agent.processAudioFile(args[0] ?  path.resolve(__dirname, `../audio/${args[0]}`) : "./audio/default.wav");
        }catch(error){
          console.error("Error during audio file processing, make sure the file path is correct and the file exists.");
        }
        break;
      case "q":
        agent.endSession();
        rl.close();
        return;
      default:
        console.log("Unknown command");
    }

    prompt();
  });
}

prompt();
