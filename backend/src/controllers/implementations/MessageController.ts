import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IMessageController } from "../interfaces/IMessageController";
import { IMessageService } from "../../services/interfaces/IMessageService";
import { STATUS_CODES } from "../../constants/statusCodes";

export class MessageController implements IMessageController {
    private messageService: IMessageService;

    constructor(messageService: IMessageService) {
        this.messageService = messageService;
    }

    getMessages = async (req: AuthRequest, res: Response): Promise<any> => {
        try {
            const messages = await this.messageService.getMessagesService(req.params.id as string);
            res.status(STATUS_CODES.OK).json(messages);
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        }
    }
}
