import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { ConversationController } from "../controllers/conversation.controller";

const router = Router();
const conversationController = new ConversationController();

router.post("/", auth, conversationController.createConversation);
router.get("/", auth, conversationController.getConversations);

export default router;