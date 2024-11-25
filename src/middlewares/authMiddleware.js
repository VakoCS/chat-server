import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_secret_key'; //Algo seguro

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token requerido' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id; // Esto configura el ID del usuario autenticado
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};
