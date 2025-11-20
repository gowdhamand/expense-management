import { ExpenseAgent } from "./dist/agent/agent.js";

const agent = new ExpenseAgent();

console.log("Initializing agent...");
await agent.initialize();

console.log("\n=== Sending query ===");
const response = await agent.chat("show me all expenses");

console.log("\n=== Final Response ===");
console.log(response);

await agent.cleanResources();
