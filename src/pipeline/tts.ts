import {execSync} from 'child_process';
import { startTimer } from '../utils/logger.js';


export async function textToSpeech(text: string, outputFilePath: string): Promise<void> {
    const timer = startTimer("TTS Timer");
    const safe = text.replace(/"/g, "'");
    execSync(`say -v Samantha "${safe}" -o ${outputFilePath}`);
    timer.end();
    console.log(`TTS process has been running for ${timer.end()} milliseconds.`);
}