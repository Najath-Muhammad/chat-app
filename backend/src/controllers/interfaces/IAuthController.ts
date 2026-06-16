import { Request, Response } from "express";

export interface IAuthController {
    register(req: Request, res: Response): Promise<any>;
    login(req: Request, res: Response): Promise<any>;
    getAllUsers(req: Request, res: Response): Promise<any>;
    updateProfile(req: any, res: Response): Promise<any>;
}
