import path from 'path'
import { fileURLToPath } from 'url';
import { transcribeAudio } from "./pipeline/stt.js";
import { detectIntent } from "./intents/detector.js";
import { handleIntent } from './intents/handler.js';

let file: string | undefined = process.argv[2];
if (!file) {
    console.error("Please provide the audio file name as a command line argument.");
    process.exit(1);
}


// Get the current directory of the file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, `../audio/${file}`)

// Transcribe the audio file and log the transcribed text and the time taken for the STT process.
let transcibedText: string = await transcribeAudio(filePath);

console.log("Transcribed Text:", transcibedText);


let detectedIntent =  await detectIntent(transcibedText);

console.log("Detected Intent:", detectedIntent.intent);
console.log("Confidence Score:", detectedIntent.confidence);

await handleIntent(detectedIntent, transcibedText);