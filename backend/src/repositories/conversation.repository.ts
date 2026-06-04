import Conversation from "../models/Conversation";

export class ConversationRepository {
    async createConversation(members: string[]) {
        return await Conversation.create({ members });
    }

    async findConversationsByUserId(userId: string) {
        return await Conversation.find({
            members: { $in: [userId] }
        });
    }
}
