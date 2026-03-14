import { randomUUID } from "node:crypto";
import type {Message, Session } from "../intents/types.js";


// This will manage the session for a single user. For multiple users, we can extend this to manage multiple sessions in a map or database.
export class SessionManager {
    private session: Session; // For more users, we can make this a map of sessionId to Session

    constructor() {
        this.session = this.createSession();
    }

    createSession(): Session {
        const session: Session = {
            sessionId: randomUUID(),
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

    endSession() {
        this.session = this.createSession();
    }   
}