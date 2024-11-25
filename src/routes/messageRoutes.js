import express from 'express';
import { getChatMessages, createMessage } from '../controllers/messageController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:chatId', authenticate, getChatMessages);
router.post('/', authenticate, createMessage);

export default router;
