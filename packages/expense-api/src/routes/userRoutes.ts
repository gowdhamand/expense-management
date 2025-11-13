import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

// User Routes
router.get("/", UserController.getAllUsers);
router.get("/users/email/:email", UserController.getUserByEmail);
router.get("/users/:id", UserController.getUserById);
router.post("/users", UserController.createUser);
router.put("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);

export default router;
