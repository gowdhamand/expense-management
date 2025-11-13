import "dotenv/config";
import { describe } from "node:test";

export const config = {
  expenseApiUrl: process.env.EXPENSE_API_URL || "http://localhost:3000",
  serverName: "expense-mcp-server",
  serverVersion: process.env.EXPENSE_MCP_VERSION || "1.0.0",
  description: process.env.EXPENSE_MCP_DESCRIPTION || "Expense Management API",
  capabilities: {
    tools: true,
    resources: true,
    prompts: true,
  },
};
