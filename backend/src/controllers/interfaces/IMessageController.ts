import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

export interface IMessageController {
    getMessages(req: AuthRequest, res: Response): Promise<any>;
    getUnreadCounts(req: AuthRequest, res: Response): Promise<any>;
}
