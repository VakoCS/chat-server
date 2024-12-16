import prisma from "../models/prismaClient.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);
    console.log("Dirección IP:", socket.handshake.address);

    socket.on("join-chat", (chatId) => {
      const room = `chat-${chatId}`;
      socket.join(room);
      console.log(
        `Usuario ${socket.id} se unió al chat ${chatId} (sala: ${room})`
      );
    });

    socket.on("send-message", async (messageData) => {
      try {
        console.log("Mensaje recibido en socket:", messageData);

        const message = await prisma.message.create({
          data: {
            content: messageData.content,
            type: messageData.type || "text",
            chatId: parseInt(messageData.chatId, 10),
            senderId: parseInt(messageData.senderId, 10),
            // Añadir duración del audio si es un mensaje de audio
            ...(messageData.type === "audio" && messageData.audioDuration
              ? { audioDuration: parseFloat(messageData.audioDuration) }
              : {}),
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
        });

        console.log("Mensaje guardado en base de datos:", message);

        // Actualizar el último mensaje del chat
        await prisma.chat.update({
          where: { id: parseInt(messageData.chatId, 10) },
          data: { lastMessageId: message.id },
        });

        console.log(
          `Emitiendo mensaje a sala chat-${messageData.chatId}:`,
          message
        );
        // Emitir a todos en la sala específica
        io.to(`chat-${messageData.chatId}`).emit("new-message", message);
      } catch (error) {
        console.error("Error guardando el mensaje:", error);
        socket.emit("message-error", {
          error: "Error al guardar el mensaje",
          content: messageData.content,
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Usuario desconectado (${socket.id}). Razón: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error("Error en socket:", error);
    });
  });
};
