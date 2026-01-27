import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Неверный или истекший токен' });
    }
}
