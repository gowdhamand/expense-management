# Expense MCP Server - Usage Examples

## 📚 Complete Usage Guide

This guide shows you exactly how to interact with the Expense MCP Server through Claude Desktop.

---

## 🚀 Getting Started

Before using these commands, ensure:
1. Expense API is running: `cd packages/expense-api && npm start`
2. MCP server is built: `cd packages/expense-mcp && npm run build`
3. Claude Desktop is configured and restarted

---

## 📋 List All Expenses

### Simple Queries
```
"Show me all expenses"
"List all expenses"
"What expenses do we have?"
"Display all expense records"
```

### Expected Response
Claude will call the `list_expenses` tool and return all expenses in the database.

---

## 👤 Filter by Username

### Query Examples
```
"Show expenses for John"
"List all expenses by username Alice"
"What are Bob's expenses?"
"Get expenses for user Sarah"
```

### With Exact Parameter
```
"List expenses by username: john_doe"
```

### Expected Response
Claude will call `list_expenses_by_username` with the provided username and return matching expenses.

---

## 🏷️ Filter by Category

### Query Examples
```
"Show me all food expenses"
"List expenses in the travel category"
"What are the office supplies expenses?"
"Display all entertainment expenses"
```

### Common Categories
- Food / Dining
- Travel / Transportation
- Office Supplies
- Entertainment
- Utilities
- Healthcare
- Shopping

### Expected Response
Claude will call `list_expenses_by_category` and return expenses matching that category.

---

## 📅 Filter by Date Range

### Query Examples
```
"Show expenses from last week"
"List expenses between January 1 and January 31"
"What expenses were made in December 2024?"
"Display all expenses from 2024-01-01 to 2024-01-31"
```

### Date Format Examples
```
"Show expenses from 2024-01-15 to 2024-01-20"
"List expenses between Jan 1 2024 and Jan 31 2024"
```

### Expected Response
Claude will call `list_expenses_by_date` with the start and end dates, returning expenses within that range.

---

## 💳 Filter by Payment Method

### Query Examples
```
"Show all credit card expenses"
"List expenses paid with cash"
"What expenses were paid by debit card?"
"Display PayPal expenses"
```

### Common Payment Methods
- Credit Card
- Cash
- Debit Card
- PayPal
- Bank Transfer
- Check

### Expected Response
Claude will call `list_expenses_by_payment_name` and return expenses matching the payment method.

---

## ➕ Create a New Expense

### Basic Creation
```
"Create an expense for $50 for lunch, category food, paid with cash, on 2024-01-15, user John"
```

### Detailed Creation
```
"Add a new expense:
- Amount: 125.50
- Description: Office supplies and printer paper
- Category: office
- Payment Method: credit card
- Date: 2024-01-15
- User: alice_smith"
```

### Simple Creation (Claude will ask for missing details)
```
"Create an expense for $30 for coffee"
```

Claude will prompt you for:
- Category
- Payment method
- Date
- Username

### Required Fields
All of these fields are **required** to create an expense:
- **amount** (number): The expense amount
- **description** (string): What the expense was for
- **category** (string): Category of expense
- **paymentMethod** (string): How it was paid
- **expenseDate** (string): Date in YYYY-MM-DD format
- **userName** (string): Username of the person

### Example with All Fields
```
"Create expense: $75.99, dinner at restaurant, food category, credit card, 2024-01-20, user john_doe"
```

### Expected Response
Claude will call `create_expense` and return the newly created expense with all details including the generated ID.

---

## 📊 Generate Reports

### Expense Summary
```
"Generate an expense summary"
"Give me a summary of all expenses"
"Create an expense summary for user John"
"Show me an expense summary for the food category"
```

### Detailed Report
```
"Create an expense report"
"Generate a detailed expense report"
"Give me an expense report for January 2024"
"Create an expense report from 2024-01-01 to 2024-01-31"
```

### What the Report Includes
- Total amount
- Breakdown by category
- Breakdown by payment method
- Top expenses
- Trends and insights

### Expected Response
Claude will use the `expense-summary` or `expense-report` prompt to generate a formatted analysis of the expenses.

---

## 🔄 Combined Queries

### Multiple Operations
```
"Show me all food expenses for John, then create a summary"
```

```
"List all expenses from last week and tell me the total"
```

```
"Show credit card expenses in the travel category"
```

Claude can combine multiple tool calls to answer complex queries.

---

## 📝 Complete Examples

### Example 1: Track Daily Expenses
```
User: "Create an expense: $12.50 for lunch at Subway, food category, cash payment, today, user john_doe"

Claude: [Calls create_expense tool]
"I've created the expense:
- Amount: $12.50
- Description: lunch at Subway
- Category: food
- Payment: cash
- Date: 2024-01-15
- User: john_doe
- ID: [generated-uuid]"
```

### Example 2: Monthly Analysis
```
User: "Show me all expenses from January 2024 and create a summary report"

Claude: [Calls list_expenses_by_date, then generates summary]
"Here's your January 2024 expense report:

Total: $2,547.89
Number of expenses: 45

By Category:
- Food: $856.20 (33.6%)
- Travel: $642.50 (25.2%)
- Office: $398.19 (15.6%)
...

Top 5 Expenses:
1. $450.00 - Flight to NYC (Travel)
2. $285.50 - Hotel accommodation (Travel)
...

Insights:
- Travel expenses dominated this month
- Average expense: $56.62
- Most common payment method: Credit Card"
```

### Example 3: Team Expense Tracking
```
User: "Show me all expenses for user sarah_jones in the office category"

Claude: [May need to call list_expenses then filter, or make multiple calls]
"Sarah Jones' office expenses:

1. $45.99 - Stapler and pens - 2024-01-10
2. $125.00 - Desk chair - 2024-01-15
3. $89.50 - Monitor stand - 2024-01-20

Total: $260.49"
```

### Example 4: Quick Entry
```
User: "I spent $8 on coffee this morning"

Claude: "I can create an expense for that. I need a few more details:
- Category: (e.g., food, drinks)
- Payment method: (e.g., cash, credit card)
- Your username: 
- Exact date:"

User: "drinks, credit card, john_doe, today"

Claude: [Calls create_expense]
"Expense created successfully!"
```

---

## 🎯 Best Practices

### 1. Be Specific with Dates
❌ Bad: "Show expenses from last month"
✅ Good: "Show expenses from 2024-01-01 to 2024-01-31"

### 2. Use Consistent Categories
Keep category names consistent:
- "food" not "Food" or "FOOD"
- "office supplies" not "office" or "supplies"

### 3. Use Standard Date Format
When creating expenses, use YYYY-MM-DD format:
- ✅ "2024-01-15"
- ❌ "01/15/2024" or "15-Jan-2024"

### 4. Include All Required Fields
When creating expenses, provide all 6 required fields to avoid back-and-forth.

### 5. Be Clear About Filters
❌ Bad: "Show me some expenses"
✅ Good: "Show me all food expenses for user John from last week"

---

## 🔍 Troubleshooting Queries

### If a query doesn't work:

1. **Tool not found error**
   - Restart Claude Desktop
   - Verify MCP server is running

2. **No expenses returned**
   - Check if database has data
   - Verify API is running
   - Try: "Show me all expenses" to confirm connection

3. **Create expense fails**
   - Ensure all 6 fields are provided
   - Check date format (YYYY-MM-DD)
   - Verify API is accessible

4. **Partial results**
   - Filters might be too restrictive
   - Check spelling of category/username
   - Verify date range includes actual expenses

---

## 📊 Sample Data for Testing

If your database is empty, create some test expenses:

```
"Create expense: $45.50, grocery shopping, food, credit card, 2024-01-15, user john_doe"
"Create expense: $120.00, flight ticket, travel, credit card, 2024-01-16, user alice_smith"
"Create expense: $25.99, office pens, office, cash, 2024-01-17, user bob_jones"
"Create expense: $89.99, team dinner, food, credit card, 2024-01-18, user john_doe"
"Create expense: $15.50, uber ride, travel, debit card, 2024-01-19, user alice_smith"
```

Then try various queries to test filtering and reporting.

---

## 🆘 Common Questions

**Q: Can I update or delete expenses?**
A: Currently, the MCP server only supports reading and creating expenses. Update/delete would need to be added.

**Q: Can I search by description?**
A: Not directly, but you can ask Claude to list all expenses and search the description text.

**Q: What date formats are supported?**
A: For creation, use YYYY-MM-DD. For queries, Claude can understand natural language dates like "last week" or "January 2024".

**Q: Can I see expenses across multiple users?**
A: Yes, use "Show me all expenses" to see everything, or combine filters.

**Q: How do I export expenses?**
A: Ask Claude to "format all expenses as a CSV" or "create a table of expenses" and Claude will format the data for you.

---

## 🎓 Advanced Queries

### Complex Analysis
```
"Show me all credit card expenses over $100 in the travel category from last month"
```

### Comparative Analysis
```
"Compare food expenses between John and Alice this month"
```

### Trend Analysis
```
"Show me expense trends over the last 3 months"
```

### Budget Tracking
```
"What's the total of all expenses this month? Is it under $2000?"
```

Claude can handle complex, multi-step queries by chaining tool calls and analyzing the data.

---

**Happy expense tracking! 🎉**

For more help, see:
- `QUICK_FIX.md` - Troubleshooting
- `CLAUDE_DESKTOP_SETUP.md` - Configuration
- `TROUBLESHOOTING.md` - All fixes applied