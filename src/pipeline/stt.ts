import { nodewhisper } from 'nodejs-whisper';
import { startTimer } from '../utils/logger.js';
import * as fs from 'fs';
import { config } from '../utils/config.js';


export async function transcribeAudio(filePath: string): Promise<string> {
    const timer = startTimer("STT Timer");
    await nodewhisper(filePath, {
        modelName: config.whisper.model,
        autoDownloadModelName: config.whisper.model, // (optional) auto download a model if model is not present
        removeWavFileAfterTranscription: false, // (optional) remove wav file once transcribed
        withCuda: false, // (optional) use cuda for faster processing
        whisperOptions: {
            outputInCsv: false, // get output result in csv file
            outputInLrc: false, // get output result in lrc file
            outputInSrt: false, // get output result in srt file
            outputInText: true, // get output result in txt file
            outputInVtt: false, // get output result in vtt file
        },
    })
    
    const outputFilePath = `${filePath}.txt`;
    const transcriptVariable = fs.readFileSync(outputFilePath, 'utf8').trim();
    fs.unlinkSync(outputFilePath);

    const duration = timer.end();
    console.log(`STT process has been running for ${duration} milliseconds.`);
    return transcriptVariable;
}