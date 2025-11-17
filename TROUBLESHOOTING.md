# Expense MCP Server - Troubleshooting Guide

## Issues Fixed

### 1. Tool Name Mismatches ✅
**Problem:** Tool definitions didn't match the switch case handlers in `expenseTools.ts`

**Fixed:**
- `list_expense_by_username` → `list_expenses_by_username`
- `list_expense_by_dates` → `list_expenses_by_date`
- `list_Expense_by_Payment_Name` → `list_expenses_by_payment_name`

### 2. Parameter Name Mismatches ✅
**Problem:** Tool schemas had different parameter names than the implementation

**Fixed:**
- Changed `id` to `username` in `list_expenses_by_username` tool
- Changed `paymentName` to `paymentMethod` in `list_expenses_by_payment_name` tool

### 3. Function Signature Issues ✅
**Problem:** Category and payment method handlers expected a string directly instead of args object

**Fixed:**
```typescript
// Before
async function listExpensesByCategory(category: string): Promise<any>

// After
async function listExpensesByCategory(args: any): Promise<any> {
  const expenses = await client.getExpenseByCategory(args.category);
}
```

### 4. Typo in Response Object ✅
**Problem:** In `index.ts` line 77, had `conttents` instead of `contents`

**Fixed:** Changed to `contents`

### 5. Missing API Path Slashes ✅
**Problem:** API endpoints were missing leading slashes (e.g., `api/expenses` instead of `/api/expenses`)

**Fixed:** Added leading slashes to all API endpoint paths in `expenseClient.ts`:
- `/api/expenses`
- `/health`

### 6. Missing Prompt Handlers ✅
**Problem:** `ListPromptsRequestSchema` and `GetPromptRequestSchema` were imported but no handlers were implemented

**Fixed:** Added two prompt handlers:
- **expense-summary**: Generate a summary of expenses with optional username/category filters
- **expense-report**: Generate a detailed expense report with optional date range

### 7. Incorrect Server Name ✅
**Problem:** Console log still said "Burger MCP Server"

**Fixed:** Changed to "Expense MCP Server"

### 8. Resource Response Format ✅
**Problem:** Resource handler used `content` field instead of `text` field in response

**Error:**
```
Invalid input: contents[0] must have either 'text' or 'blob' field
```

**Fixed:** Changed response format in ReadResourceRequestSchema handler:
```typescript
// Before
{
  uri: uri,
  mimeType: "application/json",
  content: JSON.stringify(expenses, null, 2),
}

// After
{
  uri: uri,
  mimeType: "application/json",
  text: JSON.stringify(expenses, null, 2),
}
```

---

## Current Setup

### Architecture
```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Claude Desktop │────────▶│  Expense MCP     │────────▶│  Expense API │
│   (MCP Client)  │         │     Server       │         │ (Port 3000)  │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                                                  │
                                                                  ▼
                                                           ┌──────────────┐
                                                           │  PostgreSQL  │
                                                           │   Database   │
                                                           └──────────────┘
```

### Available Tools
1. **list_expenses** - List all expenses
2. **list_expenses_by_username** - Filter by username
3. **list_expenses_by_date** - Filter by date range
4. **list_expenses_by_category** - Filter by category
5. **list_expenses_by_payment_name** - Filter by payment method
6. **create_expense** - Create a new expense

### Available Prompts
1. **expense-summary** - Generate expense summary (optional: username, category)
2. **expense-report** - Generate detailed report (optional: startDate, endDate)

### Available Resources
1. **expense://expenses** - Direct access to all expense data

---

## How to Use

### Testing the MCP Server

1. **Build the server:**
   ```bash
   cd C:\work\expense-management\packages\expense-mcp
   npm run build
   ```

2. **Restart Claude Desktop** to reload the MCP server

3. **Test with simple queries:**
   - "Show me all expenses"
   - "List expenses for user John"
   - "Show expenses from last month"
   - "Generate an expense summary"
   - "Create an expense report for this week"

### Using the Inspector (for debugging)

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run inspect
```

This opens a web interface where you can:
- View available tools and prompts
- Test tool calls directly
- See request/response data
- Debug issues

---

## Common Issues

### Issue: "Expense API Error" when calling tools

**Cause:** The Expense API is not running

**Solution:**
```bash
cd C:\work\expense-management\packages\expense-api
npm run build
npm start
```

Verify API is running: http://localhost:3000/health

---

### Issue: Changes not reflected in Claude Desktop

**Cause:** MCP server needs to be rebuilt and Claude Desktop restarted

**Solution:**
1. Rebuild: `cd packages/expense-mcp && npm run build`
2. Restart Claude Desktop completely

---

### Issue: "Resource not found" or "Invalid input" error

**Cause 1:** URI parameter is being converted incorrectly

**Solution:** In `index.ts`, the ReadResourceRequestSchema handler should use:
```typescript
const uri = request.params.uri; // Not request.params.toString()
```

**Cause 2:** Resource content field is named incorrectly

**Solution:** Resource responses must use `text` or `blob`, not `content`:
```typescript
// Correct format
{
  uri: uri,
  mimeType: "application/json",
  text: JSON.stringify(expenses, null, 2),
}
```

---

### Issue: Database connection errors

**Cause:** PostgreSQL not running or incorrect credentials

**Solution:**
1. Check `.env` file in `packages/expense-api/`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```
2. Verify PostgreSQL is running
3. Test connection: `psql -U your_username -d expense_db`

---

## Configuration Files

### MCP Server Configuration
**File:** `packages/expense-mcp/.env`
```
EXPENSE_API_URL=http://localhost:3000
EXPENSE_MCP_VERSION=1.0.0
EXPENSE_MCP_DESCRIPTION=Expense Management API
```

### API Server Configuration
**File:** `packages/expense-api/.env`
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_db
DB_USER=postgres
DB_PASSWORD=your_password
CORS_ORIGIN=*
```

### Claude Desktop Configuration
**File:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "node",
      "args": ["C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"],
      "env": {
        "EXPENSE_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

---

## Verification Checklist

- [ ] Expense API running on port 3000
- [ ] Database accessible and populated
- [ ] MCP server built successfully (`npm run build`)
- [ ] Claude Desktop restarted
- [ ] Can list all expenses
- [ ] Can filter by username
- [ ] Can filter by category
- [ ] Can generate expense summary
- [ ] Can generate expense report

---

## Next Steps

If you're still experiencing issues:

1. **Check the MCP server logs:**
   - Claude Desktop logs: `%APPDATA%\Claude\logs`
   - Look for connection errors or request failures

2. **Test API directly with curl:**
   ```bash
   curl http://localhost:3000/api/expenses
   curl http://localhost:3000/health
   ```

3. **Use the MCP Inspector:**
   ```bash
   npm run inspect
   ```
   Opens at: http://localhost:5173

4. **Enable debug logging:**
   Add to your MCP server's `index.ts`:
   ```typescript
   console.error("Tool called:", name, "with args:", args);
   ```

---

## Support

For more information:
- MCP Documentation: https://modelcontextprotocol.io
- MCP SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Project Issues: Check your Git repository

---

### 9. Missing create_expense Handler ✅
**Problem:** `create_expense` tool was defined but not included in the switch statement handler

**Error:**
```
Unknown tool: create_expense
```

**Fixed:** Added the missing case to the switch statement in `handleToolCall`:
```typescript
case "create_expense":
  return await createExpense(args);
```

Also fixed the tool schema and validation:
- Added `paymentMethod` field (required by API)
- Renamed `date` to `expenseDate` to match API expectations
- Added `required` fields array
- Updated `CreateExpenseSchema` to include `expenseDate`
- Removed unused import from `types.ts`

**Last Updated:** After fixing all tool names, prompt handlers, API paths, resource response format, and create_expense handler
**Status:** ✅ All known issues resolved (9 fixes applied)
