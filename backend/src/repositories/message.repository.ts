import Message from "../models/Message";

export class MessageRepository {
    async findMessagesByConversationId(conversationId: string) {
        return await Message.find({ conversationId });
    }
}
