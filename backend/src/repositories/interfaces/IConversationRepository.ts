export interface IConversationRepository {
    createConversation(members: string[]): Promise<any>;
    findConversationsByUserId(userId: string): Promise<any>;
}
