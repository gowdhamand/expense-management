import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import pool from "./config/database";
import { swaggerSpec, swaggerUi } from "./config/swagger-config";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Logging Middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Expense Management API",
    version: "1.0.0",
    routes: {
      users: "/api/users",
      expenses: "/api/expenses",
    },
  });
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1");
    if (result.rowCount === 0) {
      throw new Error("Database connection failed");
    }
    return res.status(200).json({
      status: "success",
      message: "Server is healthy",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server is unhealthy",
    });
    return;
  }
});

//API routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Not Found",
    error: "The requested resource was not found",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} and http://localhost:${PORT}`);
});
