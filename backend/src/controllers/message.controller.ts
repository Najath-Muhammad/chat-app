import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { MessageService } from "../services/message.service";

export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
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