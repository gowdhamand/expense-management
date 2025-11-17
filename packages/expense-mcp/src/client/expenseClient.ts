import axios, { AxiosInstance } from "axios";
import { Expense, CreateExpenseInput } from "../tools/types.js";
import { config } from "../config.js";

export class ExpenseApiClient {
  private client: AxiosInstance;

  constructor(baseURL = config.expenseApiUrl) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
  }

  /**
   * Get All Expenses
   */
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const response = await this.client.get("/api/expenses");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get expense based on UserName passed by Parameter
   */
  async getExpenseByUserName(userName: string): Promise<Expense[]> {
    try {
      const response = await this.client.get("/api/expenses", {
        params: { userName: userName },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get expense based on category passed by Parameter
   */
  async getExpenseByCategory(category: string): Promise<Expense[]> {
    try {
      const response = await this.client.get("/api/expenses", {
        params: { category: category },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get expense based on Payment Method passed by Parameter
   */
  async getExpenseByPaymentMethod(paymentMethod: string): Promise<Expense[]> {
    try {
      const response = await this.client.get("/api/expenses", {
        params: { paymentMethod: paymentMethod },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get expense based on expense dates
   */
  async getExpenseByDates(startDate: Date, endDate: Date): Promise<Expense[]> {
    try {
      const response = await this.client.get("/api/expenses", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Create expense
   */
  async createExpense(expense: CreateExpenseInput): Promise<Expense> {
    try {
      const response = await this.client.post("/api/expenses", expense);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Healthe check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/health");
      return response.status === 200;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  /**
   * Handle error
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(`Expense API Error : ${message}`);
    }
    return error instanceof Error ? error : new Error("Unknown error");
  }
}
