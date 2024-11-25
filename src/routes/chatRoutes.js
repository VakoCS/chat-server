import express from 'express';
import { getUserChats, createChat } from '../controllers/chatController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getUserChats); // Obtener chats del usuario autenticado
router.post('/', authenticate, createChat);  // Crear un nuevo chat entre dos usuarios

export default router;
