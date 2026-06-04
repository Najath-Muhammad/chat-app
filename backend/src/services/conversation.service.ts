import { ConversationRepository } from "../repositories/conversation.repository";

export class ConversationService {
    private conversationRepository: ConversationRepository;

    constructor() {
        this.conversationRepository = new ConversationRepository();
    }

    async createConversationService(userId: string, receiverId: string) {
        return await this.conversationRepository.createConversation([userId, receiverId]);
    }

    async getConversationsService(userId: string) {
        return await this.conversationRepository.findConversationsByUserId(userId);
    }
}
