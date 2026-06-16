import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/implementations/AuthController";
import { AuthService } from "../services/implementations/AuthService";
import { AuthRepository } from "../repositories/implementations/AuthRepository";

const router = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", authController.getAllUsers);
router.put("/profile", auth, authController.updateProfile);

export default router;