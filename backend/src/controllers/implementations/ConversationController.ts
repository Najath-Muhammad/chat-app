import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IConversationController } from "../interfaces/IConversationController";
import { IConversationService } from "../../services/interfaces/IConversationService";
import { STATUS_CODES } from "../../constants/statusCodes";

export class ConversationController implements IConversationController {
    private conversationService: IConversationService;

    constructor(conversationService: IConversationService) {
        this.conversationService = conversationService;
    }

    createConversation = async (req: AuthRequest, res: Response): Promise<any> => {
        try {
            const conversation = await this.conversationService.createConversationService(req.user.id, req.body.receiverId);
            res.status(STATUS_CODES.CREATED).json(conversation);
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        }
    }

    getConversations = async (req: AuthRequest, res: Response): Promise<any> => {
        try {
            const conversations = await this.conversationService.getConversationsService(req.user.id);
            res.status(STATUS_CODES.OK).json(conversations);
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        }
    }
}
