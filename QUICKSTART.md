# Expense MCP Server - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Expense API

```bash
cd C:\work\expense-management\packages\expense-api
npm run build
npm start
```

The API will start on `http://localhost:3000`

✅ Verify it's running: http://localhost:3000/health

---

### Step 2: Build the MCP Server

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run build
```

---

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to reload the MCP server.

---

## 💬 Try These Commands

### Basic Queries
- "Show me all expenses"
- "List all expenses"
- "What expenses do we have?"

### Filter by User
- "Show expenses for user John"
- "List expenses by username Alice"

### Filter by Category
- "Show me all food expenses"
- "List expenses in the travel category"

### Filter by Date
- "Show expenses from last week"
- "List expenses between January 1 and January 31"

### Filter by Payment Method
- "Show credit card expenses"
- "List cash payments"

### Generate Reports
- "Generate an expense summary"
- "Create an expense report for this month"
- "Give me an expense report"

### Create Expenses
- "Create a new expense for $50 for lunch"
- "Add an expense: $100 for office supplies on 2024-01-15"

---

## 🔧 Available Features

### ✅ Tools (6 total)
1. **list_expenses** - Get all expenses
2. **list_expenses_by_username** - Filter by user
3. **list_expenses_by_category** - Filter by category
4. **list_expenses_by_date** - Filter by date range
5. **list_expenses_by_payment_name** - Filter by payment method
6. **create_expense** - Create new expense

### ✅ Prompts (2 total)
1. **expense-summary** - Generate summary with optional filters
2. **expense-report** - Generate detailed report with date range

### ✅ Resources (1 total)
1. **expense://expenses** - Direct access to all expense data

---

## 🐛 Quick Troubleshooting

### Problem: "Expense API Error"
**Solution:** Make sure the API is running on port 3000
```bash
cd C:\work\expense-management\packages\expense-api
npm start
```

### Problem: Changes not working
**Solution:** Rebuild and restart
```bash
cd C:\work\expense-management\packages\expense-mcp
npm run build
```
Then restart Claude Desktop

### Problem: Database errors
**Solution:** Check your `.env` file in `packages/expense-api/`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_db
DB_USER=your_username
DB_PASSWORD=your_password
```

### Problem: MCP server not found
**Solution:** Check Claude Desktop config at:
`%APPDATA%\Claude\claude_desktop_config.json`

Should contain:
```json
{
  "mcpServers": {
    "expense-mcp": {
      "command": "node",
      "args": ["C:\\work\\expense-management\\packages\\expense-mcp\\dist\\index.js"]
    }
  }
}
```

---

## 📊 Example Workflow

1. **Check all expenses:**
   - "Show me all expenses"

2. **Analyze by category:**
   - "Show me food expenses"
   - "List travel expenses"

3. **Generate a report:**
   - "Create an expense report for this month"

4. **Add new expense:**
   - "Create an expense: $25 for lunch on 2024-01-15, user John, category food"

---

## 🎯 What's Been Fixed

All the following issues have been resolved:

✅ Tool name mismatches  
✅ Parameter name mismatches  
✅ Function signature issues  
✅ Typo in response object  
✅ Missing API path slashes  
✅ Missing prompt handlers  
✅ Incorrect URI extraction  
✅ Resource response format (text vs content)  
✅ Unused imports removed  

---

## 📚 Advanced Usage

### Using the MCP Inspector

Debug your MCP server with the inspector:

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run inspect
```

Opens at: http://localhost:5173

Features:
- View all available tools and prompts
- Test tool calls with custom parameters
- See real-time request/response data
- Debug connection issues

### Direct API Testing

Test the API directly with curl or Postman:

```bash
# Get all expenses
curl http://localhost:3000/api/expenses

# Health check
curl http://localhost:3000/health

# Create expense (POST)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "description": "Lunch", "category": "food", "date": "2024-01-15", "userName": "John"}'
```

---

## 📝 Configuration

### MCP Server (.env)
Location: `packages/expense-mcp/.env`
```
EXPENSE_API_URL=http://localhost:3000
EXPENSE_MCP_VERSION=1.0.0
```

### API Server (.env)
Location: `packages/expense-api/.env`
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_db
DB_USER=postgres
DB_PASSWORD=your_password
CORS_ORIGIN=*
```

---

## 🆘 Need More Help?

- **Detailed troubleshooting:** See `TROUBLESHOOTING.md`
- **API documentation:** http://localhost:3000/api-docs (when API is running)
- **MCP Documentation:** https://modelcontextprotocol.io

---

**Status:** ✅ All systems operational  
**Last Updated:** After all 8 critical fixes applied
