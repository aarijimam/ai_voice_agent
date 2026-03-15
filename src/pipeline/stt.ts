import { nodewhisper } from 'nodejs-whisper';
import { startTimer } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { debugLog } from '../utils/debug.js';

// nodejs-whisper can be very noisy, keep only errors in normal flow.
const quietWhisperLogger = {
    debug: () => {},
    log: () => {},
    error: (...args: unknown[]) => console.error(...args),
};

function stripWhisperTimestamps(text: string): string {
    // Some outputs include [hh:mm:ss.mmm --> hh:mm:ss.mmm] markers, strip for cleaner LLM input.
    return text
        .replace(/^\s*\[\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\]\s*/gm, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
}


//transcribes audio at given path using whisper and returns the text. If shouldDelete is true, the original audio file will be deleted after transcription to save space.
export async function transcribeAudio(filePath: string, shouldDelete: boolean): Promise<string> {
    const timer = startTimer("STT Timer");
    const response = await nodewhisper(filePath, {
        modelName: config.whisper.model,
        autoDownloadModelName: config.whisper.model, // (optional) auto download a model if model is not present
        removeWavFileAfterTranscription: shouldDelete, // (optional) remove wav file once transcribed
        withCuda: false, // (optional) use cuda for faster processing
        whisperOptions: {
            language: config.whisper.language, // (optional) language of the audio, if not set, it will be auto-detected
            outputInCsv: false, // get output result in csv file
            outputInLrc: false, // get output result in lrc file
            outputInSrt: false, // get output result in srt file
            outputInText: false, // get output result in txt file
            outputInVtt: false, // get output result in vtt file
        },
        logger: quietWhisperLogger,
    })

    const cleanTranscript = stripWhisperTimestamps(response);
    debugLog("[STT] response:", cleanTranscript);
    
    const duration = timer.end();
    debugLog(`STT process has been running for ${duration} milliseconds.`);
    return cleanTranscript;
}