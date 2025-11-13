import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController";

const router = Router();

// Expense Routes
router.get("/", ExpenseController.getAllExpenses);
router.post("/", ExpenseController.createExpense);

export default router;
