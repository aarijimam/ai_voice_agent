import {execSync} from 'child_process';


export async function textToSpeech(text: string, outputFilePath: string): Promise<void> {
    const safe = text.replace(/"/g, "'");
    execSync(`say -v "Alex" "${safe}" -o ${outputFilePath}`);
}