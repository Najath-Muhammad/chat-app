import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { ConversationController } from "../controllers/implementations/ConversationController";
import { ConversationService } from "../services/implementations/ConversationService";
import { ConversationRepository } from "../repositories/implementations/ConversationRepository";

const router = Router();

const conversationRepository = new ConversationRepository();
const conversationService = new ConversationService(conversationRepository);
const conversationController = new ConversationController(conversationService);

router.post("/", auth, conversationController.createConversation);
router.get("/", auth, conversationController.getConversations);

export default router;