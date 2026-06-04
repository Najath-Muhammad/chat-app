import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import socketHandler from "./sockets/socket";


dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173"
    }
});

socketHandler(io)

app.use(cors());
app.use(express.json({ limit: '10mb' }));


if (process.env.MONGO_URI) {
    console.log('mongod db connected')
    connectDB();
}

app.get("/", (req: Request, res: Response) => {
    res.send("API Running");
});

app.use("/api/auth", authRoutes)
app.use("/api/conversations",conversationRoutes)
app.use("/api/messages", messageRoutes)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
