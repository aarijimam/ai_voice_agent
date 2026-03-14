import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { Agent } from "./agent.js";
import path from "path";
import fs from "fs/promises";
import { convertToWav } from "./pipeline/audio.js";
import { transcribeAudio } from "./pipeline/stt.js";

type ChatRequest = { message?: string };
type CallRequest = {
  audioBase64?: string;
  mimeType?: string;
};

const agent = new Agent();
const PORT = Number(process.env.PORT ?? 3000);
const publicDir = path.resolve(process.cwd(), "public");

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readJsonBody(req: IncomingMessage): Promise<ChatRequest> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  const text = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(text) as ChatRequest;
}

function mimeTypeToExtension(mimeType?: string): string {
  if (!mimeType) return "webm";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

async function serveFile(res: ServerResponse, requestedPath: string) {
  const fullPath = path.join(publicDir, requestedPath === "/" ? "index.html" : requestedPath.slice(1));
  try {
    const file = await fs.readFile(fullPath);
    const ext = path.extname(fullPath);
    const contentType =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".css"
          ? "text/css; charset=utf-8"
          : ext === ".js"
            ? "text/javascript; charset=utf-8"
            : "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const reqUrl = req.url ?? "/";

  if (req.method === "GET" && reqUrl === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && reqUrl === "/api/chat") {
    try {
      const body = await readJsonBody(req);
      const message = body.message?.trim();

      if (!message) {
        sendJson(res, 400, { error: "message is required" });
        return;
      }

      const result = await agent.processTextMessage(message);
      sendJson(res, 200, {
        reply: result.llm_response,
        intent: result.intent,
        confidence: result.confidence,
        customerName: result.customerName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown server error";
      sendJson(res, 500, { error: message });
    }
    return;
  }

  if (req.method === "POST" && reqUrl === "/api/call") {
    let inputPath = "";
    let wavPath = "";
    let responseAudioPath = "";

    try {
      const body = (await readJsonBody(req)) as CallRequest;
      const audioBase64 = body.audioBase64?.trim();

      if (!audioBase64) {
        sendJson(res, 400, { error: "audioBase64 is required" });
        return;
      }

      const ext = mimeTypeToExtension(body.mimeType);
      const stamp = Date.now();
      const tempDir = path.resolve(process.cwd(), "audio", "temp", "web");
      const outputDir = path.resolve(process.cwd(), "output");

      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(outputDir, { recursive: true });

      inputPath = path.join(tempDir, `incoming_${stamp}.${ext}`);
      const rawBuffer = Buffer.from(audioBase64, "base64");
      await fs.writeFile(inputPath, rawBuffer);

      wavPath = ext === "wav" ? inputPath : convertToWav(inputPath);
      const transcript = await transcribeAudio(wavPath);

      responseAudioPath = path.join(outputDir, `web_response_${stamp}.aiff`);
      const result = await agent.processTextMessage(transcript, {
        speak: false,
        outputFilePath: responseAudioPath,
      });

      const replyAudioBuffer = await fs.readFile(responseAudioPath);
      sendJson(res, 200, {
        transcript,
        reply: result.llm_response,
        intent: result.intent,
        confidence: result.confidence,
        customerName: result.customerName,
        audioBase64: replyAudioBuffer.toString("base64"),
        audioMimeType: "audio/aiff",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown server error";
      sendJson(res, 500, { error: message });
    } finally {
      const cleanupPaths = [inputPath, wavPath];
      for (const filePath of cleanupPaths) {
        if (!filePath) continue;
        try {
          await fs.unlink(filePath);
        } catch {
        }
      }
    }
    return;
  }

  if (req.method === "GET") {
    await serveFile(res, reqUrl);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Web UI running at http://localhost:${PORT}`);
});
