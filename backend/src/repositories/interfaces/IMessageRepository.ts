export interface IMessageRepository {
    findMessagesByConversationId(conversationId: string): Promise<any>;
    getUnreadCounts(userId: string): Promise<any>;
}
