import { MessageRepository } from "../repositories/message.repository";

export class MessageService {
    private messageRepository: MessageRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
    }

    async getMessagesService(conversationId: string) {
        return await this.messageRepository.findMessagesByConversationId(conversationId);
    }
}
