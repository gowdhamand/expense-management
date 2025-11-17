# Quick Fix Guide - Claude Desktop Not Working

## 🚨 MCP Inspector Works, But Claude Desktop Doesn't?

Follow these steps in order:

---

## Step 1: Run the Diagnostic Tool

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run diagnose
```

This will check everything and give you a config to copy.

---

## Step 2: Find Your Claude Desktop Config

**Windows:** Press `Win + R`, type: `%APPDATA%\Claude`

You should see a file called `claude_desktop_config.json`

**If the file doesn't exist, create it:**
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

---

## Step 3: Add This Exact Configuration

Copy and paste this into `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "node",
      "args": [
        "C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"
      ],
      "env": {
        "EXPENSE_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**⚠️ IMPORTANT:**
- Use `\\` (double backslashes) in the path
- The path must point to `dist\index.js` (not `src`)
- Make sure there are no typos
- JSON must be valid (no trailing commas)

---

## Step 4: Verify Everything is Running

### ✅ Check 1: API is Running
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"success",...}`

**If not working:**
```bash
cd C:\work\expense-management\packages\expense-api
npm start
```

### ✅ Check 2: MCP Server is Built
```bash
dir C:\work\expense-management\packages\expense-mcp\dist\index.js
```
Should show the file exists.

**If not working:**
```bash
cd C:\work\expense-management\packages\expense-mcp
npm run build
```

---

## Step 5: Completely Restart Claude Desktop

**This is critical! Do this properly:**

1. Close ALL Claude Desktop windows
2. Press `Ctrl + Shift + Esc` to open Task Manager
3. Look for any "Claude" processes
4. End all Claude processes
5. Wait 5 seconds
6. Launch Claude Desktop again

---

## Step 6: Test in Claude Desktop

Open a new conversation and try:

```
"Show me all expenses"
```

or

```
"List all expenses"
```

Claude should now call the `list_expenses` tool and show results.

---

## 🔍 Still Not Working? Check Logs

### View Claude Desktop Logs

```bash
cd %APPDATA%\Claude\logs
dir /o-d
```

Open the most recent log file and look for:
- "expense-mcp" 
- Error messages
- Connection failures

### Common Error Messages and Fixes

**"Command not found: node"**
- Fix: Use full path to node.exe in config:
```json
"command": "C:\\Program Files\\nodejs\\node.exe"
```

**"ENOENT: no such file or directory"**
- Fix: Path is wrong in config. Copy path exactly from diagnostic tool.

**"Connection timeout"**
- Fix: Expense API not running. Start it first.

**"Server failed to start"**
- Fix: Rebuild MCP server:
```bash
cd C:\work\expense-management\packages\expense-mcp
npm run clean
npm run build
```

---

## 🎯 Quick Checklist

Before asking for help, verify ALL of these:

- [ ] Ran `npm run diagnose` - all checks passed
- [ ] Expense API running on port 3000
- [ ] API returns data: `curl http://localhost:3000/api/expenses`
- [ ] MCP server built: `dist\index.js` exists
- [ ] MCP Inspector works: `npm run inspect`
- [ ] Config file location correct: `%APPDATA%\Claude\claude_desktop_config.json`
- [ ] Config has double backslashes: `\\`
- [ ] Config points to `dist\index.js` (not `src`)
- [ ] JSON syntax valid (no trailing commas)
- [ ] Claude Desktop FULLY restarted (checked Task Manager)
- [ ] Waited 5+ seconds after restart before testing
- [ ] Checked Claude Desktop logs for errors

---

## 💡 Pro Tips

### Tip 1: Test MCP Server Manually
```bash
cd C:\work\expense-management\packages\expense-mcp
node dist/index.js
```
Should print: `Expense MCP Server running on Stdio`

If this doesn't work, Claude Desktop won't work either.

### Tip 2: Validate Your JSON Config
```powershell
Get-Content $env:APPDATA\Claude\claude_desktop_config.json | ConvertFrom-Json
```
Should parse without errors.

### Tip 3: Compare Paths
The path in your config should EXACTLY match this:
```bash
cd C:\work\expense-management\packages\expense-mcp
cd
```
Then add `\dist\index.js` and replace `\` with `\\`

---

## 🆘 Emergency Reset

If nothing works, start fresh:

```bash
# 1. Clean everything
cd C:\work\expense-management\packages\expense-mcp
npm run clean
rm -rf node_modules
npm install
npm run build

# 2. Test MCP server
node dist/index.js
# Should see: "Expense MCP Server running on Stdio"
# Press Ctrl+C to stop

# 3. Test with inspector
npm run inspect
# Should open web UI - test tools there

# 4. Backup and recreate config
copy %APPDATA%\Claude\claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json.backup
notepad %APPDATA%\Claude\claude_desktop_config.json
# Paste the config from Step 3 above

# 5. Completely restart Claude Desktop
# (Close, check Task Manager, wait, relaunch)
```

---

## 📞 Getting Help

If still stuck, provide this info:

1. **Output from diagnose:**
   ```bash
   npm run diagnose > diagnostic.txt
   ```

2. **Your config file:**
   ```bash
   type %APPDATA%\Claude\claude_desktop_config.json
   ```

3. **Recent Claude logs:**
   ```bash
   cd %APPDATA%\Claude\logs
   powershell "Get-Content -Tail 50 (Get-ChildItem | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName"
   ```

4. **Node version:**
   ```bash
   node --version
   ```

5. **What error message you see in Claude Desktop**

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ No errors in Claude Desktop logs
2. ✅ Tool icon appears in Claude Desktop
3. ✅ When you ask "Show me all expenses", Claude responds with actual expense data
4. ✅ You can see tool calls in the conversation (usually indicated by a tool icon or "Used list_expenses")

---

**Remember:** The #1 issue is usually:
- Forgetting to restart Claude Desktop completely, OR
- Wrong path in config (missing `\\` or wrong directory)

**Good luck!** 🚀