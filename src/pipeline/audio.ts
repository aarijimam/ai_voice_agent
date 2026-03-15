import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { config } from "../utils/config.js";

export async function recordAudio(durationSeconds: number): Promise<string> {
  // Records mono 16k wav because this is what STT path expects.
  const outputPath = path.resolve(config.audio.tempDir, `recording_${Date.now()}.wav`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  execFileSync("sox", [
    "-d",
    "-r",
    "16000",
    "-c",
    "1",
    outputPath,
    "trim",
    "0",
    String(durationSeconds),
  ]);

  return outputPath;
}

export function convertToWav(inputPath: string): string {
  // Standardize external audio files into same format used for microphone input.
  const outputPath = inputPath.replace(/\.[^.]+$/, "_converted.wav");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  execFileSync("ffmpeg", [
    "-i",
    inputPath,
    "-ar",
    "16000",
    "-ac",
    "1",
    outputPath,
    "-y",
  ]);

  return outputPath;
}