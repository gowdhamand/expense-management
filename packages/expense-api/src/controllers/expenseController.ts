import { Request, Response } from "express";
import pool, { query } from "../config/database";
import { Expense, ExpenseQueryParams } from "../models/Expense";
import { get } from "http";

export class ExpenseController {
  // GET All Expense
  static async getAllExpenses(req: Request, res: Response) {
    try {
      const {
        userName,
        category,
        paymentMethod,
        expenseDate,
        createdAt,
        expenseStartDate,
        expenseEndDate,
      } = req.query as ExpenseQueryParams;

      let queryText = "select * from expense_mgmt.expense_data where 1=1 ";

      const params: any[] = [];
      let paramCount = 1;

      if (userName) {
        queryText += ` and user_name ilike $${paramCount}`;
        params.push(`%${userName}%`);
        paramCount++;
      }

      if (category) {
        queryText += ` and category ilike $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      if (paymentMethod) {
        queryText += ` and payment_method ilike $${paramCount}`;
        params.push(paymentMethod);
        paramCount++;
      }

      if (expenseDate) {
        queryText += ` and expense_date = $${paramCount}`;
        params.push(expenseDate);
        paramCount++;
      }

      if (createdAt) {
        queryText += ` and created_at = $${paramCount}`;
        params.push(createdAt);
        paramCount++;
      }

      if (expenseStartDate) {
        queryText += ` and expense_date >= '${paramCount}'`;
        params.push(expenseStartDate);
        paramCount++;
      }

      if (expenseEndDate) {
        queryText += ` and expense_date <= '${paramCount}'`;
        params.push(expenseEndDate);
        paramCount++;
      }

      if (expenseStartDate && expenseEndDate) {
        queryText += ` and expense_date between '${paramCount}' and '${paramCount + 1}'`;
        params.push(expenseStartDate);
        params.push(expenseEndDate);
        paramCount += 2;
      }

      queryText += " order by created_at desc";
      const result = await query(queryText, params);
      console.info(
        `query: ${queryText} with params: ${JSON.stringify(params)}`,
      );

      res.json({
        success: true,
        conunt: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch expenses",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getNewId(): Promise<number> {
    try {
      const queryText = "select nextval('expense_mgmt.expense_data_id_seq')";
      const result = await query(queryText);
      return result.rows[0].nextval;
    } catch (error) {
      throw new Error(
        `Failed to generate new ID ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  static async createExpense(req: Request, res: Response) {
    try {
      const {
        amount,
        description,
        category,
        paymentMethod,
        expenseDate,
        userName,
      } = req.body;

      //ID column for auto-increment
      const id = await ExpenseController.getNewId();

      const queryText = `
        insert into expense_mgmt.expense_data (amount, description, category, payment_method, expense_date, id, user_name)
        values ($1, $2, $3, $4, $5, $6, $7)
        returning *
      `;
      const params = [
        amount,
        description,
        category,
        paymentMethod,
        expenseDate,
        id,
        userName,
      ];

      const result = await query(queryText, params);
      console.info(
        `query: ${queryText} with params: ${JSON.stringify(params)}`,
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to create expense",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
