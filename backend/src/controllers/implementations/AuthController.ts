import { Request, Response } from "express";
import { IAuthController } from "../interfaces/IAuthController";
import { IAuthService } from "../../services/interfaces/IAuthService";

export class AuthController implements IAuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response): Promise<any> => {
        try {
            const user = await this.authService.registerService(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            if (error.message === "User already exists") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json(error);
        }
    }

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = await this.authService.loginService(req.body);
            res.json(result);
        } catch (error: any) {
            if (error.message === "User not found") {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === "Invalid credentials") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json(error);
        }
    }
}
