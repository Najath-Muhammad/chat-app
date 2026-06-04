import Conversation from "../../models/Conversation";
import { IConversationRepository } from "../interfaces/IConversationRepository";

export class ConversationRepository implements IConversationRepository {
    async createConversation(members: string[]): Promise<any> {
        return await Conversation.create({ members });
    }

    async findConversationsByUserId(userId: string): Promise<any> {
        return await Conversation.find({
            members: { $in: [userId] }
        }).populate("members", "username email");
    }
}
