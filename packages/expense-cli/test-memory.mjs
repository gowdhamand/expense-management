import { ExpenseAgent } from "./dist/agent/agent.js";

// Clean start
import fs from "fs";
try { fs.unlinkSync("./dist/conversation-state.json"); } catch {}

console.log("=== Starting fresh conversation ===\n");
const agent = new ExpenseAgent();
await agent.initialize();

console.log("--- Message 1 ---");
const r1 = await agent.chat("My name is Alice");
console.log("Response:", r1);

console.log("\n--- Message 2 ---");
const r2 = await agent.chat("What is my name?");
console.log("Response:", r2);

console.log("\n--- Message 3 ---");
const r3 = await agent.chat("show me expenses for gowdhaman");
console.log("Response:", r3.substring(0, 200));

console.log("\n--- Message 4 ---");
const r4 = await agent.chat("how many expenses did you just show me?");
console.log("Response:", r4);

await agent.cleanResources();

console.log("\n=== State file check ===");
const state = JSON.parse(fs.readFileSync("./dist/conversation-state.json", "utf8"));
console.log("Total messages:", state.messages.length);
