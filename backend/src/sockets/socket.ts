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

            const {
                senderId,
                receiverId,
                conversationId,
                text
            } = data

            const message =
            await Message.create({
                senderId,
                conversationId,
                text
            })

            const receiver =
            users.find(
                user => user.userId === receiverId
            )

            if(receiver) {

                io.to(receiver.socketId).emit(
                    "receive-message",
                    message
                )
            }
        })

        socket.on("disconnect", () => {
            users = users.filter(
                user => user.socketId !== socket.id
            )
            console.log("Disconnected")
        })
    })
}