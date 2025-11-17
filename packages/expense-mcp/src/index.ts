import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { config } from "./config.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { expenseTools, handleToolCall } from "./tools/expenseTools.js";
import { ExpenseApiClient } from "./client/expenseClient.js";

const client = new ExpenseApiClient();

/**
 * Create and Configure MCP Server
 */
const server = new Server(
  {
    name: config.serverName,
    version: config.serverVersion,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
);

/**
 * Handlers for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: expenseTools,
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await handleToolCall(name, args);
});

/**
 * Handler for listing resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "expense://expenses",
        name: "Expense Details",
        description: "Expense details for user",
        mimeType: "application/json",
      },
      {
        uri: "expense://categories",
        name: "Expense Categories",
        description: "Expense categories for user",
        mimeType: "application/json",
      },
      {
        uri: "expense://Create",
        name: "Create Expense",
        description: "Create a new expense",
        mimeType: "application/json",
      },
    ],
  };
});

/**
 * Handler for reading resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  if (uri === "expense://expenses") {
    const expenses = await client.getAllExpenses();
    return {
      contents: [
        {
          uri: uri,
          mimeType: "application/json",
          text: JSON.stringify(expenses, null, 2),
        },
      ],
    };
  }
  throw new Error(`Resource not found: ${uri}`);
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Expense MCP Server running on Stdio");
}

main().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
