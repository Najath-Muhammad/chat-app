import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ConversationService } from "../services/conversation.service";

export class ConversationController {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();
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