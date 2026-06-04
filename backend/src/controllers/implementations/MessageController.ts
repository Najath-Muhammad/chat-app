import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IMessageController } from "../interfaces/IMessageController";
import { IMessageService } from "../../services/interfaces/IMessageService";

export class MessageController implements IMessageController {
    private messageService: IMessageService;

    constructor(messageService: IMessageService) {
        this.messageService = messageService;
    }

    getMessages = async (req: AuthRequest, res: Response): Promise<any> => {
        try {
            const messages = await this.messageService.getMessagesService(req.params.id as string);
            res.json(messages);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}
