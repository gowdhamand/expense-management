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
    name: "list_expenses_by_username",
    description: "List all expenses by username",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "username of the user to retrive expense",
        },
      },
    },
  },
  {
    name: "list_expenses_by_date",
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
    name: "list_expenses_by_payment_name",
    description: "List all expenses by payment name",
    inputSchema: {
      type: "object",
      properties: {
        paymentMethod: {
          type: "string",
          description: "payment method of the expense",
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
        paymentMethod: {
          type: "string",
          description:
            "payment method of the expense (e.g., cash, credit card)",
        },
        expenseDate: {
          type: "string",
          description: "date of the expense (ISO format: YYYY-MM-DD)",
        },
        userName: {
          type: "string",
          description: "username of the user to create expense",
        },
      },
      required: [
        "amount",
        "description",
        "category",
        "paymentMethod",
        "expenseDate",
        "userName",
      ],
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
      case "create_expense":
        return await createExpense(args);
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
  try {
    console.error(
      "[DEBUG] createExpense called with args:",
      JSON.stringify(args),
    );

    const validatedData = CreateExpenseSchema.parse(args);
    console.error("[DEBUG] Validation passed:", JSON.stringify(validatedData));

    const expense = await client.createExpense(validatedData);
    console.error(
      "[DEBUG] Expense created successfully:",
      JSON.stringify(expense),
    );

    return {
      content: [
        {
          type: "text",
          text: `Expense Created Successfully!\n\n${JSON.stringify(expense, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    console.error("[ERROR] Failed to create expense:", error);
    if (error instanceof Error) {
      console.error("[ERROR] Error message:", error.message);
      console.error("[ERROR] Error stack:", error.stack);
    }
    return {
      content: [
        {
          type: "text",
          text: `Failed to create expense: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get Expense By Category
 */
async function listExpensesByCategory(args: any): Promise<any> {
  const expenses = await client.getExpenseByCategory(args.category);
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
async function listExpensesByPaymentMethod(args: any): Promise<any> {
  const expenses = await client.getExpenseByPaymentMethod(args.paymentMethod);
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
