import * as fs from "node:fs";
import * as path from "node:path";
import type { IntentType, Message, Session } from "../intents/types.js";

interface PersistedSessionEntry {
	sessionId: string;
	customerName: string | null;
	history: Message[];
	intent: IntentType;
	startedAt: string;
	updatedAt: string;
}

interface UserMemoryFile {
	schemaVersion: 2;
	userKey: string;
	sessions: PersistedSessionEntry[];
}

export class MemoryStore {
	private readonly baseDir: string;

	constructor(baseDir: string = path.join(process.cwd(), "data", "memory")) {
		this.baseDir = baseDir;
		fs.mkdirSync(this.baseDir, { recursive: true });
	}

	loadSessions(userKey: string): PersistedSessionEntry[] {
		const filePath = this.getFilePath(userKey);
		if (!fs.existsSync(filePath)) {
			return [];
		}

		try {
			const raw = fs.readFileSync(filePath, "utf-8");
			const parsed: unknown = JSON.parse(raw);

			if (this.isValidUserMemoryFile(parsed, userKey)) {
				return parsed.sessions;
			}

			return [];
		} catch {
			return [];
		}
	}

	appendSession(session: Session): void {
		const filePath = this.getFilePath(session.userKey);
		// temp + rename pattern reduces risk of partial/corrupt write on crash.
		const tempPath = `${filePath}.tmp`;
		const existingSessions = this.loadSessions(session.userKey);

		const sessionEntry: PersistedSessionEntry = {
			sessionId: session.sessionId,
			customerName: session.customerName ?? null,
			history: session.history,
			intent: session.intent,
			startedAt: session.startedAt.toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const payload: UserMemoryFile = {
			schemaVersion: 2,
			userKey: session.userKey,
			sessions: [...existingSessions, sessionEntry],
		};

		fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), "utf-8");
		fs.renameSync(tempPath, filePath);
	}

	private getFilePath(userKey: string): string {
		return path.join(this.baseDir, `${this.toSafeFileName(userKey)}.json`);
	}

	private toSafeFileName(userKey: string): string {
		// user key can contain ':' or '+', convert to filesystem-safe form.
		return userKey.replace(/[^a-zA-Z0-9._-]/g, "_");
	}

	private isValidUserMemoryFile(parsed: unknown, userKey: string): parsed is UserMemoryFile {
		// Basic schema gate so unexpected file contents do not break runtime.
		if (!parsed || typeof parsed !== "object") {
			return false;
		}

		const candidate = parsed as Partial<UserMemoryFile>;

		if (candidate.schemaVersion !== 2) {
			return false;
		}

		if (candidate.userKey !== userKey) {
			return false;
		}

		if (!Array.isArray(candidate.sessions)) {
			return false;
		}

		return candidate.sessions.every((entry) => {
			return (
				typeof entry.sessionId === "string" &&
				typeof entry.intent === "string" &&
				typeof entry.startedAt === "string" &&
				typeof entry.updatedAt === "string" &&
				Array.isArray(entry.history)
			);
		});
	}

}
