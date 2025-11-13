import { Request, Response } from "express";
import pool, { query } from "../config/database";
import { User, UserQueryParams } from "../models/User";

export class UserController {
  //GET /api/users
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { userId, fullName, email, phoneNumber } =
        req.query as UserQueryParams;

      let queryText =
        "select user_id, full_name, email, phone_number from expense_mgmt.users";

      const params: any[] = [];
      let paramCount = 1;

      //Add Filters
      if (userId) {
        queryText += ` where user_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      }

      if (fullName) {
        queryText += ` and full_name ilike $${paramCount}`;
        params.push(`%${fullName}%`);
        paramCount++;
      }

      if (phoneNumber) {
        queryText += ` and phone_number ilike $${paramCount}`;
        params.push(`%${phoneNumber}%`);
        paramCount++;
      }

      if (email) {
        queryText += ` and email ilike $${paramCount}`;
        params.push(`%${email}%`);
        paramCount++;
      }

      queryText += ` order by user_id desc`;
      const result = await query(queryText, params);
      console.info(`Query: ${queryText} with params ${params}`);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get User By Id : /api/users/:id
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const queryText =
        "select user_id, full_name, email, phone_number from expense_mgmt.users where user_id = $1";
      const result = await query(queryText, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.json({
          success: true,
          data: result.rows[0],
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get User By Email : /api/users/email/:email
  static async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Email parameter is required",
        });
        return;
      }

      const queryText =
        "select user_id, full_name, email, phone_number, created_at from expense_mgmt.users where email = $1";
      const result = await query(queryText, [email]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Not Found",
          message: `User with email '${email}' not found`,
        });
        return;
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error fetching user by email:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Create User : /api/users
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, phoneNumber } = req.body;

      const queryText =
        "insert into expense_mgmt.users (full_name, email, phone_number) values ($1, $2, $3) returning user_id";
      const result = await query(queryText, [fullName, email, phoneNumber]);

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  //Update User : /api/users/:id
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fullName, email, phoneNumber } = req.body;

      const queryText =
        "update expense_mgmt.users set full_name = $1, email = $2, phone_number = $3 where user_id = $4 returning user_id";
      const result = await query(queryText, [fullName, email, phoneNumber, id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.json({
          success: true,
          data: result.rows[0],
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  //Delete User : /api/users/:id
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const queryText = "delete from users where id = $1 returning user_id";
      const result = await query(queryText, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.json({
          success: true,
          data: result.rows[0],
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
