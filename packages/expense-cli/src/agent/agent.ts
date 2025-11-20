import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { config } from "../config.js";
import { ChatOllama } from "@langchain/ollama";
import { MCPToolAdapter } from "./tools.js";
import { ConversationStateManager } from "../state/conversation.js";
import { ConversationMessage } from "../types.js";
import { AIMessage, HumanMessage, SystemMessage } from "langchain";

export class ExpenseAgent {
  private llm: BaseChatModel;
  private llmWithTools: any = null;
  private mcpAdapter: MCPToolAdapter;
  private tools: any[] = [];
  private stateManager: ConversationStateManager;

  constructor() {
    //Initialize LLM based on Provider
    this.llm = this.initializeLLM();

    this.mcpAdapter = new MCPToolAdapter();
    this.stateManager = new ConversationStateManager();
  }

  private initializeLLM(): BaseChatModel {
    // Implement logic to initialize LLM based on provider
    if (config.llmProvider == "ollama") {
      if (config.debug) {
        console.log("Initializing Ollama LLM");
        console.log("Ollama model path:", config.ollama.baseUrl);
        console.log("Ollama model name:", config.ollama.model);
      }
    }

    return new ChatOllama({
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.model,
      temperature: 0.7,
      verbose: config.debug,
    });
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    // Implement logic to initialize the agent
    await this.mcpAdapter.connect();

    if (config.debug) {
      console.log("MCP Server connected Sucessfully");
    }

    // Load conversation state
    await this.stateManager.Load();

    //Get langchain tools from MCP
    this.tools = this.mcpAdapter.getLangchainTools();

    if (config.debug) {
      console.log(
        `Log ${this.tools.length} tools`,
        this.tools.map((t) => t.name),
      );
    }

    if (this.tools.length === 0) {
      throw new Error("No tools found");
    }

    // Bind tools to LLM for function calling
    if (this.llm.bindTools) {
      if (config.debug) {
        console.log("\n=== TOOL BINDING DEBUG ===");
        console.log("Number of tools to bind:", this.tools.length);
        this.tools.forEach((tool, index) => {
          console.log(`\nTool ${index + 1}:`, {
            name: tool.name,
            description: tool.description,
            hasSchema: !!tool.schema,
            hasFunc: !!tool.func,
            schemaKeys: tool.schema ? Object.keys(tool.schema.shape || {}) : [],
          });
        });
      }

      this.llmWithTools = this.llm.bindTools(this.tools);

      if (config.debug) {
        console.log("\n✓ Tools bound to LLM successfully");
        console.log("llmWithTools type:", typeof this.llmWithTools);
        console.log("llmWithTools has invoke:", !!this.llmWithTools?.invoke);
      }
    } else {
      throw new Error("LLM does not support tool binding");
    }
  }

  /**
   * Process user input with manual agent loop
   */
  async chat(userInput: string): Promise<string> {
    if (!this.llmWithTools || this.tools.length === 0) {
      throw new Error("Agent not initialized. Call Initialize() first");
    }

    //Add user message to state
    await this.stateManager.addMessage("user", userInput);

    //Get Chat history
    const allMessages = this.stateManager.getMessages();
    const chatHistory = this.convertMessageToLangChain(
      allMessages.slice(0, -1),
    );

    if (config.debug) {
      console.log("\n=== CHAT REQUEST DEBUG ===");
      console.log("User input:", userInput);
      console.log("Chat history length:", chatHistory.length);
      console.log("Tools available:", this.tools.length);
      console.log("llmWithTools is set:", !!this.llmWithTools);
      console.log("Tool names:", this.tools.map((t) => t.name).join(", "));
    }

    try {
      //Create System Messages
      const systemMessage = new SystemMessage(
        `You are an ExpenseAgent assistant. You have access to several tools that can fetch expense data.

CRITICAL RULES:
1. ALWAYS use tools to fetch expense data - NEVER make up or assume expense information
2. When asked about expenses, you MUST call the appropriate tool first
3. DO NOT respond with text like "there are no expenses" without checking via tools
4. After getting tool results, format them nicely for the user

Your available tools:
- list_expenses: Fetch ALL expenses from the system
- list_expenses_by_username: Fetch expenses for a specific username (requires: username)
- list_expenses_by_date: Fetch expenses within date range (requires: startDate, endDate)
- list_expenses_by_category: Fetch expenses by category (requires: category)
- list_expenses_by_payment_name: Fetch expenses by payment method (requires: paymentMethod)
- create_expense: Create a new expense entry

Task-to-Tool mapping:
- "show all expenses" OR "list expenses" → CALL list_expenses()
- "expenses for [username]" OR "get expense of [username]" → CALL list_expenses_by_username(username="[username]")
- "expenses by category [name]" → CALL list_expenses_by_category(category="[name]")
- "expenses from [date] to [date]" → CALL list_expenses_by_date(startDate="...", endDate="...")

IMPORTANT: The first thing you should do when asked about expenses is call the appropriate tool!`,
      );

      //Build message array
      const messages = [
        systemMessage,
        ...chatHistory,
        new HumanMessage(userInput),
      ];

      //Run agent loop manually (max 5 iterations)
      let finalResponse = "";
      let currentMessage = [...messages];
      const maxIterations = 5;
      for (let i = 0; i < maxIterations; i++) {
        if (config.debug) {
          console.log(`\n=== ITERATION ${i + 1}/${maxIterations} ===`);
          console.log("Messages being sent:", currentMessage.length);
          console.log(
            "Message types:",
            currentMessage.map((m: any) => m.constructor.name || m.role),
          );
        }

        // Invoke LLM with tools bound
        const response = await this.llmWithTools.invoke(currentMessage);

        if (config.debug) {
          console.log("\n--- LLM Response ---");
          console.log("Content type:", typeof response.content);
          console.log(
            "Content:",
            typeof response.content === "string"
              ? response.content.substring(0, 200)
              : JSON.stringify(response.content).substring(0, 200),
          );
          console.log("Has tool_calls:", !!response.tool_calls);
          console.log("Tool Calls count:", response.tool_calls?.length || 0);
          if (response.tool_calls && response.tool_calls.length > 0) {
            console.log(
              "\n🔧 Tool Calls:",
              JSON.stringify(response.tool_calls, null, 2),
            );
          } else {
            console.log(
              "⚠️  NO TOOL CALLS MADE - LLM responded with text only",
            );
          }
        }

        //Check if there are tool calls
        if (response.tool_calls && response.tool_calls.length > 0) {
          // Add AI message to Conversation
          currentMessage.push(response);

          try {
            //Execute each tool call
            for (const toolCall of response.tool_calls) {
              if (config.debug) {
                console.log(`\n🔨 Executing tool: ${toolCall.name}`);
                console.log(
                  "Tool args:",
                  JSON.stringify(toolCall.args, null, 2),
                );
              }

              //Find tool
              const tool = this.tools.find((t) => t.name === toolCall.name);
              if (!tool) {
                const error = `Tool not found: ${toolCall.name}`;
                console.error("❌", error);
                console.error(
                  "Available tools:",
                  this.tools.map((t) => t.name),
                );
                throw new Error(error);
              }

              //Execute the tool
              const toolResult = await tool.func(toolCall.args);

              if (config.debug) {
                console.log(`✓ Tool ${toolCall.name} completed`);
                console.log(
                  "Result:",
                  typeof toolResult === "string"
                    ? toolResult.substring(0, 300)
                    : JSON.stringify(toolResult).substring(0, 300),
                );
              }

              currentMessage.push({
                role: "tool",
                content: toolResult,
                tool_call_id: toolCall.id,
              } as any);
            }
          } catch (error) {
            console.error("Error executing tool calls:", error);
            currentMessage.push({
              role: "error",
              content: error instanceof Error ? error.message : String(error),
              tool_call_id: response.id,
            } as any);
          }
        } else {
          //No more tool calls, we have final response
          finalResponse =
            typeof response.content == "string"
              ? response.content
              : JSON.stringify(response.content);
          break;
        }
      }

      if (!finalResponse || finalResponse.trim() === "") {
        finalResponse =
          "I apologize, but I couldn't find the information you requested. Please try again.";
      }

      await this.stateManager.addMessage("assistant", finalResponse);

      return finalResponse;
    } catch (error) {
      console.error("Error processing user input:", error);
      throw error;
    }
  }

  /**
   * Convert conversation messaes to Langchain format
   */
  private convertMessageToLangChain(messages: ConversationMessage[]): any[] {
    return messages.map((msg) => {
      switch (msg.role) {
        case "user":
          return new HumanMessage(msg.content);
        case "assistant":
          return new AIMessage(msg.content);
        case "system":
          return new SystemMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }

  /**
   * Clear conversation history
   */
  async clearConversationHistory(): Promise<void> {
    await this.stateManager.clean();
  }

  /**
   * Clean resources
   */
  async cleanResources(): Promise<void> {
    await this.mcpAdapter.closeConnection();
  }
}
