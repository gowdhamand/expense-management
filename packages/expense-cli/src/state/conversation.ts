import { ConversationMessage, ConversationState } from "../types.js";
import { config } from "../config.js";
import { existsSync } from "node:fs";
import path from "path";
import fs from "fs/promises";

export class ConversationStateManager {
  private state: ConversationState | null = null;
  private stateFile: string;

  constructor(stateFile: string = config.conversationStateFile) {
    this.stateFile = stateFile;
  }

  /**
   * Load conversation state from disk
   */
  async Load(): Promise<ConversationState> {
    if (existsSync(this.stateFile)) {
      try {
        const data = await fs.readFile(this.stateFile, "utf8");
        this.state = JSON.parse(data);
        if (config.debug) {
          console.log(
            `[State] Loaded existing conversation with ${this.state?.messages.length || 0} messages`,
          );
        }
        return this.state!;
      } catch (err) {
        console.error(
          `Failed to load conversation state from ${this.stateFile}: ${err}`,
        );
        const newSate: ConversationState = {
          messages: [],
          sessionId: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.state = newSate;
        return newSate;
      }
    }
    const newSate: ConversationState = {
      messages: [],
      sessionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state = newSate;
    if (config.debug) {
      console.log("[State] Created new conversation state");
    }
    return newSate;
  }

  /**
   * Save converation state to disk
   */
  async save(state: ConversationState): Promise<void> {
    this.state = state;
    const dir = path.dirname(this.stateFile);

    //ensure directory exists
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(
      this.stateFile,
      JSON.stringify(this.state, null, 2),
      "utf-8",
    );

    if (config.debug) {
      console.log(
        `[State] Saved conversation state with ${this.state.messages.length} messages to ${this.stateFile}`,
      );
    }
  }

  /**
   * Add a message to the conversation state
   */
  async addMessage(role: "user" | "assistant", content: string): Promise<void> {
    if (!this.state) {
      await this.Load();
    }

    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    this.state!.messages.push(message);
    this.state!.updatedAt = new Date().toISOString();

    if (config.debug) {
      console.log(
        `[State] Added ${role} message (total: ${this.state!.messages.length})`,
      );
    }

    await this.save(this.state!);
  }

  /**
   * Get all messages
   */
  getMessages(): ConversationMessage[] {
    return this.state?.messages || [];
  }

  /**
   * Clean Conversation
   */
  async clean(): Promise<void> {
    this.state = this.createNewState();
    await this.save(this.state);
    if (config.debug) {
      console.log("[State] Conversation history cleared");
    }
  }

  /**
   * Create a new Conversation state
   */
  private createNewState(): ConversationState {
    return {
      sessionId: this.generateSessionId(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a new Session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
}
