import prisma from "../models/prismaClient.js";

export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId: parseInt(chatId) },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    res.status(500).json({ error: "Error obteniendo mensajes" });
  }
};

export const createMessage = async (req, res) => {
  const {
    content,
    chatId,
    type = "text",
    audioDuration = null,
  } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: req.userId,
        chatId: parseInt(chatId, 10),
        audioDuration: type === "audio" ? audioDuration : null,
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    await prisma.chat.update({
      where: { id: parseInt(chatId, 10) },
      data: { lastMessageId: message.id },
    });

    res.json(message);
  } catch (error) {
    console.error("Error al guardar el mensaje:", error);
    res.status(500).json({ error: "Error al crear mensaje" });
  }
};

// Opcional: Endpoint para obtener mensajes por tipo
export const getMessagesByType = async (req, res) => {
  const { chatId, type } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId: parseInt(chatId),
        type: type,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    res.status(500).json({ error: "Error obteniendo mensajes" });
  }
};
