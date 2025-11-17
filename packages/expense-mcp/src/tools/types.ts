import { z } from "zod";

//Expense Schema
export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  userName: z.string().min(1).max(255),
  category: z.string().min(1).max(255),
  paymentMethod: z.string().min(1).max(255),
  amount: z.number().min(0),
  description: z.string().min(1).max(255),
  createdAt: z.date().min(new Date(0)).max(new Date()),
});

//Expense Type
export type Expense = z.infer<typeof ExpenseSchema>;

//Create Expense Schema
export const CreateExpenseSchema = z.object({
  userName: z.string().min(1).max(255),
  category: z.string().min(1).max(255),
  paymentMethod: z.string().min(1).max(255),
  amount: z.number().min(0),
  description: z.string().min(1).max(255),
  expenseDate: z.string().min(1),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
