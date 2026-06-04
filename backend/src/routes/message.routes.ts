import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { MessageController } from "../controllers/message.controller";

const router = Router();
const messageController = new MessageController();

router.get("/:id", auth, messageController.getMessages);

export default router;