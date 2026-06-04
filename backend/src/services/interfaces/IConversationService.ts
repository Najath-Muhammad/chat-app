export interface IConversationService {
    createConversationService(userId: string, receiverId: string): Promise<any>;
    getConversationsService(userId: string): Promise<any>;
}
