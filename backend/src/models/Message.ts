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
    audio: {
        type: String,
        default: ""
    },
    reaction: {
        type: String,
        default: ""
    },
    replyTo: {
        type: String, // Or ObjectId, string is simpler for frontend compatibility
        default: null
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