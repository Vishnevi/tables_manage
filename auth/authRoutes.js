import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Логин и пароль обязательны' });
    }

    if (username === process.env.APP_USERNAME && password === process.env.APP_PASSWORD) {
        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ token, message: 'Успешный вход' });
    }

    return res.status(401).json({ message: 'Неверный логин или пароль' });
});

export default router;
