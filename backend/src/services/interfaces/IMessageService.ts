export interface IMessageService {
    getMessagesService(conversationId: string): Promise<any>;
}
