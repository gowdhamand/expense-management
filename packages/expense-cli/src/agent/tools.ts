import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config.js";
import { MCPTool } from "../types.js";

export class MCPToolAdapter {
  private client: Client | null = null;
  private mcpTools: MCPTool[] = [];

  /**
   * Connect to MCP Server
   */
  async connect(): Promise<void> {
    this.client = new Client(
      {
        name: "expense-cli",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );

    const transport = new StdioClientTransport({
      command: "node",
      args: [config.mcpServerPath],
    });

    await this.client.connect(transport);

    //Fetch available tools
    const toolsResponse = await this.client.listTools();
    this.mcpTools = toolsResponse.tools as MCPTool[];
  }

  /**
   * convert MCP tools to langchain tools
   */
  getLangchainTools(): DynamicStructuredTool[] {
    return this.mcpTools.map((tool) => this.convertToLangchainTools(tool));
  }

  /**
   * Convert a single MCP tool to Langchain DynamicStructuredTool
   */
  private convertToLangchainTools(mcpTool: MCPTool): DynamicStructuredTool {
    const schema = this.createZodSchema(mcpTool.inputSchema);

    return new DynamicStructuredTool({
      name: mcpTool.name,
      description: mcpTool.description,
      schema,
      func: async (input) => {
        if (config.debug) {
          console.log(`\n[MCP] Calling tool: ${mcpTool.name}`);
          console.log(`[MCP] Input:`, JSON.stringify(input, null, 2));
        }

        const result = await this.client?.callTool({
          name: mcpTool.name,
          arguments: input,
        });

        if (config.debug) {
          console.log(`[MCP] Raw result:`, JSON.stringify(result, null, 2));
        }

        // MCP tools return: { content: [{ type: "text", text: "..." }], isError?: boolean }
        if (result?.content && Array.isArray(result.content)) {
          const textContent = result.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n");

          if (config.debug) {
            console.log(`[MCP] Extracted text:`, textContent.substring(0, 200));
          }

          return textContent || "No output";
        }

        return result?.output || JSON.stringify(result) || "No output";
      },
    });
  }

  private createZodSchema(inputSchema: any): z.ZodObject<any> {
    const shape: any = {};

    if (config.debug) {
      console.log(
        `[MCP] Creating schema for properties:`,
        Object.keys(inputSchema.properties || {}),
      );
    }

    for (const [key, value] of Object.entries(inputSchema.properties || {})) {
      const prop = value as any;
      const zodType = this.mapTypeToZod(prop);

      // Check if this property is required
      const isRequired = inputSchema.required?.includes(key);
      shape[key] = isRequired ? zodType : zodType.optional();
    }

    return z.object(shape);
  }

  /**
   * Map MCP type to Zod type
   */
  private mapTypeToZod(prop: any): z.ZodType<any> {
    switch (prop.type) {
      case "string":
        return z.string().describe(prop.description || "");
      case "number":
        return z.number().describe(prop.description || "");
      case "boolean":
        return z.boolean().describe(prop.description || "");
      case "array":
        return z.array(z.array(z.any()).describe(prop.description || ""));
      default:
        return z.any();
    }
  }

  /**
   * Close the MCP connection
   */
  async closeConnection(): Promise<void> {
    await this.client?.close();
    this.client = null;
  }
}
