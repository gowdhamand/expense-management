export interface Expense {
  id: number;
  userName: string;
  category: string;
  paymentMethod: string;
  amount: number;
  expenseDate: Date;
  description: string;
  createdAt: Date;
}

export interface CreateExpenseDTO {
  userName: string;
  category: string;
  paymentMethod: string;
  amount: number;
  description: string;
  createdAt: Date;
}

export interface UpdateExpenseDTO {
  id: number;
  userName: string;
  category: string;
  paymentMethod: string;
  amount: number;
  expenseDate: Date;
  description: string;
  createdAt: Date;
}

export interface ExpenseQueryParams {
  userName?: string;
  category?: string;
  paymentMethod?: string;
  amount?: number;
  expenseDate?: Date;
  expenseStartDate?: Date;
  expenseEndDate?: Date;
  description?: string;
  createdAt?: Date;
}
