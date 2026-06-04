import { IMessageService } from "../interfaces/IMessageService";
import { IMessageRepository } from "../../repositories/interfaces/IMessageRepository";

export class MessageService implements IMessageService {
    private messageRepository: IMessageRepository;

    constructor(messageRepository: IMessageRepository) {
        this.messageRepository = messageRepository;
    }

    async getMessagesService(conversationId: string): Promise<any> {
        return await this.messageRepository.findMessagesByConversationId(conversationId);
    }

    async getUnreadCountsService(userId: string): Promise<any> {
        return await this.messageRepository.getUnreadCounts(userId);
    }
}
