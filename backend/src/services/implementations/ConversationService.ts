import { IConversationService } from "../interfaces/IConversationService";
import { IConversationRepository } from "../../repositories/interfaces/IConversationRepository";

export class ConversationService implements IConversationService {
    private conversationRepository: IConversationRepository;

    constructor(conversationRepository: IConversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    async createConversationService(userId: string, receiverId: string): Promise<any> {
        return await this.conversationRepository.createConversation([userId, receiverId]);
    }

    async getConversationsService(userId: string): Promise<any> {
        return await this.conversationRepository.findConversationsByUserId(userId);
    }
}
