import Message from "../../models/Message";
import { IMessageRepository } from "../interfaces/IMessageRepository";

export class MessageRepository implements IMessageRepository {
    async findMessagesByConversationId(conversationId: string): Promise<any> {
        return await Message.find({ conversationId });
    }
}
