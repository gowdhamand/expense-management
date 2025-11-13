import { object, z } from "zod";
import { ExpenseApiClient } from "../client/expenseClient.js";
import { CreateExpenseSchema } from "./types.js";

const client = new ExpenseApiClient();

/**
 * Tool definition for MCP Server
 */

export const expenseTools = [
  {
    name: "list_expenses",
    description: "List all expenses",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_expense_by_username",
    description: "List all expenses by username",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "username of the user to retrive expense",
        },
      },
    },
  },
  {
    name: "list_expense_by_dates",
    description: "List all expenses by dates",
    inputSchema: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "start date of the expense",
        },
        endDate: {
          type: "string",
          description: "end date of the expense",
        },
      },
    },
  },
  {
    name: "list_expenses_by_category",
    description: "List all expenses by category",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "category of the expense",
        },
      },
    },
  },
  {
    name: "list_Expense_by_Payment_Name",
    description: "List all expenses by payment name",
    inputSchema: {
      type: "object",
      properties: {
        paymentName: {
          type: "string",
          description: "payment name of the expense",
        },
      },
    },
  },
  {
    name: "create_expense",
    description: "Create a new expense",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "amount of the expense",
        },
        description: {
          type: "string",
          description: "description of the expense",
        },
        category: {
          type: "string",
          description: "category of the expense",
        },
        date: {
          type: "string",
          description: "date of the expense",
        },
        userName: {
          type: "string",
          description: "username of the user to create expense",
        },
      },
    },
  },
];

/**
 * Tool handlers
 */
export async function handleToolCall(
  toolName: string,
  args: any,
): Promise<any> {
  try {
    switch (toolName) {
      case "list_expenses":
        return await listExpenses();
      case "list_expenses_by_username":
        return await listExpensesByUsername(args);
      case "list_expenses_by_category":
        return await listExpensesByCategory(args);
      case "list_expenses_by_date":
        return await listExpensesByDates(args);
      case "list_expenses_by_payment_name":
        return await listExpensesByPaymentMethod(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    const error_message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error_message}`,
        },
      ],
      isError: true,
    };
  }
}

async function listExpenses(): Promise<any> {
  const expenses = await client.getAllExpenses();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(expenses, null, 2),
      },
    ],
  };
}

async function listExpensesByUsername(args: any): Promise<any> {
  const expenses = await client.getExpenseByUserName(args.username);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(expenses, null, 2),
      },
    ],
  };
}

/**
 * Create expense
 */
async function createExpense(args: any): Promise<any> {
  const validatedDate = CreateExpenseSchema.parse(args);
  const expense = await client.createExpense(validatedDate);
  return {
    content: [
      {
        type: "text",
        text: `Expense Created: ${JSON.stringify(expense, null, 2)}`,
      },
    ],
  };
}

/**
 * Get Expense By Category
 */
async function listExpensesByCategory(category: string): Promise<any> {
  const expenses = await client.getExpenseByCategory(category);
  return {
    content: [
      {
        type: "text",
        text: `Expense List By Category: ${JSON.stringify(expenses, null, 2)}`,
      },
    ],
  };
}

/**
 * Get Expenese by Payment Method
 */
async function listExpensesByPaymentMethod(
  paymentMethod: string,
): Promise<any> {
  const expenses = await client.getExpenseByPaymentMethod(paymentMethod);
  return {
    content: [
      {
        type: "text",
        text: `Expense List By Payment Method: ${JSON.stringify(expenses, null, 2)}`,
      },
    ],
  };
}

/**
 * Get Expenese by Expense Dates
 */
async function listExpensesByDates(args: any): Promise<any> {
  const expenses = await client.getExpenseByDates(
    new Date(args.startDate),
    new Date(args.endDate),
  );
  return {
    content: [
      {
        type: "text",
        text: `Expense List By Dates: ${JSON.stringify(expenses, null, 2)}`,
      },
    ],
  };
}
