import Message from "../../models/Message";
import Conversation from "../../models/Conversation";
import mongoose from "mongoose";
import { IMessageRepository } from "../interfaces/IMessageRepository";

export class MessageRepository implements IMessageRepository {
    async findMessagesByConversationId(conversationId: string): Promise<any> {
        return await Message.find({ conversationId });
    }

    async getUnreadCounts(userId: string): Promise<any> {
        const myConversations = await Conversation.find({ members: { $in: [userId] } });
        const myConversationIds = myConversations.map(c => c._id);
        
        return await Message.aggregate([
            { $match: { 
                conversationId: { $in: myConversationIds },
                senderId: { $ne: new mongoose.Types.ObjectId(userId) },
                seen: false 
            } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);
    }
}
