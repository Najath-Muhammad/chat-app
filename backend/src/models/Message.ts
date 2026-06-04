import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    text: String,

    seen: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
})

export default mongoose.model(
    "Message",
    messageSchema
);