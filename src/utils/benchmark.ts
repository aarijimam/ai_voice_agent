import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type StageLatency = "stt" | "llm" | "tts";

export type LatencyBenchmarkRow = {
  timestamp: string;
  sessionId: string;
  userKey: string;
  inputSource: "mic" | "file";
  sttMs: number;
  llmMs: number;
  ttsMs: number;
  totalMs: number;
  status: "ok" | "error";
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LATENCY_CSV_PATH = resolve(__dirname, "../../data/benchmarks/latency.csv");
const CSV_HEADER =
  "timestamp,sessionId,userKey,inputSource,sttMs,llmMs,ttsMs,totalMs,status \n";

function ensureCsvExists(filePath: string): void {
  const folder = dirname(filePath);
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }

  if (!existsSync(filePath)) {
    writeFileSync(filePath, CSV_HEADER, "utf8");
  }
}

function toCsvValue(raw: string): string {
  // Escape double-quotes to keep csv valid when values contain punctuation.
  const value = raw.replace(/"/g, '""');
  return `"${value}"`;
}

export function appendLatencyBenchmark(row: LatencyBenchmarkRow): void {
  // One processed turn = one csv row.
  ensureCsvExists(LATENCY_CSV_PATH);

  const line = [
    toCsvValue(row.timestamp),
    toCsvValue(row.sessionId),
    toCsvValue(row.userKey),
    toCsvValue(row.inputSource),
    String(row.sttMs),
    String(row.llmMs),
    String(row.ttsMs),
    String(row.totalMs),
    toCsvValue(row.status),
  ].join(",");

  appendFileSync(LATENCY_CSV_PATH, `${line}\n`, "utf8");
}
