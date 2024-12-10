import prisma from "../models/prismaClient.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("join-chat", (chatId) => {
      const room = `chat-${chatId}`;
      socket.join(room);
      console.log(
        `Usuario ${socket.id} se unió al chat ${chatId} (sala: ${room})`
      );
    });

    socket.on("send-message", async (messageData) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: messageData.content,
            chatId: parseInt(messageData.chatId, 10),
            senderId: parseInt(messageData.senderId, 10),
          },
          include: {
            sender: true,
          },
        });
    
        // Emitir a todos los clientes
        io.emit("new-message", message);
      } catch (error) {
        console.error("Error guardando el mensaje:", error);
        socket.emit("message-error", {
          error: "Error al guardar el mensaje",
          content: messageData.content,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });
};
