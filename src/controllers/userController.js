import prisma from "../models/prismaClient.js";

// userController.js
export const searchUsers = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error buscando usuarios:", error);
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
};

// userController.js
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // Desde el middleware de autenticación

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
        chats: {
          select: {
            id: true,
            messages: {
              where: {
                senderId: userId,
              },
            },
            members: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        messages: {
          select: {
            id: true,
            createdAt: true,
            content: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Estadísticas generales
    const stats = {
      totalChats: user.chats.length,
      totalMessages: user.messages.length,
      accountAge: Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      ), // días
      uniqueContacts: new Set(
        user.chats.flatMap((chat) =>
          chat.members.filter((member) => member.id !== userId).map((m) => m.id)
        )
      ).size,
      avgMessagesPerChat: user.chats.length
        ? (user.messages.length / user.chats.length).toFixed(1)
        : 0,
    };

    // Actividad por hora del día
    const hourlyActivity = new Array(24).fill(0);
    user.messages.forEach((msg) => {
      const hour = new Date(msg.createdAt).getHours();
      hourlyActivity[hour]++;
    });

    // Encontrar la hora más activa
    const mostActiveHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

    // Estadísticas de mensajes
    const messageStats = {
      averageLength: user.messages.length
        ? Math.floor(
            user.messages.reduce((acc, msg) => acc + msg.content.length, 0) /
              user.messages.length
          )
        : 0,
      mostActiveHour,
      longestMessage: user.messages.length
        ? Math.max(...user.messages.map((msg) => msg.content.length))
        : 0,
      messagesLastWeek: user.messages.filter(
        (msg) =>
          new Date(msg.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      hourlyActivity,
    };

    // Actividad reciente
    const recentActivity = {
      lastMessageDate: user.messages.length ? user.messages[0].createdAt : null,
      activeDaysStreak: calculateActiveStreak(
        user.messages.map((m) => m.createdAt)
      ),
    };

    res.json({
      profile: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      stats,
      messageStats,
      recentActivity,
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

// Función auxiliar para calcular racha de días activos
const calculateActiveStreak = (dates) => {
  if (!dates.length) return 0;

  const today = new Date().setHours(0, 0, 0, 0);
  let streak = 0;
  let currentDate = new Date(today);

  // Convertir fechas a días únicos
  const activeDays = new Set(
    dates.map((date) => new Date(date).setHours(0, 0, 0, 0))
  );

  while (activeDays.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

// Actualizar foto de perfil
export const updateProfile = async (req, res) => {
  try {
    const { avatarUrl, username } = req.body;
    const userId = req.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(avatarUrl && { avatarUrl }),
        ...(username && { username }),
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};
