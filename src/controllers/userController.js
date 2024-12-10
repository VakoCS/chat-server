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
