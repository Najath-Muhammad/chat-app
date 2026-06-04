export interface IMessageRepository {
    findMessagesByConversationId(conversationId: string): Promise<any>;
}
