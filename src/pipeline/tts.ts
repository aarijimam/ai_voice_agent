import {execSync} from 'child_process';
import { startTimer } from '../utils/logger.js';
import { config } from '../utils/config.js';
import { debugLog } from '../utils/debug.js';


export async function textToSpeech(text: string, outputFilePath: string, speak: boolean): Promise<void> {
    const timer = startTimer("TTS Timer");
    const safe = text.replace(/"/g, "'");
    if (speak) {
        execSync(`say -v ${config.tts.voice} "${safe}"`);
    }else{
        execSync(`say -v ${config.tts.voice} "${safe}" -o ${outputFilePath}`);
    }
    const duration = timer.end();
    debugLog(`TTS process has been running for ${duration} milliseconds.`);
}