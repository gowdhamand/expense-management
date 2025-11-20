import { ExpenseAgent } from "./dist/agent/agent.js";
import fs from "fs";

// Clean start
try { fs.unlinkSync("./dist/conversation-state.json"); } catch {}

console.log("=== Session 1 ===");
const agent1 = new ExpenseAgent();
await agent1.initialize();
await agent1.chat("show me expenses for gowdhaman");
await agent1.cleanResources();

console.log("\n=== Session 2 (new agent instance) ===");
const agent2 = new ExpenseAgent();
await agent2.initialize();
const response = await agent2.chat("how many expenses did you show me in our last conversation?");
console.log("Response:", response);
await agent2.cleanResources();
