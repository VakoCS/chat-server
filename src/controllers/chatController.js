import prisma from '../models/prismaClient.js';

export const createChat = async (req, res) => {
    const { members } = req.body; // IDs de los usuarios que participarán en el chat

    if (!members || members.length !== 2) {
        return res.status(400).json({ error: 'Un chat debe incluir exactamente 2 usuarios.' });
    }

    try {
        // Verificar que los usuarios existen
        const users = await prisma.user.findMany({
            where: { id: { in: members } },
        });

        if (users.length !== 2) {
            return res.status(404).json({ error: 'Uno o más usuarios no existen.' });
        }

        // Crear el chat
        const chat = await prisma.chat.create({
            data: {
                members: {
                    connect: members.map((id) => ({ id })),
                },
            },
            include: {
                members: { select: { id: true, username: true } },
            },
        });

        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el chat' });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const chats = await prisma.chat.findMany({
            where: {
                members: {
                    some: { id: req.userId },
                },
            },
            include: {
                members: {
                    select: { id: true, username: true },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo chats' });
    }
};
