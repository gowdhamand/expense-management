import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  //LLM Provider: 'openai' or 'ollama'
  llmProvider: process.env.LLM_PROVIDER || "ollama",

  //ollama
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama2",
  },

  //MCP Server
  mcpServerPath:
    process.env.MCP_SERVER_PATH || path.join(__dirname, "mcp-server"),

  //state management
  conversationStateFile: path.join(__dirname, "conversation-state.json"),

  //debug
  debug: process.env.DEBUG === "true",
};
