# Claude Desktop Setup & Debugging Guide

## 🔧 Claude Desktop Configuration

### Step 1: Locate Claude Desktop Config File

The configuration file is located at:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Full path:** `C:\Users\<YourUsername>\AppData\Roaming\Claude\claude_desktop_config.json`

### Step 2: Edit the Configuration File

Open `claude_desktop_config.json` in a text editor and add your MCP server configuration:

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

**Important Notes:**
- Use double backslashes (`\\`) in Windows paths
- Make sure the path points to the **dist** folder (compiled JavaScript)
- Ensure the path is absolute (full path from C:\)

### Step 3: Verify the Path

Before restarting Claude Desktop, verify the file exists:

```bash
# In Command Prompt or PowerShell
dir C:\work\expense-management\packages\expense-mcp\dist\index.js
```

You should see the file listed. If not, rebuild:

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run build
```

### Step 4: Restart Claude Desktop

**Important:** Fully close and restart Claude Desktop:
1. Close all Claude Desktop windows
2. Check Task Manager to ensure no Claude processes are running
3. Relaunch Claude Desktop

---

## 🐛 Debugging Claude Desktop Issues

### Check Claude Desktop Logs

Claude Desktop logs can help identify the issue:

**Log Location:**
- Windows: `%APPDATA%\Claude\logs\`
- Full path: `C:\Users\<YourUsername>\AppData\Roaming\Claude\logs\`

**How to check logs:**
```bash
# Navigate to logs folder
cd %APPDATA%\Claude\logs

# View the most recent log
type mcp*.log
```

Look for errors related to:
- Connection failures
- Path not found errors
- Node.js or npm errors
- Timeout errors

---

## 🔍 Common Issues and Solutions

### Issue 1: "MCP Server Not Found" or "Server Failed to Start"

**Possible Causes:**
1. Incorrect path in config file
2. File not built (dist folder missing)
3. Node.js not in PATH

**Solutions:**

✅ **Verify the compiled file exists:**
```bash
dir C:\work\expense-management\packages\expense-mcp\dist\index.js
```

✅ **Check if Node.js is accessible:**
```bash
node --version
```
Should show v18.0.0 or higher

✅ **Try using full path to node:**
```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"
      ]
    }
  }
}
```

✅ **Rebuild the MCP server:**
```bash
cd C:\work\expense-management\packages\expense-mcp
npm run clean
npm run build
```

---

### Issue 2: Server Starts but Tools Don't Work

**Possible Causes:**
1. Expense API is not running
2. Environment variables not set
3. Network/firewall blocking localhost

**Solutions:**

✅ **Ensure Expense API is running:**
```bash
# In a separate terminal
cd C:\work\expense-management\packages\expense-api
npm start
```

Verify at: http://localhost:3000/health

✅ **Check environment variables in config:**
```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "node",
      "args": ["C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"],
      "env": {
        "EXPENSE_API_URL": "http://localhost:3000",
        "NODE_ENV": "production"
      }
    }
  }
}
```

✅ **Test API connectivity:**
```bash
curl http://localhost:3000/api/expenses
```

---

### Issue 3: "Connection Timeout" or "Server Not Responding"

**Possible Causes:**
1. Server takes too long to start
2. Port conflicts
3. Antivirus/firewall blocking

**Solutions:**

✅ **Test MCP server directly:**
```bash
cd C:\work\expense-management\packages\expense-mcp
node dist/index.js
```

You should see: `Expense MCP Server running on Stdio`

Press Ctrl+C to stop. If this works, Claude Desktop should work too.

✅ **Check for port conflicts:**
```bash
netstat -ano | findstr :3000
```

If another process is using port 3000, either stop it or change the API port.

✅ **Temporarily disable antivirus/firewall:**
Test if security software is blocking connections.

---

### Issue 4: Tools Show Up but Return Errors

**Possible Causes:**
1. API endpoints returning errors
2. Database not connected
3. Authentication issues

**Solutions:**

✅ **Test API endpoints directly:**
```bash
# Test with curl or Postman
curl http://localhost:3000/api/expenses

# Should return JSON array of expenses
```

✅ **Check API logs:**
Look at the terminal where you started the API for error messages.

✅ **Verify database connection:**
Check `.env` file in `packages/expense-api/`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_db
DB_USER=postgres
DB_PASSWORD=your_password
```

Test database:
```bash
psql -U postgres -d expense_db -c "SELECT COUNT(*) FROM expenses;"
```

---

### Issue 5: Config File Changes Not Applied

**Possible Causes:**
1. Claude Desktop not fully restarted
2. Config file has syntax errors
3. Using wrong config file location

**Solutions:**

✅ **Validate JSON syntax:**
Use a JSON validator or:
```bash
# In PowerShell
Get-Content $env:APPDATA\Claude\claude_desktop_config.json | ConvertFrom-Json
```

Should not show any errors.

✅ **Completely restart Claude Desktop:**
1. Close all windows
2. Open Task Manager (Ctrl+Shift+Esc)
3. End any "Claude" processes
4. Wait 5 seconds
5. Relaunch Claude Desktop

✅ **Check correct config location:**
```bash
echo %APPDATA%\Claude\claude_desktop_config.json
```

---

## 🧪 Testing Workflow

### 1. Test the Expense API Directly

```bash
# Terminal 1: Start API
cd C:\work\expense-management\packages\expense-api
npm start

# Terminal 2: Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/expenses
```

**Expected:** JSON responses with data

---

### 2. Test MCP Server with Inspector

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run inspect
```

**Expected:** Web UI opens at http://localhost:5173

Try calling tools:
- Click on "list_expenses"
- Click "Run Tool"
- Should see expense data

---

### 3. Test MCP Server in Claude Desktop

After configuring and restarting:

1. Open a new conversation in Claude Desktop
2. Look for MCP indicator (usually a tool icon)
3. Try: "Show me all expenses"
4. Claude should call the `list_expenses` tool

---

## 📋 Complete Configuration Examples

### Minimal Configuration

```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "node",
      "args": [
        "C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"
      ]
    }
  }
}
```

### Full Configuration with Environment Variables

```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "node",
      "args": [
        "C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"
      ],
      "env": {
        "EXPENSE_API_URL": "http://localhost:3000",
        "EXPENSE_MCP_VERSION": "1.0.0",
        "NODE_ENV": "production",
        "DEBUG": "false"
      }
    }
  }
}
```

### Configuration with Custom Node Path

```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
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

---

## 🔎 Advanced Debugging

### Enable Verbose Logging

Add console.error statements to `src/index.ts` for debugging:

```typescript
// At the top of handleToolCall
console.error(`[DEBUG] Tool called: ${toolName}`);
console.error(`[DEBUG] Arguments:`, JSON.stringify(args));

// Before returning results
console.error(`[DEBUG] Result:`, JSON.stringify(result));
```

Rebuild and check Claude Desktop logs for these messages.

---

### Test Stdio Communication

Create a test script to verify stdio communication:

```bash
# test-stdio.js
echo {"jsonrpc":"2.0","id":1,"method":"tools/list"} | node dist/index.js
```

Should return JSON response with available tools.

---

### Compare with Working MCP Server

If you have other working MCP servers (like the burger-mcp in your project), compare configurations:

```bash
# Check burger-mcp config
cd C:\work\gd-projects\packages\burger-mcp
cat package.json
```

Use the same configuration pattern for expense-mcp.

---

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] Expense API is running on port 3000
- [ ] API returns data when tested with curl/Postman
- [ ] MCP server built successfully (`npm run build`)
- [ ] `dist/index.js` file exists
- [ ] MCP Inspector works and tools are callable
- [ ] Claude Desktop config file has correct path (with `\\`)
- [ ] Claude Desktop fully restarted
- [ ] Node.js version is 18.0.0 or higher
- [ ] No syntax errors in JSON config
- [ ] Checked Claude Desktop logs for errors
- [ ] Database is connected (for API)

---

## 🆘 Still Not Working?

### Collect Diagnostic Information

Run these commands and save the output:

```bash
# System info
node --version
npm --version

# Check files
dir C:\work\expense-management\packages\expense-mcp\dist

# Test API
curl http://localhost:3000/health

# Test MCP server
cd C:\work\expense-management\packages\expense-mcp
node dist/index.js

# Check config
type %APPDATA%\Claude\claude_desktop_config.json

# Recent logs (last 50 lines)
cd %APPDATA%\Claude\logs
powershell "Get-Content -Tail 50 (Get-ChildItem | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName"
```

### What to Share When Asking for Help

1. Output from diagnostic commands above
2. Any error messages from Claude Desktop
3. Contents of `claude_desktop_config.json`
4. Screenshots of Claude Desktop showing the issue
5. MCP Inspector screenshot showing tools work

---

## 📚 Additional Resources

- **MCP Documentation:** https://modelcontextprotocol.io
- **MCP SDK GitHub:** https://github.com/modelcontextprotocol/typescript-sdk
- **Claude Desktop Docs:** https://docs.anthropic.com/claude/desktop

---

**Last Updated:** After all critical fixes applied  
**Status:** MCP Inspector working ✅ | Claude Desktop needs configuration
