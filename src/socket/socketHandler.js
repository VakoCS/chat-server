import prisma from "../models/prismaClient.js";

// socketHandler.js
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
        console.log("Mensaje recibido:", messageData);

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

        console.log("Mensaje guardado:", message);
        io.emit("new-message", message);
      } catch (error) {
        console.error("Error procesando mensaje:", error);
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
