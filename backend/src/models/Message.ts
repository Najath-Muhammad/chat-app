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
    },
    image: {
        type: String,
        default: ""
    },
    expiresAt: {
        type: Date,
        expires: 0 // Automatically deletes the document when current time >= expiresAt
    }

}, {
    timestamps: true
})

export default mongoose.model(
    "Message",
    messageSchema
);