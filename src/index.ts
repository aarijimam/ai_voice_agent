import { startTimer } from "./utils/logger.js";
import path from 'path'
import { fileURLToPath } from 'url';
import { nodewhisper } from 'nodejs-whisper'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const timer = startTimer("Random Loop Timer");


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __sampleAudioFilePath = path.resolve(__dirname, './audio/test_audio.wav');
// Need to provide exact path to your audio file.
const filePath = path.resolve(__dirname, '../audio/test_audio.wav')

await nodewhisper(filePath, {
	modelName: 'small.en', //Downloaded models name
	autoDownloadModelName: 'small.en', // (optional) auto download a model if model is not present
	removeWavFileAfterTranscription: false, // (optional) remove wav file once transcribed
	withCuda: false, // (optional) use cuda for faster processing
	logger: console, // (optional) Logging instance, defaults to console
	whisperOptions: {
		outputInCsv: false, // get output result in csv file
		outputInJson: false, // get output result in json file
		outputInJsonFull: false, // get output result in json file including more information
		outputInLrc: false, // get output result in lrc file
		outputInSrt: false, // get output result in srt file
		outputInText: true, // get output result in txt file
		outputInVtt: false, // get output result in vtt file
		outputInWords: false, // get output result in wts file for karaoke
		translateToEnglish: false, // translate from source language to english
		wordTimestamps: false, // word-level timestamps
		timestamps_length: 20, // amount of dialogue per timestamp pair
		splitOnWord: true, // split on word rather than on token
	},
})


timer.end();

console.log(`Random loop has been running for ${timer.end()} milliseconds.`);