import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IConversationController } from "../interfaces/IConversationController";
import { IConversationService } from "../../services/interfaces/IConversationService";

export class ConversationController implements IConversationController {
    private conversationService: IConversationService;

    constructor(conversationService: IConversationService) {
        this.conversationService = conversationService;
    }

    createConversation = async (req: AuthRequest, res: Response): Promise<any> => {
        try {
            const conversation = await this.conversationService.createConversationService(req.user.id, req.body.receiverId);
            res.status(201).json(conversation);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    getConversations = async (req: AuthRequest, res: Response): Promise<any> => {
        try {
            const conversations = await this.conversationService.getConversationsService(req.user.id);
            res.json(conversations);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}
