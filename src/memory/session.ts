import { randomUUID } from "node:crypto";
import type {Message, Session } from "../intents/types.js";
import { MemoryStore } from "./memory.js";
import { summarizeSessionHistory, SummaryStore } from "./summary.js";
import { debugLog } from "../utils/debug.js";


// This will manage the session for a single user. For multiple users, we can extend this to manage multiple sessions in a map or database.
export class SessionManager {
    private session: Session; // For more users, we can make this a map of sessionId to Session
    private readonly userKey: string;
    private readonly memoryStore: MemoryStore;
    private readonly summaryStore: SummaryStore;

    constructor(userKey: string) {
        this.userKey = userKey;
        this.memoryStore = new MemoryStore();
        this.summaryStore = new SummaryStore();
        // Load previous summaries here so a returning user gets context continuity.
        this.session = this.createSession(this.summaryStore.getAllSummariesAsContext(this.userKey));
    }

    createSession(previousSessionSummary: string | null = this.summaryStore.getAllSummariesAsContext(this.userKey)): Session {
        // Session starts clean for runtime history, but can still carry prior summary context.
        const session: Session = {
            sessionId: randomUUID(),
            userKey: this.userKey,
            previousSessionSummary,
            customerName: null,
            history: [],
            intent: "unknown",
            startedAt: new Date(),
            getCurrentIntent() {    
                return this.intent || "unknown";
            }
        };
        return session;
    }

    getSession(): Session | undefined {
        return this.session
    }

    addMessage(role: "user" | "assistant", content: string){
        const message: Message = { role, content };
        this.session.history.push(message);
    }

    updateIntent(intent: string) {
        this.session.intent = intent as Session["intent"]; 
    }

    updateCustomerName(name: string) {
        this.session.customerName = name;
    }

    getCustomerName(): string | null {
        return this.session.customerName || null;
    }

    getMessages(): Message[] {
        return this.session.history;
    }

    async endSession(): Promise<void> {
        debugLog(`[SESSION] Ending session for user: ${this.userKey}`);
        // Persist full raw session + condensed summary for future sessions.
        const summary = await summarizeSessionHistory(this.session.history);
        this.memoryStore.appendSession(this.session);
        this.summaryStore.appendSummary(this.session, summary);
        this.session = this.createSession();
    }   
}