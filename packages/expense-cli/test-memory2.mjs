import { ExpenseAgent } from "./dist/agent/agent.js";
import fs from "fs";

// Clean start
try { fs.unlinkSync("./dist/conversation-state.json"); } catch {}

const agent = new ExpenseAgent();
await agent.initialize();

console.log("1. First query:");
const r1 = await agent.chat("show me expenses for gowdhaman");
console.log(r1);

console.log("\n2. Follow-up (should remember):");
const r2 = await agent.chat("how many expenses were there?");
console.log(r2);

console.log("\n3. Another follow-up:");
const r3 = await agent.chat("what was the total amount?");
console.log(r3);

await agent.cleanResources();
