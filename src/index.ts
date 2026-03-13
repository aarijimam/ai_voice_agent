import { startTimer } from "./utils/logger.js";
import path from 'path'
import { fileURLToPath } from 'url';
import { transcribeAudio } from "./pipeline/stt.js";

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __sampleAudioFilePath = path.resolve(__dirname, './audio/test_audio.wav');
// Need to provide exact path to your audio file.
const filePath = path.resolve(__dirname, '../audio/test_audio.wav')


let transcibedText: string = await transcribeAudio(filePath);

console.log("Transcribed Text:", transcibedText);

