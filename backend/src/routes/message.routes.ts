import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { MessageController } from "../controllers/implementations/MessageController";
import { MessageService } from "../services/implementations/MessageService";
import { MessageRepository } from "../repositories/implementations/MessageRepository";

const router = Router();

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);

router.get("/unread", auth, messageController.getUnreadCounts);
router.get("/:id", auth, messageController.getMessages);

export default router;