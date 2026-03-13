import { nodewhisper } from 'nodejs-whisper';
import { startTimer } from '../utils/logger.js';
import * as fs from 'fs';


export async function transcribeAudio(filePath: string): Promise<string> {
    const timer = startTimer("STT Timer");
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
    
    const outputFilePath = `${filePath}.txt`;
    const transcriptVariable = fs.readFileSync(outputFilePath, 'utf8').trim();
    fs.unlinkSync(outputFilePath);

    timer.end();
    console.log(`STT process has been running for ${timer.end()} milliseconds.`);
    return transcriptVariable;
}