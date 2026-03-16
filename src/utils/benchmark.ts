import {
  appendFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type StageLatency = "stt" | "llm" | "tts";

export type LatencyBenchmarkRow = {
  timestamp: string;
  sessionId: string;
  userKey: string;
  llmProvider: "ollama" | "gemini";
  llmModel: string;
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
const CSV_COLUMNS = [
  "timestamp",
  "sessionId",
  "userKey",
  "llmProvider",
  "llmModel",
  "inputSource",
  "sttMs",
  "llmMs",
  "ttsMs",
  "totalMs",
  "status",
] as const;
const CSV_HEADER = `${CSV_COLUMNS.join(",")}\n`;

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
  const value = raw.replace(/"/g, '""');
  return `"${value}"`;
}

export function appendLatencyBenchmark(row: LatencyBenchmarkRow): void {
  ensureCsvExists(LATENCY_CSV_PATH);

  const line = [
    toCsvValue(row.timestamp),
    toCsvValue(row.sessionId),
    toCsvValue(row.userKey),
    toCsvValue(row.llmProvider),
    toCsvValue(row.llmModel),
    toCsvValue(row.inputSource),
    String(row.sttMs),
    String(row.llmMs),
    String(row.ttsMs),
    String(row.totalMs),
    toCsvValue(row.status),
  ].join(",");

  appendFileSync(LATENCY_CSV_PATH, `${line}\n`, "utf8");
}
