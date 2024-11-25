import prisma from '../models/prismaClient.js';

export const getChatMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: { chatId: parseInt(chatId) },
            include: { sender: true }, // Asegúrate de incluir el remitente
            orderBy: { createdAt: 'asc' },
        });
        res.json(messages);
    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        res.status(500).json({ error: 'Error obteniendo mensajes' });
    }
};

export const createMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    try {
        // Guardar el mensaje en la base de datos
        const message = await prisma.message.create({
            data: {
                content,
                senderId: req.userId, // ID del usuario autenticado
                chatId: parseInt(chatId, 10),
            },
            include: { sender: true }, // Incluir datos del remitente
        });

        res.json(message);
    } catch (error) {
        console.error('Error al guardar el mensaje:', error);
        res.status(500).json({ error: 'Error al crear mensaje' });
    }
};
