import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Expense Management API",
      version: "1.0.0",
      description: "REST API for managing expenses with PostgreSQL",
      contact: {
        name: "API Support",
        email: "support@expense-api.example.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./openapi.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
