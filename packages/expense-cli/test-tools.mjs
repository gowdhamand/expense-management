import { ChatOllama } from "@langchain/ollama";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const llm = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3.2:latest",
  temperature: 0.7,
});

const testTool = new DynamicStructuredTool({
  name: "get_weather",
  description: "Get the weather for a location",
  schema: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  func: async ({ location }) => {
    return `The weather in ${location} is sunny!`;
  },
});

const llmWithTools = llm.bindTools([testTool]);

const result = await llmWithTools.invoke("What's the weather in Paris?");
console.log("Response:", result.content);
console.log("Tool calls:", result.tool_calls?.length || 0);
if (result.tool_calls && result.tool_calls.length > 0) {
  console.log("Tool call details:", JSON.stringify(result.tool_calls, null, 2));
}
