import prisma from "../models/prismaClient.js";

export const createChat = async (req, res) => {
  const { members } = req.body;

  if (!members || members.length !== 2) {
    return res
      .status(400)
      .json({ error: "Un chat debe incluir exactamente 2 usuarios." });
  }

  try {
    // Verificar chat existente
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { members: { some: { id: members[0] } } },
          { members: { some: { id: members[1] } } },
        ],
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      return res.status(400).json({
        error: "Ya existe un chat con este usuario",
        existingChatId: existingChat.id,
      });
    }

    // Crear nuevo chat
    const chat = await prisma.chat.create({
      data: {
        members: {
          connect: members.map((id) => ({ id })),
        },
      },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Transformar el resultado para mantener consistencia
    const formattedChat = {
      ...chat,
      lastMessage: chat.messages[0] || null,
      messages: undefined,
    };

    res.json(formattedChat);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al crear el chat" });
  }
};

// chatController.js
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
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformar los chats para tener el formato correcto
    const formattedChats = chats.map((chat) => ({
      ...chat,
      lastMessage: chat.messages[0] || null,
    }));

    res.json(formattedChats);
  } catch (error) {
    console.error("Error obteniendo chats:", error);
    res.status(500).json({ error: "Error obteniendo chats" });
  }
};
