import { Router } from "express";
import { 
    chatController, 
    knowledgeBaseController, 
    getUserChatsController, 
    getChatMessagesController, 
    deleteChatController,
    getDocumentsController,
    deleteDocumentController
} from "../controller/ragController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken as any);

router.post("/chat", chatController as any)
router.post("/upload", upload.single("file"), knowledgeBaseController as any)
router.get("/chats", getUserChatsController as any)
router.get("/chats/:chatId", getChatMessagesController as any)
router.delete("/chats/:chatId", deleteChatController as any)

router.get("/documents", getDocumentsController as any)
router.delete("/documents/:filename", deleteDocumentController as any)

export default router