import { ExpenseAgent } from "./dist/agent/agent.js";

console.log("=== Test 1: First conversation ===");
const agent1 = new ExpenseAgent();
await agent1.initialize();

await agent1.chat("show me expenses for gowdhaman");
await agent1.cleanResources();

console.log("\n=== Test 2: Second conversation (should remember) ===");
const agent2 = new ExpenseAgent();
await agent2.initialize();

const response = await agent2.chat("how many expenses did I ask about?");
console.log("\nResponse:", response);

await agent2.cleanResources();

console.log("\n=== Checking state file ===");
import fs from "fs";
const state = JSON.parse(fs.readFileSync("./dist/conversation-state.json", "utf8"));
console.log("Number of messages in state:", state.messages.length);
console.log("Messages:");
state.messages.forEach((msg, i) => {
  console.log(`${i+1}. [${msg.role}]: ${msg.content.substring(0, 100)}...`);
});
