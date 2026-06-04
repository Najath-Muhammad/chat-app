import { Request, Response } from "express";
import { IAuthController } from "../interfaces/IAuthController";
import { IAuthService } from "../../services/interfaces/IAuthService";
import { STATUS_CODES } from "../../constants/statusCodes";
import { MESSAGES } from "../../constants/messages";

export class AuthController implements IAuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response): Promise<any> => {
        try {
            const user = await this.authService.registerService(req.body);
            res.status(STATUS_CODES.CREATED).json(user);
        } catch (error: any) {
            if (error.message === MESSAGES.USER_ALREADY_EXISTS) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
            }
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        }
    }

    login = async (req: Request, res: Response): Promise<any> => {
        try {
            const result = await this.authService.loginService(req.body);
            res.status(STATUS_CODES.OK).json(result);
        } catch (error: any) {
            if (error.message === MESSAGES.USER_NOT_FOUND) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ message: error.message });
            }
            if (error.message === MESSAGES.INVALID_CREDENTIALS) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
            }
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        }
    }

    getAllUsers = async (req: Request, res: Response): Promise<any> => {
        try {
            const users = await this.authService.getAllUsersService();
            res.status(STATUS_CODES.OK).json(users);
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        }
    }
}
