import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';

const SECRET_KEY = 'your_secret_key'; // Cambiar por algo seguro

export const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword },
        });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: 'Usuario ya registrado' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY);
    res.json({ token, userId: user.id }); // Incluye el userId en la respuesta
};
