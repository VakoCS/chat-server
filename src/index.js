import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import { networkInterfaces } from "os";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { socketHandler } from "./socket/socketHandler.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware para logging de conexiones socket
io.use((socket, next) => {
  console.log("Nueva conexión socket intentando conectar:", socket.id);
  console.log("Dirección IP:", socket.handshake.address);
  next();
});

// Middleware
app.use(bodyParser.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);

// Socket.io
socketHandler(io);

// Función auxiliar para obtener la IP local
function getLocalIpAddress() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  const localIP = getLocalIpAddress();
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Accesible localmente en: http://localhost:${PORT}`);
  console.log(`Accesible en la red en: http://${localIP}:${PORT}`);
});
