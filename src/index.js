import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { socketHandler } from "./socket/socketHandler.js";

const app = express();
const server = http.createServer(app);

// Configura CORS para aceptar localhost y tu IP de red
const allowedOrigins = [
  "http://localhost:3000",         // Para desarrollo local
  "http://192.168.1.175:3000",     // Backend en red local
  "http://192.168.1.175:5173",     // Frontend en red local
  "http://localhost:5173",         // Servidor de desarrollo (Vite u otro)
];

app.use(cors({
  origin: '*',

  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Socket.IO configurado para aceptar localhost e IP de red
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
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

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Servidor accesible desde la red en http://192.168.1.175:${PORT}`);
});