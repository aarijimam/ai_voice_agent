import { startTimer } from "./utils/logger.js";
import path from 'path'
import { fileURLToPath } from 'url';
import { transcribeAudio } from "./pipeline/stt.js";


// This is a sample code to test the functionality of the STT pipeline using nodejs-whisper library.

// Get the current directory of the file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, '../audio/test_audio.wav')

// Transcribe the audio file and log the transcribed text and the time taken for the STT process.
let transcibedText: string = await transcribeAudio(filePath);

console.log("Transcribed Text:", transcibedText);

