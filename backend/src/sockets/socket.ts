import Message from "../models/Message";

interface User {
    userId: string;
    socketId: string;
}

let users: User[] = [];

export default (io: any) => {

    io.on("connection", (socket: any) => {

        console.log("Socket connected")

        socket.on("add-user", (userId: any) => {

            users.push({
                userId,
                socketId: socket.id
            })
        })

        socket.on("send-message", async(data: any) => {
            const { senderId, receiverId, conversationId, text, image, audio, isEphemeral } = data;
            
            const messageData: any = { senderId, conversationId, text, seen: false };
            if (image) messageData.image = image;
            if (audio) messageData.audio = audio;
            if (isEphemeral) {
                messageData.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            }

            const message = await Message.create(messageData);

            const receiver = users.find(user => user.userId === receiverId);

            if(receiver) {
                io.to(receiver.socketId).emit("receive-message", message);
            }
        })

        socket.on("typing", ({ receiverId }: { receiverId: string }) => {
            const receiver = users.find(user => user.userId === receiverId);
            if (receiver) {
                io.to(receiver.socketId).emit("show-typing");
            }
        });

        socket.on("seen-message", async ({ messageId }: { messageId: string }) => {
            const message = await Message.findByIdAndUpdate(messageId, { seen: true }, { new: true });
            if (message) {
                const sender = users.find(user => user.userId === message.senderId.toString());
                if (sender) {
                    io.to(sender.socketId).emit("message-seen", { messageId: message._id });
                }
            }
        });

        socket.on("disconnect", () => {
            users = users.filter(
                user => user.socketId !== socket.id
            )
            console.log("Disconnected")
        })
    })
}