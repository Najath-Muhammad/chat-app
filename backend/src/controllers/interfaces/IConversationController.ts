import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";

export interface IConversationController {
    createConversation(req: AuthRequest, res: Response): Promise<any>;
    getConversations(req: AuthRequest, res: Response): Promise<any>;
}
