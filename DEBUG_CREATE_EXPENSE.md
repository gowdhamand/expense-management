# Debug Guide: Create Expense Not Working in Claude Desktop

## 🔍 Problem Description

The `create_expense` tool works in MCP Inspector but fails when called from Claude Desktop.

---

## ✅ What We've Already Fixed

1. Added `create_expense` case to the switch statement
2. Updated tool schema with all required fields:
   - `amount` (number)
   - `description` (string)
   - `category` (string)
   - `paymentMethod` (string)
   - `expenseDate` (string, YYYY-MM-DD)
   - `userName` (string)
3. Fixed API response extraction (`response.data.data`)
4. Added comprehensive error handling and logging
5. Updated validation schema

---

## 🧪 Step-by-Step Debugging

### Step 1: Verify the Build

```bash
cd C:\work\expense-management\packages\expense-mcp
npm run build
```

Check that `dist/index.js` was updated (check the timestamp).

---

### Step 2: Test with MCP Inspector

```bash
npm run inspect
```

In the inspector web UI:
1. Find the `create_expense` tool
2. Fill in ALL required fields:
   ```json
   {
     "amount": 49.99,
     "description": "Test lunch",
     "category": "food",
     "paymentMethod": "credit card",
     "expenseDate": "2024-01-15",
     "userName": "john_doe"
   }
   ```
3. Click "Run Tool"
4. **Expected:** Success response with created expense

If this fails, the issue is in the MCP server code.

---

### Step 3: Test with Test Script

```bash
npm run test-create
```

This simulates what Claude Desktop would send. Look for:
- ✅ "Expense created successfully" message
- ❌ Any error messages in yellow/red
- Debug logs showing the data being passed

---

### Step 4: Check API is Running

```bash
# In a separate terminal
cd C:\work\expense-management\packages\expense-api
npm start
```

Test directly:
```bash
curl -X POST http://localhost:3000/api/expenses ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":50,\"description\":\"test\",\"category\":\"food\",\"paymentMethod\":\"cash\",\"expenseDate\":\"2024-01-15\",\"userName\":\"test\"}"
```

**Expected:** JSON response with `success: true`

---

### Step 5: Check Claude Desktop Logs

**Windows:** `%APPDATA%\Claude\logs\`

```bash
cd %APPDATA%\Claude\logs
dir /o-d
```

Open the most recent log file and search for:
- `create_expense`
- `[DEBUG]`
- `[ERROR]`
- Error messages

---

## 🐛 Common Issues and Solutions

### Issue 1: "Unknown tool: create_expense"

**Cause:** MCP server not rebuilt or Claude not restarted

**Solution:**
```bash
cd packages/expense-mcp
npm run build
```
Then **completely restart Claude Desktop** (check Task Manager).

---

### Issue 2: Validation Error

**Error in logs:**
```
Invalid type: expected string, received undefined
```

**Cause:** Claude is not passing all required fields

**What Claude sees:**
```json
{
  "name": "create_expense",
  "inputSchema": {
    "type": "object",
    "properties": { ... },
    "required": ["amount", "description", "category", "paymentMethod", "expenseDate", "userName"]
  }
}
```

**Solution:** Make sure your query includes ALL information:
```
"Create expense: $50 for lunch, food category, credit card payment, 
date 2024-01-15, user john_doe"
```

If Claude doesn't have all info, it should ask for missing fields.

---

### Issue 3: API Connection Error

**Error in logs:**
```
Error: Expense API Error: connect ECONNREFUSED
```

**Cause:** Expense API not running

**Solution:**
```bash
cd packages/expense-api
npm start
```

Verify: http://localhost:3000/health

---

### Issue 4: Date Format Error

**Error in logs:**
```
Invalid date format
```

**Cause:** Date not in YYYY-MM-DD format

**Solution:** When creating, always use YYYY-MM-DD:
- ✅ "2024-01-15"
- ❌ "01/15/2024"
- ❌ "Jan 15, 2024"

---

### Issue 5: API Returns Error but MCP Doesn't Show It

**Symptom:** Tool call succeeds but no expense created

**Debug:**
Check the API terminal for error messages. Common issues:
- Database connection failed
- Missing database table
- Invalid field names

**Fix database issues:**
```bash
# Connect to PostgreSQL
psql -U postgres -d expense_db

# Check table exists
\dt expense_mgmt.*

# Check table structure
\d expense_mgmt.expense_data

# Test insert manually
INSERT INTO expense_mgmt.expense_data 
  (amount, description, category, payment_method, expense_date, user_name)
VALUES 
  (50, 'test', 'food', 'cash', '2024-01-15', 'test_user')
RETURNING *;
```

---

### Issue 6: Response Format Error

**Error in logs:**
```
Invalid response format
```

**Cause:** API response structure doesn't match expected format

**Check API response:**
```bash
curl -X POST http://localhost:3000/api/expenses -H "Content-Type: application/json" -d "{...}"
```

**Expected format:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "amount": 50,
    "description": "...",
    ...
  }
}
```

**Solution:** We now extract `response.data.data || response.data` to handle both formats.

---

## 🔬 Advanced Debugging

### Enable Maximum Logging

Edit `src/tools/expenseTools.ts` and add more console.error statements:

```typescript
async function createExpense(args: any): Promise<any> {
  console.error('[DEBUG] === CREATE EXPENSE START ===');
  console.error('[DEBUG] Raw args:', JSON.stringify(args, null, 2));
  console.error('[DEBUG] Type of args:', typeof args);
  console.error('[DEBUG] Keys in args:', Object.keys(args));
  
  try {
    const validatedData = CreateExpenseSchema.parse(args);
    console.error('[DEBUG] Validation SUCCESS');
    console.error('[DEBUG] Validated data:', JSON.stringify(validatedData, null, 2));
    
    const expense = await client.createExpense(validatedData);
    console.error('[DEBUG] API call SUCCESS');
    console.error('[DEBUG] Response:', JSON.stringify(expense, null, 2));
    
    // ... rest of function
  } catch (error) {
    console.error('[ERROR] === CREATE EXPENSE FAILED ===');
    console.error('[ERROR] Error type:', error.constructor.name);
    console.error('[ERROR] Error message:', error.message);
    if (error.issues) {
      console.error('[ERROR] Zod validation issues:', JSON.stringify(error.issues, null, 2));
    }
    console.error('[ERROR] Stack trace:', error.stack);
    throw error;
  }
}
```

Rebuild and check Claude Desktop logs for these messages.

---

### Intercept API Calls

Add logging to `src/client/expenseClient.ts`:

```typescript
async createExpense(expense: CreateExpenseInput): Promise<Expense> {
  console.error('[API] === CREATE EXPENSE API CALL ===');
  console.error('[API] Payload:', JSON.stringify(expense, null, 2));
  console.error('[API] URL:', this.client.defaults.baseURL + '/api/expenses');
  
  try {
    const response = await this.client.post("/api/expenses", expense);
    console.error('[API] Response status:', response.status);
    console.error('[API] Response data:', JSON.stringify(response.data, null, 2));
    return response.data.data || response.data;
  } catch (error) {
    console.error('[API] === API CALL FAILED ===');
    if (axios.isAxiosError(error)) {
      console.error('[API] Response status:', error.response?.status);
      console.error('[API] Response data:', JSON.stringify(error.response?.data, null, 2));
    }
    throw this.handleError(error);
  }
}
```

---

## 📋 Debugging Checklist

Before asking for more help, verify ALL of these:

- [ ] Expense API is running on port 3000
- [ ] API works when tested with curl/Postman
- [ ] MCP server rebuilt: `npm run build`
- [ ] `dist/index.js` timestamp is recent (after last code change)
- [ ] MCP Inspector shows `create_expense` tool in list
- [ ] MCP Inspector can successfully call `create_expense` 
- [ ] Test script passes: `npm run test-create`
- [ ] Claude Desktop fully restarted (checked Task Manager)
- [ ] Claude Desktop config file is correct
- [ ] Claude Desktop logs checked for errors
- [ ] Database is accessible and has expense_data table
- [ ] All 6 required fields provided in the query

---

## 🎯 The Real Issue

If MCP Inspector works but Claude Desktop doesn't, the issue is likely:

### 1. Claude Not Passing All Required Fields

Claude might be trying to call the tool without all parameters.

**Check:** Claude Desktop logs for the actual tool call parameters

**Solution:** Be very explicit in your query:
```
"Create an expense with these details:
- Amount: 50.00
- Description: Team lunch at restaurant  
- Category: food
- Payment method: credit card
- Date: 2024-01-15
- Username: john_doe"
```

### 2. Claude Not Handling Required Fields

The tool schema has `"required": [...]` array. Claude should ask for missing fields.

**If Claude doesn't ask for missing fields:**
This might be a Claude Desktop version issue. Try updating Claude Desktop.

### 3. Tool Response Format

Make sure the response format matches MCP specs:

```typescript
return {
  content: [
    {
      type: "text",
      text: "...",
    },
  ],
};
```

**Not:**
```typescript
return {
  text: "...",  // Wrong!
};
```

---

## 🆘 Still Not Working?

### Collect Full Diagnostic Info

Run these and save output:

```bash
# 1. Check build
cd packages/expense-mcp
npm run build
dir dist

# 2. Test MCP server directly
npm run test-create > test-output.txt 2>&1

# 3. Check API
cd ../expense-api
curl http://localhost:3000/health

# 4. Test create via API
curl -X POST http://localhost:3000/api/expenses ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":50,\"description\":\"test\",\"category\":\"food\",\"paymentMethod\":\"cash\",\"expenseDate\":\"2024-01-15\",\"userName\":\"test\"}"

# 5. Get Claude logs (last 100 lines)
cd %APPDATA%\Claude\logs
powershell "Get-Content -Tail 100 (Get-ChildItem | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName" > claude-logs.txt
```

### What to Share

1. Output from `npm run test-create`
2. MCP Inspector screenshot showing successful create
3. Claude Desktop logs (last 100 lines when trying to create)
4. Exact query you're using in Claude Desktop
5. Error message Claude shows (if any)
6. Screenshot of Claude Desktop showing the issue

---

## 💡 Quick Fix Attempts

### Try 1: Simplify the Tool Schema

Temporarily remove the `required` array to see if that's the issue:

```typescript
{
  name: "create_expense",
  description: "Create a new expense",
  inputSchema: {
    type: "object",
    properties: {
      // ... all properties
    },
    // Remove or comment out required array temporarily
    // required: [...],
  },
}
```

Rebuild and test. If this works, the issue is with how Claude handles required fields.

---

### Try 2: Test with Minimal Data

Try creating with just the absolute minimum:

```
"Create expense: 50 dollars, test description, food, cash, 2024-01-15, testuser"
```

No extra words, just the data.

---

### Try 3: Use MCP Inspector While Claude Calls It

1. Keep MCP Inspector open
2. Try to create from Claude Desktop
3. Check if the tool call appears in Inspector's network tab
4. See what parameters Claude actually sends

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Claude shows: "I've created the expense..."
2. ✅ Claude Desktop logs show no errors
3. ✅ API logs show INSERT query executed
4. ✅ Database has new row: `SELECT * FROM expense_mgmt.expense_data ORDER BY created_at DESC LIMIT 1;`
5. ✅ "Show me all expenses" includes the new expense

---

**Good luck! The issue is almost certainly in the communication between Claude Desktop and the MCP server, not in the code itself since Inspector works.**
