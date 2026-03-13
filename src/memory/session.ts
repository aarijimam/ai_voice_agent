import { randomUUID } from "node:crypto";
import type {Message, Session } from "../intents/types.js";

export class SessionManager {
    private session: Session;

    constructor() {
        this.session = this.createSession();
    }

    createSession(): Session {
        const session: Session = {
            sessionId: randomUUID(),
            customerName: null,
            history: [],
            startedAt: new Date()
        };
        return session;
    }

    getSession(sessionId: string): Session | undefined {
        return this.session
    }

    addMessage(role: "user" | "assistant", content: string){
        const message: Message = { role, content };
        this.session.history.push(message);
    }
}