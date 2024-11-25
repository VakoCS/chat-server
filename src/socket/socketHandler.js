import prisma from '../models/prismaClient.js';

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('Usuario conectado:', socket.id);

        // Escuchar el evento para enviar un mensaje
        socket.on('send-message', async (messageData) => {
            try {
                // Guardar mensaje en la base de datos
                const message = await prisma.message.create({
                    data: {
                        content: messageData.content,
                        chatId: parseInt(messageData.chatId, 10),
                        senderId: messageData.senderId,
                    },
                    include: { sender: true }, // Incluir el remitente
                });

                // Emitir el mensaje guardado a todos los clientes conectados
                io.emit('new-message', message);
                console.log('Mensaje emitido:', message);
            } catch (error) {
                console.error('Error guardando el mensaje en la base de datos:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);
        });
    });
};

