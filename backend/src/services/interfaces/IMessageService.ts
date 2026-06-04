export interface IMessageService {
    getMessagesService(conversationId: string): Promise<any>;
    getUnreadCountsService(userId: string): Promise<any>;
}
