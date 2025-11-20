import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client(
  { name: "test-client", version: "1.0.0" },
  { capabilities: {} }
);

const transport = new StdioClientTransport({
  command: "node",
  args: ["../expense-mcp/dist/index.js"],
});

await client.connect(transport);
console.log("✓ Connected to MCP server");

const toolsResponse = await client.listTools();
console.log("\n=== MCP Tools ===");
console.log("Number of tools:", toolsResponse.tools.length);

toolsResponse.tools.forEach((tool, i) => {
  console.log(`\nTool ${i + 1}:`, tool.name);
  console.log("Description:", tool.description);
  console.log("Input Schema:", JSON.stringify(tool.inputSchema, null, 2));
});

// Test calling a tool
console.log("\n=== Testing list_expenses tool ===");
const result = await client.callTool({
  name: "list_expenses",
  arguments: {},
});
console.log("Result:", JSON.stringify(result, null, 2));

await client.close();
